export interface Product {
  id: string;
  name: string;
  model: string;
  category: string;
  size: string;
  image: string;
  originalPrice: number;
  discountPrice: number;
  discountRate: number;
  monthlyPrice?: number;
  rating?: number;
  reviewCount?: number;
  tags?: string[];
  isBest?: boolean;
  isNew?: boolean;
  benefits?: string[];
}
