<template>
  <div>
    <!-- VideoPlayer solo en el cliente -->
    <VideoPlayer
      v-if="isClient"
      :video="video"
      :get-video-url="getVideoUrl"
      :height="height"
      :width="width"
      :autoplay="autoplay"
      :muted="muted"
      :loop="loop"
      :show-custom-controls="showCustomControls"
      :show-native-controls="showNativeControls"
      :click-to-toggle="clickToToggle"
      :loading-text="loadingText"
      @play="(video) => $emit('play', video)"
      @pause="(video) => $emit('pause', video)"
      @loaded="(video, duration) => $emit('loaded', video, duration)"
      @error="(video, error) => $emit('error', video, error)"
      @timeUpdate="
        (video, currentTime, duration) =>
          $emit('timeUpdate', video, currentTime, duration)
      "
      @ended="(video) => $emit('ended', video)"
      @pipToggle="(video, isPiP) => $emit('pipToggle', video, isPiP)"
    />

    <!-- Placeholder durante la hidratación -->
    <div v-else class="relative overflow-hidden rounded-3xl">
      <div
        class="w-full bg-black rounded-3xl overflow-hidden"
        :style="{ height: height, width: width }"
      >
        <div class="absolute inset-0 bg-black/80 flex items-center justify-center">
          <div class="flex flex-col items-center space-y-2">
            <div
              class="animate-spin inline-block size-6 border-3 border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500"
              role="status"
              aria-label="loading"
            >
              <span class="sr-only text-sm text-muted-foreground">Cargando video...</span>
            </div>
            <span class="text-white text-sm">{{
              loadingText || "Cargando video..."
            }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import VideoPlayer from "@/components/common/VideoPlayer.vue";

interface Props {
  video: any;
  getVideoUrl?: (video: any) => string | Promise<string>;
  height?: string;
  width?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  showCustomControls?: boolean;
  showNativeControls?: boolean;
  clickToToggle?: boolean;
  loadingText?: string;
}

defineProps<Props>();

const emit = defineEmits<{
  play: [video: any];
  pause: [video: any];
  loaded: [video: any, duration: number];
  error: [video: any, error: Event];
  timeUpdate: [video: any, currentTime: number, duration: number];
  ended: [video: any];
  pipToggle: [video: any, isPiP: boolean];
}>();

const isClient = ref(false);

onMounted(() => {
  isClient.value = true;
});
</script>
