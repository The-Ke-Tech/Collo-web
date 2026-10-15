'use client';



import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { MdDelete, MdAdd, MdRemove, MdArrowBack, MdShoppingCart, MdChevronLeft, MdChevronRight } from "react-icons/md";

import { useAuthStore } from "@/store/auth-store";

import { useCartStore } from "@/store/cart-store";

import displayKESCurrency from "@/helpers/displayCurrency";



const Cart = () => {

  const router = useRouter();

  // Subscribe to the user object — this makes the component re-render on login/logout

  const user = useAuthStore((s) => s.user);

  const isAuthenticated = !!user;



  const {

    items,

    loading,

    fetchCart,

    updateQuantity,

    removeFromCart,

    totalCount,

    totalPrice,

    clearCart,

  } = useCartStore();



  const scrollRef = useRef<HTMLDivElement | null>(null);

  const loadingCart = new Array(6).fill(null);



  // When auth state changes, react accordingly

  useEffect(() => {

    if (isAuthenticated) {

      fetchCart();

    } else {

      // User is not logged in — wipe cart completely

      clearCart();

      useCartStore.persist.clearStorage();

    }

  }, [isAuthenticated, fetchCart, clearCart]);



  // Slow, continuous carousel auto-scroll.
  // It pauses only while a mouse is hovering over the carousel. Touching or
  // swiping does not permanently stop the animation; the animation remains slow.
  useEffect(() => {
    const el = scrollRef.current;

    if (!el || !isAuthenticated || loading || items.length < 2) return;

    let animationFrame = 0;
    let pausedByHover = false;
    let direction = 1;
    let lastTimestamp = 0;
    const speed = 8; // slow and subtle: pixels per second

    const onMouseEnter = () => {
      pausedByHover = true;
    };

    const onMouseLeave = () => {
      pausedByHover = false;
      lastTimestamp = 0;
    };

    const animate = (timestamp: number) => {
      if (lastTimestamp === 0) lastTimestamp = timestamp;
      const elapsed = Math.min(timestamp - lastTimestamp, 50);
      lastTimestamp = timestamp;

      if (!pausedByHover) {
        const maxScroll = el.scrollWidth - el.clientWidth;

        if (maxScroll > 2) {
          if (el.scrollLeft >= maxScroll - 1) direction = -1;
          else if (el.scrollLeft <= 1) direction = 1;

          const distance = (speed * elapsed) / 1000;
          el.scrollLeft = Math.max(0, Math.min(maxScroll, el.scrollLeft + direction * distance));
        }
      }

      animationFrame = window.requestAnimationFrame(animate);
    };

    el.addEventListener("mouseenter", onMouseEnter);
    el.addEventListener("mouseleave", onMouseLeave);
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      el.removeEventListener("mouseenter", onMouseEnter);
      el.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [isAuthenticated, loading, items.length]);

  const openProductDetails = (slug?: string) => {
    if (!slug) return;
    router.push(`/product-details/${slug}`);
  };

  const scrollByAmount = (dir: number) => {

    const el = scrollRef.current;

    if (!el) return;

    el.scrollBy({ left: dir * Math.max(220, Math.round(el.clientWidth * 0.75)), behavior: "smooth" });

  };



  const increaseQty = (productId: string, qty: number, stock: number) => {

    if (qty >= stock) return;

    updateQuantity(productId, qty + 1);

  };



  const decreaseQty = (productId: string, qty: number) => {

    if (qty <= 1) return;

    updateQuantity(productId, qty - 1);

  };



  const deleteCartProduct = (productId: string) => removeFromCart(productId);



  const handlePayment = () => {

    const encodedItems = encodeURIComponent(JSON.stringify(items));

    window.location.href = `/checkout?items=${encodedItems}`;

  };



  const handleContinueShopping = () => {

    window.location.href = "/";

  };



  // ---------- NOT LOGGED IN ----------

  if (!isAuthenticated) {

    return (

      <div className="min-h-screen bg-gradient-to-b from-cyan-950 via-gray-900 to-purple-950 flex flex-col">

        <div className="bg-gray-900/80 backdrop-blur border-b border-purple-800/50 sticky top-0 z-20">

          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">

            <div className="flex items-center justify-between gap-2">

              <button

                onClick={handleContinueShopping}

                className="flex items-center gap-1 sm:gap-2 text-gray-300 hover:text-cyan-400 transition-colors flex-shrink-0"

              >

                <MdArrowBack size={18} className="sm:w-5 sm:h-5" />

                <span className="text-xs sm:text-sm font-medium hidden xs:inline">

                  Continue Shopping

                </span>

              </button>

              <h1 className="text-sm sm:text-lg font-semibold text-white">Cart</h1>

              <div className="w-8 sm:w-24 flex-shrink-0" />

            </div>

          </div>

        </div>



        <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">

          <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gradient-to-br from-cyan-600/20 to-purple-600/20 border border-purple-700/50 rounded-full flex items-center justify-center mb-5">

            <MdShoppingCart size={36} className="text-cyan-400 sm:w-12 sm:h-12" />

          </div>

          <h2 className="text-lg sm:text-2xl font-bold text-white mb-2 text-center">

            Please login to view your cart

          </h2>

          <p className="text-gray-400 mb-6 text-center max-w-md text-xs sm:text-sm px-4">

            Sign in to your account to see items in your cart and continue shopping.

          </p>

          <div className="flex flex-col sm:flex-row gap-3">

            <a

              href="/login"

              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold px-8 py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base text-center"

            >

              Login

            </a>

            <a

              href="/register"

              className="border border-purple-600 text-cyan-400 hover:bg-purple-900/30 font-semibold px-8 py-2.5 sm:py-3 rounded-lg transition-colors text-sm sm:text-base text-center"

            >

              Register

            </a>

          </div>

        </div>

      </div>

    );

  }



  // ---------- LOGGED IN ----------

  return (

    <div className="min-h-screen bg-gradient-to-b from-cyan-950 via-gray-900 to-purple-950 flex flex-col">

      <div className="bg-gray-900/80 backdrop-blur border-b border-purple-800/50 sticky top-0 z-20">

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-3">

          <div className="flex items-center justify-between gap-2">

            <button

              onClick={handleContinueShopping}

              className="flex items-center gap-1 sm:gap-2 text-gray-300 hover:text-cyan-400 transition-colors flex-shrink-0"

            >

              <MdArrowBack size={18} className="sm:w-5 sm:h-5" />

              <span className="text-xs sm:text-sm font-medium hidden xs:inline">

                Continue Shopping

              </span>

            </button>

            <h1 className="text-sm sm:text-lg font-semibold text-white truncate">

              Cart

              {!loading && items.length > 0 && (

                <span className="ml-1 sm:ml-2 text-xs sm:text-sm font-normal text-gray-400">

                  ({totalCount()})

                </span>

              )}

            </h1>

            <div className="w-8 sm:w-24 flex-shrink-0" />

          </div>

        </div>

      </div>



      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-6">

        {items.length === 0 && !loading ? (

          <div className="flex flex-col items-center justify-center flex-1 py-10 sm:py-16">

            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-cyan-600/20 to-purple-600/20 border border-purple-700/50 rounded-full flex items-center justify-center mb-4">

              <MdShoppingCart size={30} className="text-cyan-400 sm:w-9 sm:h-9" />

            </div>

            <h2 className="text-base sm:text-xl font-semibold text-white mb-2">Your cart is empty</h2>

            <p className="text-gray-400 mb-6 text-center max-w-md text-xs sm:text-sm px-4">

              Looks like you haven't added anything to your cart yet.

            </p>

            <button

              onClick={handleContinueShopping}

              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base"

            >

              Start Shopping

            </button>

          </div>

        ) : (

          <>

            {/* Carousel */}

            <div className="bg-gradient-to-r from-cyan-900/60 to-purple-900/60 border border-purple-700/50 rounded-lg mb-3 sm:mb-5 backdrop-blur">

              <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-purple-700/40">

                <h2 className="text-xs sm:text-sm font-semibold text-white">

                  Your Items

                  <span className="ml-1 sm:ml-2 text-xs font-normal text-gray-300">

                    ({totalCount()})

                  </span>

                </h2>

                <div className="flex gap-1 sm:gap-2">

                  <button

                    onClick={() => scrollByAmount(-1)}

                    className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-purple-800/50 hover:bg-purple-700/70 text-cyan-400 transition-colors border border-purple-600/40"

                    aria-label="Scroll left"

                  >

                    <MdChevronLeft size={14} className="sm:w-4 sm:h-4" />

                  </button>

                  <button

                    onClick={() => scrollByAmount(1)}

                    className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full bg-purple-800/50 hover:bg-purple-700/70 text-cyan-400 transition-colors border border-purple-600/40"

                    aria-label="Scroll right"

                  >

                    <MdChevronRight size={14} className="sm:w-4 sm:h-4" />

                  </button>

                </div>

              </div>



              <div

                ref={scrollRef}

                className="flex gap-2 sm:gap-3 overflow-x-auto overscroll-x-contain touch-pan-x px-2 sm:px-3 py-3 scrollbar-hide"

                style={{ WebkitOverflowScrolling: "touch", scrollBehavior: "auto" }}

              >

                {loading

                  ? loadingCart.map((_, i) => (

                      <div

                        key={i}

                        className="flex-shrink-0 w-[120px] sm:w-[150px] bg-cyan-900/40 border border-purple-700/30 rounded-lg p-2 animate-pulse"

                      >

                        <div className="w-full h-16 sm:h-20 bg-purple-800/40 rounded mb-2" />

                        <div className="h-2.5 bg-purple-800/40 rounded w-3/4 mb-1.5" />

                        <div className="h-3 bg-purple-800/40 rounded w-1/2" />

                      </div>

                    ))

                  : items.map((product) => (

                      <div

                        key={product.productId}

                        role={product.product?.slug ? "link" : undefined}
                        tabIndex={product.product?.slug ? 0 : undefined}
                        onClick={(event) => {
                          if ((event.target as HTMLElement).closest("button")) return;
                          openProductDetails(product.product?.slug);
                        }}
                        onKeyDown={(event) => {
                          if (!product.product?.slug) return;
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openProductDetails(product.product.slug);
                          }
                        }}
                        className="flex-shrink-0 w-[120px] sm:w-[150px] bg-gradient-to-br from-cyan-900 to-purple-900 border border-purple-700/50 rounded-lg overflow-hidden hover:border-cyan-500/60 transition-all group cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400"

                      >

                        <div className="relative w-full h-16 sm:h-20 bg-gray-100 flex items-center justify-center">

                          <img

                            src={product.product?.productImage?.[0] || "/placeholder.png"}

                            className="max-w-full max-h-full object-contain mix-blend-multiply p-1"

                            alt={product.product?.productName || "Product"}

                          />

                          <button

                            onClick={() => deleteCartProduct(product.productId)}

                            className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-pink-500/90 text-white hover:bg-pink-600 rounded-full shadow-sm transition-colors opacity-0 group-hover:opacity-100"

                            aria-label="Remove item"

                          >

                            <MdDelete size={11} />

                          </button>

                        </div>



                        <div className="p-1.5 sm:p-2">

                          <h3 className="text-[10px] sm:text-xs font-medium text-white line-clamp-2 mb-1 leading-tight min-h-[24px] sm:min-h-[28px] group-hover:text-cyan-300 transition-colors">

                            {product.product?.productName}

                          </h3>

                          <p className="text-[10px] sm:text-xs font-semibold text-cyan-400 mb-1.5">

                            {displayKESCurrency(product.product?.sellingPrice || 0)}

                          </p>



                          <div className="flex items-center justify-between">

                            <div className="flex items-center border border-purple-600/50 rounded overflow-hidden bg-purple-900/40">

                              <button

                                className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-pink-400 hover:bg-pink-600 hover:text-white disabled:opacity-40 transition-colors"

                                onClick={() => decreaseQty(product.productId, product.quantity)}

                                disabled={product.quantity <= 1}

                              >

                                <MdRemove size={10} />

                              </button>

                              <span className="w-5 sm:w-6 text-center text-[10px] sm:text-xs font-medium text-white">

                                {product.quantity}

                              </span>

                              <button

                                className={`w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center transition-colors ${

                                  product.quantity >= (product.product?.stock || 0)

                                    ? "text-gray-500 cursor-not-allowed"

                                    : "text-cyan-400 hover:bg-cyan-600 hover:text-white"

                                }`}

                                onClick={() =>

                                  increaseQty(product.productId, product.quantity, product.product?.stock || 0)

                                }

                                disabled={product.quantity >= (product.product?.stock || 0)}

                              >

                                <MdAdd size={10} />

                              </button>

                            </div>

                          </div>

                          {product.quantity >= (product.product?.stock || 0) && (

                            <p className="text-[9px] text-pink-400 mt-1">Max stock</p>

                          )}

                        </div>

                      </div>

                    ))}

              </div>

            </div>



            {/* Summary */}

            <div className="w-full max-w-2xl mx-auto lg:max-w-none">

              {loading ? (

                <div className="bg-gradient-to-r from-cyan-900/60 to-purple-900/60 border border-purple-700/50 rounded-lg p-4 animate-pulse">

                  <div className="h-4 bg-purple-800/40 rounded w-1/3 mb-3" />

                  <div className="space-y-2.5">

                    <div className="h-3 bg-purple-800/40 rounded" />

                    <div className="h-3 bg-purple-800/40 rounded" />

                    <div className="h-9 bg-purple-800/40 rounded" />

                  </div>

                </div>

              ) : (

                <div className="bg-gradient-to-r from-cyan-900/60 to-purple-900/60 border border-purple-700/50 rounded-lg overflow-hidden backdrop-blur">

                  <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-purple-700/40">

                    <h2 className="text-sm sm:text-base font-semibold text-white">Order Summary</h2>

                  </div>



                  <div className="p-3 sm:p-4 space-y-2">

                    <div className="flex justify-between text-xs sm:text-sm">

                      <span className="text-gray-300">Subtotal ({totalCount()} items)</span>

                      <span className="font-medium text-white">{displayKESCurrency(totalPrice())}</span>

                    </div>

                    <div className="flex justify-between text-xs sm:text-sm">

                      <span className="text-gray-300">Delivery</span>

                      <span className="font-medium text-cyan-400">Free</span>

                    </div>



                    <div className="border-t border-purple-700/40 pt-2 mt-2">

                      <div className="flex justify-between items-center">

                        <span className="font-semibold text-sm sm:text-base text-white">Total</span>

                        <span className="font-bold text-base sm:text-xl text-cyan-400">

                          {displayKESCurrency(totalPrice())}

                        </span>

                      </div>

                    </div>

                  </div>



                  <div className="p-3 sm:p-4 bg-purple-950/40 border-t border-purple-700/40">

                    <button

                      onClick={handlePayment}

                      className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-semibold py-2.5 sm:py-3 px-4 rounded-lg transition-all text-sm sm:text-base"

                    >

                      Proceed to Checkout

                    </button>



                    <button

                      onClick={handleContinueShopping}

                      className="w-full mt-2 text-cyan-400 hover:text-cyan-300 font-medium py-1.5 text-xs sm:text-sm transition-colors"

                    >

                      Continue Shopping

                    </button>



                    <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] sm:text-xs text-gray-400">

                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />

                      </svg>

                      <span>Secure checkout powered by M-Pesa</span>

                    </div>

                  </div>

                </div>

              )}

            </div>

          </>

        )}

      </div>



      <style jsx>{`

        .scrollbar-hide::-webkit-scrollbar { display: none; }

        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        @media (min-width: 400px) { .xs\\:inline { display: inline; } }

      `}</style>

    </div>

  );

};



export default Cart;