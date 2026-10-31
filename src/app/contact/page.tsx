import { Metadata } from "next";
import { ContactView } from "@/components/contact/ContactView";

export const metadata: Metadata = {
  title: "Contact",
  description: "Email, phone and links for Chirag Patil in Pune.",
};

export default function ContactPage() {
  return <ContactView />;
}
