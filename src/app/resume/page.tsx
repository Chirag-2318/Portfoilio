import { Metadata } from "next";
import { ResumeView } from "@/components/resume/ResumeView";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "Resume of Chirag Patil: education, skills, projects and achievements.",
};

export default function ResumePage() {
  return <ResumeView />;
}
