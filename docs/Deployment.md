# Vertical Signage — Deployment Guide

## Overview

This document covers how to deploy the Vertical Signage project on a Raspberry Pi connected to a projector or door screen. The setup uses a local web server and Chromium in kiosk mode to display the signage fullscreen with no browser UI.

---

## Prerequisites

Make sure the following are installed on the Raspberry Pi before starting:

- **Node.js** — required to run the local server
- **npm** — comes with Node.js
- **Chromium** — comes pre-installed on Raspberry Pi OS

To check if Node.js is installed:
```bash
node -v
```

If it is not installed:
```bash
sudo apt update
sudo apt install nodejs npm
```

---

## Step 1 — Get the Project onto the Pi

Choose one of the following methods:

**Option A — USB Drive**
Copy your project folder onto a USB drive, plug it into the Pi, and copy it to your home directory:
```bash
cp -r /media/pi/YOUR_USB/Vertical-Signage ~/Vertical-Signage
```

**Option B — Git Clone**
If the project is on GitHub:
```bash
git clone https://github.com/your-repo/Vertical-Signage.git
```

**Option C — Network Transfer (SCP)**
From your development machine:
```bash
scp -r ./Vertical-Signage pi@YOUR_PI_IP:~/Vertical-Signage
```

---

## Step 2 — Install the Local Server

Install the `serve` package globally so it is available as a terminal command:
```bash
npm install -g serve
```

---

## Step 3 — Start the Server

Navigate to your project root folder and start the server:
```bash
cd ~/Vertical-Signage
serve .
```

You should see output like this:
```
┌───────────────────────────────────────────┐
│                                           │
│   Serving!                                │
│                                           │
│   - Local:    http://localhost:3000       │
│                                           │
└───────────────────────────────────────────┘
```

Leave this terminal window open. If you close it, the server stops and the display goes down.

---

## Step 4 — Launch Chromium in Kiosk Mode

Open a second terminal and run:
```bash
chromium-browser --kiosk --noerrdialogs --disable-infobars --no-first-run --disable-extensions http://localhost:3000/src/
```

This opens Chromium completely fullscreen with no address bar, bookmarks, tabs, or any other browser UI — exactly what you want for a projector or door screen display.

> **Important:** If you can still see the URL bar or bookmarks bar, it means Chromium was already open when you ran the command. You must **close all Chromium windows completely first**, then run the command again. Kiosk mode only works when launching a fresh instance of the browser.

To exit kiosk mode press **Alt + F4**.

---

## Step 5 — Auto-Start on Boot (Optional but Recommended)

To make everything launch automatically when the Pi powers on, edit the autostart file:
```bash
nano ~/.config/lxsession/LXDE-pi/autostart
```

Add these two lines at the bottom:
```
@serve /home/pi/Vertical-Signage
@chromium-browser --kiosk --noerrdialogs --disable-infobars --no-first-run --disable-extensions http://localhost:3000/src/
```

Save the file with `Ctrl + X`, then `Y`, then `Enter`. Now every time the Pi boots, it will automatically start the server and launch the display.

---

## Testing on a Windows PC Before Deploying

You can test the full kiosk setup on your development PC before touching the Pi.

**Step 1 — Start the server** from your project root:
```bash
npx serve .
```

**Step 2 — Close all Chrome windows completely**, then run:
```
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk --noerrdialogs --disable-infobars --no-first-run --disable-extensions http://localhost:3000/src/
```

> **Important:** All Chrome windows must be fully closed before running this command. If Chrome is already open, it will open a new tab in your existing window instead of launching in kiosk mode, and the URL bar and bookmarks will still be visible.

To exit kiosk mode press **Alt + F4**.

---

## Troubleshooting

**The page shows but content is missing (clock, weather, RSS not loading)**
- Check that the server is still running in the other terminal
- Open the browser console (`F12` → Console tab) and look for errors
- Make sure your `config/config.json` path is correct relative to where you ran `serve`

**Kiosk mode is not hiding the browser UI**
- Close all browser windows completely and try the command again
- Add `--no-first-run --disable-extensions` flags to the command if not already there

**The display looks stretched or wrong on the projector**
- Find the exact resolution of your projector and set it in the Pi display settings
- Most small projectors are 1280x720 (720p) or 1920x1080 (1080p)

**The server stops when I close the terminal**
- Use a terminal multiplexer like `screen` to keep the server running in the background:
```bash
screen -S signage
serve .
```
Then press `Ctrl + A` then `D` to detach. The server keeps running even if you close the terminal.