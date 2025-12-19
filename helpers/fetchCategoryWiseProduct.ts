// helpers/fetchCategoryWiseProduct.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchCategoryWiseProduct = async (category: string) => {
  try {
    const response = await fetch(`${API_URL}/api/products/category-wise`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch category products');
    }

    const dataResponse = await response.json();
    return dataResponse;
  } catch (error: any) {
    console.error('Error fetching category-wise products:', error);
    return { success: false, message: error.message || 'Something went wrong' };
  }
};

export default fetchCategoryWiseProduct;
