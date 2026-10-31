import { ViewFrame } from "@/components/ui/ViewFrame";
import { ComingTogether } from "@/components/ui/ComingTogether";

export const metadata = {
  title: "Work — Chirag Patil",
};

export default function WorkPage() {
  return (
    <ViewFrame
      kicker="02 — Selected work"
      title="Work"
      sub="Three projects: Suspicious Activity Reports backend, HIPAA EDI validator, and a zero-typing UPI expense tracker."
    >
      <ComingTogether
        title="02 — Work"
        note="The work portfolio is being set. Detailed project case studies arrive in Prompt 4."
      />
    </ViewFrame>
  );
}

