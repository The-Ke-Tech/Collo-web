export type Product = {
  _id: string;
  slug: string;
  productName: string;
  productImage: string[];
  category: string;
  price: number;
  sellingPrice: number;
  stock: number;
  brandName?: string;      // added
  description?: string;    // added
  createdBy: string;   
  createdAt: string;   
  updatedAt: string;   
};
