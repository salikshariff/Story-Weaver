/**
 * Read-aloud, built on the browser's own speech synthesis.
 *
 * A speech engine reads. A narrator performs, and the difference is almost
 * entirely in three things the engine will not do on its own:
 *
 *  1. Phrasing. The page is broken into paragraphs, sentences and clauses,
 *     each spoken as its own utterance with a pause after it sized to the
 *     punctuation that ended it. Without this everything runs together at one
 *     pitch, which is most of what "robotic" actually means.
 *  2. Voices within the voice. Dialogue is lifted and quickened; the "she
 *     whispered" attribution after it is dropped and thrown away quickly, the
 *     way a reader does; narration sits between them.
 *  3. Shape over a page. The opening line eases in, the closing line slows
 *     and lands, and successive narration sentences get a small deterministic
 *     pitch drift so the delivery never settles into a drone.
 *
 * The remaining limit is the voice itself, which belongs to the operating
 * system. `rankVoice` prefers the neural Enhanced/Premium voices over the old
 * formant ones, and the reader exposes a picker, but a legacy voice performed
 * well still sounds like a legacy voice.
 *
 * Everything degrades to silence rather than an error.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Narration pace, slower than conversational speech. The age band drives it,
// the same lever that already drives story length.
const RATE_BY_AGE = {
  '3-4': 0.72,
  '5-6': 0.78,
  '7-8': 0.85,
  '9-10': 0.9,
};

const PAUSE = {
  paragraph: 760,
  trailing: 640, // after an ellipsis — the sentence is meant to hang
  sentence: 470,
  clause: 225,
  breath: 90, // between dialogue and its attribution
};

// How each role is spoken, relative to the base rate and a pitch of 1.
const VOICING = {
  narration: { pitch: 1, rate: 1 },
  dialogue: { pitch: 1.07, rate: 1.03 },
  attribution: { pitch: 0.93, rate: 1.06 },
};

const LONG_RUN = 85;

// A speech tag, not just any short line after dialogue — "It was the smallest
// dragon she had ever seen" follows a quote too, and is narration.
const SPEECH_VERB =
  /\b(said|says|asked|replied|whispered|shouted|cried|murmured|called|answered|added|laughed|sighed|muttered|exclaimed|begged|agreed|wondered|repeated)\b/i;

export const speechSupported =
  typeof window !== 'undefined' &&
  'speechSynthesis' in window &&
  typeof window.SpeechSynthesisUtterance === 'function';

/** Split a stretch of text into quoted and unquoted runs, keeping offsets. */
function splitQuotes(text, base) {
  const runs = [];
  const pattern = /[“"][^“”"]*[”"]?/g;
  let cursor = 0;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      runs.push({ text: text.slice(cursor, match.index), start: base + cursor, quoted: false });
    }
    runs.push({ text: match[0], start: base + match.index, quoted: true });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) {
    runs.push({ text: text.slice(cursor), start: base + cursor, quoted: false });
  }
  return runs.filter((run) => run.text.trim());
}

