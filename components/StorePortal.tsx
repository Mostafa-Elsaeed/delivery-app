
import React, { useState } from 'react';
import { Order, OrderStatus, User } from '../types';
import ReviewSection from './ReviewSection';

interface StorePortalProps {
  orders: Order[];
  users: User[];
  onCreate: (name: string, price: number, fee: number, address: string, clientName: string, clientPhone: string) => void;
  onSelectBidder: (orderId: string, bidId: string) => void;
  onPayEscrow: (orderId: string) => void;
  onOpenChat: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onReview: (orderId: string, targetId: string, rating: number, comment: string) => void;
  t: any;
}

const StorePortal: React.FC<StorePortalProps> = ({ orders, users, onCreate, onSelectBidder, onPayEscrow, onOpenChat, onUpdateStatus, onReview, t }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(
      productName, 
      parseFloat(productPrice), 
      parseFloat(deliveryFee),
      deliveryAddress,
      clientName,
      clientPhone
    );
    setProductName('');
    setProductPrice('');
    setDeliveryFee('');
    setDeliveryAddress('');
    setClientName('');
    setClientPhone('');
    setShowCreate(false);
  };

  const getStatusBadge = (status: OrderStatus) => {
    const badges = {
      [OrderStatus.BIDDING]: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
      [OrderStatus.AWAITING_ESCROW]: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
      [OrderStatus.READY_FOR_PICKUP]: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800',
      [OrderStatus.IN_TRANSIT]: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
      [OrderStatus.DELIVERED]: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800',
      [OrderStatus.COMPLETED]: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badges[status]}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{t.storeDashboard}</h1>
          <p className="text-slate-500 dark:text-slate-400">{t.storeSubtitle}</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md active:scale-95 flex items-center"
        >
          <svg className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          {t.postRequest}
        </button>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-xl font-black mb-6 text-slate-800 dark:text-slate-100">{t.newOffer}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.productName}</label>
                <input
                  required
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Wedding Cake"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.productPrice}</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.maxFee}</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.deliveryAddress}</label>
                <input
                  required
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Full street address, city"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.clientName}</label>
                  <input
                    required
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{t.clientPhone}</label>
                  <input
                    required
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <button type="button" onClick={() => setShowCreate(false)} className="px-6 py-2.5 text-slate-500 dark:text-slate-400 font-bold hover:text-slate-800 dark:hover:text-slate-100">{t.cancel}</button>
              <button type="submit" className="bg-indigo-600 text-white px-10 py-2.5 rounded-xl font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30">{t.create}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {orders.map(order => {
          const selectedBid = order.bids.find(b => b.id === order.selectedBidId);
          const riderUser = users.find(u => u.id === order.deliveryGuyId);
          const avgRating = riderUser && riderUser.reviews.length > 0 
            ? (riderUser.reviews.reduce((acc, r) => acc + r.rating, 0) / riderUser.reviews.length).toFixed(1)
            : 'New';

          return (
            <div key={order.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 dark:text-slate-100 leading-tight">{order.productName}</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{order.id}</p>
                  </div>
                </div>
                {getStatusBadge(order.status)}
              </div>
              
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px]">{t.productValue}</p>
                    <p className="text-slate-800 dark:text-slate-200 font-black text-lg">${order.productPrice.toFixed(2)}</p>
                  </div>
                  <div className="text-right rtl:text-left space-y-1">
                    <p className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px]">{t.maxFee}</p>
                    <p className="text-indigo-600 dark:text-indigo-400 font-black text-lg">${order.deliveryFeeOffer.toFixed(2)}</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-start space-x-2 rtl:space-x-reverse">
                    <svg className="w-4 h-4 text-slate-400 mt-1 rtl:ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{t.destination}</p>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{order.deliveryAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black">{order.clientName.charAt(0)}</div>
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{order.clientName}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400">{order.clientPhone}</span>
                  </div>
                </div>

                {order.status === OrderStatus.BIDDING && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
                    <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                      <span className="mr-2 rtl:mr-0 rtl:ml-2">{t.offers} ({order.bids.length})</span>
                      <span className="flex-grow h-px bg-slate-100 dark:bg-slate-800"></span>
                    </p>
                    {order.bids.length === 0 ? (
                      <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 transition-colors">
                        <p className="text-sm text-slate-400 dark:text-slate-500 font-bold">{t.waitingForRiders}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {order.bids.map(bid => {
                           const bidder = users.find(u => u.id === bid.deliveryGuyId);
                           const bidderRating = bidder && bidder.reviews.length > 0 
                            ? (bidder.reviews.reduce((acc, r) => acc + r.rating, 0) / bidder.reviews.length).toFixed(1)
                            : 'New';
                           return (
                            <div key={bid.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all duration-300">
                              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-black shadow-inner">
                                  {bid.deliveryGuyName.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-800 dark:text-slate-200 transition-colors">
                                    {bid.deliveryGuyName} 
                                    <span className="ml-2 rtl:ml-0 rtl:mr-2 text-amber-500 text-[10px]">★ {bidderRating}</span>
                                  </p>
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{new Date(bid.timestamp).toLocaleTimeString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                <span className="text-indigo-600 dark:text-indigo-400 font-black text-sm transition-colors">${bid.amount.toFixed(2)}</span>
                                <button 
                                  onClick={() => onSelectBidder(order.id, bid.id)}
                                  className="px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-black hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 hover:border-indigo-600 transition-all shadow-sm"
                                >
                                  {t.select}
                                </button>
                              </div>
                            </div>
                           );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {order.status === OrderStatus.AWAITING_ESCROW && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-2xl border border-amber-100 dark:border-amber-900/30 space-y-4 transition-colors">
                      <div className="flex items-center text-amber-900 dark:text-amber-400 transition-colors rtl:space-x-reverse">
                        <svg className="w-5 h-5 mr-2 rtl:ml-2 rtl:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        <h4 className="font-black text-sm uppercase tracking-tight">{t.escrowProcess}</h4>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-800 dark:text-amber-300 transition-colors">{t.feeDeposit}</span>
                        {order.storeEscrowPaid ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center text-xs font-black bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg transition-colors">{t.secured}</span>
                        ) : (
                          <button onClick={() => onPayEscrow(order.id)} className="bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-amber-700 shadow-md shadow-amber-200 transition-all">{t.deposit} ${selectedBid?.amount.toFixed(2)}</button>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-800 dark:text-amber-300 transition-colors">{t.riderCollateral}</span>
                        {order.deliveryEscrowPaid ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center text-xs font-black bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg transition-colors">{t.secured}</span>
                        ) : (
                          <span className="text-amber-500 dark:text-amber-400 text-xs font-black italic animate-pulse">{t.pending}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {(order.status === OrderStatus.DELIVERED || order.status === OrderStatus.COMPLETED) && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors space-y-4">
                    {order.status === OrderStatus.DELIVERED && (
                      <button 
                        onClick={() => {
                          setProcessingId(order.id);
                          onUpdateStatus(order.id, OrderStatus.COMPLETED);
                        }}
                        disabled={processingId === order.id}
                        className={`w-full py-4 rounded-2xl font-black transition shadow-xl active:scale-[0.98] ${processingId === order.id ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                      >
                        {processingId === order.id ? t.processing : t.confirmReceipt}
                      </button>
                    )}
                    {order.status === OrderStatus.COMPLETED && order.deliveryGuyId && (
                      <ReviewSection 
                        targetName={riderUser?.name || 'Rider'} 
                        alreadyReviewed={order.storeReviewed}
                        onReview={(rating, comment) => onReview(order.id, order.deliveryGuyId!, rating, comment)}
                        t={t}
                      />
                    )}
                  </div>
                )}

                {order.status !== OrderStatus.BIDDING && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-700 flex items-center justify-center text-white text-sm font-black transition-colors">
                        {selectedBid?.deliveryGuyName.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase leading-none mb-1">{t.assignedRider}</p>
                        <p className="text-sm font-black text-slate-800 dark:text-slate-200 transition-colors">
                          {selectedBid?.deliveryGuyName || t.unknown}
                          <span className="ml-2 rtl:ml-0 rtl:mr-2 text-amber-500 text-[10px]">★ {avgRating}</span>
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => onOpenChat(order.id)}
                      className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-all flex items-center space-x-2 rtl:space-x-reverse shadow-sm border border-transparent dark:border-indigo-900/30"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      <span className="text-xs font-black">{t.chat}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {orders.length === 0 && (
          <div className="lg:col-span-2 py-24 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center transition-colors">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 rounded-full flex items-center justify-center mb-4 transition-colors">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <p className="text-slate-400 dark:text-slate-500 font-bold">{t.noRequests}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePortal;
