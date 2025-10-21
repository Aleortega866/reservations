<template>
  <div>
    <!-- Diálogos -->
    <EditVideoDialog
      v-model:open="editDialogOpen"
      :video="selectedVideo"
      @saved="handleVideoSaved"
    />
    <VideoVisibilityDialog
      v-model:open="visibilityDialogOpen"
      :video="selectedVideo"
      @saved="handleVideoSaved"
    />
    <ReplaceVideoDialog
      v-model:open="replaceDialogOpen"
      :video="selectedVideo"
      @replaced="handleVideoReplaced"
      @deleted="handleVideoDeleted"
    />

    <div class="space-y-0 mt-1" v-auto-animate="{ duration: 200, easing: 'ease-out' }">
      <!-- Opciones que se expanden hacia abajo -->
      <div class="space-y-0">
        <!-- Estado de carga -->
        <div v-if="loading" class="p-6 rounded-md">
          <div class="flex items-center justify-center space-x-2">
            <div
              class="animate-spin inline-block size-6 border-3 border-current border-t-transparent text-blue-600 rounded-full dark:text-blue-500"
              role="status"
              aria-label="loading"
            >
              <span class="sr-only text-sm text-muted-foreground"
                >Cargando videos...</span
              >
            </div>
          </div>
        </div>

        <!-- Estado de error -->
        <div v-else-if="error" class="p-4 border border-destructive/20 rounded-md">
          <div class="flex items-center space-x-2">
            <Icon
              icon="lucide:circle-alert"
              width="16"
              height="16"
              class="text-destructive"
            />
            <span class="text-sm text-destructive">{{ error }}</span>
          </div>
          <button
            @click="retryLoadVideos"
            class="mt-2 text-xs text-destructive hover:text-destructive/80 underline"
          >
            Reintentar
          </button>
        </div>

        <!-- Lista de videos agrupados por sección -->
        <div v-else class="max-h-auto overflow-y-auto space-y-4">
          <div
            v-for="group in groupedVideos"
            :key="group.section?.id || 'sin-seccion'"
            class="space-y-2 overflow-hidden"
          >
            <!-- Header de sección -->
            <div
              class="sticky top-0 bg-secondary/10 border-b border-border/40 px-4 py-3 mb-0 cursor-pointer rounded-full hover:bg-secondary/20 transition-colors"
              :class="
                isSectionCollapsed(group.section?.id?.toString() || 'sin-seccion')
                  ? 'rounded-full'
                  : 'rounded-none rounded-t-xl rounded-b-none'
              "
              @click="
                toggleSectionCollapse(group.section?.id?.toString() || 'sin-seccion')
              "
            >
              <h3
                class="text-sm font-semibold text-foreground/80 flex items-center justify-between space-x-2"
              >
                <span class="space-x-2">
                  <span>{{ group.section?.name || "Sin Sección" }}</span>
                  <span class="text-xs text-muted-foreground"
                    >({{ group.videos.length }} video{{
                      group.videos.length !== 1 ? "s" : ""
                    }})</span
                  >
                </span>
                <Icon
                  v-if="
                    isSectionCollapsed(group.section?.id?.toString() || 'sin-seccion')
                  "
                  icon="lucide:chevrons-up-down"
                  width="16"
                  height="16"
                  class="text-muted-foreground"
                />
                <Icon
                  v-else
                  icon="lucide:chevrons-down-up"
                  width="16"
                  height="16"
                  class="text-muted-foreground"
                />
              </h3>
            </div>

            <!-- Videos de la sección -->
            <div v-auto-animate="{ duration: 300, easing: 'ease-in-out' }">
              <div
                v-if="!isSectionCollapsed(group.section?.id?.toString() || 'sin-seccion')"
                class="bg-secondary/10 space-y-1 overflow-hidden px-2 py-3"
                :class="
                  isSectionCollapsed(group.section?.id?.toString() || 'sin-seccion')
                    ? 'rounded-full'
                    : 'rounded-none rounded-b-xl'
                "
              >
                <div
                  v-for="(video, index) in group.videos"
                  :key="video.id"
                  class="py-1 px-1"
                  :class="
                    index === group.videos.length - 1 ? 'rounded-none' : 'rounded-none'
                  "
                >
                  <!-- Información del video -->
                  <div
                    class="flex items-center justify-between space-x-4 py-3 px-4 cursor-pointer bg-accent/10"
                    :class="video.showDemo ? 'rounded-none rounded-t-lg' : 'rounded-full'"
                    @click="handleHeaderClick(video.id.toString())"
                  >
                    <div class="flex justify-between items-center space-x-2">
                      <div
                        class="text-sm font-normal text-foreground hover:text-primary transition-colors"
                        :title="video.showDemo ? 'Ocultar video' : 'Mostrar video'"
                      >
                        {{ video.title }}
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="transition-transform duration-200">
                        <Icon
                          v-if="video.showDemo"
                          icon="lucide:chevrons-down-up"
                          width="16"
                          height="16"
                          class="text-muted-foreground"
                        />
                        <Icon
                          v-else
                          icon="lucide:chevrons-up-down"
                          width="16"
                          height="16"
                          class="text-muted-foreground"
                        />
                      </span>
                    </div>
                  </div>

                  <div
                    v-if="video.showDemo"
                    class="w-full space-y-4 overflow-hidden bg-accent/10 p-4"
                    v-auto-animate="{ duration: 200, easing: 'ease-out' }"
                  >
                    <div v-if="video.showDemo" class="bg-white p-4 rounded-2xl">
                      <!-- Demo del video usando VideoPlayer común -->
                      <div
                        v-if="video.showDemo"
                        class="relative overflow-hidden rounded-lg"
                        v-auto-animate="{ duration: 300, easing: 'ease-out' }"
                      >
                        <VideoPlayer
                          :video="video"
                          :get-video-url="getVideoUrlForPlayer"
                          :loading="video.isLoading"
                          loading-text="Cargando video..."
                          height="12rem"
                          @play="handleVideoPlayerPlay"
                          @pause="handleVideoPlayerPause"
                          @loaded="handleVideoPlayerLoaded"
                          @error="handleVideoPlayerError"
                          @pip-toggle="handlePiPToggle"
                        />
                      </div>

                      <!-- Controles del video -->
                      <div
                        v-if="video.showDemo"
                        class="flex items-center justify-between mt-4"
                        v-auto-animate="{ duration: 300, easing: 'ease-out' }"
                      >
                        <div class="flex items-center space-x-2">
                          <Button
                            variant="secondary"
                            class="rounded-full text-white !p-[8px]"
                            size="sm"
                            @click="editVideo(video)"
                            title="Editar video"
                          >
                            <Icon icon="lucide:pencil" width="4" height="4" />
                          </Button>
                          <Button
                            variant="secondary"
                            class="rounded-full text-white !p-[8px]"
                            size="sm"
                            @click="openReplaceDialog(video)"
                            title="Reemplazar video"
                          >
                            <Icon icon="lucide:video" />
                          </Button>
                          <Button
                            variant="secondary"
                            class="rounded-full text-white !p-[8px]"
                            size="sm"
                            @click="openVisibilityDialog(video)"
                            title="Configurar visibilidad"
                          >
                            <Icon icon="lucide:calendar" width="24" height="24" />
                          </Button>
                        </div>
                      </div>

                      <!-- Switch siempre visible -->
                      <div
                        v-if="video.showDemo"
                        class="flex items-center justify-end space-x-2 mt-2"
                        @click.stop
                      >
                        <span class="text-xs text-muted-foreground">
                          {{ video.isVisible ? "Visible" : "Oculto" }}
                        </span>
                        <Switch
                          variant="secondary"
                          :model-value="video.isVisible || false"
                          @update:model-value="
                            handleSwitchToggle(video.id.toString(), $event)
                          "
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Mensaje si no hay videos -->
          <div
            v-if="videos.length === 0 && !loading && !error"
            class="p-3 bg-background border border-muted border-t-0 rounded-b-md"
          >
            <span class="text-sm text-muted-foreground text-center block">
              No hay videos disponibles
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed } from "vue";
import { Icon } from "@iconify/vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useVideosStore } from "@/stores/videos";
import { useToast } from "@/composables/ui/useToast";
// import type { Video } from "@/lib/api/types/media";
import EditVideoDialog from "./EditVideoDialog.vue";
import VideoVisibilityDialog from "./VideoVisibilityDialog.vue";
import ReplaceVideoDialog from "./ReplaceVideoDialog.vue";
import VideoPlayer from "@/components/common/VideoPlayer.vue";
import { videoService } from "@/lib/api/services/media/video.service";
import { API_CONFIG, API_ENDPOINTS } from "@/lib/api/core/config";
import type { VideoData } from "@/composables/media/useVideoPlayer";
import type { VideoSection } from "@/lib/api/types/media";

