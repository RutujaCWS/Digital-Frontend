import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();
const API = 'https://digital-backend-phi.vercel.app/api/cart';

// ✅ Helper: get product id from item (handles both populated object and raw id)
const getProductId = (item) => {
  if (!item?.product) return null;
  if (typeof item.product === 'object') return item.product._id;
  return item.product;
};

// ✅ Helper: check if item has a valid populated product
const isValidItem = (item) =>
  item &&
  item.product &&
  typeof item.product === 'object' &&
  typeof item.product.price === 'number';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [] });
  const { token } = useAuth();

  // ═══════════════════════════════════════════
  // FETCH CART
  // ═══════════════════════════════════════════
  const fetchCart = async () => {
    if (!token) {
      setCart({ items: [] });
      return;
    }
    try {
      const { data } = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // ✅ Fakt valid (populated) items theva
      const validItems = (data?.items || []).filter(isValidItem);

      setCart({ ...data, items: validItems });
    } catch {
      setCart({ items: [] });
    }
  };

  // ═══════════════════════════════════════════
  // ADD TO CART
  // ═══════════════════════════════════════════
  const addToCart = async (productId, quantity = 1) => {
    if (!token) throw new Error('Login required');

    const { data } = await axios.post(
      `${API}/add`,
      { productId, quantity },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // ✅ Safe filter
    const validItems = (data?.items || []).filter(isValidItem);
    setCart({ ...data, items: validItems });

    return data;
  };

  // ═══════════════════════════════════════════
  // REMOVE FROM CART
  // ═══════════════════════════════════════════
  const removeFromCart = async (productId) => {
    // ✅ Keep previous items as fallback (with full populated data)
    const previousItems = cart.items;

    try {
      const { data } = await axios.delete(`${API}/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // ✅ Check if backend returned populated products
      const backendItems = data?.items || [];
      const allValid =
        backendItems.length > 0 && backendItems.every(isValidItem);

      if (allValid) {
        // Backend response good — use it
        setCart({ ...data, items: backendItems });
      } else {
        // Backend ne populate nahi kela — manually filter previous items
        const filtered = previousItems.filter(
          (item) => getProductId(item) !== productId
        );
        setCart({
          ...(typeof data === 'object' ? data : cart),
          items: filtered
        });
      }
    } catch (err) {
      // ✅ On error, still update locally
      const filtered = previousItems.filter(
        (item) => getProductId(item) !== productId
      );
      setCart({ ...cart, items: filtered });
      throw err;
    }
  };

  // ═══════════════════════════════════════════
  // UPDATE QUANTITY
  // ═══════════════════════════════════════════
  const updateQuantity = async (productId, quantity) => {
    // ✅ Save previous items (with populated product data)
    const previousItems = cart.items;

    try {
      const { data } = await axios.put(
        `${API}/update`,
        { productId, quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Check if backend returned populated products
      const backendItems = data?.items || [];
      const allValid =
        backendItems.length > 0 && backendItems.every(isValidItem);

      if (allValid) {
        // Backend response good — use it
        setCart({ ...data, items: backendItems });
      } else {
        // Backend ne populate nahi kela — manually update kara
        // Product object jasa cha tasa theva, fakt quantity change kara
        const updated = previousItems.map((item) => {
          if (getProductId(item) === productId) {
            return { ...item, quantity };
          }
          return item;
        });

        setCart({
          ...(typeof data === 'object' ? data : cart),
          items: updated
        });
      }
    } catch (err) {
      // ✅ On error, still update locally (optimistic)
      const updated = previousItems.map((item) => {
        if (getProductId(item) === productId) {
          return { ...item, quantity };
        }
        return item;
      });
      setCart({ ...cart, items: updated });
      throw err;
    }
  };

  // ═══════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════
  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const cartCount =
    cart.items?.reduce((s, i) => s + (Number(i.quantity) || 0), 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartCount,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);