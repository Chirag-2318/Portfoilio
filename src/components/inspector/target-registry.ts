// Target Registry: scans DOM for [data-build-id], batch-measures bounding boxes
// (including multi-line text Range rects), caches coordinates, and updates build states.

import type { BuildState, BuildType, TargetRect } from "./inspector-types";

class TargetRegistry {
  private targets: Map<string, TargetRect> = new Map();
  private resizeObserver: ResizeObserver | null = null;
  private isInitialized = false;

  /**
   * Scan and register all elements with `data-build-id`.
   */
  public init(container?: HTMLElement | null): void {
    const root = container || (typeof document !== "undefined" ? document : null);
    if (!root) return;

    this.targets.clear();
    const elements = root.querySelectorAll<HTMLElement>("[data-build-id]");

    // Batch Read: measure all elements in a single pass to prevent reflow thrashing
    const measuredTargets: TargetRect[] = [];

    elements.forEach((el, index) => {
      const id = el.getAttribute("data-build-id") || `target-${index}`;
      const type = (el.getAttribute("data-build-type") as BuildType) || "block";
      const section = el.getAttribute("data-build-section") || undefined;
      const orderAttr = el.getAttribute("data-build-order");
      const order = orderAttr ? parseInt(orderAttr, 10) : index;

      const rect = el.getBoundingClientRect();

      let lineRects: DOMRect[] | undefined;
      if (type === "text") {
        try {
          const range = document.createRange();
          range.selectNodeContents(el);
          const clientRects = Array.from(range.getClientRects()).filter(
            (r) => r.width > 2 && r.height > 2
          );
          if (clientRects.length > 0) {
            lineRects = clientRects;
          }
        } catch {
          // Fall back to main rect
        }
      }

      measuredTargets.push({
        id,
        type,
        order,
        section,
        rect,
        lineRects,
        element: el,
      });
    });

    // Batch Write: store records and initialize attributes
    measuredTargets.forEach((t) => {
      this.targets.set(t.id, t);
      t.element.setAttribute("data-build-state", "pending");
    });

    // Set up resize observer to keep cached rects synchronized
    if (typeof window !== "undefined" && !this.resizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.remeasure();
      });

      const observeTarget = container || document.body;
      if (observeTarget) {
        this.resizeObserver.observe(observeTarget);
      }

      window.addEventListener("resize", this.handleResize, { passive: true });
    }

    this.isInitialized = true;
  }

  private handleResize = () => {
    this.remeasure();
  };

  /**
   * Recalculate bounding client rects for all registered targets without altering states.
   */
  public remeasure(): void {
    if (typeof document === "undefined") return;

    this.targets.forEach((target) => {
      if (!target.element || !target.element.isConnected) return;
      target.rect = target.element.getBoundingClientRect();

      if (target.type === "text") {
        try {
          const range = document.createRange();
          range.selectNodeContents(target.element);
          const clientRects = Array.from(range.getClientRects()).filter(
            (r) => r.width > 2 && r.height > 2
          );
          if (clientRects.length > 0) {
            target.lineRects = clientRects;
          }
        } catch {
          // ignore
        }
      }
    });
  }

  public getTarget(id: string): TargetRect | undefined {
    return this.targets.get(id);
  }

  public getAllTargets(): TargetRect[] {
    return Array.from(this.targets.values());
  }

  /**
   * Update the build state of a specific target element.
   */
  public setTargetState(id: string, state: BuildState): void {
    const target = this.targets.get(id);
    if (!target || !target.element) return;
    target.element.setAttribute("data-build-state", state);
  }

  /**
   * Immediately mark all targets as done.
   */
  public setAllDone(): void {
    this.targets.forEach((target) => {
      if (target.element) {
        target.element.setAttribute("data-build-state", "done");
      }
    });
  }

  /**
   * Cleanup observers and listeners.
   */
  public cleanup(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", this.handleResize);
    }
    this.targets.clear();
    this.isInitialized = false;
  }
}

export const targetRegistry = new TargetRegistry();

