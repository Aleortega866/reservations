<!-- with Nuxt -->
<script setup lang="ts">
import { Toaster } from "vue-sonner";
import "vue-sonner/style.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import TheSidebar from "@/components/app/TheSidebar.vue";
import { useAuthStore } from "@/stores/auth";
import { useDialogStore } from "@/stores/dialog";

import SplashScreen from "@/components/common/SplashScreen.vue";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAppLoading } from "@/composables/ui/useAppLoading";

const authStore = useAuthStore();

// Store de dialogo
const dialogStore = useDialogStore();

const router = useRouter();

// Loading global
const { isLoading, loadingText, showText, showSpinner } = useAppLoading();

// Manejador de errores para módulos dinámicos (red de seguridad)
// Nota: Con keepalive configurado correctamente, esto rara vez se ejecutará
onMounted(() => {
  router.onError((error: Error) => {
    const errorMsg = error?.message || "";
    if (errorMsg.includes("Failed to fetch dynamically imported module")) {
      console.warn("🔄 Error de módulo dinámico detectado, recargando...");
      window.location.reload();
    }
  });
});
</script>

<template>
  <SidebarProvider :default-open="false" data-version="201025: 21:30:QA">
    <div class="flex flex-row-reverse h-full w-full">
      <ClientOnly>
        <TheSidebar v-if="authStore.isAuthenticated" />
      </ClientOnly>
      <main class="flex-1 w-full h-full overflow-y-auto">
        <NuxtPage
          :keepalive="{
            max: 20,
            include: [
              'reservations-index',
              'notifications-index',
              'profile-index',
              'admin-index',
            ],
          }"
        />
      </main>
      <!-- Modal de splash screen -->
      <ClientOnly>
        <SplashScreen
          v-if="authStore.isAuthenticated"
          :show-dialog="dialogStore.showDialog"
          :dialog-title="dialogStore.dialogTitle"
          :dialog-content="dialogStore.dialogContent"
          @handle-dialog="(value) => dialogStore.toggleDialog(value)"
        />
      </ClientOnly>
    </div>
    <!-- Nuxt, vue-sonner v1 because inserting inline CSS with JS to the head tag -->
    <ClientOnly>
      <Toaster
        position="top-right"
        :rich-colors="true"
        :close-button="true"
        :dismissible="true"
        :max-toasts="5"
        :expand="false"
        :swipe-to-close="true"
      />
    </ClientOnly>

    <!-- Loading Global -->
    <AppLoading
      :is-visible="isLoading"
      :loading-text="loadingText"
      :show-text="showText"
      :show-spinner="showSpinner"
    />
  </SidebarProvider>
</template>

<style>
/* Estilos globales */
</style>
