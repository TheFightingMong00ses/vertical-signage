# Docker — Container Guide

This document covers how to build and run the Vertical Signage container locally for testing, and how the automated CI/CD pipeline builds and publishes the image on every merge to main.

---

## Prerequisites

Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) for Mac or Windows. Docker Desktop must be open and running before using any `docker` commands.

On Linux or Raspberry Pi, install Docker Engine instead — it runs as a background service and does not require a GUI.

---

## Building and Running Locally

Use this when you want to test your changes in a container before pushing.

### 1. Build the image

Run this from the root of the repo:

```bash
docker build -t vertical-signage-test .
```

The first build will download the base nginx image (~25MB). Subsequent builds are fast because Docker caches unchanged layers.

### 2. Run the container

```bash
docker run -d -p 8080:80 --name vertical-signage-test vertical-signage-test
```

Open your browser and go to `http://localhost:8080` to view the sign.

### 3. Rebuild after changes

Stop and remove the running container, then rebuild:

```bash
docker stop vertical-signage-test
docker rm vertical-signage-test
docker build -t vertical-signage-test .
docker run -d -p 8080:80 --name vertical-signage-test vertical-signage-test
```

### 4. Stop the container

```bash
docker stop vertical-signage-test
```

---

## How the Container Works

The `Dockerfile` at the repo root uses `nginx:alpine` as the base image — a minimal Linux install with nginx pre-configured. It copies the source files into the directory nginx serves by default:

```
src/         →  /usr/share/nginx/html/
config/      →  /usr/share/nginx/html/config/
```

This flattens `src/` into the web root so all relative paths in the app resolve correctly. No build step is required since the project is plain HTML, CSS, and JavaScript.

The `.dockerignore` file excludes `node_modules/`, `test/`, `docs/`, and other files that don't belong in the image, keeping it lean.

---

## CI/CD Pipeline — Auto Build and Publish

The workflow at `.github/workflows/docker.yml` runs automatically on every merge to `main`. It builds the Docker image and pushes it to the **GitHub Container Registry (ghcr.io)**.

### What triggers it

Any push or merged PR to the `main` branch.

### What it does

1. Checks out the latest code
2. Logs in to ghcr.io using a `GITHUB_TOKEN` — this is provided automatically by GitHub, no manual secret setup required
3. Builds the image from the `Dockerfile`
4. Pushes two tags:
   - `:latest` — always points to the most recent build
   - `:<git-sha>` — a tag for the exact commit, useful for rollbacks

### Where to find the published image

Go to the repo on GitHub and click the **Packages** link on the right sidebar. The image is published at:

```
ghcr.io/thefightingmong00ses/vertical-signage
```

### Pulling the image

To pull the latest image on any machine (including a Raspberry Pi):

```bash
docker pull ghcr.io/thefightingmong00ses/vertical-signage:latest
```

To run it:

```bash
docker run -d -p 80:80 ghcr.io/thefightingmong00ses/vertical-signage:latest
```

### Monitoring builds

Go to the **Actions** tab on the GitHub repo to see the status of each workflow run and view logs if something fails.
