/* eslint-disable react-refresh/only-export-components */
import { useTheme } from './ThemeContext.jsx';
import { useUI } from './UIContext.jsx';
import { useAuth } from './AuthContext.jsx';
import { useCatalog } from './CatalogContext.jsx';
import { useCustomer } from './CustomerContext.jsx';
import { useWishlist } from './WishlistContext.jsx';
import { useNotification } from './NotificationContext.jsx';
import { useAddress } from './AddressContext.jsx';
import { useOrder } from './OrderContext.jsx';
import { useCart } from './CartContext.jsx';
import AppProviders from './AppProviders.jsx';

/**
 * useStore: High-level facade hook for 100% backward compatibility.
 * Aggregates all modular domain contexts so existing components continue to work
 * without breaking changes while allowing new components to consume discrete domain hooks.
 */
export function useStore() {
  const theme = useTheme();
  const ui = useUI();
  const auth = useAuth();
  const catalog = useCatalog();
  const customer = useCustomer();
  const wishlist = useWishlist();
  const notification = useNotification();
  const address = useAddress();
  const order = useOrder();
  const cart = useCart();

  return {
    ...theme,

    ...ui,

    ...auth,

    ...catalog,

    ...customer,

    ...wishlist,

    ...notification,

    ...address,

    ...order,

    ...cart,
  };
}

/**
 * StoreProvider facade: alias to the composed AppProviders
 */
export const StoreProvider = AppProviders;

export { useTheme, ThemeProvider } from './ThemeContext.jsx';
export { useUI, UIProvider } from './UIContext.jsx';
export { useAuth, AuthProvider } from './AuthContext.jsx';
export { useCatalog, CatalogProvider } from './CatalogContext.jsx';
export { useCustomer, CustomerProvider } from './CustomerContext.jsx';
export { useWishlist, WishlistProvider } from './WishlistContext.jsx';
export { useNotification, NotificationProvider } from './NotificationContext.jsx';
export { useAddress, AddressProvider } from './AddressContext.jsx';
export { useOrder, OrderProvider } from './OrderContext.jsx';
export { useCart, CartProvider } from './CartContext.jsx';
export { AppProviders };

export default useStore;
