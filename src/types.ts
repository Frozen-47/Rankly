export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  specs: {
    ram: string;
    battery: string;
    camera: string;
    processor: string;
    display: string;
    [key: string]: string;
  };
  image: string;
  source: string;
  score?: number;
}

export interface ComparisonResult {
  products: Product[];
  winnerId: string;
  recommendation: string;
}