interface Props {
  label: string;
  autoOpen?: boolean;
  onToggleEnable?: (id: string) => Promise<void>;
}

const props = withDefaults(defineProps<Props>(), {
  autoOpen: false,
});

const emit = defineEmits<{
  edit: [video: any];
  delete: [video: any];
}>();

// Usar el store de videos
const videosStore = useVideosStore();

// Usar el composable de toast
const { showSuccess, showError } = useToast();

// Computed para acceder a los videos del store
const videos = computed(() => videosStore.videos);
const loading = computed(() => videosStore.loading);
const error = computed(() => videosStore.error);

// Variables para secciones
const sections = ref<VideoSection[]>([]);
const sectionsLoading = ref(false);
const collapsedSections = ref<Set<string>>(new Set());

// Función para cargar secciones
const loadSections = async () => {
  try {
    sectionsLoading.value = true;
    const sectionsData = await videoService.getAllSections();
    sections.value = sectionsData;
  } catch (err) {
    console.error("Error al cargar secciones:", err);
  } finally {
    sectionsLoading.value = false;
  }
};

// Función para alternar colapso de sección
const toggleSectionCollapse = (sectionId: string) => {
  if (collapsedSections.value.has(sectionId)) {
    collapsedSections.value.delete(sectionId);
  } else {
    collapsedSections.value.add(sectionId);
  }
};

