import Link from "next/link";

export const metadata = {
  title: "404 — Not Found — Chirag Patil",
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl border-x border-[var(--line)] px-4 py-24 text-center">
      <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground block mb-2">
        404 — Not found
      </span>
      <h1 className="text-3xl font-medium tracking-tight text-foreground mb-4">
        Page not found
      </h1>
      <p className="font-mono text-sm text-muted-foreground mb-8">
        This page does not exist on this blueprint.
      </p>
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border)] font-mono text-xs text-foreground hover:bg-[var(--muted)] transition-colors"
        >
          ← Return to index
        </Link>
      </div>
    </div>
  );
}
