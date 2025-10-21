<template>
  <div class="min-h-screen bg-background">
    <!-- Layout responsivo -->
    <div class="flex flex-col md:flex-row min-h-screen">
      <!-- Video de bienvenida -->
      <div class="w-full md:flex-1 flex items-center justify-center p-4 md:p-8">
        <div class="w-full" :class="isMobile ? 'max-w-lg' : 'max-w-2xl'">
          <h1
            v-if="!isMobile"
            :class="isMobile ? 'text-2xl text-center' : 'text-3xl text-left'"
            class="text-card-foreground font-semibold text-left mb-4"
          >
            RECUPERA TUS DATOS DE MANERA SENCILLA
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

          <!-- Step 1: Forgot Password Form -->
          <ForgotPasswordForm
            v-if="currentStep === 'forgot'"
            :loading="loading"
            :error="error"
            @submit="handleForgotPassword"
            @login="goToLogin"
            @register="goToRegister"
          />

          <!-- Step 2: New Password Form -->
          <NewPasswordForm
            v-if="currentStep === 'reset'"
            :loading="loading"
            :error="error"
            :code="code"
            :email="email"
            @submit="handleResetPassword"
            @login="goToLogin"
            @register="goToRegister"
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

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import ChatButton from "@/components/common/ChatButton.vue";
import VideoPlayer from "@/components/common/VideoPlayer.vue";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm.vue";
import NewPasswordForm from "@/components/auth/NewPasswordForm.vue";

import { useRouter, useRoute } from "vue-router";
import { useApiAuth } from "@/lib/api/composables/auth";
import { useToast } from "@/composables/ui/useToast";
import { useErrorHandler } from "@/composables/ui/useErrorHandler";
import { navigateTo } from "nuxt/app";

const router = useRouter();
// Obtener parámetros de la URL igual que en confirm-user.vue
const route = useRoute();
const urlEmail = (route.query.Email || route.query.email || "") as string;
const urlCode = (route.query.Code || route.query.code || "") as string;
// Composable de autenticación
const { forgotPassword, resetPassword, loading, error } = useApiAuth();
// Toast system (notificaciones visuales para el usuario)
const { showSuccess, showError, showInfo } = useToast();
// Manejador de errores personalizados para autenticación
const { getAuthErrorMessage, getPasswordResetErrorMessage } = useErrorHandler();

// Usar el composable de device de Nuxt
const { isMobile } = useDevice();

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

onMounted(() => {
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

const handleChatClick = () => {
  // Aquí iría la lógica para abrir el chat
  console.log("Chat clicked!");
};

// Estados del componente
const currentStep = ref(""); // 'forgot' | 'reset'
const code = ref("");
const email = ref("");

// Funciones de navegación reutilizables para ir a login o registro
const goToLogin = () => navigateTo("/auth/login");
const goToRegister = () => navigateTo("/auth/register");

onMounted(async () => {
  try {
    console.log("urlEmail", urlEmail);
    console.log("urlCode", urlCode);

    // Si existen los parámetros de URL, mostrar directamente el formulario de nueva contraseña
    if (urlEmail && urlCode) {
      email.value = urlEmail;
      code.value = urlCode;
      currentStep.value = "reset";
      console.log("Mostrando formulario de nueva contraseña con datos de URL");
      console.log("Email:", urlEmail);
      console.log("Token:", urlCode);

      // Mostrar notificación informativa al usuario
      showInfo("Enlace de recuperación válido", "Puedes establecer tu nueva contraseña");
    } else if (urlEmail || urlCode) {
      // Si solo existe uno de los parámetros, mostrar error
      console.warn("Parámetros incompletos:", { urlEmail, urlCode });
      showError(
        "Enlace inválido",
        "El enlace de recuperación está incompleto. Solicita un nuevo enlace."
      );

      // Limpiar los parámetros de la URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      currentStep.value = "forgot";
    } else {
      currentStep.value = "forgot";
    }
  } catch (error) {
    console.error("Error al verificar credenciales:", error);
    showError("Error de verificación", "Hubo un problema al verificar las credenciales");
    currentStep.value = "forgot";
  }
});

// Maneja el envío del formulario de "Olvidé mi contraseña"
const handleForgotPassword = async (formData: any) => {
  // Notifica al usuario que se está procesando la solicitud
  showInfo("Procesando solicitud", "Estamos enviando el enlace de recuperación...", {
    duration: 1000,
  });
  try {
    // Llama al composable para enviar el correo de recuperación
    const response = await forgotPassword(formData.email);

    // Extraer el token de la respuesta y guardarlo
    if (response && response.token) {
      code.value = response.token;
      email.value = formData.email;
      currentStep.value = "reset";

      // Notifica éxito
      showSuccess(
        "¡Enlace enviado!",
        "Revisa tu correo electrónico para continuar con la recuperación"
      );
      console.log("Token guardado:", response.token);
      navigateTo("/auth/login");
    }
  } catch (err) {
    console.error("Error en recuperación de contraseña:", err);
    // Notifica error
    showError("Error al enviar enlace", getAuthErrorMessage(err as any));
  }
};

// Maneja el envío del formulario de "Nueva contraseña"
const handleResetPassword = async (formData: any) => {
  // Notifica al usuario que se está procesando el cambio de contraseña
  showInfo("Cambiando contraseña", "Procesando tu nueva contraseña...", {
    duration: 1000,
  });
  try {
    // Llama al composable para restablecer la contraseña
    await resetPassword({
      email: email.value,
      newPassword: formData.password,
      code: code.value,
    });
    // Notifica éxito
    showSuccess(
      "¡Contraseña actualizada!",
      "Tu contraseña ha sido cambiada exitosamente"
    );
    // Redirige al login con mensaje de éxito
    await navigateTo("/auth/login?message=password-reset-success");
  } catch (err) {
    console.error("Error al cambiar contraseña:", err);
    // Notifica error
    showError("Error al cambiar contraseña", getPasswordResetErrorMessage(err as any));
  }
};
</script>

<style></style>
