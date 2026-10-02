// German word pronunciation backed by the Web Speech API. The browser owns the
// voices; there are no audio assets to ship. Every utterance carries a `key`,
// so the UI can tell which control is speaking and toggle it off.
//
// Toggle rules, shared by all controls: the same key stops, a different key
// cancels whatever is playing and starts the new text.

const storageKey = "spiky-speech";

const supported =
  typeof window !== "undefined" &&
  "speechSynthesis" in window &&
  "SpeechSynthesisUtterance" in window;

export const speechSupported: boolean = supported;

function readSaved(): boolean | null {
  try {
    const value = localStorage.getItem(storageKey);
    return value === "on" ? true : value === "off" ? false : null;
  } catch {
    return null;
  }
}

// Pronunciation is on unless the learner turns it off.
let enabled = $state<boolean>(readSaved() ?? true);
let speakingKey = $state<string | null>(null);

// Bumped on every stop/start so stale utterance callbacks from a cancelled
// queue never clear the state of the audio that replaced them.
let session = 0;

export function isSpeechEnabled(): boolean {
  return enabled && speechSupported;
}

export function getSpeakingKey(): string | null {
  return speakingKey;
}

export function toggleSpeech(): void {
  enabled = !enabled;
  try {
    localStorage.setItem(storageKey, enabled ? "on" : "off");
  } catch {
    // Private mode or full storage: the choice still applies for this session.
  }
  if (!enabled) stopSpeech();
}

// Keeps the letters and digits of a tapped word, drops the punctuation and
// quotes around it: «"Hallo!"» → Hallo. Empty means "not a word".
export function cleanSpeechText(text: string): string {
  return text
    .replace(/^[^\p{L}\p{N}]+/u, "")
    .replace(/[^\p{L}\p{N}]+$/u, "")
    .trim();
}

function germanVoice(): SpeechSynthesisVoice | null {
  if (!speechSupported) return null;
  const voices = window.speechSynthesis.getVoices();
  const german = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("de"),
  );
  // Locally installed voices are the reliable ones: remote/network voices
  // silently fall back to the system default (usually English) when they fail.
  return (
    german.find((voice) => voice.localService) ??
    german.find((voice) => voice.lang.toLowerCase() === "de-de") ??
    german[0] ??
    null
  );
}

// Vivaldi (and some Chromium builds) report an empty voice list until the
// engine has spoken once, so the very first click had no German voice attached
// and fell back to the system default. Prime the engine with a silent
// utterance and wait for the list before speaking the real text.
function loadVoices(isCurrent: () => boolean): Promise<void> {
  if (!speechSupported || window.speechSynthesis.getVoices().length) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearInterval(poll);
      clearTimeout(timeout);
      if (typeof synth.removeEventListener === "function") {
        synth.removeEventListener("voiceschanged", finish);
      }
      synth.onvoiceschanged = null;
      // Drop the warm-up only while we still own the engine; a newer click
      // may already be speaking with its own voice.
      if (isCurrent() && (synth.speaking || synth.pending)) synth.cancel();
      resolve();
    };
    const poll = setInterval(() => {
      if (synth.getVoices().length) finish();
    }, 50);
    const timeout = setTimeout(finish, 1500);
    if (typeof synth.addEventListener === "function") {
      synth.addEventListener("voiceschanged", finish);
    } else {
      synth.onvoiceschanged = finish;
    }
    const nudge = new SpeechSynthesisUtterance(" ");
    nudge.lang = "de-DE";
    nudge.volume = 0;
    synth.speak(nudge);
  });
}

export function speak(key: string, text: string): void {
  if (!isSpeechEnabled()) return;
  if (speakingKey === key) {
    stopSpeech();
    return;
  }
  const chunks = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!chunks.length) return;

  stopSpeech();
  const mySession = session;
  speakingKey = key;

  void loadVoices(() => session === mySession).then(() => {
    if (session !== mySession) return;
    const voice = germanVoice();
    let index = 0;

    // Lines are chained one utterance at a time instead of queued: some
    // browsers drop `voice` for every utterance after the first in a queue,
    // which made the speaker switch to the system language mid-sentence.
    const speakNext = () => {
      if (session !== mySession) return;
      if (index >= chunks.length) {
        speakingKey = null;
        return;
      }
      const utterance = new SpeechSynthesisUtterance(chunks[index++]);
      utterance.lang = "de-DE";
      if (voice) utterance.voice = voice;
      let handled = false;
      const next = () => {
        if (handled) return;
        handled = true;
        speakNext();
      };
      utterance.onend = next;
      utterance.onerror = next;
      window.speechSynthesis.speak(utterance);
    };
    speakNext();
  });
}

export function stopSpeech(): void {
  // The session bump comes first so a cancel callback from the in-flight
  // utterance cannot chain the next line back on.
  session += 1;
  // Cancelling only when something is actually queued avoids the iOS Safari
  // quirk where cancel() immediately followed by speak() drops the voice.
  if (
    speechSupported &&
    (window.speechSynthesis.speaking || window.speechSynthesis.pending)
  ) {
    window.speechSynthesis.cancel();
  }
  speakingKey = null;
}
