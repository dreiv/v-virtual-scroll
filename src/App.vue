<script setup lang="ts">
import { ref } from 'vue'
import { useIntersectionObserver, useVirtualList } from '@vueuse/core'

// Define the shape of our mock data
interface Item {
  id: number
  name: string
}

const allItems = ref<Item[]>([])
const nextCursor = ref<number | null>(0)
const isLoading = ref(false)

// 1. Set up virtual scrolling for the items currently in memory
const { list, containerProps, wrapperProps } = useVirtualList(allItems, {
  itemHeight: 50 // Fixed height optimization
})

// Mock API fetch function to generate local data
const fetchNextChunk = async (cursor: number) => {
  if (isLoading.value) return
  isLoading.value = true

  // Simulate a 500ms network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const chunkSize = 20
  const newItems: Item[] = Array.from({ length: chunkSize }).map((_, i) => ({
    id: cursor + i,
    name: `Virtual Item #${cursor + i}`
  }))

  allItems.value.push(...newItems)
  nextCursor.value = cursor + chunkSize
  isLoading.value = false
}

// 2. Sentinel target to trigger the next fetch
const sentinel = ref<HTMLElement | null>(null)

useIntersectionObserver(sentinel, (entries) => {
  const entry = entries[0]

  if (entry?.isIntersecting && nextCursor.value !== null) {
    // Hit the mock API, push new items to allItems.value, update nextCursor
    fetchNextChunk(nextCursor.value)
  }
})
</script>

<template>
  <main>
    <h1>Virtual Scrolling List</h1>

    <!-- Virtual List Container -->
    <div v-bind="containerProps" class="list-container">

      <!-- Semantic wrapper using ul and aria-setsize for screen readers -->
      <ul
        v-bind="wrapperProps"
        class="list-wrapper"
        role="list"
        :aria-setsize="allItems.length"
      >
        <!-- Semantic list items with aria-posinset and keyboard focus support -->
        <li
          v-for="item in list"
          :key="item.data.id"
          class="list-item"
          role="listitem"
          :aria-posinset="item.index + 1"
          tabindex="0"
        >
          {{ item.data.name }}
        </li>
      </ul>

      <!-- Sentinel element for infinite loading with polite aria live region -->
      <div ref="sentinel" class="sentinel" aria-live="polite">
        <span v-if="isLoading">Loading more items...</span>
        <span v-else>Scroll down for more</span>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Flexbox layout to make the container responsive */
main {
  font-family: sans-serif;
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;

  height: 80vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

/*
  flex-grow: 1 forces the container to take up all remaining space.
  min-height: 0 prevents it from stretching beyond the parent's boundaries.
*/
.list-container {
  flex-grow: 1;
  min-height: 0;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}

/* Reset list styles for the wrapper */
.list-wrapper {
  margin: 0;
  padding: 0;
  list-style: none;
}

.list-item {
  height: 50px; /* MUST match the itemHeight defined in useVirtualList */
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #eee;
  box-sizing: border-box;
  outline: none; /* Manage focus state explicitly for keyboard users */
}

/* Clear, highly visible focus state for keyboard navigation */
.list-item:focus-visible {
  background-color: #e0f0ff;
  box-shadow: inset 0 0 0 2px #005fcc;
}

.sentinel {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 0.9em;
}
</style>
