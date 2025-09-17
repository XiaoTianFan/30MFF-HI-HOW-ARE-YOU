# Project Design: Boarder-less Film Player For 30MFF

## 1. Introduction

Website for playing 30MFF film in ComLab.

## 2. Tech Stack

Plain HTML, CSS, JS.

## 3. Page Design

### 3.1. HTML Structure

`index.html` elements:

* `div.film-player-container`: Main film player container, centered.
* `div.background-image`: Full-viewport background image (dimmed).
* `nav.main-nav`: Top navigation (title, L1–L4 segment links, About button).
* `<video.film-video>`: Film player, border-less, pseudo-fullscreen on play.
* `p.loop-counter`: Displays current loop index and repetition count while playing.
* `div.play-pause-button-container`: Centered overlay button (show on pause).
* `div.audio-control`: Left-side volume control (range input).
* `div.playback-control`: Right-side playback speed control (range input).
* `div.progress-bar-background` → `div.progress-bar`: Bottom segment-progress indicator.
* `div.about-overlay`: Overlay with About text, Credits, external author link, subtle `notes` link to Easter Eggs, Close button.
* Secondary page: `easter-eggs.html` shows hidden clip(s) and a Back link.

### 3.2. CSS Styling

`style.css` styles:

* `body`: Black background, flexbox centered; `Geist Mono` loaded via Google Fonts.
* `.film-player-container`: Flex column, centered.
* `.background-image`: Covers viewport, `object-fit: cover`, dimmed.
* `video.film-video`: Pseudo-fullscreen on playback (`.pseudo-fullscreen`).
* `.main-nav`: Initially transparent; becomes opaque on hover or when `.visible` is set.
* `.audio-control`, `.playback-control`: Initially transparent; fade in on hover/`.visible`.
* `.loop-counter`: Hidden by default; `.visible` shows while playing.
* `.progress-bar-background`, `.progress-bar`: Bottom-fixed; smooth width transition for segment progress.
* `.play-pause-button-container`: Center overlay; shown on pause.
* `.about-overlay`: Hidden by default; `.visible` shows with semi-transparent backdrop. Two-column layout for description/credits.
* Easter Eggs page: `.easter-eggs-container`, clips grid, and back link styles.

### 3.3. JavaScript Interactions

`script.js` interactions:

1. **Pseudo-fullscreen**: On play, add `.pseudo-fullscreen` to the video; hide center play button. On pause, revert and show button.
2. **Video controls**: `togglePlayPause`; volume slider binds to `video.volume`.
3. **Initial UI reveal**: On `DOMContentLoaded`, temporarily add `.visible` to nav and side panels for ~2s.
4. **Navigation**: L1–L4 links set the active segment and start playback.
5. **Playback loop**:
    * `loopSegments`: segment {start, end, loopCount} list.
    * On `timeupdate`, when reaching segment end: increment counters and either jump to another non-final segment or, after a threshold, enter the last segment.
    * In the final segment, freeze at the end frame; if paused there, reset to the first segment.
6. **Playback speed algorithm**: Effective speed = manual slider base + auto bonus. Auto bonus scales linearly with total loops up to a cap, and the applied rate is clamped to slider min/max.
7. **Progress bar**: Updated via `requestAnimationFrame`; tracks progress within the current segment (not the full film).
8. **About overlay**: About and Close toggle `.visible`. Contains a subtle link to `easter-eggs.html`.
9. **Accessibility**: Play/pause button updates `aria-label`/`title`; SVG icon syncs to state.

## 4. Pages & Assets

### 4.1. Pages

* `index.html`: Main film player.
* `easter-eggs.html`: Hidden page linked from About; shows bonus clip(s) and Back link.

### 4.2. Assets & Fonts

* `assets/film.mp4`
* `assets/background.jpg`
* `assets/easter-clip.mp4`
* Font: Google Fonts `Geist Mono`

## 5. Configuration (current values)

* Segments: `[0–13]`, `[14–24]`, `[24–29]`, `[29–38]`, `[39–70]`
* `loopThreshold`: 1 (min loops before random switch chance)
* `endingLoopThreshold`: 10 (enter last segment after this many total loops)
* Auto bonus cap: +3.0× by 10 loops (linear ramp)
* Playback slider: min 0.1, max 10, step 0.1, default 1.0
* Volume slider: min 0, max 1, step 0.01, default 0.5

## 6. Disclaimer

Formatted with Gemini 2.5 Flash.