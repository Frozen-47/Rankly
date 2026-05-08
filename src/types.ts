/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  price: string;
  rating: number;
  image?: string;
  specs: Record<string, string>;
  pros: string[];
  cons: string[];
  ranklyScore: number; // 0-100
  summary: string;
  url: string;
}

export interface ComparisonData {
  products: Product[];
  commonSpecs: string[];
  verdict: string;
}