// Función para verificar si una sección está colapsada
const isSectionCollapsed = (sectionId: string) => {
  return collapsedSections.value.has(sectionId);
};

// Computed para agrupar videos por sección
const groupedVideos = computed(() => {
  const groups: { [key: string]: { section: VideoSection | null; videos: any[] } } = {};

  // Agregar grupo para videos sin sección
  groups["sin-seccion"] = {
    section: null,
    videos: [],
  };

  // Agregar grupos para cada sección
  sections.value.forEach((section) => {
    groups[section.id.toString()] = {
      section: section,
      videos: [],
    };
  });

  // Agrupar videos
  videos.value.forEach((video: any) => {
    const sectionId = video.sectionId?.toString() || "sin-seccion";
    if (groups[sectionId]) {
      groups[sectionId].videos.push(video);
    } else {
      // Si la sección no existe, agregar a sin sección
      groups["sin-seccion"].videos.push(video);
    }
  });

  // Filtrar grupos vacíos y ordenar
  return Object.values(groups)
    .filter((group) => group.videos.length > 0)
    .sort((a, b) => {
      // Videos sin sección al final
      if (!a.section) return 1;
      if (!b.section) return -1;
      return a.section.name.localeCompare(b.section.name);
    });
});

// Estado de los diálogos
const editDialogOpen = ref(false);
const visibilityDialogOpen = ref(false);
const replaceDialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const selectedVideo = ref<any | null>(null);

const showOptions = ref(props.autoOpen);
const videoRefs = ref<Record<string, HTMLVideoElement>>({});
const isSwitchBeingUsed = ref(false);

// Verificar si Picture-in-Picture está soportado
const isPictureInPictureSupported = ref(false);

const setVideoRef = (el: any, id: string) => {
  if (el) {
    videoRefs.value[id] = el;
  }
};

// Función para obtener URL del video para el VideoPlayer
const getVideoUrlForPlayer = async (video: VideoData): Promise<string> => {
  const result = await getVideoBlob(video);
  return result || "";
};

// Función para obtener la URL del video (síncrona para uso en template)
const getVideoUrl = (video: any): string => {
  // Si el video tiene una URL directa, usarla
  if (video.fileUrl) {
    return video.fileUrl;
  }

  // Si el video tiene un fileName, construir URL directa del endpoint
  // NO añadir timestamp para permitir cache del navegador
  if (video.fileName) {
    return `${API_CONFIG.baseURL}${API_ENDPOINTS.video.getVideoFile}/${video.fileName}`;
  }

  // URL de video de ejemplo si no hay archivo
  return "https://www.w3schools.com/html/mov_bbb.mp4";
};

