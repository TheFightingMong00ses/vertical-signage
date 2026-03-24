# Vertical Signage – Architecture Notes (Initial Draft)

## Overview

Vertical Signage is a web-based digital signage system that renders vertically stacked "cards" of information. It uses plain HTML, CSS, and JavaScript as a learning-focused student project.

At this stage there is **no backend**. All content is driven by a static configuration file (`config/config.json`).

## High-Level Design

- **HTML (`src/index.html`)**
  - Defines the basic page structure: header, main vertical column, footer.
  - Provides a dedicated container (`#signage-column`) where signage content is injected by JavaScript.

- **CSS (`src/style.css`)**
  - Creates a vertical, mobile-first layout that looks good on tall displays.
  - Styles signage items as "cards" stacked in a single column.

- **JavaScript (`src/app.js`)**
  - Loads settings and content from `config/config.json`.
  - Renders a list of signage items into the `#signage-column` element.
  - Shows a small status message in the footer (e.g., "Config loaded (3 items)").

- **Configuration (`config/config.json`)**
  - Contains:
    - `displaySettings`: options that affect the look/behavior (e.g., rotationSeconds, fontScale).
    - `items`: array of signage cards with section, title, body, and optional tags.

## Data Flow (Current)

1. User opens `src/index.html` in a browser (typically via a small dev server for CORS-friendly `fetch`).
2. `app.js` runs:
   - Shows "Loading configuration…" in the footer.
   - Performs `fetch("../config/config.json")`.
3. On success:
   - Uses `displaySettings` to update any document-level settings (e.g., font scale).
   - Iterates over `items` and builds DOM nodes for each card.
   - Replaces the content of `#signage-column` with the rendered cards.
   - Updates the footer status (e.g., "Config loaded (3 items)").
4. On failure:
   - Logs an error to the console.
   - Shows a user-friendly status in the footer.
   - Displays a simple "No signage items configured yet." message.

## Future Directions (Incremental)

The project is intentionally simple so that features can be added step-by-step, such as:

- **Rotation / Slideshow**
  - Use `displaySettings.rotationSeconds` to periodically scroll or rotate which cards are visible.

- **API-Driven Content**
  - Add a small backend or external API.
  - Fetch live data (e.g., metrics, schedules) and merge it with or replace `config.json` content.

- **Admin / Editor UI**
  - A small configuration UI to edit signage items without touching JSON directly.

- **Layout Variants**
  - Different templates for cards (e.g., "headline + big number", "schedule list", "image + caption").

Each of these can be introduced as a separate, small change to keep the code understandable and maintainable.

