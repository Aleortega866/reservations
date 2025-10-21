<template>
  <div class="min-h-screen flex flex-col">
    <!-- Loading durante verificación de autenticación -->
    <AuthLoading v-if="shouldShowLoading" />

    <!-- Contenido solo si está autenticado -->
    <template v-else-if="shouldShowContent">
      <!-- Header -->
      <AdminHeader
        title="Gestión de videos informativos"
        showBackButton
        showMoreButton
        @goBack="goBack"
      />

      <!-- Contenido -->
      <div class="w-full mx-0 lg:max-w-2xl lg:mx-auto p-4 pt-12 mb-16 space-y-4 flex-1">
      <section class="mb-4">
        <div class="flex justify-end mb-4">
          <Button @click="openCreateVideo" class="bg-primary hover:bg-primary/90">
            <Icon icon="material-symbols:add" class="mr-0" width="16" height="16" />
            Agregar nuevo video
          </Button>
        </div>
        <VideoList
          label="Gestión de videos informativos"
          v-auto-animate="{ duration: 100, easing: 'ease-out' }"
          :auto-open="false"
          @create="openCreateVideo"
          @edit="openEditVideo"
          @delete="confirmDeleteVideo"
          @toggle-enable="toggleEnableVideo"
        />
      </section>

      <section>
        <Card
          class="bg-secondary/40 cursor-pointer hover:bg-secondary/20 rounded-full py-3"
        >
          <CardContent class="flex items-center justify-between">
            <p class="text-sm font-medium">Consulta carpeta completa</p>
            <Icon icon="weui:arrow-filled" width="20" height="20" />
          </CardContent>
        </Card>
      </section>
    </div>

      <!-- Bottom Navigation -->
      <BottomNavigation
        :showReservationButton="true"
        @open-chat="handleOpenChat"
        :showFooter="true"
      />

      <!-- Modal de crear video -->
      <CreateVideoDialog
        :open="createVideoDialogOpen"
        @update:open="createVideoDialogOpen = $event"
        @created="handleVideoCreated"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import AdminHeader from "@/components/admin/AdminHeader.vue";
import VideoList from "@/components/admin/videos/VideoList.vue";
import CreateVideoDialog from "@/components/admin/videos/CreateVideoDialog.vue";
import { useRouter } from "vue-router";
import BottomNavigation from "@/components/common/BottomNavigation.vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/vue";
import { ref } from "vue";
import { useVideosStore } from "@/stores/videos";
import { useAuthGuard } from "@/composables/auth/useAuthGuard";
import AuthLoading from "@/components/auth/AuthLoading.vue";

const router = useRouter();

// Guard de autenticación
const { shouldShowLoading, shouldShowContent } = useAuthGuard();

// Store de videos para recargar la lista
const videosStore = useVideosStore();

// Estado del modal de crear video
const createVideoDialogOpen = ref(false);

const goBack = () => {
  router.back();
};

const openCreateVideo = () => {
  createVideoDialogOpen.value = true;
};

const handleVideoCreated = async (video: any) => {
  console.log("Video creado exitosamente:", video);

  try {
    // Recargar la lista de videos desde el servidor
    console.log("🔄 Recargando lista de videos...");
    await videosStore.fetchVideos(true); // force = true para forzar la recarga
    console.log("✅ Lista de videos recargada exitosamente");
  } catch (error) {
    console.error("❌ Error al recargar la lista de videos:", error);
  }
};

const openEditVideo = (video: any) => {
  console.log("openEditVideo - Implementar diálogo de edición", video);
};

const confirmDeleteVideo = (video: any) => {
  console.log("confirmDeleteVideo - Implementar confirmación de eliminación", video);
};

const toggleEnableVideo = async (id: string) => {
  console.log("toggleEnableVideo - Implementar toggle de estado", id);
};

const handleOpenChat = () => {
  // Aquí puedes agregar lógica futura
  console.log("Abriendo chat...");
};
// Aquí puedes agregar lógica futura
</script>
