const API_KEY = 'AIzaSyA5P7oin4sIt9YIF2duHNnEzKSMTTcDXM0';
const CALENDAR_ID = '822f45b9a5bfd09202fefbe67cf78a0d96861e6ec514f4978c864e5a570f56fd@group.calendar.google.com';

async function displayWeekView() {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // Build all 7 days upfront regardless of events
  const days = {};
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split('T')[0];
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

  Object.entries(days).forEach(([date, events]) => {
    const isToday = date === now.toISOString().split('T')[0];
    const card = document.createElement('div');
    card.className = 'vs-calendar-day' + (isToday ? ' vs-calendar-today' : '');

    const heading = document.createElement('h3');
    heading.textContent = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', month: 'short', day: 'numeric'
    });

    card.appendChild(heading);

    if (events.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'vs-card-body';
      empty.textContent = 'No events';
      card.appendChild(empty);
    } else {
      events.forEach(e => {
        const p = document.createElement('p');
        p.textContent = `${e.summary} — ${e.start.dateTime ? new Date(e.start.dateTime).toLocaleTimeString() : 'All Day'}`;
        card.appendChild(p);
      });
    }

    container.appendChild(card);
  });
}
document.addEventListener('vs:config-rendered', function() {
  // Create and insert the calendar container above the RSS card
  const column = document.getElementById('signage-column');
  const rssCard = column.querySelector('.vs-rss-card');

  const calendarCard = document.createElement('div');
  calendarCard.id = 'calendar';
  calendarCard.className = 'vs-card'; // matches existing card styling

  if (rssCard) {
    column.insertBefore(calendarCard, rssCard); // places it directly above RSS
  } else {
    column.appendChild(calendarCard); // fallback if RSS card isn't there yet
  }

  displayWeekView();
});
