<template>
  <div>
    <!-- Botones flotantes fijos -->
    <div
      class="fixed left-0 right-0 z-[50] transition-all duration-300"
      :class="[
        { 'opacity-0 pointer-events-none': isSidebarOpen },
        isFooterVisible ? 'bottom-[110px]' : 'bottom-[10px]',
      ]"
    >
      <div class="px-4 flex justify-between items-center">
        <!-- Lado izquierdo: Solo Nueva Reservación (móvil) -->
        <div class="flex items-center">
          <Button
            v-if="showReservationButton"
            class="bg-primary rounded-full hover:bg-primary/90 shadow-lg flex items-center gap-2"
            @click="navigateToReservations"
          >
            <Icon
              icon="mdi:calendar-outline"
              width="24"
              height="24"
              style="color: #fff"
            />
            Nueva reservación
          </Button>
        </div>

        <!-- Lado derecho: Botones superpuestos y Chat -->
        <div class="relative">
          <!-- Botón de cancelación expandible -->
          <div v-if="shouldShowCancelButton" class="absolute -top-12 right-0 z-10">
            <div class="relative flex items-center justify-end">
              <Transition name="slide-fade">
                <button
                  v-if="showCancelButton"
                  @click="handleCancelReservation"
                  class="bg-destructive text-white rounded-full shadow-lg hover:bg-destructive/90 flex items-center gap-2 whitespace-nowrap mr-3 overflow-hidden expand-button"
                >
                  <span class="flex items-center gap-2 px-5 py-3 button-content">
                    <Icon
                      icon="material-symbols:cancel-outline"
                      width="20"
                      height="20"
                      class="text-white"
                    />
                    No podré asistir a mi reservación
                  </span>
                </button>
              </Transition>

              <button @click="toggleCancelButton">
                <div
                  class="bg-destructive shadow-md rounded-full hover:bg-destructive/90 h-11 w-11 flex items-center justify-center transition-colors"
                >
                  <Icon
                    :icon="
                      showCancelButton
                        ? 'material-symbols:arrow-forward-ios'
                        : 'material-symbols:cancel-outline'
                    "
                    width="20"
                    height="20"
                    class="text-white"
                  />
                </div>
              </button>
            </div>
          </div>

          <!-- Botón de descarga externo -->
          <ClientOnly>
            <button
              v-if="props.externalDownload?.showDownloadButton"
              @click="handleDownload"
              :disabled="isDownloading"
              class="absolute -top-12 right-0 z-10"
            >
              <div
                class="bg-[#652F6C] border-white border-2 shadow-lg rounded-full hover:bg-[#5A2A61] h-11 w-11 flex items-center justify-center transition-transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Icon 
                  :icon="isDownloading ? 'lucide:loader-2' : 'lucide:download'" 
                  width="20" 
                  height="20" 
                  style="color: #fff"
                  :class="{ 'animate-spin': isDownloading }"
                />
              </div>
            </button>
          </ClientOnly>

          <!-- Botón de Chat -->
          <button @click="openChat">
            <div
              class="bg-[#003DA6] border-white border-2 shadow-lg rounded-full hover:bg-[#002d7a] h-11 w-11 flex items-center justify-center transition-transform hover:scale-105"
            >
              <Icon icon="bi:chat-dots-fill" width="20" height="20" style="color: #fff" />
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div
      v-if="props.showFooter"
      ref="footerRef"
      class="bg-muted/30 border-t border-gray-200 rounded-t-4xl pb-4 pt-3 px-4 mt-3"
    >
      <div class="text-center mb-2">
        <NuxtLink
          to="/legal-information"
          class="text-sm text-primary font-medium italic hover:underline transition-all"
        >
          Información legal
        </NuxtLink>
      </div>

      <div class="flex justify-center">
        <div class="flex flex-col items-center">
          <img
            src="/assets/logo-header.svg"
            alt="MIDE"
            class="h-8 mb-1"
            @error="handleLogoError"
          />
        </div>
      </div>
    </div>

    <!-- Overlay oscuro -->
    <Transition name="overlay-fade">
      <div
        v-if="showChat"
        @click="closeChat"
        class="fixed inset-0 bg-black/50 z-[9998] backdrop-blur-sm"
      ></div>
    </Transition>

    <!-- Panel de chat -->
    <Transition name="chat-slide">
      <div
        v-if="showChat"
        @click.stop
        class="fixed bottom-0 right-0 left-0 w-full h-[70vh] bg-white shadow-3xl rounded-t-2xl z-[9999] flex flex-col"
      >
        <!-- Header del chat -->
        <div class="bg-white px-6 py-4 rounded-t-2xl border-none">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-base text-card-foreground font-semibold">Chatbot MIDE</h3>
            <Button @click="closeChat" variant="ghost" size="icon" class="h-8 w-8">
              <Icon icon="material-symbols:close-rounded" class="h-5 w-5" />
            </Button>
          </div>

          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                <Icon icon="mdi:account" class="h-4 w-4 text-[#1976D2]" />
              </div>
              <span class="text-sm text-card-foreground font-medium">Marbot</span>
            </div>

            <div class="flex items-center gap-2">
              <span
                class="text-sm text-accent font-semibold hover:underline flex items-center gap-1"
              >
                {{ selectedLanguage }} -
              </span>

              <Button
                @click="toggleLanguageTabs"
                variant="default"
                size="icon"
                class="h-10 w-10 rounded-full bg-accent hover:bg-accent/45 transition-transform"
              >
                <Icon icon="material-symbols:translate" class="h-5 w-5 text-white" />
              </Button>
            </div>
          </div>
        </div>

        <!-- Selector de idioma -->
        <Transition name="language-tabs">
          <div
            v-if="showLanguageTabs"
            class="w-full bg-white pb-4 language-tabs-shadow"
            style="transform-origin: top center"
          >
            <div class="w-3/4 mx-auto flex border-0 overflow-hidden mt-6 space-x-0.5">
              <Button
                @click="selectLanguage('Español')"
                class="flex-1 py-3 text-sm font-medium transition-colors rounded-none rounded-l-full pr-0"
                :class="
                  selectedLanguage === 'Español'
                    ? 'bg-[#1976D2] text-white'
                    : 'bg-gray-300 text-gray-600 hover:bg-gray-300'
                "
              >
                Español
              </Button>
              <Button
                @click="selectLanguage('English')"
                class="flex-1 py-3 text-sm font-medium transition-colors rounded-none rounded-r-full pl-0"
                :class="
                  selectedLanguage === 'English'
                    ? 'bg-[#1976D2] text-white'
                    : 'bg-gray-300 text-gray-600 hover:bg-gray-300'
                "
              >
                English
              </Button>
            </div>
          </div>
        </Transition>

        <!-- Contenido del chat -->
        <div class="flex-1 p-6 overflow-y-auto bg-gray-50 overscroll-contain">
          <TransitionGroup name="message-slide" tag="div">
            <div v-for="message in botMessages" :key="message.id">
              <div v-if="message.languageChangeBadge" class="flex justify-center mb-4">
                <div class="bg-gray-200 rounded-full px-4 py-2">
                  <p class="text-xs text-gray-600 font-medium">
                    {{ message.languageChangeBadge }}
                  </p>
                </div>
              </div>

              <!-- Mensaje del bot -->
              <div class="flex items-start gap-3 mb-4">
                <div class="bg-blue-200 rounded-3xl px-5 py-4 max-w-md">
                  <div class="flex items-center gap-2 mb-3">
                    <div
                      class="w-10 h-10 rounded-full bg-white flex items-center justify-center"
                    >
                      <Icon
                        icon="mdi:account"
                        width="24"
                        height="24"
                        class="text-blue-500"
                      />
                    </div>
                    <span class="font-bold text-gray-900">Marbot</span>
                  </div>
                  <div>
                    <p class="text-gray-900 leading-relaxed mb-3">
                      {{ message.welcome }}
                    </p>
                    <p class="text-gray-900 leading-relaxed mb-2">
                      {{ message.question }}
                    </p>
                    <div class="text-right">
                      <span class="text-xs text-gray-700 font-medium">Status</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TransitionGroup>

          <!-- Animación de escritura -->
          <div v-if="isTyping" class="flex items-start gap-3 mb-4">
            <div class="bg-blue-200 rounded-3xl px-5 py-4 max-w-md">
              <div class="flex items-center gap-2 mb-3">
                <div
                  class="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0"
                >
                  <Icon icon="mdi:account" width="24" height="24" class="text-blue-500" />
                </div>
                <span class="font-bold text-gray-900">Marbot</span>
              </div>
              <div class="flex gap-1 items-center pl-12">
                <div class="typing-dot"></div>
                <div class="typing-dot" style="animation-delay: 0.2s"></div>
                <div class="typing-dot" style="animation-delay: 0.4s"></div>
              </div>
            </div>
          </div>

          <!-- Opciones -->
          <Transition name="fade-scale">
            <div v-if="showChatOptions" class="mb-4 w-3/4 ml-auto">
              <p class="text-sm text-gray-700 mb-3 font-normal">
                {{ currentTranslations.selectOption }}
              </p>
              <div class="bg-white rounded-lg overflow-hidden">
                <button
                  v-for="(option, index) in chatOptions"
                  :key="option.id"
                  @click="selectChatOption(option)"
                  class="w-full px-4 py-1 text-left text-sm font-medium transition-colors hover:bg-[#BBDEFB]"
                  :class="{ 'border-b border-[#90CAF9]': index < chatOptions.length - 1 }"
                  :style="{
                    backgroundColor: index % 2 === 0 ? '#EBF4FC' : '#D8E8F8',
                    color: '#3C3C3B',
                  }"
                >
                  {{ option.text }}
                </button>
              </div>
            </div>
          </Transition>

          <!-- Mensaje del usuario -->
          <div v-if="userMessage" class="flex items-start gap-3 mb-4 justify-end">
            <div
              class="bg-[#003DA6] rounded-3xl px-5 py-3 max-w-md ml-auto flex items-start gap-3"
            >
              <div class="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <Icon icon="mdi:account" width="20" height="20" class="text-[#003DA6]" />
              </div>
              <p class="text-white leading-relaxed">{{ userMessage }}</p>
            </div>
          </div>

          <!-- Respuesta del bot -->
          <div v-if="botResponse" class="flex items-start gap-3 mb-4">
            <div class="bg-blue-200 rounded-3xl px-5 py-4 max-w-md">
              <div class="flex items-center gap-2 mb-3">
                <div
                  class="w-10 h-10 rounded-full bg-white flex items-center justify-center"
                >
                  <Icon icon="mdi:account" width="24" height="24" class="text-blue-500" />
                </div>
                <span class="font-bold text-gray-900">Marbot</span>
              </div>
              <div>
                <p class="text-gray-900 leading-relaxed mb-2">{{ botResponse }}</p>
                <div class="text-right">
                  <span class="text-xs text-gray-700 font-medium">Status</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Pregunta de seguimiento -->
          <div v-if="botFollowUp" class="flex items-start gap-3 mb-4">
            <div class="bg-blue-200 rounded-3xl px-5 py-4 max-w-md">
              <div class="flex items-center gap-2 mb-3">
                <div
                  class="w-10 h-10 rounded-full bg-white flex items-center justify-center"
                >
                  <Icon icon="mdi:account" width="24" height="24" class="text-blue-500" />
                </div>
                <span class="font-bold text-gray-900">Marbot</span>
              </div>
              <div>
                <p class="text-gray-900 leading-relaxed mb-2">{{ botFollowUp }}</p>
                <div class="text-right">
                  <span class="text-xs text-gray-700 font-medium">Status</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Opciones de seguimiento -->
          <Transition name="fade-scale">
            <div v-if="showFollowUpOptions" class="mb-4 w-3/4 ml-auto">
              <p class="text-sm text-gray-700 mb-3 font-normal">
                {{ currentTranslations.followUp }}
              </p>
              <div class="bg-white rounded-lg overflow-hidden">
                <button
                  v-for="(option, index) in followUpChatOptions"
                  :key="option.id"
                  @click="selectChatOption(option)"
                  class="w-full px-4 py-1 text-left text-sm font-medium transition-colors hover:bg-[#BBDEFB]"
                  :class="{
                    'border-b border-[#90CAF9]': index < followUpChatOptions.length - 1,
                  }"
                  :style="{
                    backgroundColor: index % 2 === 0 ? '#EBF4FC' : '#D8E8F8',
                    color: '#3C3C3B',
                  }"
                >
                  {{ option.text }}
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Input del chat -->
        <div v-if="botMessages.length > 0" class="border-t border-gray-200 p-4 bg-white">
          <input
            v-model="chatInput"
            type="text"
            :placeholder="currentTranslations.chatPlaceholder"
            @focus="handleInputFocus"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
    </Transition>

    <!-- Diálogos de cancelación -->
    <CancelReservationDialog
      :is-open="showCancelDialog"
      :reservation-id="props.reservationId"
      @close="handleCloseCancelDialog"
      @option-selected="handleCancelOption"
    />

    <CancelConfirmedReservationDialog
      :is-open="showConfirmedCancelDialog"
      :reservation-id="props.reservationId"
      @close="handleCloseCancelDialog"
      @confirm-cancellation="handleConfirmedCancellationEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Button } from "@/components/ui/button";
