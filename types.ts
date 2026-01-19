export enum OrderStatus {
  BIDDING = "BIDDING",
  AWAITING_ESCROW = "AWAITING_ESCROW",
  READY_FOR_PICKUP = "READY_FOR_PICKUP",
  IN_TRANSIT = "IN_TRANSIT",
  DELIVERED = "DELIVERED",
  COMPLETED = "COMPLETED",
}

export enum UserRole {
  STORE = "STORE",
  DELIVERY = "DELIVERY",
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  comment: string;
  timestamp: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: "IN" | "OUT";
  description: string;
  timestamp: number;
}

export interface Wallet {
  balance: number;
  escrowHeld: number;
  transactions: Transaction[];
}

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  wallet?: Wallet;
  reviews: Review[];
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface Bid {
  id: string;
  deliveryGuyId: string;
  deliveryGuyName: string;
  amount: number;
  timestamp: number;
}

export interface Order {
  id: string;
  storeId: string;
  storeName: string;
  productName: string;
  productPrice: number;
  deliveryFeeOffer: number;
  deliveryAddress: string;
  clientName: string;
  clientPhone: string;
  status: OrderStatus;
  bids: Bid[];
  messages: Message[];
  selectedBidId?: string;
  deliveryGuyId?: string;
  storeEscrowPaid: boolean;
  deliveryEscrowPaid: boolean;
  createdAt: number;
  storeReviewed: boolean;
  riderReviewed: boolean;
}
