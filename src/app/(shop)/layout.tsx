import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import { Toast } from "@/components/cart/Toast";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { config } from "@/lib/config";

/** Storefront chrome: glass header, cart drawer, toast, mobile tab bar. */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Header />
      <main className="min-h-[60vh]">{children}</main>
      <Footer />
      <CartDrawer deliveryFeeEur={config.pricing.deliveryFeeEur} freeDeliveryFromEur={config.pricing.freeDeliveryFromEur} />
      <Toast />
    </CartProvider>
  );
}
