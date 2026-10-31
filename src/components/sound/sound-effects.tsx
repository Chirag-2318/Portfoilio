'use client'

import type { SoundPatch } from '@web-kits/audio'
import { SoundProvider, usePatch } from '@web-kits/audio/react'
import { useEffect, useId, useRef, useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'

const STORAGE_KEY = 'cp-sound-muted'
const VOLUME_KEY = 'cp-sound-volume'
const DEFAULT_VOLUME = 0.4

const PATCH = {
  name: 'cp-ui',
  sounds: {
    tap: {
      source: { type: 'sine', frequency: 1300, fm: { ratio: 0.5, depth: 100 } },
      envelope: { attack: 0, decay: 0.015, sustain: 0, release: 0.005 },
      gain: 0.2,
    },
    select: {
      source: { type: 'triangle', frequency: { start: 900, end: 780 } },
      envelope: { attack: 0.001, decay: 0.055 },
      gain: 0.26,
    },
    toggleOn: {
      source: { type: 'sine', frequency: { start: 520, end: 880 } },
      envelope: { attack: 0.002, decay: 0.085 },
      gain: 0.3,
    },
    toggleOff: {
      source: { type: 'sine', frequency: { start: 780, end: 420 } },
      envelope: { attack: 0.002, decay: 0.085 },
      gain: 0.28,
    },
    open: {
      source: { type: 'triangle', frequency: { start: 320, end: 620 } },
      filter: { type: 'lowpass', frequency: 2600 },
      envelope: { attack: 0.006, decay: 0.13 },
      gain: 0.24,
    },
    close: {
      source: { type: 'triangle', frequency: { start: 560, end: 300 } },
      filter: { type: 'lowpass', frequency: 2200 },
      envelope: { attack: 0.004, decay: 0.11 },
      gain: 0.22,
    },
    tick: {
      source: { type: 'square', frequency: 1400 },
      filter: { type: 'lowpass', frequency: 3000 },
      envelope: { decay: 0.014 },
      gain: 0.1,
    },
    sliderTick: {
      layers: [
        {
          source: { type: 'noise', color: 'white' },
          filter: { type: 'bandpass', frequency: 3000, resonance: 4 },
          envelope: { attack: 0, decay: 0.02, sustain: 0, release: 0.006 },
          gain: 0.19,
        },
        {
          source: { type: 'sine', frequency: 700 },
          envelope: { attack: 0, decay: 0.012, sustain: 0, release: 0.004 },
          gain: 0.09,
        },
      ],
    },
    destructive: {
      layers: [
        {
          source: { type: 'triangle', frequency: { start: 300, end: 170 } },
          filter: { type: 'lowpass', frequency: 1400 },
          envelope: { attack: 0.002, decay: 0.12 },
          gain: 0.32,
        },
        {
          source: { type: 'noise', color: 'brown' },
          filter: { type: 'bandpass', frequency: 700, resonance: 1.1 },
          envelope: { decay: 0.05 },
          gain: 0.06,
        },
      ],
    },
    key: {
      layers: [
        {
          source: { type: 'sine', frequency: { start: 1000, end: 900 } },
          envelope: { attack: 0.001, decay: 0.028 },
          gain: 0.14,
        },
        {
          source: { type: 'noise', color: 'white' },
          filter: { type: 'bandpass', frequency: 3200, resonance: 2 },
          envelope: { decay: 0.01 },
          gain: 0.035,
        },
      ],
    },
    success: {
      layers: [
        {
          source: { type: 'triangle', frequency: 784 },
          envelope: { attack: 0.004, decay: 0.16 },
          gain: 0.22,
        },
        {
          source: { type: 'triangle', frequency: 1175 },
          envelope: { attack: 0.004, decay: 0.22 },
          gain: 0.18,
          delay: 0.075,
        },
      ],
    },
    error: {
      layers: [
        {
          source: { type: 'triangle', frequency: 300 },
          filter: { type: 'lowpass', frequency: 1200 },
          envelope: { attack: 0.003, decay: 0.13 },
          gain: 0.26,
        },
        {
          source: { type: 'triangle', frequency: 224 },
          filter: { type: 'lowpass', frequency: 1000 },
          envelope: { attack: 0.003, decay: 0.2 },
          gain: 0.24,
          delay: 0.09,
        },
      ],
    },
    warning: {
      layers: [
        {
          source: { type: 'triangle', frequency: 622 },
          filter: { type: 'lowpass', frequency: 2800 },
          envelope: { attack: 0.003, decay: 0.14 },
          gain: 0.2,
        },
        {
          source: { type: 'triangle', frequency: 622 },
          filter: { type: 'lowpass', frequency: 2800 },
          envelope: { attack: 0.003, decay: 0.18 },
          gain: 0.17,
          delay: 0.085,
        },
      ],
    },
    copy: {
      layers: [
        {
          source: { type: 'sine', frequency: 1200 },
          envelope: { attack: 0, decay: 0.015, sustain: 0, release: 0.006 },
          gain: 0.16,
        },
        {
          source: { type: 'sine', frequency: 1400 },
          envelope: { attack: 0, decay: 0.015, sustain: 0, release: 0.006 },
          delay: 0.04,
          gain: 0.14,
        },
      ],
    },
    notification: {
      layers: [
        {
          source: { type: 'triangle', frequency: 523 },
          envelope: { attack: 0.008, decay: 0.3, sustain: 0.03, release: 0.12 },
          gain: 0.14,
        },
        {
          source: { type: 'triangle', frequency: 784 },
          envelope: { attack: 0.008, decay: 0.25, sustain: 0.02, release: 0.1 },
          delay: 0.12,
          gain: 0.12,
        },
      ],
    },
    swoosh: {
      source: { type: 'sine', frequency: { start: 300, end: 2000 } },
      envelope: { attack: 0.008, decay: 0.12, sustain: 0, release: 0.04 },
      gain: 0.12,
    },
    chirp: {
      source: { type: 'sine', frequency: { start: 1200, end: 1500 } },
      envelope: { attack: 0, decay: 0.03, sustain: 0, release: 0.01 },
      gain: 0.08,
    },
    command: {
      layers: [
        {
          source: { type: 'triangle', frequency: { start: 1046, end: 784 } },
          envelope: { attack: 0.001, decay: 0.075 },
          gain: 0.2,
        },
        {
          source: { type: 'sine', frequency: 1568 },
          envelope: { attack: 0.001, decay: 0.045 },
          gain: 0.06,
          delay: 0.018,
        },
      ],
    },
    blocked: {
      source: { type: 'sine', frequency: 180 },
      filter: { type: 'lowpass', frequency: 700 },
      envelope: { attack: 0.004, decay: 0.06 },
      gain: 0.16,
    },
  },
} as const satisfies SoundPatch

export type SoundName = keyof (typeof PATCH)['sounds']

type Cue = { sound: SoundName; detune?: number; velocity?: number }

const JITTER: Record<SoundName, number> = {
  tap: 26, select: 22, toggleOn: 14, toggleOff: 14, open: 10, close: 10, tick: 18,
  sliderTick: 10, key: 20, destructive: 12, blocked: 30, chirp: 24, command: 8,
  copy: 6, notification: 3, swoosh: 14, success: 5, error: 5, warning: 5,
}

function jitter(cents: number) {
  return (Math.random() * 2 - 1) * cents
}

type Patch = { play: (name: string, opts?: object) => unknown }

let audioWarm = false

function play(patch: Patch, cue: Cue) {
  const sound = () =>
    patch.play(cue.sound, {
      detune: (cue.detune ?? 0) + jitter(JITTER[cue.sound]),
      velocity: (cue.velocity ?? 1) * (0.9 + Math.random() * 0.1),
    })
  if (audioWarm) {
    sound()
    return
  }
  audioWarm = true
  requestAnimationFrame(() => {
    window.setTimeout(sound, 0)
  })
}

function warm(patch: Patch) {
  if (audioWarm || !navigator.userActivation?.hasBeenActive) return
  audioWarm = true
  patch.play('tap', { volume: 0.0001 })
}

// Imperative API for code that decides the sound itself (theme toggle, game, hero pins).
let busPlay: ((cue: Cue) => void) | null = null

export function playSound(sound: SoundName, opts?: { detune?: number; velocity?: number }) {
  busPlay?.({ sound, ...opts })
}

// Only elements that opt in make sound: data-sound="<name>" or data-slot="*-trigger" (collapsibles).
const INTERACTIVE = '[data-sound], [data-slot$="-trigger"]'

const TEXT_ENTRY =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable]'

