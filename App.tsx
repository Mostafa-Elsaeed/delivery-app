
import React, { useState, useEffect } from 'react';
import { UserRole, Order, OrderStatus, Bid, User, Message, Review } from './types';
import StorePortal from './components/StorePortal';
import DeliveryPortal from './components/DeliveryPortal';
import Navbar from './components/Navbar';
import ChatModal from './components/ChatModal';
import AuthPortal from './components/AuthPortal';
import { supabase } from './supabaseClient';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeChatOrderId, setActiveChatOrderId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => document.documentElement.classList.contains('dark'));

  // Helper to map DB order to UI Order type
  const mapOrder = (dbOrder: any): Order => ({
    id: dbOrder.id,
    storeId: dbOrder.storeId,
    storeName: dbOrder.storeName,
    productName: dbOrder.productName,
    productPrice: Number(dbOrder.productPrice),
    deliveryFeeOffer: Number(dbOrder.suggestedDeliveryFee),
    deliveryAddress: dbOrder.destination,
    clientName: dbOrder.clientName || '',
    clientPhone: dbOrder.clientPhone || '',
    status: dbOrder.status as OrderStatus,
    bids: (dbOrder.bids || []).map((b: any) => ({
      id: b.id,
      deliveryGuyId: b.deliveryGuyId,
      deliveryGuyName: b.deliveryGuyName,
      amount: Number(b.proposedFee),
      timestamp: new Date(b.timestamp).getTime()
    })),
    messages: [], // Messages table not provided, keeping empty
    selectedBidId: dbOrder.chosenBidId,
    deliveryGuyId: dbOrder.deliveryGuyId,
    storeEscrowPaid: dbOrder.storeDeposited,
    deliveryEscrowPaid: dbOrder.riderDeposited,
    createdAt: new Date(dbOrder.created_at).getTime(),
    storeReviewed: false,
    riderReviewed: false
  });

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  };

  // Initialize Supabase Auth Listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(prev => {
          // If the user is already loaded and matches the session, preserve the existing state (including wallet)
          if (prev?.id === session.user.id) return prev;

          return {
            id: session.user.id,
            email: session.user.email!,
            password: '', // Managed by Supabase
            name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'User',
            role: (session.user.user_metadata.role as UserRole) || UserRole.DELIVERY,
            reviews: []
          };
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Orders and Subscribe to changes
  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select(`*, bids(*)`)
        .order('created_at', { ascending: false });
      
      if (data) {
        setOrders(data.map(mapOrder));
      }
    };

    fetchOrders();

    const channel = supabase.channel('public:data')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, fetchOrders)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bids' }, fetchOrders)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Sync Wallet from DB
  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchWallet = async () => {
      let { data } = await supabase.from('wallets').select('*').eq('user_id', currentUser.id).single();
      
      // Create wallet if it doesn't exist
      if (!data) {
        const { data: newData } = await supabase.from('wallets').insert({ user_id: currentUser.id }).select().single();
        data = newData;
      }

      if (data) {
        setCurrentUser(prev => prev ? ({
          ...prev,
          wallet: {
            balance: Number(data.balance),
            escrowHeld: Number(data.escrow),
            transactions: [] // Transactions table not provided
          }
        }) : null);
      }
    };

    fetchWallet();

    const channel = supabase.channel('wallet_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallets', filter: `user_id=eq.${currentUser.id}` }, fetchWallet)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [currentUser?.id]);

  const createOrder = async (productName: string, productPrice: number, deliveryFee: number, deliveryAddress: string, clientName: string, clientPhone: string) => {
    if (!currentUser) return;
    await supabase.from('orders').insert({
      storeId: currentUser.id,
      storeName: currentUser.name,
      productName,
      productPrice,
      suggestedDeliveryFee: deliveryFee,
      destination: deliveryAddress,
      clientName,
      clientPhone,
      status: OrderStatus.BIDDING
    });
  };

  const placeBid = async (orderId: string, amount: number) => {
    if (!currentUser) return;
    
    // Check if bid exists in current state
    const existingBid = orders.find(o => o.id === orderId)?.bids.find(b => b.deliveryGuyId === currentUser.id);

    if (existingBid) {
      await supabase.from('bids').update({
        proposedFee: amount,
        timestamp: new Date().toISOString()
      }).eq('id', existingBid.id);
    } else {
      await supabase.from('bids').insert({
        orderId,
        deliveryGuyId: currentUser.id,
        deliveryGuyName: currentUser.name,
        proposedFee: amount
      });
    }
  };

  const selectBidder = async (orderId: string, bidId: string) => {
    const order = orders.find(o => o.id === orderId);
    const bid = order?.bids.find(b => b.id === bidId);
    if (!bid) return;

    await supabase.from('orders').update({
      chosenBidId: bidId,
      deliveryGuyId: bid.deliveryGuyId,
      status: OrderStatus.AWAITING_ESCROW
    }).eq('id', orderId);
  };

  const payStoreEscrow = async (orderId: string) => {
    if (!currentUser) return;
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const selectedBid = order.bids.find(b => b.id === order.selectedBidId);
    const fee = selectedBid ? selectedBid.amount : order.deliveryFeeOffer;

    if (!currentUser.wallet || currentUser.wallet.balance < fee) return alert("Insufficient balance or wallet not loaded.");

    // Update Wallet
    await supabase.from('wallets').update({
      balance: currentUser.wallet.balance - fee,
      escrow: currentUser.wallet.escrowHeld + fee,
    }).eq('user_id', currentUser.id);

    // Update Order
    const newStatus = order.deliveryEscrowPaid ? OrderStatus.READY_FOR_PICKUP : OrderStatus.AWAITING_ESCROW;
    await supabase.from('orders').update({ storeDeposited: true, status: newStatus }).eq('id', orderId);
  };

  const payDeliveryEscrow = async (orderId: string) => {
    if (!currentUser) return;
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    if (!currentUser.wallet || currentUser.wallet.balance < order.productPrice) return alert("Insufficient balance or wallet not loaded.");

    // Update Wallet
    await supabase.from('wallets').update({
      balance: currentUser.wallet.balance - order.productPrice,
      escrow: currentUser.wallet.escrowHeld + order.productPrice,
    }).eq('user_id', currentUser.id);

    // Update Order
    const newStatus = order.storeEscrowPaid ? OrderStatus.READY_FOR_PICKUP : OrderStatus.AWAITING_ESCROW;
    await supabase.from('orders').update({ riderDeposited: true, status: newStatus }).eq('id', orderId);
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await supabase.from('orders').update({ status }).eq('id', orderId);
    
    if (status === OrderStatus.COMPLETED) {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const selectedBid = order.bids.find(b => b.id === order.selectedBidId);
        const fee = selectedBid ? selectedBid.amount : order.deliveryFeeOffer;

        // Payout Logic (Note: In production, use RPC/Transactions for safety)
        
        // 1. Store: Receives Product Price (from Rider's escrow) + Gets Fee back from escrow (Wait, fee goes to rider. Store pays fee.)
        // Correction: Store paid Fee into Escrow. Rider paid ProductPrice into Escrow.
        // Store should receive ProductPrice.
        // Rider should receive ProductPrice (collateral back) + Fee.
        
        // Fetch Store Wallet
        const { data: storeWallet } = await supabase.from('wallets').select('*').eq('user_id', order.storeId).single();
        if (storeWallet) {
          await supabase.from('wallets').update({
            balance: Number(storeWallet.balance) + order.productPrice,
            escrow: Number(storeWallet.escrow) - fee // Release fee from escrow
          }).eq('user_id', order.storeId);
        }

        // Fetch Rider Wallet
        if (order.deliveryGuyId) {
          const { data: riderWallet } = await supabase.from('wallets').select('*').eq('user_id', order.deliveryGuyId).single();
          if (riderWallet) {
            await supabase.from('wallets').update({
              balance: Number(riderWallet.balance) + order.productPrice + fee,
              escrow: Number(riderWallet.escrow) - order.productPrice // Release collateral
            }).eq('user_id', order.deliveryGuyId);
          }
        }
      }
    }
  };

  const submitReview = async (orderId: string, targetUserId: string, rating: number, comment: string) => {
    if (!currentUser) return;
    
    // Save to Supabase
    await supabase.from('reviews').insert({
      orderId,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      targetUserId,
      rating,
      comment
    });

    const newReview: Review = {
      id: Math.random().toString(36).substr(2, 9),
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      rating,
      comment,
      timestamp: Date.now()
    };

    setUsers(prev => prev.map(u => {
      if (u.id === targetUserId) {
        return { ...u, reviews: [newReview, ...u.reviews] };
      }
      return u;
    }));

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        if (currentUser.role === UserRole.STORE) return { ...o, storeReviewed: true };
        return { ...o, riderReviewed: true };
      }
      return o;
    }));
  };

  const sendMessage = (orderId: string, text: string) => {
    if (!currentUser) return;
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      text,
      timestamp: Date.now()
    };
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, messages: [...o.messages, newMessage] } : o));
  };

  const handleAuth = (user: User) => {
    setCurrentUser(user);
  };

  const handleSignup = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <AuthPortal onAuth={handleAuth} existingUsers={users} onSignup={handleSignup} isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />;
  }

  const activeChatOrder = orders.find(o => o.id === activeChatOrderId);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 animate-in fade-in duration-500">
      <Navbar 
        role={currentUser.role} 
        onLogout={handleLogout}
        wallet={currentUser.wallet || { balance: 0, escrowHeld: 0, transactions: [] }}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {currentUser.role === UserRole.STORE ? (
          <StorePortal 
            orders={orders.filter(o => o.storeId === currentUser.id)} 
            users={users}
            onCreate={createOrder} 
            onSelectBidder={selectBidder}
            onPayEscrow={payStoreEscrow}
            onOpenChat={(id) => setActiveChatOrderId(id)}
            onUpdateStatus={updateOrderStatus}
            onReview={submitReview}
          />
        ) : (
          <DeliveryPortal 
            currentUser={currentUser}
            orders={orders} 
            users={users}
            onBid={placeBid} 
            onPayEscrow={payDeliveryEscrow}
            onUpdateStatus={updateOrderStatus}
            onOpenChat={(id) => setActiveChatOrderId(id)}
            onReview={submitReview}
          />
        )}
      </main>

      {activeChatOrder && (
        <ChatModal 
          order={activeChatOrder} 
          currentUserId={currentUser.id}
          onClose={() => setActiveChatOrderId(null)}
          onSend={(text) => sendMessage(activeChatOrder.id, text)}
        />
      )}
      
      <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 py-6 mt-12 transition-colors">
        <div className="container mx-auto px-4 text-center text-gray-500 dark:text-slate-400 text-sm">
          &copy; 2024 SwiftEscrow Delivery. Securely connecting stores and riders.
        </div>
      </footer>
    </div>
  );
};

export default App;
