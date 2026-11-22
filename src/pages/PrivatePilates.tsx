import { privateProduct } from "@/content/content";
import OrderPage from "@/components/checkout/OrderPage";

/**
 * Private sessions at /private-pilates: the program's order page layout with
 * private.json's words, for a link Diana sends. No application first, so no
 * "you qualify" bar. The button goes to the Stripe link once it is set in
 * private.json, and to the contact page (fallbackUrl) until then.
 */
export default function PrivatePilates() {
  const { option, fallbackUrl, shortName } = privateProduct;
  return (
    <OrderPage
      product={privateProduct}
      href={option.stripeUrl || fallbackUrl}
      mailSubject={shortName}
    />
  );
}
