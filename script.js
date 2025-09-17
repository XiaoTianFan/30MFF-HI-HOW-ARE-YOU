// DOM Elements
const filmVideo = document.querySelector('.film-video');
const filmPlayerContainer = document.querySelector('.film-player-container');
const playPauseButtonContainer = document.querySelector('.play-pause-button-container');
const playPauseButton = document.querySelector('.toggle-play-pause');
const loopCounter = document.querySelector('.loop-counter');
const playbackSlider = document.querySelector('.playback-slider');
const audioSlider = document.querySelector('.audio-slider');
const playbackControl = document.querySelector('.playback-control');
const audioControl = document.querySelector('.audio-control');
const mainNav = document.querySelector('.main-nav');
const navLinks = document.querySelectorAll('.nav-links a');
const progressBar = document.querySelector('.progress-bar');
const aboutOverlay = document.querySelector('.about-overlay');
const aboutButton = document.querySelector('.about-button');
const aboutCloseButton = document.querySelector('.about-close');
const playbackSpeedIndicator = document.querySelector('.playback-speed-indicator');

// SVG Icons
const PLAY_ICON_SVG = `
  <svg class="icon icon-play" viewBox="0 0 24 24" aria-hidden="true">
    <polygon points="8,5 19,12 8,19"></polygon>
  </svg>
`;
const PAUSE_ICON_SVG = `
  <svg class="icon icon-pause" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="6" y="5" width="4" height="14"></rect>
    <rect x="14" y="5" width="4" height="14"></rect>
  </svg>
`;

// Config
const loopThreshold = 1;
const loopSegments = [
    { start: 0, end: 13, loopCount: 0 },
    { start: 14, end: 24, loopCount: 0 },
    { start: 24, end: 29.5, loopCount: 0 },
    { start: 29.5, end: 38, loopCount: 0 },
    { start: 39, end: 70, loopCount: 0 }
];
const endingLoopThreshold = 10;

// States
let currentLoopStart = loopSegments[0].start;
let currentLoopEnd = loopSegments[0].end;
let currentLoopIndex = 0;
let totalLoopCount = loopSegments[0].loopCount;
let animationFrameId = null;
// Manual baseline speed set by the user via the slider
let manualBaseSpeed = parseFloat(playbackSlider.value);
// Track if user is currently dragging the playback slider
let isAdjustingPlaybackSlider = false;

// Functions
function resetPlayer() {
    currentLoopIndex = 0;
    currentLoopStart = loopSegments[0].start;
    currentLoopEnd = loopSegments[0].end;
    totalLoopCount = 0;
    loopSegments.forEach(segment => segment.loopCount = 0);

    filmVideo.currentTime = currentLoopStart;
    updateCombinedPlaybackSpeed();

    loopCounter.textContent = `Loop No. ${currentLoopIndex + 1}, Time ${loopSegments[currentLoopIndex].loopCount + 1}`;
}

function setSpeedIndicator(value) {
    if (!playbackSpeedIndicator) return;
    const rounded = Math.round(value * 10) / 10;
    playbackSpeedIndicator.textContent = `${rounded}×`;
}

// Apply a new playback rate, clamped to slider min/max, and sync UI if needed
function applyPlaybackRate(newRate) {
    const min = parseFloat(playbackSlider.min);
    const max = parseFloat(playbackSlider.max);
    const clamped = Math.max(min, Math.min(max, newRate));

    filmVideo.playbackRate = clamped;

    // Only sync the slider UI when the user is NOT dragging it
    if (!isAdjustingPlaybackSlider && playbackSlider.value !== String(clamped)) {
        playbackSlider.value = clamped.toString();
    }
    setSpeedIndicator(clamped);
}

// How much bonus speed we add based on loop count (linear up to a cap)
function computeAutoBonus(loopCount) {
    const AUTO_MAX_BONUS = 3.0;
    const AUTO_APEX_AT = endingLoopThreshold; // reach the cap by the threshold loops
    const normalized = Math.min(loopCount, AUTO_APEX_AT) / AUTO_APEX_AT;
    return AUTO_MAX_BONUS * normalized;
}

function updateCombinedPlaybackSpeed() {
    if (currentLoopIndex === loopSegments.length - 1) {
        applyPlaybackRate(1);
        return;
    }

    const finalSpeed = manualBaseSpeed + computeAutoBonus(totalLoopCount);
    applyPlaybackRate(finalSpeed);
}

function updateProgressBar() {
    if (!filmVideo.paused) {
        const segmentDuration = currentLoopEnd - currentLoopStart;
        const currentTimeInSegment = filmVideo.currentTime - currentLoopStart;

        // Calculate progress, ensuring it doesn't go below 0 or above 100
        const progressPercentage = Math.max(0, Math.min(100, (currentTimeInSegment / segmentDuration) * 100));

        progressBar.style.width = `${progressPercentage}%`;

        // Request the next animation frame
        animationFrameId = requestAnimationFrame(updateProgressBar);
    } else {
        // If video is paused, cancel any pending animation frame
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    }
}

function togglePlayPause() {
    if (filmVideo.paused) {
        filmVideo.play();
        playPauseButton.innerHTML = PAUSE_ICON_SVG;
        playPauseButton.setAttribute('aria-label', 'Pause');
        playPauseButton.setAttribute('title', 'Pause');
    } else {
        filmVideo.pause();
        playPauseButton.innerHTML = PLAY_ICON_SVG;
        playPauseButton.setAttribute('aria-label', 'Play');
        playPauseButton.setAttribute('title', 'Play');
    }
}

// Event Listeners
playPauseButton.addEventListener('click', () => {
    togglePlayPause();
});

