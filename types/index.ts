export interface Holding {
  symbol: string;
  company: string;
  shares: number;
  marketValue: number;
  percentage: number;
}

export interface AUM {
  quarter: string;
  date: string;
  aum: number;
}