// Cache de URLs de videos para evitar peticiones duplicadas
const videoUrlCache = new Map<string, string>();
// Mapa de promesas en curso para evitar peticiones simultáneas
const pendingRequests = new Map<string, Promise<string | null>>();

// Función asíncrona para obtener el blob del video usando el servicio
const getVideoBlob = async (video: any): Promise<string | null> => {
  if (!video.fileName) {
    return null;
  }

  const cacheKey = `${video.id}_${video.fileName}`;

  try {
    // 1. Verificar cache primero
    if (videoUrlCache.has(cacheKey)) {
      console.log("📦 Video obtenido desde cache:", video.fileName);
      return videoUrlCache.get(cacheKey)!;
    }

    // 2. Verificar si ya hay una petición en curso para este video
    if (pendingRequests.has(cacheKey)) {
      console.log("⏳ Esperando petición en curso para:", video.fileName);
      return await pendingRequests.get(cacheKey)!;
    }

    // 3. Crear nueva petición y guardarla en pending
    console.log("🌐 Obteniendo video desde servidor:", video.fileName);

    const requestPromise = (async (): Promise<string | null> => {
      try {
        const result = await videoService.getVideoFile(video.fileName);
        if (result.success && result.data) {
          // Crear URL del blob
          const videoUrl = URL.createObjectURL(result.data);

          // Guardar en cache
          videoUrlCache.set(cacheKey, videoUrl);
          console.log("💾 Video guardado en cache:", video.fileName);

          return videoUrl;
        } else {
          console.error("Error al obtener video:", result.error);
          return null;
        }
      } catch (error) {
        console.error("Error al obtener video con servicio:", error);
        return null;
      } finally {
        // Limpiar de pending requests
        pendingRequests.delete(cacheKey);
      }
    })();

    // Guardar la promesa en pending
    pendingRequests.set(cacheKey, requestPromise);

    return await requestPromise;
  } catch (error) {
    // Limpiar de pending en caso de error
    pendingRequests.delete(cacheKey);
    console.error("Error general en getVideoBlob:", error);
    return null;
  }
};

// Función para retry en caso de error (usando el store)
const retryLoadVideos = async () => {
  await videosStore.fetchVideos(true); // force = true para retry
};

// Cargar videos y configurar soporte PiP al montar el componente
onMounted(async () => {
  console.log("🚀 VideoList.vue - Inicializando componente...");

  // Cargar secciones
  await loadSections();

  // Verificar soporte de Picture-in-Picture
  isPictureInPictureSupported.value =
    document.pictureInPictureEnabled ||
    ((document as any).webkitSupportsPresentationMode &&
      typeof (document as any).webkitSupportsPresentationMode === "function");

  // Cargar videos usando el store (solo una vez)
  await videosStore.fetchVideos();

  console.log("✅ VideoList.vue - Componente inicializado correctamente");
});

// Ya no necesitamos el watcher porque usamos el store directamente

// Watcher para actualizar showOptions cuando cambie autoOpen
watch(
  () => props.autoOpen,
  (newValue: boolean) => {
    showOptions.value = newValue;
  }
);

const editVideo = (video: any) => {
  selectedVideo.value = video;
  editDialogOpen.value = true;
};

const handleVideoSaved = async (video: any) => {
  // Cerrar los diálogos
  editDialogOpen.value = false;
  visibilityDialogOpen.value = false;
  selectedVideo.value = null;

  // Recargar los datos actualizados del video
  console.log("✅ Video actualizado exitosamentess:", video);

  // Ejecutar GetAllVideosAsync para actualizar todos los datos (forzado)
  console.log("🔄 Ejecutando GetAllVideosAsync para actualizar todos los datos...");
  try {
    await videosStore.fetchVideos(true); // force = true
    console.log("✅ Lista de videos recargada exitosamente desde el servidor");
  } catch (error) {
    console.error("❌ Error al recargar la lista de videos:", error);
  }

  // Si el demo del video está abierto, recargarlo para mostrar los cambios
  const videoId = video.id;
  const currentVideo = videosStore.getVideoById(videoId);

  if (currentVideo && currentVideo.showDemo) {
    console.log("🔄 Recargando video editado en el demo...");

    // Forzar recarga del video para mostrar los cambios
    await forceReloadVideo(videoId);

    // Mostrar mensaje de éxito
    showSuccess(
      "Video actualizado",
      `El video se ha actualizado y recargado automáticamente`
    );
  } else {
    // Mostrar mensaje de éxito sin recarga
    showSuccess("Video actualizado", `El video se ha actualizado exitosamente`);
  }
};

