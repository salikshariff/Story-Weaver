/**
 * Neural narration with Kokoro-82M, running entirely in the browser.
 *
 * The model (Apache 2.0, 82M parameters) is fetched once from the Hugging Face
 * hub and cached by the browser, then synthesizes locally. There is no server
 * route, no API key, and nothing leaves the machine after the first load.
 *
 * Two differences from the system-voice engine shape the code:
 *
 *  - Kokoro has its own sentence prosody, so it is fed whole sentences rather
 *    than the clause fragments the system engine needs. Chopping a sentence up
 *    would fight the model instead of helping it.
 *  - It returns audio, not speech events, so there are no word timings. The
 *    sentence being spoken is highlighted instead of the word.
 *
 * Each sentence is synthesized one ahead of playback, so the gap between
 * sentences stays the pause we want rather than the time generation took.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import { buildScript } from './speech.js';

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';

// Narration pace, matching the system engine's age scaling.
const SPEED_BY_AGE = {
  '3-4': 0.80,
  '5-6': 0.85,
  '7-8': 0.92,
  '9-10': 0.98,
};

const ROLE_SPEED = {
  narration: 1,
  dialogue: 1.02,
  attribution: 1.06,
};

export const kokoroSupported =
  typeof window !== 'undefined' && typeof WebAssembly === 'object';

async function pickDevice() {
  // WebGPU is markedly faster where it exists, and wants fp32.
  if (typeof navigator !== 'undefined' && navigator.gpu) {
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter) return { device: 'webgpu', dtype: 'fp32' };
    } catch {
      // fall through to wasm
    }
  }
  return { device: 'wasm', dtype: 'q8' };
}

let modelPromise = null;

/** Load once per page; every later call reuses the same instance. */
export function loadKokoro(onProgress) {
  if (!modelPromise) {
    modelPromise = (async () => {
      const { KokoroTTS } = await import('kokoro-js');
      const { device, dtype } = await pickDevice();
      const tts = await KokoroTTS.from_pretrained(MODEL_ID, {
        dtype,
        device,
        progress_callback: (event) => {
          if (event?.status === 'progress' && typeof event.progress === 'number') {
            onProgress?.(Math.round(event.progress));
          }
        },
      });
      return { tts, device };
    })().catch((error) => {
      modelPromise = null;
      throw error;
    });
  }
  return modelPromise;
}

/** The voices, best first. Kokoro ships a quality grade for each. */
export function listVoices(tts) {
  const order = { A: 0, 'A-': 1, 'B+': 2, B: 3, 'B-': 4, 'C+': 5, C: 6, 'C-': 7, D: 8, 'D-': 9, 'F+': 10, F: 11 };
  return Object.entries(tts.voices)
    .map(([id, meta]) => ({
      id,
      name: meta.name,
      language: meta.language,
      gender: meta.gender,
      grade: meta.overallGrade,
    }))
    .sort((a, b) => (order[a.grade] ?? 99) - (order[b.grade] ?? 99));
}

export function useKokoroNarrator({ pages, page, goToPage, age }) {
  const [status, setStatus] = useState('idle'); // idle | loading | ready | error
  const [progress, setProgress] = useState(0);
  const [voices, setVoices] = useState([]);
  const [voiceId, setVoiceId] = useState('af_heart');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [range, setRange] = useState(null);

  const ttsRef = useRef(null);
  const ctxRef = useRef(null);
  const sourceRef = useRef(null);
  const timerRef = useRef(null);
  const playing = useRef(false);
  const session = useRef(0);

  const baseSpeed = SPEED_BY_AGE[age] ?? SPEED_BY_AGE['5-6'];

  const stop = useCallback(() => {
    playing.current = false;
    session.current += 1;
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (sourceRef.current) {
      try {
        sourceRef.current.onended = null;
        sourceRef.current.stop();
      } catch {
        // already finished
      }
      sourceRef.current = null;
    }
    setIsSpeaking(false);
    setRange(null);
  }, []);

  const ensureLoaded = useCallback(async () => {
    if (ttsRef.current) return ttsRef.current;
    setStatus('loading');
    try {
      const { tts } = await loadKokoro(setProgress);
      ttsRef.current = tts;
      setVoices(listVoices(tts));
      setStatus('ready');
      return tts;
    } catch (error) {
      setStatus('error');
      throw error;
    }
  }, []);

  const speakPageRef = useRef(null);

  const speakPage = useCallback(
    async (index) => {
      if (!kokoroSupported) return;
      const source = pages[index];
      if (!source?.text) return;

      session.current += 1;
      const mine = session.current;
      if (timerRef.current) clearTimeout(timerRef.current);

      let tts;
      try {
        tts = await ensureLoaded();
      } catch {
        return;
      }
      if (session.current !== mine) return;

      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = ctxRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      // Sentences, not clauses — Kokoro handles the rhythm inside a sentence.
      const script = buildScript(source.text, { splitClauses: false, splitQuotes: false });

      playing.current = true;
      setIsSpeaking(true);

      const synth = (i) => {
        const segment = script[i];
        if (!segment) return Promise.resolve(null);
        return tts
          .generate(segment.text, {
            voice: voiceId,
            speed: baseSpeed * (ROLE_SPEED[segment.role] ?? 1),
          })
          .catch(() => null);
      };

      // Keep one sentence in flight ahead of the one being played.
      let pending = synth(0);

      const play = async (i) => {
        if (!playing.current || session.current !== mine) return;

        if (i >= script.length) {
          const following = index + 1;
          if (following < pages.length) {
            goToPage(following);
            timerRef.current = setTimeout(() => {
              if (playing.current && session.current === mine) speakPageRef.current?.(following);
            }, 700);
          } else {
            stop();
          }
          return;
        }

        const raw = await pending;
        if (!playing.current || session.current !== mine) return;
        pending = synth(i + 1);

        if (!raw) {
          play(i + 1);
          return;
        }

        const segment = script[i];
        setRange({ start: segment.start, end: segment.end });

        const buffer = ctx.createBuffer(1, raw.audio.length, raw.sampling_rate);
        buffer.copyToChannel(raw.audio, 0);

        const node = ctx.createBufferSource();
        node.buffer = buffer;
        node.connect(ctx.destination);
        node.onended = () => {
          if (!playing.current || session.current !== mine) return;
          timerRef.current = setTimeout(() => play(i + 1), segment.pause);
        };
        sourceRef.current = node;
        node.start();
      };

      play(0);
    },
    [pages, voiceId, baseSpeed, goToPage, stop, ensureLoaded],
  );

  speakPageRef.current = speakPage;

  const toggle = useCallback(() => {
    if (isSpeaking) stop();
    else speakPage(page);
  }, [isSpeaking, stop, speakPage, page]);

  useEffect(() => stop, [stop]);
  useEffect(() => {
    function onHide() {
      if (document.hidden) stop();
    }
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [stop]);

  return {
    supported: kokoroSupported,
    status,
    progress,
    voices,
    voiceId,
    setVoiceId,
    isSpeaking,
    highlight: range ? { kind: 'range', ...range } : null,
    toggle,
    stop,
    speakPage,
    isPlaying: () => playing.current,
  };
}
