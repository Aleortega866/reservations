<template>
  <div class="min-h-screen bg-background">
    <!-- Layout responsivo -->
    <div class="flex flex-col justify-center align-center md:flex-row min-h-screen">
      <!-- Video de bienvenida -->
      <div class="w-full md:flex-1 flex items-center justify-center p-4 md:p-8">
        <div class="w-full max-w-lg md:max-w-2xl">
          <h1
            class="hidden lg:block text-card-foreground font-semibold text-3xl text-left mb-4"
          >
            MULTIPLES RESERVACIONES DESDE UNA SOLA CUENTA
          </h1>
          <!-- VideoPlayer con manejo de hidratación -->
          <div class="h-[200px] md:h-[350px] w-full">
            <ClientOnlyVideoPlayer
              :video="welcomeVideo"
              :get-video-url="getWelcomeVideoUrl"
              height="100%"
              width="100%"
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
      </div>

      <!-- Formulario de login -->
      <div class="w-full md:flex-1 flex items-center justify-center p-4 md:p-8">
        <div class="w-full max-w-md space-y-6">
          <!-- Success message for password reset -->
          <div
            v-if="showSuccessMessage"
            class="p-4 bg-green-50 border border-green-200 rounded-md"
          >
            <p class="text-sm text-green-600">
              ¡Tu contraseña ha sido cambiada exitosamente! Ya puedes iniciar sesión con
              tu nueva contraseña.
            </p>
          </div>

          <LoginForm
            :loading="loading"
            :error="error"
            @submit="handleLogin"
            @forgot-password="router.push('/auth/forgot-password')"
            @register="router.push('/auth/register')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from "vue";
import LoginForm from "@/components/auth/LoginForm.vue";
import ChatButton from "@/components/common/ChatButton.vue";
import ClientOnlyVideoPlayer from "@/components/auth/ClientOnlyVideoPlayer.vue";
import { useRouter, useRoute } from "vue-router";
import { useApiAuth } from "@/lib/api/composables/auth";
import type { SignInRequest } from "@/lib/api/types";
import { useToast } from "@/composables/ui/useToast";
import { useErrorHandler } from "@/composables/ui/useErrorHandler";

const router = useRouter();
const route = useRoute();
const { signIn, loading, error } = useApiAuth();
const { showSuccess, showError, showInfo } = useToast();
const { getAuthErrorMessage } = useErrorHandler();

const showSuccessMessage = ref(false);

// Estado del video de bienvenida
const hasUserInteracted = ref(false);

// Configuración del video de bienvenida
const welcomeVideo = {
  id: "welcome-video",
  title: "Video de Bienvenida",
  src:
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
};

interface LoginFormData {
  email: string;
  password: string;
}

onMounted(async () => {
  // Verificar si hay un mensaje de éxito en la URL
  if (route.query.message === "password-reset-success") {
    showSuccessMessage.value = true;
    // Limpiar el query parameter
    router.replace({ query: {} });

    // Ocultar el mensaje después de 5 segundos
    setTimeout(() => {
      showSuccessMessage.value = false;
    }, 5000);
  }

  // Forzar re-renderización si venimos de una redirección 404
  if (route.query.from === "404" || route.query.redirected === "true") {
    console.log("🔄 Detectada redirección desde 404, forzando re-renderización");
    // Forzar un re-renderizado completo
    await nextTick();
    // Pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
      console.log("✅ Re-renderización completada");
    }, 100);
  }
});

// Funciones para el video de bienvenida
const getWelcomeVideoUrl = (video: any): string => {
  return video.src || "";
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

const handleLogin = async (formData: LoginFormData) => {
  try {
    // Toast informativo de inicio
    showInfo("Iniciando sesión", "Verificando tus credenciales...", { duration: 2000 });

    const credentials: SignInRequest = {
      email: formData.email,
      password: formData.password,
    };

    const response = await signIn(credentials);

    if (response) {
      // Esperar un momento antes de mostrar el toast de éxito
      await new Promise((resolve) => setTimeout(resolve, 800));
      // Toast de éxito
      showSuccess("¡Inicio de sesión exitoso!", "Bienvenido de vuelta");

      // Esperar a que el estado reactivo se actualice completamente
      await nextTick();

      // Esperar un poco más para asegurar que el middleware detecte el cambio
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Login exitoso - redirigir a la página principal
      await router.push("/reservations");
    }
  } catch (error) {
    console.error("Error en login:", error);

    // Toast de error
    showError("Error al iniciar sesión", getAuthErrorMessage(error as any));
  }
};

const handleChatClick = () => {
  // Aquí iría la lógica para abrir el chat
  console.log("Chat clicked!");
};
</script>

<style></style>