function classify(el: HTMLElement): Cue | null {
  const named = el.dataset.sound
  if (named && named in PATCH.sounds) return { sound: named as SoundName }
  const slot = el.dataset.slot ?? ''
  if (slot.endsWith('-trigger')) {
    const expanded = el.getAttribute('aria-expanded')
    if (expanded === null) return { sound: 'select' }
    // aria-expanded still has the PRE-click value when the pointer goes down.
    return { sound: expanded === 'true' ? 'close' : 'open' }
  }
  return null
}

function soundFor(target: Element, keyed = false): Cue | null {
  // Command palette (cmdk): the dialog content has class "command-overlay", rows have "command-option".
  if (target.closest('.command-overlay')) {
    const pointed = keyed ? target.getAttribute('aria-activedescendant') : null
    const row = pointed ? document.getElementById(pointed) : target.closest('.command-option')
    if (!row) return null
    return { sound: 'command' }
  }
  const labeled = target.closest('label')?.control ?? target
  if (labeled.closest(TEXT_ENTRY)) return null
  let el = labeled.closest<HTMLElement>(INTERACTIVE)
  while (el) {
    if (el.matches(':disabled, [aria-disabled="true"], [data-disabled]')) {
      return { sound: 'blocked' }
    }
    const cue = classify(el)
    if (cue) return cue
    el = el.parentElement?.closest<HTMLElement>(INTERACTIVE) ?? null
  }
  return null
}