import { useRouter } from "vue-router";
import { Icon } from "@iconify/vue";
import { useSidebar } from "@/components/ui/sidebar";
import CancelReservationDialog from "@/components/reservations/dialogs/CancelReservationDialog.vue";
import CancelConfirmedReservationDialog from "@/components/reservations/dialogs/CancelConfirmedReservationDialog.vue";
import { useCancelReservation } from "@/composables/reservations/useCancelReservation";
import { useBreakpoints } from "@vueuse/core";
import { useToast } from "@/composables/ui/useToast";

// Router y dependencias
const router = useRouter();
const { showSuccess, showError } = useToast();
const { open: isSidebarOpen } = useSidebar();

// Breakpoints responsivos
const breakpoints = useBreakpoints({
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
});
const isMobile = breakpoints.smaller("tablet");

// Props
const props = withDefaults(
  defineProps<{
    showReservationButton: boolean;
    showFooter?: boolean;
    reservationId?: number | null;
    areAllStepsComplete?: boolean;
    externalDownload?: { showDownloadButton: boolean; downloadFunction: () => void };
  }>(),
  { showFooter: true, reservationId: null, areAllStepsComplete: false }
);

// Emits
const emit = defineEmits<{
  openChat: [];
  cancelReservation: [];
  cancelOptionSelected: [option: string];
}>();

