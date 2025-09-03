# Project Design: Boarder-less Film Player For 30MFF

## 1. Introduction

Website for playing 30MFF film in ComLab.

## 2. Tech Stack

Plain HTML, CSS, JS.

## 3. Page Design

### 3.1. HTML Structure

`index.html` elements:

*   `div.film-player-container`: Main film player container, centered.
*   `nav.main-nav`: Top navigation (title, links, About button).
*   `<video>`: Film player, border-less, pseudo-fullscreen.
*   `div`: Play/Pause button container.
*   `div.audio-control`: Left-side volume control (range input).
*   `div.playback-control`: Right-side playback speed control (range input).
*   `div.progress-bar-background`: Bottom fixed progress bar.
*   `div.about-overlay`: Hidden overlay with About title, Description, Credits, Author link, Close button.

### 3.2. CSS Styling

`style.css` styles:

*   `body`: Black background, flexbox centered.
*   `.film-player-container`: Flex column, centered.
*   `video.film-video`: Pseudo-fullscreen on playback (`pseudo-fullscreen` class).
*   `.main-nav`: Top, initially transparent, fades in on hover.
*   `.audio-control`, `.playback-control`: Left/right, initially transparent, fades in on hover.
*   `.progress-bar-background`, `.progress-bar`: Bottom fixed, smooth width transition.
*   `.about-overlay`: Initially hidden/faded, `visible` class shows with semi-transparent background.
*   `.play-pause-button-container`: Center, initially `opacity: 0`, `visible` class shows, fades in on hover.

### 3.3. JavaScript Interactions

`script.js` interactions:

1.  **Pseudo-fullscreen**: Add `pseudo-fullscreen` class to video on play, hides play/pause button.
2.  **Video Controls**: `togglePlayPause` function for play/pause. `audioSlider` linked to `filmVideo.volume`. Event listeners for play/pause button and video.
3.  **UI Fade In/Out**: Navigation bar, audio/playback control panels controlled via CSS `:hover`.
4.  **Playback Loop**:
    *   `loopSegments` array: Defines custom loop points (start, end, loopCount).
    *   `timeupdate` listener: Monitors playback, increments `loopCount`.
    *   `endingLoopThreshold`: Triggers last segment loop.
    *   Random `currentLoopIndex` selection (excluding last segment) if `loopCount` exceeded.
    *   Resets `filmVideo.currentTime` to `currentLoopStart` for looping.
    *   Navigation links update `currentLoopStart`, `currentLoopEnd`, `currentLoopIndex` for non-linear playback.
5.  **Progress Bar**: `updateProgressBar` (via `requestAnimationFrame`) calculates/updates `.progress-bar` width based on segment progress.
6.  **About Overlay**: "About" and "Exit" buttons toggle `visible` class on `.about-overlay`.
7.  **Random Last Loop**: Logic for last loop entry after a threshold.

## 4. Disclaimer

Formatted with Gemini 2.5 Flash.
