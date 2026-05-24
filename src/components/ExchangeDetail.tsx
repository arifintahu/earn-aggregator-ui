'use client';
import { EarnProduct } from '@/types';
interface ExchangeDetailProps {
  exchange: string;
  allProducts: EarnProduct[];
  onClose: () => void;
  onAddPortfolio: (p: EarnProduct) => void;
}
export default function ExchangeDetail(_props: ExchangeDetailProps) {
  return null;
}