// Estado visual del footer
const isFooterVisible = ref(false);
const footerRef = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

// Cancelación de reservaciones
const showCancelButton = ref(false);

// Estado para el loading del botón de descarga
const isDownloading = ref(false);

// Usar el composable de cancelación
const {
  showCancelDialog,
  showConfirmedCancelDialog,
  openCancelDialog,
  closeCancelDialogs,
  handleCancellationOption,
  handleConfirmedCancellation,
} = useCancelReservation();

// Computed
const shouldShowCancelButton = computed(
  () => props.reservationId && props.areAllStepsComplete
);


// Computed para determinar si se debe mostrar el botón de nueva reservación
const showReservationButton = computed(() => {
  return props.showReservationButton && isMobile.value;
});



// Función para manejar la descarga con loading
const handleDownload = async () => {
  if (!props.externalDownload?.downloadFunction) return;
  
  try {
    isDownloading.value = true;
    await props.externalDownload.downloadFunction();
  } catch (error) {
    console.error("Error durante la descarga:", error);
  } finally {
    isDownloading.value = false;
  }
};

// Acciones
const navigateToReservations = () => router.push("/reservations/formulario-reservacion");
const toggleCancelButton = () => (showCancelButton.value = !showCancelButton.value);
const handleLogoError = () =>
  console.warn("Logo no encontrado, usando texto alternativo");
