"use client";

import * as React from "react";
import { ViewFrame } from "@/components/ui/ViewFrame";
import { EmailLink } from "@/components/contact/EmailLink";
import { ContactRows } from "@/components/contact/ContactRows";
import { Button } from "@/components/ui/Button";
import { MagneticArrow } from "@/components/ui/MagneticArrow";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/motion/Reveal";
import { useCopy } from "@/lib/useCopy";
import { useToaster } from "@/components/ui/Toaster";
import { site } from "@/content/site";
import { motion, AnimatePresence } from "motion/react";

export function ContactView() {
  const { copy } = useCopy();
  const { toast } = useToaster();
  const [copied, setCopied] = React.useState(false);
  const copyTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleCopy = () => {
    copy(site.email);
    toast("Email copied");
    setCopied(true);

    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => {
      setCopied(false);
    }, 1600);
  };

  React.useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  return (
    <ViewFrame
      kicker="05 — Contact"
      title="Contact"
      sub="Email is the best way to reach me."
      compactHeader
      className="h-full flex flex-col justify-between"
    >
      {/* DESKTOP (>= 1024px): 12 cols, gap 24px, fits one viewport with no page scroll at 1366x768 */}
      <div className="hidden lg:grid grid-cols-12 gap-8 xl:gap-12 items-end pt-4 pb-4">
        {/* LEFT COLUMN: Col 1-7, vertically anchored toward bottom */}
        <div className="col-span-7 flex flex-col justify-end">
          <Reveal delay={0.06} y={12}>
            <span className="label block mb-3 text-ink-2">Email</span>
            <EmailLink />
          </Reveal>

          <Reveal delay={0.16} y={12} className="mt-8 flex items-center gap-4">
            <Button
              href={`mailto:${site.email}?subject=Hello%20Chirag`}
              variant="primary"
            >
              <span>Write an email</span>
              <MagneticArrow variant="primary" />
            </Button>

            <Button
              variant="outline"
              onClick={handleCopy}
              className="min-w-[148px]"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={copied ? "check" : "copy"}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center"
                >
                  <Icon
                    name={copied ? "check" : "copy"}
                    size={16}
                    className={copied ? "text-accent" : "text-ink-2"}
                  />
                </motion.span>
              </AnimatePresence>
              <span aria-live="polite">
                {copied ? "Copied" : "Copy address"}
              </span>
            </Button>
          </Reveal>
        </div>

        {/* RIGHT COLUMN: Col 8-12, span 5 */}
        <div className="col-span-5 pb-1">
          <Reveal delay={0.24} y={12}>
            <ContactRows />
          </Reveal>
        </div>
      </div>

      {/* TABLET / MOBILE (< 1024px) */}
      <div className="flex flex-col gap-8 lg:hidden pt-2 pb-12">
        <Reveal delay={0.06} y={8}>
          <span className="label block mb-2 text-ink-2">Email</span>
          <EmailLink />
        </Reveal>

        <Reveal delay={0.12} y={8} className="flex flex-col sm:flex-row gap-3 w-full">
          <Button
            href={`mailto:${site.email}?subject=Hello%20Chirag`}
            variant="primary"
            className="w-full sm:flex-1 h-11"
          >
            <span>Write an email</span>
            <MagneticArrow variant="primary" />
          </Button>

          <Button
            variant="outline"
            onClick={handleCopy}
            className="w-full sm:flex-1 h-11"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={copied ? "check" : "copy"}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center"
              >
                <Icon
                  name={copied ? "check" : "copy"}
                  size={16}
                  className={copied ? "text-accent" : "text-ink-2"}
                />
              </motion.span>
            </AnimatePresence>
            <span aria-live="polite">
              {copied ? "Copied" : "Copy address"}
            </span>
          </Button>
        </Reveal>

        <Reveal delay={0.18} y={12}>
          <ContactRows />
        </Reveal>
      </div>
    </ViewFrame>
  );
}

