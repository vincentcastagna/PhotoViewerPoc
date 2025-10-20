# Photo Viewer Proof of Concept – Feature Overview

This document provides a written walkthrough of the Photo Viewer proof of concept
for cases where running the Vite development server is not possible.

## Modal Shell
- Full-screen modal overlay with dimmed backdrop.
- Top toolbar displays the current photo index/total and a close button.
- Focus is trapped inside the dialog while it is open and returns to the
  triggering element on close.

## Photo Stage
- Large central stage that renders the active image using `decoding="async"`.
- Supports zoom levels from 1× to 4× with double-click toggling between
  default and 2×.
- Panning becomes available while zoomed, keeping the image within bounds.
- Mouse wheel with <kbd>Ctrl</kbd> or vertical scroll zooms smoothly.

## Controls
- Bottom control bar with buttons for Previous, Next, Zoom In, Zoom Out,
  Reset Zoom, and Fullscreen.
- Buttons are disabled at the boundaries when looping is turned off.
- Keyboard shortcuts mirror button intents (`←`/`→`, `+`, `-`, `0`, `F`).

## Thumbnails
- Optional thumbnail strip (bottom by default, switchable to left alignment).
- Implements WAI-ARIA listbox/option roles with `aria-selected` state.
- Clicking or pressing <kbd>Enter</kbd> on a thumbnail jumps to that photo.

## Additional Behavior
- Neighbor images preload automatically after navigation for smoother
  transitions.
- Fullscreen API integration lets the viewer toggle browser fullscreen mode,
  falling back gracefully if unsupported.
- Demo gallery showcases opening the viewer from a button and via an exposed
  `open(index)` method.

Refer to the component and composable source files in `src/components/photoviewer`
for implementation details.