const handleCancelReservation = () => {
  if (!props.reservationId) return console.error("❌ No hay reservationId");
  const reservationStatus = {
    id: props.reservationId,
    status: "Confirmada" as const,
  };
  openCancelDialog(props.reservationId, reservationStatus);
  showCancelButton.value = false;
  emit("cancelReservation");
};

const handleCloseCancelDialog = () => closeCancelDialogs();
const processCancellationResponse = (
  result: { success: boolean; message?: string },
  emitValue: string
) => {
  if (result?.success) {
    showSuccess(
      "¡Reservación cancelada!",
      result.message || "La reservación fue eliminada exitosamente."
    );
    emit("cancelOptionSelected", emitValue);
    setTimeout(() => router.push("/reservations"), 1000);
  } else
    showError(
      "Error al cancelar",
      result?.message || "No se pudo cancelar la reservación"
    );
};
const handleCancelOption = async () =>
  processCancellationResponse(await handleCancellationOption(), "cancelled");
const handleConfirmedCancellationEvent = async (id: number, reasonId: number) =>
  processCancellationResponse(
    await handleConfirmedCancellation(id, reasonId),
    `confirmed-${reasonId}`
  );

// Chat
const showChat = ref(false);
const isTyping = ref(false);
const showChatOptions = ref(false);
const showFollowUpOptions = ref(false);
const chatInput = ref("");
const userMessage = ref("");
const botResponse = ref("");
const botFollowUp = ref("");
const selectedLanguage = ref("Español");
const showLanguageTabs = ref(false);
const botMessages = ref<
  {
    id: number;
    welcome: string;
    question: string;
    timestamp: number;
    languageChangeBadge?: string;
  }[]
