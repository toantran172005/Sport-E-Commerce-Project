import { ThemeProvider } from './ThemeContext.jsx';
import { UIProvider } from './UIContext.jsx';
import { AuthProvider } from './AuthContext.jsx';
import { StaffProvider } from './StaffContext.jsx';
import { CatalogProvider } from './CatalogContext.jsx';
import { CustomerProvider } from './CustomerContext.jsx';
import { UserScope } from './UserScope.jsx';
import { WishlistProvider } from './WishlistContext.jsx';
import { NotificationProvider } from './NotificationContext.jsx';
import { AddressProvider } from './AddressContext.jsx';
import { OrderProvider } from './OrderContext.jsx';
import { CartProvider } from './CartContext.jsx';

const providers = [
  ThemeProvider,
  UIProvider,
  AuthProvider,
  StaffProvider,
  CatalogProvider,
  CustomerProvider,
  // Từ đây trở xuống: dữ liệu thuộc về từng người dùng, mount lại khi đổi tài khoản
  UserScope,
  WishlistProvider,
  NotificationProvider,
  AddressProvider,
  OrderProvider,
  CartProvider,
];

/**
 * AppProviders: Composes all modular domain providers cleanly without deep nesting.
 */
export default function AppProviders({ children }) {
  return providers.reduceRight(
    (nested, Provider) => <Provider>{nested}</Provider>,
    children
  );
}

export { AppProviders };