const handleVideoReplaced = async (video: any) => {
  // El video fue reemplazado exitosamente
  replaceDialogOpen.value = false;
  selectedVideo.value = null;
  console.log("Video reemplazado:", video);

  // Recargar el video automáticamente si el demo está abierto
  const videoId = video.id;
  const currentVideo = videosStore.getVideoById(videoId);

  if (currentVideo && currentVideo.showDemo) {
    console.log("Recargando video reemplazado...");

    // Forzar recarga completa del video con enfoque agresivo
    await forceReloadVideoAggressive(videoId);

    // Mostrar mensaje de éxito
    showSuccess(
      "Video reemplazado",
      `El video "${video.title}" se ha reemplazado y recargado automáticamente`
    );
  } else {
    // Mostrar mensaje de éxito sin recarga
    showSuccess(
      "Video reemplazado",
      `El video "${video.title}" se ha reemplazado exitosamente`
    );
  }
};

const handleVideoDeleted = async (video: any) => {
  // El video fue eliminado exitosamente
  replaceDialogOpen.value = false;
  selectedVideo.value = null;
  console.log("Video eliminado:", video);

  // Actualizar la lista de videos
  await videosStore.fetchVideos(true);

  // Mostrar mensaje de éxito
  showSuccess(
    "Video eliminado",
    `El video "${video.title}" ha sido eliminado permanentemente`
  );
};

// Función para forzar la recarga completa del video
const forceReloadVideo = async (videoId: number) => {
  const video = videosStore.getVideoById(videoId);
  if (!video) {
    console.error("Video no encontrado para recarga forzada");
    return;
  }

  try {
    // Marcar como cargando
    videosStore.updateVideoUIState(videoId, { isLoading: true });

    console.log("Forzando recarga del video:", video.fileName);

    // Limpiar cualquier URL de blob anterior
    const videoElement = videoRefs.value[videoId.toString()];
    if (videoElement) {
      // Limpiar la fuente actual y revocar URL anterior si existe
      if (videoElement.src && videoElement.src.startsWith("blob:")) {
        URL.revokeObjectURL(videoElement.src);
      }
      videoElement.src = "";
      videoElement.load();
    }

    // Obtener el nuevo blob del video
    const videoUrl = await getVideoBlob(video);

    if (videoUrl) {
      // Esperar a que el DOM se actualice
      await nextTick();

      // Obtener el elemento de video nuevamente
      const updatedVideoElement = videoRefs.value[videoId.toString()];
      if (updatedVideoElement) {
        // Establecer la nueva fuente del video
        updatedVideoElement.src = videoUrl;

        // Precargar el video
        updatedVideoElement.load();

        // Forzar actualización del reproductor
        updatedVideoElement.currentTime = 0;

        console.log("✅ Video recargado exitosamente");
      } else {
        console.warn("Elemento de video no encontrado después de la recarga");
        videosStore.updateVideoUIState(videoId, { isLoading: false });
      }
    } else {
      console.error("No se pudo obtener la nueva URL del video");
      videosStore.updateVideoUIState(videoId, { isLoading: false });
    }
  } catch (error) {
    console.error("Error al forzar recarga del video:", error);
    videosStore.updateVideoUIState(videoId, { isLoading: false });
  }
};

// Función para forzar la recarga agresiva del video (recarga completa del store)
const forceReloadVideoAggressive = async (videoId: number) => {
  console.log("Iniciando recarga agresiva del video:", videoId);

  try {
    // Marcar como cargando
    videosStore.updateVideoUIState(videoId, { isLoading: true });

    // Cerrar temporalmente el demo
    videosStore.updateVideoUIState(videoId, { showDemo: false });

    // Esperar un momento para que se cierre
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Recargar completamente la lista de videos desde el servidor (forzado)
    await videosStore.fetchVideos(true);

    // Esperar un momento para que se actualice
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Obtener el video actualizado
    const updatedVideo = videosStore.getVideoById(videoId);
    if (updatedVideo) {
      // Abrir el demo nuevamente
      videosStore.updateVideoUIState(videoId, { showDemo: true });

      // Esperar a que el DOM se actualice
      await nextTick();

      // Cargar el video con el nuevo archivo
      await loadVideoForDemo(updatedVideo);

      console.log("✅ Recarga agresiva completada exitosamente");
    } else {
      console.error("Video no encontrado después de la recarga del store");
      videosStore.updateVideoUIState(videoId, { isLoading: false });
    }
  } catch (error) {
    console.error("Error en recarga agresiva:", error);
    videosStore.updateVideoUIState(videoId, { isLoading: false });
  }
};

