import { ViewFrame } from "@/components/ui/ViewFrame";
import { ComingTogether } from "@/components/ui/ComingTogether";

export const metadata = {
  title: "About — Chirag Patil",
};

export default function AboutPage() {
  return (
    <ViewFrame
      kicker="03 — Background & skills"
      title="About"
      sub="Engineering student at PICT Pune and IIT Madras. Languages, frameworks, achievements."
    >
      <ComingTogether
        title="03 — About"
        note="The profile, education, skills and highlights views are being set. Full tabs arrive in Prompt 5."
      />
    </ViewFrame>
  );
}
