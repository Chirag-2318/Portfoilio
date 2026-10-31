import { ResolveText } from "@/components/motion/ResolveText";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Page not in this proof — Chirag Patil",
};

export default function NotFound() {
  return (
    <div className="pt-12 sm:pt-16 max-w-2xl">
      <span className="label block mb-2">404 — Not found</span>
      <ResolveText as="h1" className="title-2xl font-serif mb-4">
        Page not in this proof
      </ResolveText>
      <p className="text-base text-ink-2 mb-8 leading-relaxed">
        That address does not exist. Try one of the views below.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button href="/" variant="primary">
          Home
        </Button>
        <Button href="/work" variant="outline">
          Work
        </Button>
        <Button href="/about" variant="outline">
          About
        </Button>
      </div>
    </div>
  );
}