const openVisibilityDialog = (video: any) => {
  selectedVideo.value = video;
  visibilityDialogOpen.value = true;
};

const openReplaceDialog = (video: any) => {
  selectedVideo.value = video;
  replaceDialogOpen.value = true;
};

const handleHeaderClick = (id: string) => {
  toggleVideoDemo(id);
};

const toggleVideoDemo = async (id: string) => {
  const videoId = parseInt(id);
  const video = videosStore.getVideoById(videoId);

  if (video) {
    const newShowDemo = !video.showDemo;
    videosStore.updateVideoUIState(videoId, { showDemo: newShowDemo });

    // Si se abre el demo, cargar el video
    if (newShowDemo) {
      await loadVideoForDemo(video);
    } else {
      // Si se oculta el demo, pausar el video
      pauseVideo(id);
    }
  }
};

// Función para cargar el video cuando se abre el demo
const loadVideoForDemo = async (video: any) => {
  if (!video.fileName) {
    console.warn("Video no tiene fileName:", video);
    return;
  }

  try {
    // Marcar como cargando
    videosStore.updateVideoUIState(video.id, { isLoading: true });

    console.log("Cargando video para demo:", video.fileName);

    // Obtener el blob del video usando el servicio
    const videoUrl = await getVideoBlob(video);

    if (videoUrl) {
      // Esperar a que el DOM se actualice
      await nextTick();

      // Obtener el elemento de video
      const videoElement = videoRefs.value[video.id.toString()];
      if (videoElement) {
        // Establecer la fuente del video
        videoElement.src = videoUrl;

        // Precargar el video
        videoElement.load();

        console.log("✅ Video cargado exitosamente para demo");
      } else {
        console.warn("Elemento de video no encontrado");
        videosStore.updateVideoUIState(video.id, { isLoading: false });
      }
    } else {
      console.error("No se pudo obtener la URL del video");
      videosStore.updateVideoUIState(video.id, { isLoading: false });
    }
  } catch (error) {
    console.error("Error al cargar video para demo:", error);
    videosStore.updateVideoUIState(video.id, { isLoading: false });
  }
};

// Función para manejar cuando el video se carga exitosamente
const handleVideoLoaded = (id: string) => {
  const videoId = parseInt(id);
  videosStore.updateVideoUIState(videoId, { isLoading: false });
  console.log("Video cargado:", id);
};

// Función para manejar errores de carga del video
const handleVideoError = (id: string) => {
  const videoId = parseInt(id);
  videosStore.updateVideoUIState(videoId, { isLoading: false });
  console.error("Error al cargar video:", id);
};

const handleSwitchToggle = async (id: string, value: boolean) => {
  try {
    const videoId = parseInt(id);
    const video = videosStore.getVideoById(videoId);

    if (video) {
      console.log(
        `Enviando petición al servidor para cambiar visibilidad del video ${id} a: ${value}`
      );

      // Actualizar el estado local inmediatamente para feedback visual
      videosStore.updateVideoUIState(videoId, { isVisible: value });

      // Usar el store para actualizar solo la visibilidad
      const response = await videosStore.updateVideoVisibility(videoId, value);

      console.log("Respuesta del servidor:", response);

      // Mostrar toast de éxito
      showSuccess(
        "Visibilidad actualizada",
        `El video "${video.title}" ahora está ${value ? "visible" : "oculto"}`
      );

      console.log(`✅ Visibilidad del video ${id} cambiada exitosamente a: ${value}`);
    }
  } catch (error) {
    console.error("❌ Error al cambiar visibilidad del video:", error);

    // Revertir el estado local si la petición falló
    const videoId = parseInt(id);
    const video = videosStore.getVideoById(videoId);
    if (video) {
      videosStore.updateVideoUIState(videoId, { isVisible: !value });
    }

    // Mostrar toast de error
    showError(
      "Error al actualizar visibilidad",
      "No se pudo cambiar la visibilidad del video. Inténtalo de nuevo."
    );
  }
};

