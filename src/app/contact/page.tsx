import type { Metadata } from "next";
import { site, isPlaceholder } from "@/content/site";
import { ContactView } from "@/components/contact/ContactView";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Email, phone and location for Chirag Patil in Pune, Maharashtra, India.",
  ...(isPlaceholder(site.url) ? {} : { alternates: { canonical: "./" } }),
};

export default function ContactPage() {
  return <ContactView />;
}