>([]);

const translations = {
  Español: {
    welcome:
      "¡Hola User! Yo soy Marbot, un Chatbot que te apoyará a resolver tus dudas en el proceso de reservación en tu visita al MIDE.",
    question: "¿En qué puedo asistirte el día de hoy?",
    selectOption: "Por favor, elige una categoría",
    followUp: "Por favor, elige una categoría:",
    chatPlaceholder: "Chatea con Marbot",
  },
  English: {
    welcome:
      "Hello User! I'm Marbot, a chatbot that will help you answer your questions about the reservation process for your visit to the MIDE.",
    question: "To continue, please choose a category.",
    selectOption: "Select a category to continue",
    followUp: "Please, choose an option:",
    chatPlaceholder: "Chat with Marbot",
  },
};
const currentTranslations = computed(
  () => translations[selectedLanguage.value as keyof typeof translations]
);

// Opciones del chat
const initialChatOptions = [
  { id: 1, text: "Reservaciones" },
  { id: 2, text: "Horarios" },
  { id: 3, text: "Costos" },
  { id: 4, text: "Descuentos y promociones" },
  { id: 5, text: "Formas de pago" },
  { id: 6, text: "Facturación" },
  { id: 7, text: "Ubicación" },
  { id: 8, text: "Estacionamiento" },
  { id: 9, text: "Accesibilidad" },
  { id: 10, text: "Docentes" },
  { id: 11, text: "Instituciones educativas" },
  { id: 12, text: "Centro de Atención Educativa" },
  { id: 13, text: "Empresas" },
  { id: 14, text: "Confirmación de reservación" },
  { id: 15, text: "Material didáctico" },
  { id: 16, text: "Talleres" },
  { id: 17, text: "Curso de verano" },
];
const followUpChatOptions = [
  { id: 18, text: "Ver todas las categorías" },
  { id: 19, text: "Contactar a un asesor" },
  { id: 20, text: "Preguntas frecuentes" },
  { id: 21, text: "Cerrar chat" },
];
const chatOptions = ref(initialChatOptions);

// Respuestas del bot
const botResponses: Record<number, { response: string; followUp?: string }> = {
  1: {
    response: "Para hacer una reservación...",
    followUp: "¿Hay algo más en lo que puedo asistirte?",
  },
  2: {
    response: "Nuestros horarios son de martes a domingo...",
    followUp: "¿Hay algo más en lo que puedo asistirte?",
  },
  3: {
    response: "El costo de la visita varía según el tipo...",
    followUp: "¿Hay algo más en lo que puedo asistirte?",
  },
  21: { response: "Gracias por usar nuestro chat. ¡Que tengas un excelente día!" },
};

