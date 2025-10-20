<template>
  <section class="demo">
    <p>
      This gallery demonstrates the <code>PhotoViewer</code> component with keyboard navigation,
      thumbnails, zoom, and fullscreen support.
    </p>
    <div class="actions">
      <button type="button" @click="openViewer">Open viewer</button>
      <button type="button" @click="openAt(2)">Jump to third image</button>
    </div>
    <div class="hero-grid">
      <figure
        v-for="({ image, index }, position) in previewImages"
        :key="image.src"
        class="preview"
        :class="position === 0 ? 'preview--primary' : 'preview--secondary'"
      >
        <button type="button" class="preview-media" @click="openAt(index)">
          <img :src="image.src" :alt="image.alt" loading="lazy" decoding="async" />
          <span
            v-if="position === previewImages.length - 1 && images.length > previewImages.length"
            class="preview-overlay"
            aria-hidden="true"
          >
            +{{ images.length - previewImages.length }}
          </span>
        </button>
        <figcaption>
          {{ image.alt || `Photo ${index + 1}` }}
        </figcaption>
      </figure>
    </div>
    <PhotoViewer
      ref="viewerRef"
      v-model="isOpen"
      :images="images"
      :loop="true"
      :start-index="startIndex"
      :show-thumbnails="true"
      thumbs-placement="bottom"
      @change="onChange"
      @image-load="onImageLoad"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import PhotoViewer from '@/components/photoviewer/PhotoViewer.vue';
import { demoImages } from './demoData';

const images = demoImages;
const isOpen = ref(false);
const viewerRef = ref<InstanceType<typeof PhotoViewer> | null>(null);
const startIndex = ref(0);
const previewImages = computed(() =>
  images.slice(0, 3).map((image, index) => ({ image, index }))
);

function openViewer() {
  if (isOpen.value) return;
  isOpen.value = true;
}

function openAt(index: number) {
  startIndex.value = index;
  if (isOpen.value) {
    viewerRef.value?.goTo(index);
    return;
  }
  isOpen.value = true;
}

function onChange(index: number) {
  startIndex.value = index;
  console.info('PhotoViewer changed to index', index);
}

function onImageLoad(index: number) {
  console.info('Image loaded', index);
}
</script>

<style scoped>

.demo {
  display: grid;
  gap: 2rem;
  text-align: left;
  background: #ffffff;
  padding: 2rem;
  border-radius: 1.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
}

.actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

button {
  border: none;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #ffffff;
  padding: 0.75rem 1.25rem;
  border-radius: 999px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 12px 24px rgba(59, 130, 246, 0.18);
}

button:hover {
  transform: translateY(-1px);
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  grid-auto-rows: minmax(0, 1fr);
  gap: 0.75rem;
  min-height: clamp(320px, 45vw, 480px);
}

.preview {
  background: #f8fafc;
  border-radius: 1rem;
  overflow: hidden;
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;
  gap: 0.5rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 25px rgba(148, 163, 184, 0.18);
  min-height: 0;
}

.preview--primary {
  grid-row: 1 / span 2;
  grid-column: 1;
}

.preview--secondary {
  grid-column: 2;
}

.preview-media {
  display: block;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  position: relative;
  isolation: isolate;
  width: 100%;
  height: 100%;
}

.preview-media img {
  width: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.25s ease;
  height: 100%;
}

.preview-media:focus-visible {
  outline: none;
  box-shadow: inset 0 0 0 2px rgba(56, 189, 248, 0.9);
}

.preview-media:focus-visible img,
.preview-media:hover img {
  transform: scale(1.03);
}

.preview-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.35), rgba(15, 23, 42, 0.6));
  color: #ffffff;
  font-weight: 700;
  font-size: 1.5rem;
  letter-spacing: 0.08em;
  border-radius: inherit;
  backdrop-filter: blur(2px);
}

figcaption {
  padding: 0 1rem 1rem;
  color: #475569;
}

@media (max-width: 900px) {
  .hero-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
    min-height: auto;
  }

  .preview--primary {
    grid-row: auto;
  }
}
</style>
