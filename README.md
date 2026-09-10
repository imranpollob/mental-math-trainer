# Mental Math Trainer

<p align="center">
  <img src="public/logo.png" alt="Mental Math Trainer Logo" width="80" />
</p>

<p align="center">
  A clean, keyboard-first mental math trainer to sharpen your arithmetic reflexes.
  <br />
  <strong><a href="https://imranpollob.github.io/mental-math-trainer/">Try Live Demo →</a></strong>
</p>

---

## Overview

Mental Math Trainer helps you practice arithmetic through short, focused speed drills. Whether you're warming up for quantitative interviews, competitive exams, or just want faster mental calculation, it adapts to your pace with instant feedback and clean stats.

It runs entirely in your browser with zero backend, saving your personal bests and streaks locally.

## Features

- **7 Core Operations**: Addition, subtraction, multiplication, division, percentages, squares, and square roots.
- **Adaptive Drills**: Pick from curated presets (Easy, Medium, Hard, Expert) or customize your own number ranges and session length.
- **Fast Keyboard Flow**: Auto-focused input, quick `Enter` submission, `Space` to skip, and optional instant advance on correct answer.
- **Audio Feedback**: Subtle Web Audio cues for correct answers, streaks, and session transitions (toggleable).
- **Session Insights**: Real-time pace (Questions Per Minute), accuracy breakdown by operation, and shareable result summaries.
- **Offline & Private**: Runs 100% client-side with local storage for personal bests and daily streaks. Full dark and light mode support.

## Getting Started

### Prerequisites
- Node.js 18+

### Setup

```bash
# Clone the repository
git clone https://github.com/imranpollob/mental-math-trainer.git
cd mental-math-trainer

# Install dependencies
npm install

# Start local dev server
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

## Tech Stack

- **Framework**: Vue 3 (Composition API)
- **Tooling**: Vite 5
- **Routing**: Vue Router 4
- **Hosting**: GitHub Pages

## License

MIT © [Imran Pollob](https://github.com/imranpollob)