const openChat = () => {
  showChat.value = true;
  emit("openChat");
  document.body.style.overflow = "hidden";
  startTypingAnimation();
};
const closeChat = () => {
  showChat.value = false;
  isTyping.value = false;
  showChatOptions.value = false;
  showFollowUpOptions.value = false;
  botMessages.value = [];
  chatInput.value = "";
  userMessage.value = "";
  botResponse.value = "";
  botFollowUp.value = "";
  chatOptions.value = initialChatOptions;
  document.body.style.overflow = "";
};
const startTypingAnimation = () => {
  isTyping.value = true;
  setTimeout(() => {
    isTyping.value = false;
    botMessages.value.push({
      id: Date.now(),
      welcome: currentTranslations.value.welcome,
      question: currentTranslations.value.question,
      timestamp: Date.now(),
    });
  }, 2300);
};
const handleInputFocus = () => {
  if (!showChatOptions.value && !showFollowUpOptions.value && !userMessage.value)
    showChatOptions.value = true;
};
const toggleLanguageTabs = () => (showLanguageTabs.value = !showLanguageTabs.value);
const selectLanguage = (lang: string) => {
  selectedLanguage.value = lang;
  showLanguageTabs.value = false;
  const badgeText =
    lang === "English" ? "English language selected" : "Idioma español seleccionado";
  isTyping.value = true;
  setTimeout(() => {
    isTyping.value = false;
    botMessages.value.push({
      id: Date.now(),
      welcome: currentTranslations.value.welcome,
      question: currentTranslations.value.question,
      timestamp: Date.now(),
      languageChangeBadge: badgeText,
    });
  }, 1500);
};
const selectChatOption = (option: { id: number; text: string }) => {
  userMessage.value = option.text;
  showChatOptions.value = false;
  showFollowUpOptions.value = false;
  chatInput.value = "";
  isTyping.value = true;
  setTimeout(() => {
    isTyping.value = false;
    const responseData = botResponses[option.id];
    if (responseData) {
      botResponse.value = responseData.response;
      setTimeout(() => {
        if (responseData.followUp) {
          botFollowUp.value = responseData.followUp;
          setTimeout(() => (showFollowUpOptions.value = true), 500);
        }
      }, 1000);
    }
  }, 1500);
};

// Observer del footer
onMounted(() => {
  if (footerRef.value) {
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => (isFooterVisible.value = entry.isIntersecting));
      },
      { threshold: 0.1 }
    );
    observer.observe(footerRef.value);
  }
});
onUnmounted(() => {
  if (observer && footerRef.value) {
    observer.unobserve(footerRef.value);
    observer.disconnect();
  }
});
</script>

<style scoped>
.slide-fade-enter-active {
  animation: expand-width 0.4s ease-out;
}
.slide-fade-leave-active {
  animation: expand-width 0.3s ease-in reverse;
}
@keyframes expand-width {
  0% {
    width: 44px;
  }
  60% {
    width: 100%;
  }
  100% {
    width: 100%;
  }
}
.slide-fade-enter-active .button-content {
  animation: fade-in-content 0.2s ease-out 0.25s both;
}
.slide-fade-leave-active .button-content {
  animation: fade-out-content 0.15s ease-in both;
}
@keyframes fade-in-content {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
@keyframes fade-out-content {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-10px);
  }
}
.expand-button {
  min-height: 44px;
}
.overlay-fade-enter-active {
  animation: fade-in 0.3s ease-out;
}
.overlay-fade-leave-active {
  animation: fade-in 0.2s ease-in reverse;
}
@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.chat-slide-enter-active {
  animation: slide-up 0.3s ease-out;
}
.chat-slide-leave-active {
  animation: slide-up 0.3s ease-in reverse;
}
@keyframes slide-up {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
.typing-dot {
  width: 8px;
  height: 8px;
  background-color: #4b5563;
  border-radius: 50%;
  animation: typing-bounce 1.4s infinite ease-in-out;
}
@keyframes typing-bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}
.fade-scale-enter-active {
  animation: fade-scale-in 0.2s ease-out;
}
.fade-scale-leave-active {
  animation: fade-scale-in 0.15s ease-in reverse;
}
@keyframes fade-scale-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
.language-tabs-shadow {
  filter: drop-shadow(0 4px 3px rgba(0, 0, 0, 0.2));
}
.overscroll-contain {
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
.message-slide-enter-active,
.message-slide-leave-active {
  transition: all 0.4s ease;
}
.message-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
.message-slide-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
