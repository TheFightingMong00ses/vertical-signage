// slideshow.js — cycles photos as the hero section background
// Photos are configured in config/config.json under:
//   "slideshow": { "images": ["./images/cat1.jpg", ...], "intervalSeconds": 8 }
// If no config is found, the hero background stays as a plain dark gradient.

const DEFAULT_INTERVAL = 8000;

let photos = [];
let current = 0;
let intervalId = null;

const photoA = document.getElementById('vs-hero-photo-a');
const photoB = document.getElementById('vs-hero-photo-b');
const dotsContainer = document.getElementById('vs-hero-dots');

// Which element is currently "front" (visible)
let front = photoA;
let back  = photoB;

function buildDots(count) {
  dotsContainer.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.className = 'vs-hero-dot' + (i === 0 ? ' active' : '');
    dot.id = 'vs-dot-' + i;
    dotsContainer.appendChild(dot);
  }
}

function setActiveDot(index) {
  dotsContainer.querySelectorAll('.vs-hero-dot').forEach((d, i) => {
    d.classList.toggle('active', i === index);
  });
}

function crossfadeTo(index) {
  if (!photos.length) return;
  const url = photos[index];

  // Pre-load the image into the back layer
  back.style.backgroundImage = `url('${url}')`;
  back.style.opacity = '1';

  // Fade out the front layer
  front.style.opacity = '0';

  // Swap roles
  const tmp = front;
  front = back;
  back  = tmp;

  setActiveDot(index);
  current = index;
}

function next() {
  const nextIndex = (current + 1) % photos.length;
  crossfadeTo(nextIndex);
}

export function initSlideshow(config) {
  const slideshowConfig = config && config.slideshow;

  if (!slideshowConfig || !Array.isArray(slideshowConfig.images) || slideshowConfig.images.length === 0) {
    // No photos configured — hide dots, leave hero as plain dark bg
    dotsContainer.style.display = 'none';
    return;
  }

  photos = slideshowConfig.images;
  const interval = (slideshowConfig.intervalSeconds || DEFAULT_INTERVAL / 1000) * 1000;

  buildDots(photos.length);

  // Show first photo immediately
  front.style.backgroundImage = `url('${photos[0]}')`;
  front.style.opacity = '1';
  current = 0;

  if (photos.length > 1) {
    intervalId = setInterval(next, interval);
  } else {
    // Only one photo — hide dots
    dotsContainer.style.display = 'none';
  }
}