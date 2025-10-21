<template>
  <Card class="py-2">
    <CardContent class="flex flex-col items-center p-4">
      <!-- Imagen -->
      <template v-if="material.type === 'image'">
        <div class="w-full h-32 rounded mb-2 relative">
          <img
            v-if="imageLoaded"
            :src="material.src"
            :alt="material.title"
            class="w-full h-32 object-cover rounded"
            :data-index="index"
            @error="handleImageError"
            @load="handleImageLoad"
          />
          <div v-if="!imageLoaded" class="absolute inset-0 bg-muted rounded flex items-center justify-center">
            <div class="text-center">
              <svg class="w-12 h-12 mx-auto text-muted-foreground mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
              </svg>
              <p class="text-xs text-muted-foreground">Imagen no disponible</p>
            </div>
          </div>
        </div>
      </template>

      <!-- Video -->
      <template v-else-if="material.type === 'video'">
        <div class="w-full h-32 rounded mb-2 relative">
          <video
            ref="videoRef"
            :src="material.src"
            class="w-full h-32 rounded cursor-pointer"
            :data-index="index"
            @error="handleVideoError"
            @loadeddata="handleVideoLoad"
            @play="handleVideoPlay"
            @pause="handleVideoPause"
            @click="toggleVideo"
          ></video>
          
          <!-- Overlay con botón de play -->
          <div 
            v-if="!videoLoaded || showPlayOverlay" 
            class="absolute inset-0 bg-muted-foreground rounded flex items-center justify-center"
            @click="playVideo"
          >
            <div class="text-center">
              <div 
                v-if="videoLoaded && showPlayOverlay"
                class="w-16 h-16  rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors"
              >
                <svg class="w-12 h-12 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
                </svg>
              </div>
              <div v-else class="text-center">
                <svg class="w-12 h-12 mx-auto text-white mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v1H2V6zm0 3v7a2 2 0 002 2h12a2 2 0 002-2V9H2z" clip-rule="evenodd" />
                  <path d="M9 11l3-3-3-3v6z" />
                </svg>
                <p class="text-xs text-white">Video no disponible</p>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- PDF -->
      <template v-else-if="material.type === 'pdf'">
        <div class="w-full h-32 bg-muted rounded mb-2 flex items-center justify-center">
          <div class="text-center">
            <svg class="w-12 h-12 mx-auto text-muted-foreground mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
            </svg>
            <p class="text-xs text-muted-foreground">PDF</p>
          </div>
        </div>
      </template>

      <!-- Título y descripción -->
      <h4 class="font-medium text-center">{{ material.title }}</h4>
      <p class="text-xs text-muted-foreground text-center mt-1">
        {{ material.description }}
      </p>
    </CardContent>
  </Card>
</template>

<script setup>
import { ref } from 'vue'
import { Card, CardContent } from '@/components/ui/card'

// Props
const props = defineProps({
  material: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

// Estados para manejar carga de medios
const imageLoaded = ref(false)
const videoLoaded = ref(false)
const showPlayOverlay = ref(true)
const videoRef = ref(null)

// Funciones para manejar carga de medios
const handleImageLoad = () => {
  imageLoaded.value = true
}

const handleImageError = () => {
  imageLoaded.value = false
}

const handleVideoLoad = () => {
  videoLoaded.value = true
}

const handleVideoError = () => {
  videoLoaded.value = false
}

// Funciones para manejar reproducción de video
const playVideo = () => {
  if (videoRef.value && videoLoaded.value) {
    videoRef.value.play()
  }
}

const handleVideoPlay = () => {
  showPlayOverlay.value = false
}

const handleVideoPause = () => {
  showPlayOverlay.value = true
}

const toggleVideo = () => {
  if (videoRef.value && videoLoaded.value) {
    if (videoRef.value.paused) {
      videoRef.value.play()
    } else {
      videoRef.value.pause()
    }
  }
}
</script> 