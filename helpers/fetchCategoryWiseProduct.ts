const fetchCategoryWiseProduct = async (category: string) => {
  const response = await fetch('/api/products/category-wise', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category }),
  });

  const dataResponse = await response.json();
  return dataResponse;
};

export default fetchCategoryWiseProduct;