function SoundEffectListener() {
  const patch = usePatch(PATCH)
  const muted = useSoundMuted()

  const wasMuted = useRef(muted)
  useEffect(() => {
    const cameBack = wasMuted.current && !muted
    wasMuted.current = muted
    if (cameBack) play(patch, { sound: 'swoosh' })
  }, [muted, patch])

  useEffect(() => {
    if (!patch.ready) return
    busPlay = (cue) => play(patch, cue)

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || !(event.target instanceof Element)) return
      const cue = soundFor(event.target)
      if (cue) play(patch, cue)
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      if (event.repeat || !(event.target instanceof Element)) return
      const typing = event.target.matches(TEXT_ENTRY)
      const driving = event.key === 'Enter' && event.target.closest('.command-overlay')
      if (typing && !driving) return
      const cue = soundFor(event.target, true)
      if (cue) play(patch, cue)
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      busPlay = null
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [patch])

  useEffect(() => {
    if (!patch.ready || muted) return
    const handle = window.setTimeout(() => {
      warm(patch)
    }, 400)
    return () => {
      window.clearTimeout(handle)
    }
  }, [patch, muted])

  return null
}

const listeners = new Set<() => void>()

function subscribeMuted(onChange: () => void) {
  listeners.add(onChange)
  window.addEventListener('storage', onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onChange)
  }
}

function notify() {
  for (const onChange of listeners) onChange()
}

function readMuted() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

export function isSoundMuted() {
  return typeof window === 'undefined' ? true : readMuted()
}

export function setSoundMuted(muted: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, muted ? '1' : '0')
  } catch {}
  notify()
}

export function useSoundMuted() {
  return useSyncExternalStore(subscribeMuted, readMuted, () => false)
}

export function setSoundVolume(volume: number) {
  try {
    localStorage.setItem(VOLUME_KEY, String(volume))
  } catch {}
  notify()
}

function readVolume() {
  try {
    const stored = Number(localStorage.getItem(VOLUME_KEY))
    return Number.isFinite(stored) && stored > 0 && stored <= 1 ? stored : DEFAULT_VOLUME
  } catch {
    return DEFAULT_VOLUME
  }
}

export function useSoundVolume() {
  return useSyncExternalStore(subscribeMuted, readVolume, () => DEFAULT_VOLUME)
}

export function SoundEffects({ children }: { children: React.ReactNode }) {
  const muted = useSoundMuted()
  const volume = useSoundVolume()

  return (
    <SoundProvider enabled={!muted} volume={volume}>
      <SoundEffectListener />
      {children}
    </SoundProvider>
  )
}

const SPEAKER =
  'M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z'
const WAVE_INNER = 'M16 9a5 5 0 0 1 0 6'
const WAVE_OUTER = 'M19.364 18.364a9 9 0 0 0 0-12.728'
const SLASH = 'M2 2 22 22'

export function SoundToggle({ className, onClick, ...props }: React.ComponentProps<'button'>) {
  const muted = useSoundMuted()
  const maskId = useId()

  return (
    <button
      type="button"
      aria-label={muted ? 'Unmute interface sounds' : 'Mute interface sounds'}
      aria-pressed={muted}
      onClick={(event) => {
        onClick?.(event)
        if (!event.defaultPrevented) setSoundMuted(!muted)
      }}
      data-sound="swoosh"
      {...props}
      className={cn(
        'flex size-7 cursor-pointer items-center justify-center rounded text-shell-fg-faint transition-[transform,box-shadow] duration-100 ease-out outline-none hover:bg-foreground/5 hover:text-shell-fg-muted focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] motion-reduce:transition-none',
        className,
      )}
    >
      <svg
        data-muted={muted}
        viewBox="0 0 24 24"
        width={17}
        height={17}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <mask id={maskId}>
          <rect width="24" height="24" fill="white" />
          <path className="sound-slash" d={SLASH} pathLength={1} stroke="black" strokeWidth={4} />
        </mask>
        <g mask={`url(#${maskId})`}>
          <path className="sound-speaker" d={SPEAKER} />
          <path className="sound-wave sound-wave-inner" d={WAVE_INNER} />
          <path className="sound-wave sound-wave-outer" d={WAVE_OUTER} />
        </g>
        <path className="sound-slash" d={SLASH} pathLength={1} />
      </svg>
    </button>
  )
}
