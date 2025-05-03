export interface Book {
  id: number;
  authorName: string;
  bookTitle: string;
  genres: string[];
  sellPrice: number;
  borrowPrice: number;
  stockPrice: number;
  copies: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookAction {
  id: number;
  bookId: number;
  userId: string;
  actionType: 'borrow' | 'return' | 'buy' | 'restock';
  createdAt: Date;
}

export interface Wallet {
  id: number;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletMovement {
  id: number;
  walletId: number;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  createdAt: Date;
}

export interface UserBook {
  id: number;
  userId: string;
  bookId: number;
  type: 'borrowed' | 'bought';
  status: 'active' | 'returned';
  createdAt: Date;
  updatedAt: Date;
} 