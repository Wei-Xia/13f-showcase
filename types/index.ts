export interface Holding {
  symbol: string;
  company: string;
  shares: number;
  price: number;
  marketValue: number;
  percentage: number;
}

export interface QuarterlyHoldings {
  quarter: string;
  date: string;
  aum: number;
  holdings: Holding[];
}

export interface AUM {
  quarter: string;
  date: string;
  aum: number;
}

export interface Transaction {
  action: 'buy' | 'sell';
  symbol: string;
  company: string;
  shares: number;
}

export interface QuarterlyTransactions {
  quarter: string;
  date: string;
  transactions: Transaction[];
}
