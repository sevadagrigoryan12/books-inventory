export enum BookActionType {
  BORROW = 'BORROW',
  RETURN = 'RETURN',
  BUY = 'BUY',
  RESTOCK = 'RESTOCK',
  RESTOCK_COMPLETED = 'RESTOCK_COMPLETED'
}

export enum UserBookType {
  BORROWED = 'BORROWED',
  BOUGHT = 'BOUGHT'
}

export enum UserBookStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED'
}

export enum WalletMovementType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT'
} 