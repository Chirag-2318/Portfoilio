import { ViewFrame } from "@/components/ui/ViewFrame";
import { ComingTogether } from "@/components/ui/ComingTogether";
import { site } from "@/content/site";

export const metadata = {
  title: "Contact — Chirag Patil",
};

export default function ContactPage() {
  return (
    <ViewFrame
      kicker="05 — Reach out"
      title="Contact"
      sub="Email, phone, and links."
    >
      <ComingTogether
        title="05 — Contact"
        note={
          <span>
            Contact details are being set. For now:{" "}
            <a
              href={`mailto:${site.email}?subject=Hello%20Chirag`}
              className="text-accent underline underline-offset-4 decoration-1"
            >
              {site.email}
            </a>
          </span>
        }
      />
    </ViewFrame>
  );
}