const playVideo = (id: string) => {
  const videoElement = videoRefs.value[id];
  if (videoElement) {
    videoElement.play();
  }
};

const pauseVideo = (id: string) => {
  const videoElement = videoRefs.value[id];
  if (videoElement) {
    videoElement.pause();
  }
};

const toggleVideoPlay = (id: string) => {
  const videoElement = videoRefs.value[id];
  if (videoElement) {
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  }
};

const handleVideoPlay = (id: string) => {
  const videoId = parseInt(id);
  videosStore.updateVideoUIState(videoId, { isPlaying: true });
};

const handleVideoPause = (id: string) => {
  const videoId = parseInt(id);
  videosStore.updateVideoUIState(videoId, { isPlaying: false });
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// Métodos para manejar eventos del VideoPlayer
const handleVideoPlayerPlay = (video: VideoData) => {
  const videoId = typeof video.id === "string" ? parseInt(video.id) : video.id;
  videosStore.updateVideoUIState(videoId, { isPlaying: true });
  console.log("Video reproduciéndose:", video.title);
};

const handleVideoPlayerPause = (video: VideoData) => {
  const videoId = typeof video.id === "string" ? parseInt(video.id) : video.id;
  videosStore.updateVideoUIState(videoId, { isPlaying: false });
  console.log("Video pausado:", video.title);
};

const handleVideoPlayerLoaded = (video: VideoData, duration: number) => {
  const videoId = typeof video.id === "string" ? parseInt(video.id) : video.id;
  videosStore.updateVideoUIState(videoId, {
    isLoading: false,
    duration: duration,
  });
  console.log("Video cargado:", video.title, "Duración:", duration);
};

const handleVideoPlayerError = (video: VideoData, error: Event) => {
  const videoId = typeof video.id === "string" ? parseInt(video.id) : video.id;
  videosStore.updateVideoUIState(videoId, { isLoading: false });
  console.error("Error al cargar video:", video.title, error);

  showError(
    "Error al cargar video",
    `No se pudo cargar el video "${video.title}". Inténtalo de nuevo.`
  );
};

const handlePiPToggle = (video: VideoData, isPiP: boolean) => {
  const videoId = typeof video.id === "string" ? parseInt(video.id) : video.id;
  videosStore.updateVideoUIState(videoId, { isPiP });
  console.log(
    "Picture-in-Picture:",
    isPiP ? "Activado" : "Desactivado",
    "para",
    video.title
  );
};

// Función para alternar Picture-in-Picture
const togglePictureInPicture = async (id: string) => {
  const videoElement = videoRefs.value[id];
  const videoId = parseInt(id);

  if (!videoElement) return;

  try {
    if (document.pictureInPictureElement) {
      // Si ya hay un video en PiP, salir
      await document.exitPictureInPicture();
      videosStore.updateVideoUIState(videoId, { isPiP: false });
    } else {
      // Entrar en modo PiP
      await videoElement.requestPictureInPicture();
      videosStore.updateVideoUIState(videoId, { isPiP: true });
    }
  } catch (error) {
    console.error("Error al alternar Picture-in-Picture:", error);
  }
};

// Escuchar eventos de Picture-in-Picture
onMounted(() => {
  document.addEventListener("enterpictureinpicture", () => {
    // Actualizar estado cuando entra en PiP
    const videoElement = document.pictureInPictureElement as HTMLVideoElement;
    if (videoElement) {
      const videoId = Object.keys(videoRefs.value).find(
        (id) => videoRefs.value[id] === videoElement
      );
      if (videoId) {
        const videoIdNum = parseInt(videoId);
        videosStore.updateVideoUIState(videoIdNum, { isPiP: true });
      }
    }
  });

  document.addEventListener("leavepictureinpicture", () => {
    // Actualizar estado cuando sale de PiP
    videos.value.forEach((video: any) => {
      videosStore.updateVideoUIState(video.id, { isPiP: false });
    });
  });
});
</script>
