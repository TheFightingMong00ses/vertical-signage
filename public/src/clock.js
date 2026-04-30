export function initClock(clockConfig) {
  const timezone = clockConfig.timezone || "UTC";
  const theme = clockConfig.theme || "dark";

  const card = document.createElement("div");
  card.className = `vs-card vs-clock-card vs-clock-theme-${theme}`;
  card.innerHTML = `
    <div class="vs-card-title">Clock</div>
    <div class="vs-clock-time" id="vs-clock-time">--:--:--</div>
    <div class="vs-clock-date" id="vs-clock-date">---</div>
    <div class="vs-clock-tz">${timezone.replace("_", " ")}</div>
  `;

  const signageColumn = document.getElementById("signage-column");
  if (signageColumn) signageColumn.appendChild(card);

  function tick() {
    const now = new Date();
    const timeEl = document.getElementById("vs-clock-time");
    const dateEl = document.getElementById("vs-clock-date");

    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString("en-US", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });
    }
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString("en-US", {
        timeZone: timezone,
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  }

  tick();
  setInterval(tick, 1000);
}
