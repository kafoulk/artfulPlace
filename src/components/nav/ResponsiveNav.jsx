import useViewport from "./useViewport";
import NavbarTop from "./NavbarTop";
import NavbarBottom from "./NavbarBottom";

// A responsive navigation component that switches between top and bottom navbars
// based on the viewport size.
export default function ResponsiveNav() {
  const { isDesktop } = useViewport();
  return isDesktop ? <NavbarTop /> : <NavbarBottom />;
}
