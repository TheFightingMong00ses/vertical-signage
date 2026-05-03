const API_KEY = 'AIzaSyA5P7oin4sIt9YIF2duHNnEzKSMTTcDXM0';
const CALENDAR_ID = '822f45b9a5bfd09202fefbe67cf78a0d96861e6ec514f4978c864e5a570f56fd@group.calendar.google.com';

function toLocalDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function displayWeekView() {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // Build all 7 days upfront regardless of events
  const days = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const key = toLocalDateKey(d);
    days[key] = []; // start empty, events will fill in if they exist
  }

  // Fetch events and slot them into the correct day
  try {
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${API_KEY}&orderBy=startTime&singleEvents=true&timeMin=${now.toISOString()}&timeMax=${weekEnd.toISOString()}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.items) {
      data.items.forEach(event => {
        const date = (event.start.dateTime || event.start.date).split('T')[0];
        if (days[date] !== undefined) {
          days[date].push(event);
        }
      });
    }
  } catch (err) {
    console.error('Calendar fetch failed:', err);
    // Continue rendering — days will just show as empty
  }

  // Render every day
  const container = document.getElementById('calendar');
  container.innerHTML = '';

  // Create the grid wrapper
  const grid = document.createElement('div');
  grid.className = 'vs-calendar-grid';

  Object.entries(days).forEach(([date, events]) => {
    const isToday = date === toLocalDateKey(now);
    const [year, month, day] = date.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);

    const col = document.createElement('div');
    col.className = 'vs-calendar-col' + (isToday ? ' vs-calendar-today' : '');
     // Day header
    const header = document.createElement('div');
    header.className = 'vs-calendar-col-header';

    const dayName = document.createElement('span');
    dayName.className = 'vs-calendar-dayname';
    dayName.textContent = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();

    const dayNum = document.createElement('span');
    dayNum.className = 'vs-calendar-daynum' + (isToday ? ' vs-calendar-daynum-today' : '');
    dayNum.textContent = dateObj.getDate();

    header.appendChild(dayName);
    header.appendChild(dayNum);
    col.appendChild(header);

    // Events
    if (events.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'vs-calendar-empty';
      empty.textContent = '';
      col.appendChild(empty);
    } else {
      events.forEach(e => {
        const event = document.createElement('div');
        event.className = 'vs-calendar-event';

        const startTime = e.start.dateTime
          ? new Date(e.start.dateTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          : 'All Day';

        event.textContent = `${startTime} ${e.summary}`;
        col.appendChild(event);
      });
    }
    grid.appendChild(col);
  });
container.appendChild(grid);
}

document.addEventListener('vs:config-rendered', function() {
  // Create and insert the calendar container above the RSS card
  const column = document.getElementById('signage-column');
  const rssCard = column.querySelector('.vs-rss-card');

  const calendarCard = document.createElement('div');
  calendarCard.id = 'calendar';
  calendarCard.className = 'vs-card';

  if (rssCard) {
    column.insertBefore(calendarCard, rssCard);
  } else {
    column.appendChild(calendarCard);
  }

  // Initial load
  displayWeekView();

  // Refresh every 5 minutes
  setInterval(displayWeekView, 5 * 60 * 1000);
}, { once: true });
