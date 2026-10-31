import type { Metadata } from "next";
import { site, isPlaceholder } from "@/content/site";
import { WorkView } from "@/components/work/WorkView";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Three builds: a Spring Boot reporting backend, a FastAPI EDI validator and an offline Android expense tracker.",
  ...(isPlaceholder(site.url) ? {} : { alternates: { canonical: "./" } }),
};

export default function WorkPage() {
  return <WorkView />;
}
