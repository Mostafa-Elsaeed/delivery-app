
import React, { useState } from 'react';
import { Order, OrderStatus, User } from '../types';
import ReviewSection from './ReviewSection';

interface DeliveryPortalProps {
  currentUser: User;
  orders: Order[];
  users: User[];
  onBid: (orderId: string, amount: number) => void;
  onPayEscrow: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onOpenChat: (orderId: string) => void;
  onReview: (orderId: string, targetId: string, rating: number, comment: string) => void;
}

const DeliveryPortal: React.FC<DeliveryPortalProps> = ({ currentUser, orders, users, onBid, onPayEscrow, onUpdateStatus, onOpenChat, onReview }) => {
  const [bidAmounts, setBidAmounts] = useState<Record<string, string>>({});

  const handleBidSubmit = (orderId: string) => {
    const amount = parseFloat(bidAmounts[orderId]);
    if (!isNaN(amount)) {
      onBid(orderId, amount);
      setBidAmounts({ ...bidAmounts, [orderId]: '' });
    }
  };

  const availableOrders = orders.filter(o => o.status === OrderStatus.BIDDING);
  const myActiveOrders = orders.filter(o => 
    (o.deliveryGuyId === currentUser.id || o.bids.some(b => b.deliveryGuyId === currentUser.id)) &&
    o.status !== OrderStatus.BIDDING
  );

  const getStatusStep = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.AWAITING_ESCROW: return 1;
      case OrderStatus.READY_FOR_PICKUP: return 2;
      case OrderStatus.IN_TRANSIT: return 3;
      case OrderStatus.DELIVERED: return 4;
      case OrderStatus.COMPLETED: return 4;
      default: return 0;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <section>
        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Active Deliveries</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Track progress and complete shipments for payout.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {myActiveOrders.map(order => {
             const storeUser = users.find(u => u.id === order.storeId);
             const storeRating = storeUser && storeUser.reviews.length > 0 
              ? (storeUser.reviews.reduce((acc, r) => acc + r.rating, 0) / storeUser.reviews.length).toFixed(1)
              : 'New';

             return (
              <div key={order.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row group transition-all duration-300">
                <div className="p-8 flex-grow">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-black text-2xl text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{order.productName}</h3>
                      <p className="text-sm text-indigo-500 dark:text-indigo-400 font-black uppercase tracking-widest transition-colors">
                        {order.storeName}
                        <span className="ml-2 text-amber-500 text-[10px]">★ {storeRating}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-1 transition-colors">Your Reward</p>
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 transition-colors">${order.bids.find(b => b.id === order.selectedBidId)?.amount.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 mb-6 space-y-3">
                    <div className="flex items-start space-x-2">
                      <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Deliver To</p>
                        <p className="text-md font-black text-slate-800 dark:text-slate-200">{order.deliveryAddress}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-black">{order.clientName.charAt(0)}</div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{order.clientName}</span>
                      </div>
                      <a href={`tel:${order.clientPhone}`} className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 004.529 4.528l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                        {order.clientPhone}
                      </a>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 transition-colors">
                      <span className={getStatusStep(order.status) >= 1 ? 'text-indigo-600 dark:text-indigo-400' : ''}>1. Escrow</span>
                      <span className={getStatusStep(order.status) >= 2 ? 'text-indigo-600 dark:text-indigo-400' : ''}>2. Pickup</span>
                      <span className={getStatusStep(order.status) >= 3 ? 'text-indigo-600 dark:text-indigo-400' : ''}>3. Transit</span>
                      <span className={getStatusStep(order.status) >= 4 ? 'text-indigo-600 dark:text-indigo-400' : ''}>4. Finished</span>
                    </div>
                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5 transition-colors">
                      <div className="h-full rounded-full transition-all duration-1000 bg-indigo-600 shadow-sm" style={{ width: `${(getStatusStep(order.status) / 4) * 100}%` }}></div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex-grow">
                      {order.status === OrderStatus.AWAITING_ESCROW && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex items-center justify-between transition-colors">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mr-4 text-amber-600 dark:text-amber-400">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                            </div>
                            <div>
                              <p className="text-sm font-black text-amber-900 dark:text-amber-200">Payment Required</p>
                              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Escrow Product Price: ${order.productPrice.toFixed(2)}</p>
                            </div>
                          </div>
                          {order.deliveryEscrowPaid ? (
                            <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-black text-xs transition-colors">
                               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                               <span>Paid to Escrow</span>
                            </div>
                          ) : (
                            <button onClick={() => onPayEscrow(order.id)} className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-black hover:bg-amber-700 shadow-lg shadow-amber-200 dark:shadow-amber-900/40 active:scale-95 transition-all">Pay & Start</button>
                          )}
                        </div>
                      )}

                      {order.status === OrderStatus.READY_FOR_PICKUP && (
                        <button onClick={() => onUpdateStatus(order.id, OrderStatus.IN_TRANSIT)} className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-slate-800 dark:hover:bg-indigo-700 transition shadow-xl dark:shadow-indigo-900/30 active:scale-[0.98]">Confirm Product Pickup</button>
                      )}

                      {order.status === OrderStatus.IN_TRANSIT && (
                        <button onClick={() => onUpdateStatus(order.id, OrderStatus.DELIVERED)} className="w-full bg-indigo-600 dark:bg-purple-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 dark:hover:bg-purple-700 transition shadow-xl active:scale-[0.98]">Mark as Delivered</button>
                      )}

                      {order.status === OrderStatus.DELIVERED && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 text-center animate-pulse transition-colors">
                          <p className="text-sm font-black text-emerald-800 dark:text-emerald-300 mb-2">Package Delivered!</p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-500 font-bold uppercase tracking-widest">Awaiting store confirmation to release funds...</p>
                        </div>
                      )}

                      {order.status === OrderStatus.COMPLETED && (
                        <ReviewSection 
                          targetName={order.storeName} 
                          alreadyReviewed={order.riderReviewed}
                          onReview={(rating, comment) => onReview(order.id, order.storeId, rating, comment)}
                        />
                      )}
                    </div>
                    {order.status !== OrderStatus.COMPLETED && (
                      <button onClick={() => onOpenChat(order.id)} className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all shadow-sm border border-slate-100 dark:border-slate-800 self-stretch flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
             );
          })}
          {myActiveOrders.length === 0 && (
            <div className="xl:col-span-2 py-16 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center flex flex-col items-center transition-colors">
              <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 shadow-sm mb-4 transition-colors">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-slate-400 dark:text-slate-500 font-bold">You don't have any active deliveries. Bid on jobs below!</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Job Board</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Find lucrative delivery jobs from local stores.</p>
          </div>
          <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-200 dark:border-indigo-800 shadow-sm transition-colors">
            {availableOrders.length} New Requests
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {availableOrders.map(order => {
             const storeUser = users.find(u => u.id === order.storeId);
             const storeRating = storeUser && storeUser.reviews.length > 0 
              ? (storeUser.reviews.reduce((acc, r) => acc + r.rating, 0) / storeUser.reviews.length).toFixed(1)
              : 'New';
             const myBid = order.bids.find(b => b.deliveryGuyId === currentUser.id);
             const bestBid = order.bids.length > 0 ? Math.min(...order.bids.map(b => b.amount)) : null;

             return (
              <div key={order.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col group overflow-hidden">
                <div className="h-2 bg-indigo-600 w-0 group-hover:w-full transition-all duration-500"></div>
                <div className="p-7 flex-grow">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mb-1 transition-colors">
                        {order.storeName}
                        <span className="ml-2 text-amber-500 text-[9px]">★ {storeRating}</span>
                      </p>
                      <h3 className="font-black text-xl text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{order.productName}</h3>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 text-center min-w-[70px] transition-colors">
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase mb-1">Fee</p>
                      <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 leading-none">${order.deliveryFeeOffer.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-3 rounded-2xl space-y-2">
                      <div className="flex items-start space-x-2">
                        <svg className="w-4 h-4 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <div className="overflow-hidden">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Destination Area</p>
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{order.deliveryAddress}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center p-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl transition-colors">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-700 flex items-center justify-center mr-3 text-white transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1 transition-colors">Price to Pay Store</p>
                         <p className="text-sm font-black text-slate-800 dark:text-slate-200 transition-colors">${order.productPrice.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4 transition-colors">
                    <div className="flex space-x-2">
                      <div className="relative flex-grow">
                        <span className="absolute left-4 top-3 text-slate-400 dark:text-slate-500 text-sm font-black">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={bidAmounts[order.id] !== undefined ? bidAmounts[order.id] : (myBid ? myBid.amount.toString() : '')}
                          onChange={(e) => setBidAmounts({ ...bidAmounts, [order.id]: e.target.value })}
                          placeholder="Offer fee"
                          className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white transition-all"
                        />
                      </div>
                      <button 
                        onClick={() => handleBidSubmit(order.id)}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30 active:scale-95 whitespace-nowrap"
                      >
                        {myBid ? 'Update Bid' : 'Bid'}
                      </button>
                    </div>
                    {order.bids.length > 0 && (
                      <div className="flex items-center justify-between px-1 mt-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex -space-x-3">
                            {order.bids.slice(0, 3).map(b => (
                              <div key={b.id} className="w-8 h-8 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-slate-400 shadow-sm transition-colors">
                                {b.deliveryGuyName.charAt(0)}
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest transition-colors">{order.bids.length} bids</p>
                        </div>
                        {bestBid && (
                          <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">Best: ${bestBid.toFixed(2)}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
             );
          })}
          {availableOrders.length === 0 && (
            <div className="md:col-span-2 lg:col-span-3 py-24 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 transition-colors">
               <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]">All jobs taken. Check back later!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DeliveryPortal;
