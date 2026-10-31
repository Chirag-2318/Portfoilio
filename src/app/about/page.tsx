import type { Metadata } from "next";
import { site, isPlaceholder } from "@/content/site";
import { AboutView } from "@/components/about/AboutView";

export const metadata: Metadata = {
  title: "About",
  description:
    "Second-year engineering student at PICT Pune and IIT Madras. Profile, education, technical skills, and hackathon highlights.",
  ...(isPlaceholder(site.url) ? {} : { alternates: { canonical: "./" } }),
};

export default function AboutPage() {
  return <AboutView />;
}
