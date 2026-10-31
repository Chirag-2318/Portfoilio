import type { Metadata } from "next";
import { TokenShowcase } from "@/components/ui/TokenShowcase";

export const metadata: Metadata = {
  title: "Tokens & Specimens — Chirag Patil",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DevTokensPage() {
  return <TokenShowcase />;
}

