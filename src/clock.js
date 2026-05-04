// clock.js — renders the clock card into the hero section
export function initClock(clockConfig) {
  const timezone = clockConfig.timezone || 'UTC';
  const theme    = clockConfig.theme    || 'dark';

  const card = document.createElement('div');
  card.className = `vs-card vs-clock-card vs-clock-theme-${theme}`;
  card.innerHTML = `
    <div class="vs-card-title">Current Time</div>
    <div class="vs-clock-time" id="vs-clock-time">--:--:--</div>
    <div class="vs-clock-date" id="vs-clock-date">---</div>
    <div class="vs-clock-tz">${timezone.replace('_', ' ')}</div>
  `;

  // Insert into hero column, not signage-column
  const heroCol = document.getElementById('signage-column-hero');
  if (heroCol) {
    heroCol.appendChild(card);
  } else {
    // Fallback
    const col = document.getElementById('signage-column');
    if (col) col.prepend(card);
  }

  function tick() {
    const now    = new Date();
    const timeEl = document.getElementById('vs-clock-time');
    const dateEl = document.getElementById('vs-clock-date');

    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString('en-US', {
        timeZone: timezone,
        hour:     '2-digit',
        minute:   '2-digit',
        second:   '2-digit',
        hour12:   true,
      });
    }
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('en-US', {
        timeZone: timezone,
        weekday:  'long',
        year:     'numeric',
        month:    'long',
        day:      'numeric',
      });
    }
  }

  tick();
  setInterval(tick, 1000);
}