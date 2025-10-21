<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="w-full max-w-md space-y-6">
      <!-- Mensaje de loading -->
      <div v-if="loading && !exito && !mensajeError" class="text-center space-y-6">
        <div class="p-6 dark:bg-blue-950/20 dark:border-blue-800 rounded-lg">
          <Icon
            icon="lucide:loader-2"
            width="48"
            height="48"
            class="text-blue-600 dark:text-blue-400 mx-auto mb-4 animate-spin"
          />
          <h2 class="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
            Confirmando tu cuenta...
          </h2>
          <p class="text-sm text-blue-700 dark:text-blue-300">
            Por favor espera mientras verificamos tu información.
          </p>
        </div>
      </div>

      <!-- Mensaje de éxito -->
      <div v-if="exito" class="text-center space-y-6">
        <div class="p-6 dark:bg-green-950/20 dark:border-green-800 rounded-lg">
          <Icon
            icon="lucide:circle-check"
            width="48"
            height="48"
            class="text-green-600 dark:text-green-400 mx-auto mb-4"
          />
          <h2 class="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
            ¡Confirmación Exitosa!
          </h2>
          <p class="text-sm text-green-700 dark:text-green-300">
            Tu cuenta ha sido verificada correctamente. Ahora puedes acceder a todas las
            funcionalidades.
          </p>
        </div>

        <div class="space-y-3">
          <Button @click="irAlLogin" class="w-full" size="lg">
            <Icon icon="lucide:log-in" width="16" height="16" class="mr-2" />
            Iniciar Sesión
          </Button>
        </div>
      </div>

      <!-- Mensaje de error -->
      <div v-else-if="mensajeError" class="text-center space-y-6">
        <div class="p-6 g">
          <Icon
            icon="lucide:circle-alert"
            width="48"
            height="48"
            class="text-red-600 dark:text-red-400 mx-auto mb-4"
          />
          <h2 class="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Error de Confirmación
          </h2>
          <p class="text-sm text-red-700 dark:text-red-300">
            {{ mensajeError }}
          </p>
        </div>

        <div class="space-y-3">
          <Button
            v-if="type !== 'EmailAlternativeConfirmation'"
            @click="irAlLogin"
            class="w-full"
            variant="outline"
            size="lg"
          >
            <Icon icon="lucide:arrow-left" width="16" height="16" class="mr-2" />
            Volver al Inicio de Sesión
          </Button>
          <!-- <Button @click="reenviarConfirmacion" class="w-full" variant="secondary" size="lg" :disabled="reenviando || loading">
              <Icon icon="lucide:mail" width="16" height="16" class="mr-2" />
              {{ reenviando || loading ? 'Reenviando...' : 'Reenviar Confirmación' }}
            </Button> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/vue";
import { useApiAuth } from "@/lib/api/composables/auth";
import { useToast } from "@/composables/ui/useToast";

// Composables
const route = useRoute();
const router = useRouter();
const { showSuccess, showError } = useToast();
const {
  confirmTokenAccess,
  confirmTokenAccessEmailAlternative,
  loading,
  error,
} = useApiAuth();

// Estado reactivo
const exito = ref(false);
const mensajeError = ref("");
const reenviando = ref(false);

// Parámetros de la URL - ahora maneja tanto Token como Code
const email = String(route.query.Email || route.query.email || "");
const token = String(route.query.Token || route.query.token || "");
const code = String(route.query.Code || route.query.code || "");
const type = String(route.query.Type || route.query.type || "");

// Función principal de confirmación
const confirmarUsuario = async () => {
  // Verificar que tengamos email y al menos uno de los dos parámetros (token o code)
  if (!email || (!token && !code)) {
    mensajeError.value =
      "El enlace de confirmación no es válido o le faltan parámetros necesarios.";
    showError("Error de confirmación", mensajeError.value);
    return;
  }

  try {
    let confirmationToken = 0;

    // Determinar qué parámetro usar
    if (code) {
      // Si tenemos un código numérico, usarlo como token
      confirmationToken = parseInt(code);
      console.log("Usando código numérico:", code);
    } else if (token) {
      // Si tenemos un token, procesarlo como antes
      let fixedToken = token.replace(/ /g, "+");
      fixedToken = decodeURIComponent(fixedToken);
      confirmationToken = parseInt(fixedToken);
      console.log("Usando token:", fixedToken);
    }
    let response;

    if (type === "EmailAlternativeConfirmation") {
      response = await confirmTokenAccessEmailAlternative({
        email,
        code: confirmationToken,
      });
    } else if (type === "EmailPrimaryConfirmation") {
      response = await confirmTokenAccess({ email, code: confirmationToken });
    } else {
      // Confirmación por defecto
      response = await confirmTokenAccess({ email, code: confirmationToken });
    }

    if (response?.isValid) {
      exito.value = true;
      showSuccess("Usuario confirmado", response.comments);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } else {
      // Mostrar el mensaje de error del servidor
      mensajeError.value = response?.comments || "Error al confirmar la cuenta";
      showError(
        "Error de confirmación",
        response?.comments || "Error al confirmar la cuenta"
      );
    }
  } catch (error: any) {
    // Obtener mensaje del servidor o usar mensaje genérico
    const serverMessage = error.response?.data?.comments || error.message;
    mensajeError.value = serverMessage;
    showError("Error de confirmación", serverMessage);
  }
};

// Función para reenviar confirmación
const reenviarConfirmacion = async () => {
  if (!email) {
    showError("Error", "No se puede reenviar la confirmación sin un email válido.");
    return;
  }

  try {
    reenviando.value = true;
    // Usar el token o código que tengamos disponible
    const confirmationToken = code || token;
    await confirmTokenAccess({ email, token: confirmationToken });
    showSuccess(
      "Confirmación reenviada",
      "Revisa tu correo electrónico para el nuevo enlace."
    );
  } catch (error: any) {
    showError("Error", "No se pudo reenviar la confirmación. Intenta más tarde.");
  } finally {
    reenviando.value = false;
  }
};

// Función para navegar al login
const irAlLogin = () => {
  router.push("/auth/login");
};

// Lifecycle hooks
onMounted(() => {
  console.log("onMounted ejecutado");
  console.log("Email de la URL:", email);
  console.log("Token de la URL:", token);
  console.log("Code de la URL:", code);
  console.log("Query completo:", route.query);
  console.log("URL completa:", window.location.href);
  confirmarUsuario();
});
</script>
