# Poke Photo Viewer

A modular Vue 3 + TypeScript proof of concept showcasing an accessible, keyboard-friendly photo viewer with zoom, pan, thumbnails, and fullscreen support.

## Usage as a library

The photo viewer can be consumed directly from the package barrel. Import the component and ship the generated styles alongside it:

```ts
import PhotoViewer from 'poke-photo-viewer';
import 'poke-photo-viewer/dist/style.css';

// Optional named exports are also available:
// import { PhotoViewer, usePhotoViewer } from 'poke-photo-viewer';
```

Supporting composables (`usePhotoViewer`, `usePhotoViewerController`, `useDialogAccessibility`, `usePreload`, `useZoomPan`) and TypeScript types (`ImageItem`, `PhotoViewerProps`) are all re-exported from the package entry point.

## Getting Started

```bash
pnpm install
pnpm dev
```

## Dockerized Development

You can work on the project without installing Node.js locally by using the provided Docker setup.

```bash
# Build the image (only required after changing dependencies)
docker compose build

# Start the development server (accessible at http://localhost:5173)
docker compose up
```

The container automatically installs dependencies on first boot and reuses them across runs via a named volume. To run one-off commands such as the test suite inside the container, use `docker compose run`:

```bash
docker compose run --rm app pnpm test
```

Run tests:

```bash
pnpm test
```

Lint and format:

```bash
pnpm lint
pnpm format
```
