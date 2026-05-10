"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const FILLER_WORDS = [
  "um", "uh", "like", "you know", "actually", "basically",
  "literally", "i mean", "kind of", "sort of",
];

function countFillers(text: string): number {
  if (!text) return 0;
  const lower = text.toLowerCase();
  let count = 0;
  for (const filler of FILLER_WORDS) {
    const regex = new RegExp(`\\b${filler}\\b`, "g");
    const matches = lower.match(regex);
    if (matches) count += matches.length;
  }
  return count;
}

type SpeechState = "idle" | "listening" | "speaking" | "thinking";

export function useSpeech() {
  const [state, setState] = useState<SpeechState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recogRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef("");

  // CRITICAL: Tracks user intent — true while button held.
  // Chrome auto-stops recognition every few seconds; we restart it as long as
  // the user is still holding the button down.
  const shouldKeepListeningRef = useRef(false);

  // Initialize SpeechRecognition once
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognitionImpl =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionImpl) {
      setIsSupported(false);
      setError("Speech recognition not supported in this browser. Use Chrome.");
      return;
    }
    const recog = new SpeechRecognitionImpl();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = "en-US";

    recog.onresult = (event: SpeechRecognitionEvent) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptPiece = result[0].transcript;
        if (result.isFinal) {
          finalChunk += transcriptPiece;
        } else {
          interimChunk += transcriptPiece;
        }
      }
      if (finalChunk) {
        transcriptRef.current = (transcriptRef.current + " " + finalChunk).trim();
        setTranscript(transcriptRef.current);
      }
      setInterimTranscript(interimChunk);
    };

    recog.onerror = (e: SpeechRecognitionErrorEvent) => {
      // Silently ignore "no-speech" — fires constantly when user pauses
      if (e.error === "no-speech" || e.error === "aborted") return;
      console.warn("Speech recognition error:", e.error);
      // For "audio-capture" or "not-allowed", surface to user
      if (e.error === "not-allowed" || e.error === "audio-capture") {
        setError(`Mic error: ${e.error}. Check permissions.`);
        shouldKeepListeningRef.current = false;
      }
    };

    // THIS IS THE KEY FIX:
    // Chrome ends the recognition session every few seconds.
    // If the user is still pressing the button, just restart it immediately.
    recog.onend = () => {
      if (shouldKeepListeningRef.current) {
        try {
          recog.start();
          // Stay in "listening" state — don't reset
        } catch {
          // already started or recovering — ignore
        }
      } else {
        setState("idle");
      }
    };

    recogRef.current = recog;

    return () => {
      shouldKeepListeningRef.current = false;
      try {
        recog.abort();
      } catch {}
    };
  }, []);

  // Start listening (push-to-talk press)
  const startListening = useCallback(() => {
    if (!recogRef.current) return;
    setError(null);
    transcriptRef.current = "";
    setTranscript("");
    setInterimTranscript("");
    shouldKeepListeningRef.current = true;
    try {
      recogRef.current.start();
      setState("listening");
    } catch {
      // Already started — ignore. The onend handler will keep it alive.
    }
  }, []);

  // Stop listening (push-to-talk release) — returns the final transcript
  const stopListening = useCallback((): string => {
    shouldKeepListeningRef.current = false;
    if (!recogRef.current) return transcriptRef.current;
    try {
      recogRef.current.stop();
    } catch {}
    setState("idle");
    return transcriptRef.current;
  }, []);

  // Speak — agent says a question out loud
  const speak = useCallback((text: string, onDone?: () => void) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      onDone?.();
      return;
    }
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.0;
    utter.pitch = 1.05;
    utter.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => v.name.includes("Samantha")) ??
      voices.find((v) => v.name.includes("Karen")) ??
      voices.find((v) => /female/i.test(v.name)) ??
      voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utter.voice = preferred;

    utter.onstart = () => setState("speaking");
    utter.onend = () => {
      setState("idle");
      onDone?.();
    };

    window.speechSynthesis.speak(utter);
  }, []);

  const cancelSpeak = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setState("idle");
  }, []);

  return {
    state,
    setState,
    transcript,
    interimTranscript,
    error,
    isSupported,
    startListening,
    stopListening,
    speak,
    cancelSpeak,
    countFillers,
  };
}
