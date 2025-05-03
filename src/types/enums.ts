export enum BookActionType {
  BORROW = 'borrow',
  RETURN = 'return',
  BUY = 'buy',
  RESTOCK = 'restock',
  RESTOCK_COMPLETED = 'restock_completed'
}

export enum UserBookType {
  BORROWED = 'borrowed',
  BOUGHT = 'bought'
}

export enum UserBookStatus {
  ACTIVE = 'active',
  RETURNED = 'returned'
}

export enum WalletMovementType {
  CREDIT = 'credit',
  DEBIT = 'debit'
} 