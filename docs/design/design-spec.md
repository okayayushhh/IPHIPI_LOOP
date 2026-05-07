# Design Spec — north star

This folder contains the original Claude-generated design files.
We are NOT shipping these as code — they are our visual reference.

## Color tokens

- `--bg`: app background (dark)
- `--bg-1`: card surface (slightly lighter than bg)
- `--bg-2`: hover/active surface
- `--bg-3`: subtle fills (progress bars, chips)
- `--ink`: primary text
- `--ink-2`, `--ink-3`, `--ink-4`: text hierarchy (decreasing prominence)
- `--line`, `--line-2`: borders
- `--acc`: accent (lime green #C4FF4E)
- `--good`: success (#7CFF6B)
- `--warn`: warning (#FFB84E)
- `--bad`: error (#FF6B5B)

## Typography

- Headlines: serif, large, tight tracking (-.025em)
- Body: sans-serif
- Numbers/code/timestamps: monospace
- Small labels: uppercase, letter-spaced (.1–.15em), 10–11px

## Component patterns

- `.card`: rounded 14px corners, subtle border, `--bg-1` background
- `.chip`: small pill labels with `--bg-2` background
- `.btn-pri`: primary action button (lime accent)
- `.btn`: secondary button
- ScoreRing: circular progress with center number
- ScoreBar: horizontal progress bar with label + delta
- Sparkbars: tiny bar chart for audio levels
- LiveDot: pulsing red dot for "LIVE" indicators

## Screens (in flow order)

01 — Landing (resume upload)
02 — Roles (inferred role cards)
03 — Setup (camera/mic check)
04 — Interview (live agent + multimodal HUD)
05 — Feedback (5-dimension report + confidence chart)
06 — Jobs (recommended postings)
07 — History (past sessions trend)

## Agent persona

"Mira" — illustrated, warm, friendly. State-driven (idle/asking/listening/thinking).
SVG-based, no external assets needed.