filmVideo.addEventListener('click', () => {
    togglePlayPause();
});

filmVideo.addEventListener('play', () => {
    filmVideo.classList.add('pseudo-fullscreen');
    loopCounter.classList.add('visible');
    // Sync icon to Pause when video starts playing 
    playPauseButton.innerHTML = PAUSE_ICON_SVG;
    playPauseButton.setAttribute('aria-label', 'Pause');
    playPauseButton.setAttribute('title', 'Pause');
    playPauseButtonContainer.classList.remove('visible');

    if (!animationFrameId) { // Only start if not already running
        updateProgressBar();
    }
});

filmVideo.addEventListener('pause', () => {
    filmVideo.classList.remove('pseudo-fullscreen');
    loopCounter.classList.remove('visible');
    // Sync icon to Play when video is paused
    playPauseButton.innerHTML = PLAY_ICON_SVG;
    playPauseButton.setAttribute('aria-label', 'Play');
    playPauseButton.setAttribute('title', 'Play');
    playPauseButtonContainer.classList.add('visible');

    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
});

filmVideo.addEventListener('timeupdate', () => {
    // Check if the video is playing and if current time has passed the loop end point
    if (!filmVideo.paused && filmVideo.currentTime >= currentLoopEnd) {
        if (currentLoopIndex === loopSegments.length - 1) {
            filmVideo.currentTime = currentLoopEnd; // Freeze on the last segment last frame
            applyPlaybackRate(1);
            return;
        } else {
            totalLoopCount++;
            loopSegments[currentLoopIndex].loopCount++;

            console.log('Total Loop Played:', totalLoopCount,
                'Current Loop Index:', currentLoopIndex,
                'Current Loop Played:', loopSegments[currentLoopIndex].loopCount,
                'Current Loop Speed:', filmVideo.playbackRate,);

            if (totalLoopCount >= endingLoopThreshold) {
                currentLoopIndex = loopSegments.length - 1;
                currentLoopStart = loopSegments[loopSegments.length - 1].start;
                currentLoopEnd = loopSegments[loopSegments.length - 1].end;
            } else {
                if (loopSegments[currentLoopIndex].loopCount >= Math.floor((loopThreshold + Math.random() * 2))) {
                    let nextIndex;
                    do {
                        nextIndex = Math.floor(Math.random() * (loopSegments.length - 1));
                    } while (nextIndex === currentLoopIndex);
                    currentLoopIndex = nextIndex;

                    currentLoopStart = loopSegments[currentLoopIndex].start;
                    currentLoopEnd = loopSegments[currentLoopIndex].end;
                }
            }

            updateCombinedPlaybackSpeed();
            filmVideo.currentTime = currentLoopStart; // Jump back to the loop start point    
        }

        loopCounter.textContent = `Loop No. ${currentLoopIndex + 1}, Time ${loopSegments[currentLoopIndex].loopCount + 1}`;
    } else if (filmVideo.paused && currentLoopIndex === loopSegments.length - 1) {
        resetPlayer();
        applyPlaybackRate(1);
    }
});

navLinks.forEach((link, index) => {
    link.addEventListener('click', (event) => {
        event.preventDefault();

        currentLoopStart = loopSegments[index].start;
        currentLoopEnd = loopSegments[index].end;
        currentLoopIndex = index;

        console.log(currentLoopStart, currentLoopEnd);

        filmVideo.currentTime = currentLoopStart;
        updateCombinedPlaybackSpeed();
        filmVideo.play();

        loopCounter.textContent = `Loop No. ${currentLoopIndex + 1}, Time ${loopSegments[currentLoopIndex].loopCount + 1}`;
    })
});

aboutButton.addEventListener('click', () => {
    aboutOverlay.classList.toggle('visible');
});

aboutCloseButton.addEventListener('click', () => {
    aboutOverlay.classList.toggle('visible');
});

audioSlider.addEventListener('input', () => {
    filmVideo.volume = audioSlider.value;
});

// Start of manual adjust
playbackSlider.addEventListener('pointerdown', () => {
    isAdjustingPlaybackSlider = true;
});
// End of manual adjust (use broad listeners so we always catch it)
window.addEventListener('pointerup', () => {
    isAdjustingPlaybackSlider = false;
    // After releasing, sync the UI once to reflect the current effective speed
    updateCombinedPlaybackSpeed();
});
window.addEventListener('pointercancel', () => {
    isAdjustingPlaybackSlider = false;
    updateCombinedPlaybackSpeed();
});
// User drags the slider → update manual baseline, then recompute final
playbackSlider.addEventListener('input', () => {
    manualBaseSpeed = parseFloat(playbackSlider.value);
    updateCombinedPlaybackSpeed();
});

window.addEventListener('DOMContentLoaded', () => {
    // toggle visibility of controls and nav for 3 seconds after DOM is ready
    playbackControl.classList.add('visible');
    audioControl.classList.add('visible');
    mainNav.classList.add('visible');
    setTimeout(() => {
        playbackControl.classList.remove('visible');
        audioControl.classList.remove('visible');
        mainNav.classList.remove('visible');
    }, 2000);
});

// Initialization
filmVideo.volume = audioSlider.value;
filmVideo.currentTime = currentLoopStart;

// Initialize button with Play icon
playPauseButton.innerHTML = PLAY_ICON_SVG;
playPauseButton.setAttribute('aria-label', 'Play');
playPauseButton.setAttribute('title', 'Play');
playPauseButtonContainer.classList.add('visible');

setSpeedIndicator(parseFloat(playbackSlider.value));
updateCombinedPlaybackSpeed();
