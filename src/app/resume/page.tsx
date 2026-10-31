import type { Metadata } from "next";
import { site, isPlaceholder } from "@/content/site";
import { ResumeView } from "@/components/resume/ResumeView";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Resume of Chirag Patil: education, skills, projects and achievements.",
  ...(isPlaceholder(site.url) ? {} : { alternates: { canonical: "./" } }),
};

export default function ResumePage() {
  return <ResumeView />;
}
