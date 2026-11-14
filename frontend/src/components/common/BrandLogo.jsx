import logoLockupLight from '../../assets/brand/logo-lockup-light.png';
import logoLockupDark from '../../assets/brand/logo-lockup-dark.png';
import logoFullLight from '../../assets/brand/logo-full-light.png';
import logoFullDark from '../../assets/brand/logo-full-dark.png';
import logoMark from '../../assets/brand/logo-mark.png';

const SOURCES = {
  lockup: { light: logoLockupLight, dark: logoLockupDark },
  full: { light: logoFullLight, dark: logoFullDark },
};

/**
 * Logo Delta Sport.
 *
 *  - variant="lockup" (mặc định): biểu tượng + chữ nằm ngang, dùng ở header/sidebar/footer.
 *  - variant="full": logo xếp dọc (biểu tượng ở trên, chữ ở dưới), dùng ở chỗ rộng.
 *  - variant="mark": chỉ biểu tượng.
 *  - theme: bỏ trống => tự đổi theo giao diện (chữ navy ở light mode, chữ trắng ở dark mode).
 *           "light" | "dark" => ép cố định, dùng khi nền không đổi theo theme (vd: banner xanh).
 *
 * Chiều cao đặt bằng className, ví dụ className="h-9 w-auto".
 */
export default function BrandLogo({ variant = 'lockup', theme, className = '', alt = 'Delta Sport' }) {
  if (variant === 'mark') {
    return <img src={logoMark} alt={alt} className={className} draggable={false} />;
  }

  const { light, dark } = SOURCES[variant] || SOURCES.lockup;

  if (theme) {
    return <img src={theme === 'dark' ? dark : light} alt={alt} className={className} draggable={false} />;
  }

  return (
    <>
      <img src={light} alt={alt} className={`${className} block dark:hidden`} draggable={false} />
      <img src={dark} alt="" aria-hidden="true" className={`${className} hidden dark:block`} draggable={false} />
    </>
  );
}
