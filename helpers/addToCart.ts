import { toast } from "react-toastify";

const addToCart = async (e: React.SyntheticEvent, id: string) => {
  e?.stopPropagation?.();
  e?.preventDefault?.();

  const response = await fetch("/api/cart/modify", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId: id }),
  });

  const data = await response.json();

  if (data.alreadyInCart) {
    toast.info(data.message); // Show info toast instead of success
  } else {
    toast[data.success ? "success" : "error"](data.message);
  }

  return data;
};

export default addToCart;
