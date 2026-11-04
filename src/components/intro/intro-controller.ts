// Hand-off controller and event bus for the portfolio intro transition.
// Provides a typed contract for subsequent choreographies (e.g. cursor spawns).

export type IntroState = "loading" | "ready" | "entering" | "entered";

export interface IntroEnteringPayload {
  originX: number; // Viewport X coordinate of the Enter button center
  originY: number; // Viewport Y coordinate of the Enter button center
}

export type IntroListener<T = unknown> = (payload: T) => void;

class IntroController {
  private currentState: IntroState = "loading";
  private listeners: Map<string, Set<IntroListener<any>>> = new Map();

  /**
   * Get the current state of the intro scene.
   */
  getState(): IntroState {
    return this.currentState;
  }

  /**
   * Update internal state and emit state change notification.
   */
  setState(nextState: IntroState): void {
    if (this.currentState === nextState) return;
    this.currentState = nextState;
    this.emitInternal("intro:statechange", nextState);
  }

  /**
   * Subscribe to intro lifecycle events.
   * Returns an unsubscribe function.
   */
  on(event: "intro:entering", listener: IntroListener<IntroEnteringPayload>): () => void;
  on(event: "intro:entered", listener: IntroListener<void>): () => void;
  on(event: "intro:statechange", listener: IntroListener<IntroState>): () => void;
  on(event: string, listener: IntroListener<any>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => {
      this.listeners.get(event)?.delete(listener);
    };
  }

  /**
   * Trigger the "intro:entering" hand-off event.
   */
  emitEntering(originX: number, originY: number): void {
    this.setState("entering");
    const payload: IntroEnteringPayload = { originX, originY };
    this.emitInternal("intro:entering", payload);
  }

  /**
   * Trigger the "intro:entered" completion event.
   */
  emitEntered(): void {
    this.setState("entered");
    this.emitInternal("intro:entered", undefined);
  }

  private emitInternal(eventName: string, payload?: unknown): void {
    // 1. Dispatch to registered TypeScript listeners
    const group = this.listeners.get(eventName);
    if (group) {
      group.forEach((listener) => {
        try {
          listener(payload);
        } catch (err) {
          console.error(`[introController] Error in "${eventName}" listener:`, err);
        }
      });
    }

    // 2. Dispatch native window CustomEvent for decoupling across independent modules
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent(eventName, {
          detail: payload,
          bubbles: true,
          cancelable: false,
        })
      );
    }
  }
}

export const introController = new IntroController();
