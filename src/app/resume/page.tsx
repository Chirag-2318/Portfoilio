import { ViewFrame } from "@/components/ui/ViewFrame";
import { ComingTogether } from "@/components/ui/ComingTogether";

export const metadata = {
  title: "Resume — Chirag Patil",
};

export default function ResumePage() {
  return (
    <ViewFrame
      kicker="04 — Curriculum Vitae"
      title="Resume"
      sub="Full resume sheet and offline PDF download."
    >
      <ComingTogether
        title="04 — Resume"
        note="The resume view is being set. Download and in-site view arrive soon."
      />
    </ViewFrame>
  );
}
