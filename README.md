# Vue 3 Virtual Scrolling & Infinite Loading

This project demonstrates a highly performant approach to rendering massive datasets in Vue 3. By combining DOM virtualization with an intersection observer, the application maintains a strict memory and rendering footprint regardless of how much data is loaded.

## 🚀 Core Architecture

The implementation relies on two primary composables from `@vueuse/core`:

1.  **`useVirtualList` (DOM Virtualization)**
    Instead of rendering thousands of DOM elements, this composable calculates exactly which items fit within the user's current viewport based on the scroll position and the `itemHeight`. It only renders that specific subset of nodes (plus a small buffer). As the user scrolls, the same DOM nodes are effectively recycled and updated with new data, keeping the browser's painting and layout engines operating efficiently.

2.  **`useIntersectionObserver` (Infinite Loading)**
    Instead of binding a costly generic `scroll` event listener to the window or container, this pattern uses a "Sentinel" element. The sentinel is an empty or purely visual `<div>` placed at the very bottom of the scrolling list. When the browser detects that the sentinel has intersected with the visible viewport, it triggers the callback to fetch the next chunk of data.

## 🛠️ How It Works

*   **The Container:** The list container requires a fixed height (or `max-height`) and `overflow-y: auto`. This creates the scrollable window.
*   **The Data Store:** An array (`allItems`) acts as the single source of truth. It holds all the raw data fetched from the API.
*   **The Rendered List:** `useVirtualList` watches `allItems` and outputs a sliced `list` array containing only the visible items. The Vue `<template>` iterates over this sliced array, not the main data store.
*   **The Fetch Cycle:**
    * User scrolls down.
    * Sentinel enters the viewport.
    * Intersection observer fires and triggers `fetchNextChunk()`.
    * New data is appended to `allItems`.
    * `useVirtualList` automatically recalculates and updates the scroll height.

## ♿ Accessibility (A11y) & Semantic Considerations

Virtual lists inherently break native browser accessibility because the majority of the list items do not exist in the DOM at any given time. Keep the following considerations in mind when adapting this for production:

*   **Screen Readers:** Because items are missing from the DOM, screen readers cannot announce the total number of items or allow users to easily jump to the end of the list. Consider adding `aria-setsize` to define the total known dataset size and `aria-posinset` on individual items to declare their specific index.
*   **Keyboard Navigation (Tabbing):** If your list items contain focusable elements (like buttons or links), tabbing through them can behave unpredictably. When focused items scroll out of view and are removed from the DOM by the virtualizer, the keyboard focus will be lost and reset to the document body.
*   **Semantic HTML:** While `<div>` elements are used here for simplicity, consider mapping the container to a `<ul>` with `role="list"` and the items to `<li>` with `role="listitem"` to enforce strict semantic structure.

## 📦 Setup & Commands

Ensure you have Node.js installed (v22.18.0 or >=24.12.0).

Install dependencies:
```bash
npm install
