"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  FaceLandmarker,
  PoseLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
  type PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";

export type MultimodalScores = {
  eyeContact: number;
  posture: number;
  engagement: number;
  stress: number;
  faceDetected: boolean;
  posePresent: boolean;
};

export type MultimodalState = {
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
  scores: MultimodalScores;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  start: () => Promise<void>;
  stop: () => void;
};

const INITIAL_SCORES: MultimodalScores = {
  eyeContact: 0,
  posture: 0,
  engagement: 0,
  stress: 0,
  faceDetected: false,
  posePresent: false,
};

const WINDOW_SIZE = 12;

export function useMultimodal(): MultimodalState {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<MultimodalScores>(INITIAL_SCORES);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const isRunningRef = useRef(false); // guards against orphan frame loops

  const eyeContactHistory = useRef<number[]>([]);
  const blinkTimestamps = useRef<number[]>([]);
  const headPosHistory = useRef<{ x: number; y: number }[]>([]);

  // Load MediaPipe models once
  const initMediaPipe = useCallback(async () => {
    if (faceLandmarkerRef.current && poseLandmarkerRef.current) return;

    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
    );

    faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU",
      },
      outputFaceBlendshapes: false,
      runningMode: "VIDEO",
      numFaces: 1,
    });

    poseLandmarkerRef.current = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: 1,
    });
  }, []);

  const processFrame = useCallback(() => {
    // Bail out cleanly if we've been told to stop
    if (!isRunningRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState < 2 || video.videoWidth === 0) {
      // Video not ready yet — just keep waiting
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    // Match canvas to video dimensions
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    const now = performance.now();
    let faceResult: FaceLandmarkerResult | undefined;
    let poseResult: PoseLandmarkerResult | undefined;

    try {
      if (faceLandmarkerRef.current) {
        faceResult = faceLandmarkerRef.current.detectForVideo(video, now);
      }
    } catch {
      // MediaPipe occasionally throws on first frames or when video resizes
      // — silently skip this frame and try again next tick.
    }
    try {
      if (poseLandmarkerRef.current) {
        poseResult = poseLandmarkerRef.current.detectForVideo(video, now);
      }
    } catch {
      // MediaPipe occasionally throws on first frames or when video resizes
      // — silently skip this frame and try again next tick.
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let faceDetected = false;
    let eyeContactScore = 0;
    let blinking = false;

    if (faceResult?.faceLandmarks && faceResult.faceLandmarks.length > 0) {
      faceDetected = true;
      const landmarks = faceResult.faceLandmarks[0];

      // Draw landmarks (mesh dots)
      ctx.fillStyle = "rgba(107, 142, 14, 0.65)";
      const landmarkIndices = [
        // Face oval (clean perimeter)
        10, 109, 67, 103, 54, 21, 162, 127, 234, 93, 132, 58, 172, 136, 150,
        149, 176, 148, 152, 377, 400, 378, 379, 365, 397, 288, 361, 323, 454,
        356, 389, 251, 284, 332, 297, 338,
        // Right eye outline
        33, 246, 161, 160, 159, 158, 157, 173, 133,
        // Left eye outline
        362, 398, 384, 385, 386, 387, 388, 466, 263,
        // Iris centers only (skip the surrounding iris dots — too cluttered)
        468, 473,
        // Lips outer
        61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291,
        // Lips inner (subtle)
        78, 13, 308,
        // Eyebrows (one curve each, not every point)
        70, 105, 107,
        300, 334, 336,
        // Nose ridge (3 points only)
        6, 197, 195,
      ];
      for (const idx of landmarkIndices) {
        const lm = landmarks[idx];
        if (!lm) continue;
        ctx.beginPath();
        ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Eye contact via iris position
      const rIris = landmarks[468];
      const lIris = landmarks[473];
      const rOuter = landmarks[33];
      const rInner = landmarks[133];
      const lOuter = landmarks[362];
      const lInner = landmarks[263];
      if (rIris && lIris && rOuter && rInner && lOuter && lInner) {
        // Iris position within the eye socket (0=far left, 0.5=centered, 1=far right)
        const rEyeWidth = rInner.x - rOuter.x;
        const rIrisRel = rEyeWidth > 0 ? (rIris.x - rOuter.x) / rEyeWidth : 0.5;
        const lEyeWidth = lInner.x - lOuter.x;
        const lIrisRel = lEyeWidth > 0 ? (lIris.x - lOuter.x) / lEyeWidth : 0.5;

        // Horizontal deviation from center
        const horizDev = (Math.abs(rIrisRel - 0.5) + Math.abs(lIrisRel - 0.5)) / 2;

        // ALSO check head yaw/pitch — looking down at keyboard tanks eye contact
        // Use nose-to-eye-midpoint as a proxy for head orientation
        const noseTip = landmarks[1];
        const eyeMidY = (rIris.y + lIris.y) / 2;
        const headPitch = noseTip ? Math.abs(noseTip.y - eyeMidY - 0.05) : 0;

        // Tighter: deviation of 0.10 (instead of 0.25) drops to 0
        const horizScore = Math.max(0, 1 - horizDev * 10);
        const pitchScore = Math.max(0, 1 - headPitch * 8);
        // Boost the strictness — small head turns count as looking away
        eyeContactScore = Math.pow(horizScore * 0.7 + pitchScore * 0.3, 1.5);
      }

      // Blink detection
      const rTop = landmarks[159];
      const rBottom = landmarks[145];
      const rLeft = landmarks[33];
      const rRight = landmarks[133];
      if (rTop && rBottom && rLeft && rRight) {
        const v = Math.abs(rTop.y - rBottom.y);
        const h = Math.abs(rLeft.x - rRight.x);
        const ear = h > 0 ? v / h : 0;
        if (ear < 0.18) blinking = true;
      }
    }

    if (blinking) {
      const last = blinkTimestamps.current[blinkTimestamps.current.length - 1];
      if (!last || now - last > 150) {
        blinkTimestamps.current.push(now);
        blinkTimestamps.current = blinkTimestamps.current.filter((t) => now - t < 60000);
      }
    }

    let posePresent = false;
    let postureScore = 0.7;
    if (poseResult?.landmarks && poseResult.landmarks.length > 0) {
      posePresent = true;
      const pose = poseResult.landmarks[0];
      const lShoulder = pose[11];
      const rShoulder = pose[12];
      const nose = pose[0];

      if (lShoulder && rShoulder) {
        const shoulderTilt = Math.abs(lShoulder.y - rShoulder.y);
        const shoulderMidX = (lShoulder.x + rShoulder.x) / 2;
        const noseOffset = nose ? Math.abs(nose.x - shoulderMidX) : 0;
        const tiltScore = Math.max(0, 1 - shoulderTilt * 8);
        const centerScore = Math.max(0, 1 - noseOffset * 5);
        postureScore = (tiltScore + centerScore) / 2;

        if (nose) {
          headPosHistory.current.push({ x: nose.x, y: nose.y });
          if (headPosHistory.current.length > WINDOW_SIZE) {
            headPosHistory.current.shift();
          }
        }

        ctx.strokeStyle = "rgba(107, 142, 14, 0.45)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(lShoulder.x * canvas.width, lShoulder.y * canvas.height);
        ctx.lineTo(rShoulder.x * canvas.width, rShoulder.y * canvas.height);
        ctx.stroke();
      }
    }

    eyeContactHistory.current.push(eyeContactScore);
    if (eyeContactHistory.current.length > WINDOW_SIZE) {
      eyeContactHistory.current.shift();
    }
    const smoothEyeContact =
      eyeContactHistory.current.reduce((a, b) => a + b, 0) /
      Math.max(1, eyeContactHistory.current.length);

    const blinksPerMin = blinkTimestamps.current.length;
    // Normal: 12-20 bpm. <8 = staring (anxious focus). >25 = nervous.
    const blinkAbnormality = Math.min(
      1,
      blinksPerMin < 8
        ? (8 - blinksPerMin) / 8
        : blinksPerMin > 25
        ? (blinksPerMin - 25) / 20
        : 0,
    );

    let headStability = 1;
    if (headPosHistory.current.length > 5) {
      const xs = headPosHistory.current.map((p) => p.x);
      const ys = headPosHistory.current.map((p) => p.y);
      const xMean = xs.reduce((a, b) => a + b, 0) / xs.length;
      const yMean = ys.reduce((a, b) => a + b, 0) / ys.length;
      const variance =
        xs.reduce((sum, x) => sum + (x - xMean) ** 2, 0) / xs.length +
        ys.reduce((sum, y) => sum + (y - yMean) ** 2, 0) / ys.length;
      headStability = Math.max(0, 1 - variance * 200);
    }

    const engagement = faceDetected
      ? smoothEyeContact * 0.5 + headStability * 0.3 + postureScore * 0.2
      : 0;
    // Stress combines: head movement, abnormal blinking, AND poor eye contact
    // (looking away frequently = nervous/avoidant)
    const eyeAvoidance = Math.max(0, 1 - smoothEyeContact);
    const stress = Math.min(
      1,
      (1 - headStability) * 0.4 + blinkAbnormality * 0.3 + eyeAvoidance * 0.3,
    );

    setScores({
      eyeContact: smoothEyeContact,
      posture: postureScore,
      engagement,
      stress,
      faceDetected,
      posePresent,
    });

    rafRef.current = requestAnimationFrame(processFrame);
  }, []);

  const start = useCallback(async () => {
    if (isActive) return;
    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;

      if (!videoRef.current) {
        throw new Error("Video element not mounted yet");
      }

      videoRef.current.srcObject = stream;

      // Wait for the video to be playable before calling .play() — avoids
      // the "play() interrupted by new load" race condition.
      await new Promise<void>((resolve, reject) => {
        const v = videoRef.current!;
        const onReady = () => {
          v.removeEventListener("loadedmetadata", onReady);
          v.removeEventListener("error", onError);
          resolve();
        };
        const onError = () => {
          v.removeEventListener("loadedmetadata", onReady);
          v.removeEventListener("error", onError);
          reject(new Error("Video failed to load"));
        };
        v.addEventListener("loadedmetadata", onReady);
        v.addEventListener("error", onError);
        // Already loaded? Resolve immediately
        if (v.readyState >= 1) onReady();
      });

      try {
        await videoRef.current.play();
      } catch (playErr) {
        // Most "play() interrupted" errors are recoverable; continue.
        console.warn("Initial play() warning:", playErr);
      }

      await initMediaPipe();

      isRunningRef.current = true;
      setIsActive(true);
      setIsLoading(false);

      rafRef.current = requestAnimationFrame(processFrame);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Camera access failed";
      setError(msg);
      setIsLoading(false);
      isRunningRef.current = false;
    }
  }, [isActive, initMediaPipe, processFrame]);

  const stop = useCallback(() => {
    isRunningRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {}
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setScores(INITIAL_SCORES);
  }, []);

  useEffect(() => {
    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    isActive,
    isLoading,
    error,
    scores,
    videoRef,
    canvasRef,
    start,
    stop,
  };
}
