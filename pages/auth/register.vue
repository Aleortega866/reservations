<template>
  <div class="min-h-screen bg-background">
    <!-- Layout responsivo -->
    <div class="flex flex-col md:flex-row min-h-screen">
      <!-- Video de bienvenida -->
      <div
        class="w-full md:w-1/2 md:fixed md:left-0 md:top-0 md:h-screen flex items-center justify-center p-4 md:p-12"
      >
        <div class="w-full" :class="isMobile ? 'max-w-lg' : 'max-w-2xl'">
          <h1
            v-if="!isMobile"
            :class="isMobile ? 'text-2xl text-center' : 'text-3xl text-left'"
            class="text-card-foreground font-semibold text-left mb-4"
          >
            CREA TU CUENTA EN MINUTOS
          </h1>
          <VideoPlayer
            :video="welcomeVideo"
            :get-video-url="getWelcomeVideoUrl"
            :height="isMobile ? '200px' : '350px'"
            :width="isMobile ? '100%' : '900px'"
            :autoplay="false"
            :muted="true"
            :loop="true"
            :show-custom-controls="hasUserInteracted"
            :show-native-controls="false"
            :click-to-toggle="true"
            loading-text="Cargando video de bienvenida..."
            @play="handleVideoPlay"
            @pause="handleVideoPause"
            @loaded="handleVideoLoaded"
            @error="handleVideoError"
          />
        </div>
      </div>

      <!-- Formulario de registro -->
      <div
        class="w-full md:w-1/2 md:ml-[50%] flex items-center justify-center p-4 md:p-12"
      >
        <div class="w-full max-w-md space-y-6">
          <!-- Mensaje de éxito -->
          <div
            v-if="successMessage"
            class="p-4 bg-green-50 border border-green-200 rounded-md"
          >
            <p class="text-sm text-green-600">
              {{ successMessage }}
            </p>
          </div>

          <RegisterForm
            :loading="loading"
            :error="error"
            @submit="handleRegister"
            @cancel="navigateTo('/auth/login')"
          />
        </div>
      </div>
    </div>

    <!-- Chat button -->
    <div class="fixed bottom-4 right-4">
      <ChatButton :icon-class="'w-8 h-8'" @click="handleChatClick" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import RegisterForm from "@/components/auth/RegisterForm.vue";
import ChatButton from "@/components/common/ChatButton.vue";
import VideoPlayer from "@/components/common/VideoPlayer.vue";
import { useApiAuth } from "@/lib/api/composables/auth";
import { useToast } from "@/composables/ui/useToast";
import { useErrorHandler } from "@/composables/ui/useErrorHandler";
import { navigateTo } from "nuxt/app";

const { register, loading, error } = useApiAuth();
const { showSuccess, showError, showInfo } = useToast();
const { getAuthErrorMessage } = useErrorHandler();
const successMessage = ref("");

// Usar el composable de device de Nuxt
const {
  isMobile,
  isDesktop,
  isTablet,
  isMobileOrTablet,
  isDesktopOrTablet,
} = useDevice();

// Debug: Log de información del dispositivo
onMounted(() => {
  console.log("🔍 Device Detection Debug:", {
    isMobile,
    isDesktop,
    isTablet,
    isMobileOrTablet,
    isDesktopOrTablet,
    userAgent: process.client ? navigator.userAgent : "SSR",
  });
});

// Estado del video de bienvenida
const hasUserInteracted = ref(false);

interface RegisterFormData {
  email: string;
  password: string;
  name: string;
  // Agrega otros campos según tu formulario
}

// Configuración del video de bienvenida
const welcomeVideo = {
  id: "welcome-video",
  title: "Video de Bienvenida",
  src:
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
};

const handleVideoPlay = (video: any) => {
  console.log("▶️ Reproduciendo video de bienvenida:", video.title);
  // Mostrar controles después de la primera interacción
  hasUserInteracted.value = true;
};

const handleVideoPause = (video: any) => {
  console.log("⏸️ Video de bienvenida pausado:", video.title);
  // Ocultar controles cuando se pausa desde el centro del video
  hasUserInteracted.value = false;
};

const handleVideoLoaded = (video: any, duration: number) => {
  console.log(
    "✅ Video de bienvenida cargado:",
    video.title,
    "Duración:",
    Math.round(duration),
    "s"
  );
};

const handleVideoError = (video: any, error: Event) => {
  console.error("❌ Error en video de bienvenida:", video.title, error);
};

// Funciones para el video de bienvenida
const getWelcomeVideoUrl = (video: any): string => {
  return video.src || "";
};

const handleRegister = async (formData: RegisterFormData) => {
  console.log("formData", formData);
  try {
    // Limpiar mensajes anteriores
    successMessage.value = "";

    // Toast informativo de inicio
    showInfo("Procesando registro", "Estamos creando tu cuenta...");

    // Mapear los datos del formulario al formato de la API
    const userData = formData;

    // Llamar al endpoint de registro
    const response = await register(userData);

    if (response) {
      // Toast de éxito
      showSuccess("¡Registro exitoso!", "Tu cuenta ha sido creada correctamente");

      // Toast informativo de redirección
      setTimeout(() => {
        showInfo("Redirigiendo", "Te estamos llevando al inicio de sesión...");
      }, 1000);

      // Redirigir después de 2 segundos
      setTimeout(async () => {
        await navigateTo("/auth/login");
      }, 2000);
    }
  } catch (err) {
    console.error("Error en registro:", err);

    // Toast de error
    showError("Error en el registro", getAuthErrorMessage(err as any));
  }
};

const handleChatClick = () => {
  // Aquí iría la lógica para abrir el chat
  console.log("Chat clicked!");
};
</script>
