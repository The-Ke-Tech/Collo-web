type ItemType = "product" | "service";

interface BaseItem {
  id: string;
  slug: string;
  category: string;
  image: string[];
  type: ItemType;
}

interface ProductItem extends BaseItem {
  type: "product";
  productName: string;
  sellingPrice: number;
  price: number;
  stock: number;
}

interface ServiceItem extends BaseItem {
  type: "service";
  serviceName: string;
  price?: number;
  startingFrom?: boolean;
  pricingType?: string;
  unitLabel?: string;
}

type DisplayItem = ProductItem | ServiceItem;