/** Split a run into sentences, and over-long sentences into clauses. */
function splitPhrases(run, splitClauses) {
  const sentences = run.text.match(/[^.!?…]+(?:[.!?…]+["'”’)]*)?\s*/g) ?? [run.text];
  const phrases = [];
  let cursor = 0;

  for (const sentence of sentences) {
    if (!sentence.trim()) {
      cursor += sentence.length;
      continue;
    }
    const pieces =
      splitClauses && sentence.length > LONG_RUN
        ? sentence.match(/[^,;:—]+(?:[,;:—]+)?\s*/g) ?? [sentence]
        : [sentence];

    for (const piece of pieces) {
      if (!piece.trim()) {
        cursor += piece.length;
        continue;
      }
      phrases.push({ text: piece, start: run.start + cursor, quoted: run.quoted });
      cursor += piece.length;
    }
  }
  return phrases;
}

/**
 * Turn a page of prose into a performance script: an ordered list of segments,
 * each with a role, a pause to leave after it, and the offset it came from so
 * the spoken word can still be highlighted in the original paragraph.
 */
export function buildScript(text, options = {}) {
  const { splitClauses = true, splitQuotes: wantQuotes = true } = options;
  const segments = [];
  const paragraphs = text.split(/\n{2,}/);
  let paraBase = 0;

  paragraphs.forEach((paragraph, paraIndex) => {
    const runs = wantQuotes
      ? splitQuotes(paragraph, paraBase)
      : [{ text: paragraph, start: paraBase, quoted: false }].filter((r) => r.text.trim());
    let previousWasDialogue = false;

    runs.forEach((run) => {
      splitPhrases(run, splitClauses).forEach((phrase) => {
        const trimmed = phrase.text.trim();
        const closing = trimmed.replace(/["'”’)]+$/, '').slice(-1);

        let role = 'narration';
        if (phrase.quoted) role = 'dialogue';
        else if (previousWasDialogue && trimmed.length <= 45 && SPEECH_VERB.test(trimmed)) {
          role = 'attribution';
        }

        let pause = PAUSE.breath;
        if (/[.!?]/.test(closing)) pause = PAUSE.sentence;
        else if (closing === '…' || trimmed.endsWith('...')) pause = PAUSE.trailing;
        else if (/[,;:—]/.test(closing)) pause = PAUSE.clause;

        segments.push({
          text: trimmed,
          start: phrase.start,
          end: phrase.start + phrase.text.length,
          role,
          closing,
          pause,
        });

        previousWasDialogue = phrase.quoted;
      });
    });

    if (segments.length > 0 && paraIndex < paragraphs.length - 1) {
      segments[segments.length - 1].pause = PAUSE.paragraph;
    }
    paraBase += paragraph.length + 2;
  });

  return segments;
}

/**
 * Rank the installed voices. Neural voices ship under names marked Enhanced,
 * Premium, Neural or Natural; the unmarked legacy voices are the robotic ones.
 */
export function rankVoice(voice) {
  const name = voice.name.toLowerCase();
  let score = 0;

  if (/premium|enhanced|neural|natural/.test(name)) score += 100;
  if (/siri/.test(name)) score += 60;
  const liked = ['ava', 'allison', 'samantha', 'serena', 'jamie', 'matilda', 'daniel', 'moira', 'karen'];
  const likedIndex = liked.findIndex((n) => name.includes(n));
  if (likedIndex !== -1) score += 40 - likedIndex * 2;
  if (name.includes('google')) score += 30;
  if (voice.localService) score += 8;
  if (voice.default) score += 4;
  if (
    /albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|ralph|kathy/.test(
      name,
    )
  ) {
    score -= 200;
  }

  return score;
}

function useVoiceChoice() {
  const [voices, setVoices] = useState(() => (speechSupported ? speechSynthesis.getVoices() : []));
  const [chosenURI, setChosenURI] = useState(null);

  useEffect(() => {
    if (!speechSupported) return undefined;
    function sync() {
      setVoices(speechSynthesis.getVoices());
    }
    sync();
    speechSynthesis.addEventListener('voiceschanged', sync);
    return () => speechSynthesis.removeEventListener('voiceschanged', sync);
  }, []);

  const english = useMemo(
    () =>
      voices
        .filter((voice) => voice.lang?.toLowerCase().startsWith('en'))
        .sort((a, b) => rankVoice(b) - rankVoice(a)),
    [voices],
  );

  const voice = useMemo(() => {
    if (chosenURI) {
      const picked = english.find((v) => v.voiceURI === chosenURI);
      if (picked) return picked;
    }
    return english[0] ?? null;
  }, [english, chosenURI]);

  return { voices: english, voice, setChosenURI };
}

export function tokenize(text) {
  const tokens = [];
  const pattern = /\S+\s*/g;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    tokens.push({ text: match[0], start: match.index, end: match.index + match[0].length });
  }
  return tokens;
}

export function useReadAloud({ pages, page, goToPage, age }) {
  const { voices, voice, setChosenURI } = useVoiceChoice();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [charIndex, setCharIndex] = useState(-1);

  const playing = useRef(false);
  const session = useRef(0);
  const timer = useRef(null);

  const baseRate = RATE_BY_AGE[age] ?? RATE_BY_AGE['5-6'];

  const stop = useCallback(() => {
    playing.current = false;
    session.current += 1;
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    setIsSpeaking(false);
    setCharIndex(-1);
    if (speechSupported) speechSynthesis.cancel();
  }, []);

  const speakPageRef = useRef(null);

  const speakPage = useCallback(
    (index) => {
      if (!speechSupported) return;
      const source = pages[index];
      if (!source?.text) return;

      session.current += 1;
      const mine = session.current;
      if (timer.current) clearTimeout(timer.current);
      speechSynthesis.cancel();

      const script = buildScript(source.text);
      playing.current = true;
      setIsSpeaking(true);
      setCharIndex(-1);

      function perform(i) {
        if (!playing.current || session.current !== mine) return;

        if (i >= script.length) {
          const following = index + 1;
          if (following < pages.length) {
            goToPage(following);
            timer.current = setTimeout(() => {
              if (playing.current && session.current === mine) speakPageRef.current?.(following);
            }, 700);
          } else {
            stop();
          }
          return;
        }

        const segment = script[i];
        const voicing = VOICING[segment.role];
        const utterance = new SpeechSynthesisUtterance(segment.text);

        let rate = baseRate * voicing.rate;
        let pitch = voicing.pitch;

        // Shape across the page: ease in, and land the last line.
        if (i === 0) rate *= 0.97;
        if (i === script.length - 1) {
          rate *= 0.93;
          pitch -= 0.02;
        }

        // Sentence-level inflection.
        if (segment.closing === '?') pitch += 0.06;
        else if (segment.closing === '!') {
          pitch += 0.04;
          rate *= 1.03;
        }

        // A small deterministic drift keeps narration off a single note.
        if (segment.role === 'narration') pitch += (((i * 37) % 7) - 3) / 100;

        utterance.rate = Math.min(Math.max(rate, 0.5), 1.4);
        utterance.pitch = Math.min(Math.max(pitch, 0.6), 1.4);
        utterance.volume = 1;

        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        }

        utterance.onboundary = (event) => {
          if (session.current !== mine) return;
          if (event.name === 'word' || event.name === undefined) {
            setCharIndex(segment.start + (event.charIndex ?? 0));
          }
        };

        utterance.onend = () => {
          if (!playing.current || session.current !== mine) return;
          timer.current = setTimeout(() => perform(i + 1), segment.pause);
        };

        utterance.onerror = () => {
          if (session.current === mine) stop();
        };

        speechSynthesis.speak(utterance);
      }

      // Queueing in the same tick as cancel() drops the utterance in Safari
      // and Chrome both, so start on the next one.
      timer.current = setTimeout(() => perform(0), 0);
    },
    [pages, baseRate, voice, goToPage, stop],
  );

  speakPageRef.current = speakPage;

  const toggle = useCallback(() => {
    if (isSpeaking) stop();
    else speakPage(page);
  }, [isSpeaking, stop, speakPage, page]);

  useEffect(() => stop, [stop]);
  useEffect(() => {
    if (!speechSupported) return undefined;
    function onHide() {
      if (document.hidden) stop();
    }
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, [stop]);

  return {
    supported: speechSupported,
    isSpeaking,
    charIndex,
    highlight: isSpeaking && charIndex >= 0 ? { kind: 'word', charIndex } : null,
    toggle,
    stop,
    speakPage,
    voices,
    voice,
    setChosenURI,
    isPlaying: () => playing.current,
  };
}
