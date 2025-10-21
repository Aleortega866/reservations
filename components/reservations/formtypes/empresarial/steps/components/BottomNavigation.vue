<template>
  <div
    class="fixed bottom-0 right-0 bg-transparent max-w-fit max-h-fit border-t-0 p-2 z-30"
  >
    <div class="flex justify-end">
      <!-- Contenedor de botones de cancelación y chat en columna -->
      <div class="flex flex-col items-end gap-3">
        <!-- Botón de cancelación expandible -->
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
              class="bg-destructive shadow-md rounded-full hover:bg-destructive/90 h-12 w-12 flex items-center justify-center transition-colors"
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

        <!-- Botón de chat -->
        <button @click="toggleChat">
          <div
            class="bg-[#003DA6] border-white border-2 shadow-md rounded-full hover:bg-secondary/90 h-12 w-12 flex items-center justify-center"
          >
            <Icon icon="bi:chat-dots-fill" width="18" height="18" style="color: #fff" />
          </div>
        </button>
      </div>
    </div>

    <!-- Panel de chat -->
    <Transition name="chat-slide">
      <div
        v-if="showChat"
        class="fixed bottom-0 right-0 left-0 w-full h-[70vh] bg-white shadow-2xl rounded-t-2xl z-[9999] flex flex-col"
      >
        <!-- Header del chat -->
        <div
          class="flex items-center justify-between bg-[#003DA6] text-white px-6 py-4 rounded-t-2xl"
        >
          <h3 class="text-lg font-semibold">Chatbot MIDE</h3>
          <button
            @click="closeChat"
            class="hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <Icon icon="mdi:close" width="24" height="24" />
          </button>
        </div>

        <!-- Contenido del chat con scroll -->
        <div class="flex-1 p-6 overflow-y-auto bg-gray-50 overscroll-contain">
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

          <!-- Mensaje de bienvenida -->
          <div v-if="showWelcomeMessage" class="flex items-start gap-3 mb-4">
            <div class="bg-blue-200 rounded-3xl px-5 py-4 max-w-md">
              <div class="flex items-center gap-2 mb-3">
                <div
                  class="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0"
                >
                  <Icon icon="mdi:account" width="24" height="24" class="text-blue-500" />
                </div>
                <span class="font-bold text-gray-900">Marbot</span>
              </div>
              <div>
                <p class="text-gray-900 leading-relaxed mb-3">
                  ¡Hola User! Yo soy Marbot, un Chatbot que te apoyará a resolver tus
                  dudas en el proceso de reservación en tu visita al MIDE.
                </p>
                <p class="text-gray-900 leading-relaxed mb-2">
                  ¿En qué puedo asistirte el día de hoy?
                </p>
                <div class="text-right">
                  <span class="text-xs text-gray-700 font-medium">Status</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Lista de opciones como bubbles -->
          <Transition name="fade-scale">
            <div v-if="showChatOptions" class="mb-4 flex flex-col items-end">
              <p class="text-xs text-gray-500 mb-3 font-semibold">
                Selecciona una opción:
              </p>
              <div class="flex flex-wrap gap-2 justify-end">
                <button
                  v-for="option in chatOptions"
                  :key="option.id"
                  @click="selectChatOption(option)"
                  class="bg-white border-2 border-blue-400 text-blue-700 rounded-full px-4 py-2 hover:bg-blue-50 transition-colors text-sm flex items-center gap-2 shadow-sm hover:shadow-md"
                >
                  <Icon
                    :icon="option.icon"
                    width="18"
                    height="18"
                    class="text-blue-500"
                  />
                  <span class="font-medium">{{ option.text }}</span>
                </button>
              </div>
            </div>
          </Transition>

          <!-- Mensaje del usuario (opción seleccionada) -->
          <div v-if="userMessage" class="flex items-start gap-3 mb-4 justify-end">
            <div
              class="bg-[#003DA6] rounded-3xl px-5 py-3 max-w-md ml-auto flex items-start gap-3"
            >
              <div
                class="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0"
              >
                <Icon icon="mdi:account" width="20" height="20" class="text-[#003DA6]" />
              </div>
              <p class="text-white leading-relaxed">{{ userMessage }}</p>
            </div>
          </div>

          <!-- Respuesta del bot después de la pregunta del usuario -->
          <div v-if="botResponse" class="flex items-start gap-3 mb-4">
            <div class="bg-blue-200 rounded-3xl px-5 py-4 max-w-md">
              <div class="flex items-center gap-2 mb-3">
                <div
                  class="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0"
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

          <!-- Pregunta adicional del bot -->
          <div v-if="botFollowUp" class="flex items-start gap-3 mb-4">
            <div class="bg-blue-200 rounded-3xl px-5 py-4 max-w-md">
              <div class="flex items-center gap-2 mb-3">
                <div
                  class="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0"
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

          <!-- Opciones de seguimiento después de la pregunta del bot -->
          <Transition name="fade-scale">
            <div v-if="showFollowUpOptions" class="mb-4 flex flex-col items-end">
              <p class="text-xs text-gray-500 mb-3 font-semibold">
                Por favor, elige una opción:
              </p>
              <div class="flex flex-wrap gap-2 justify-end">
                <button
                  v-for="option in followUpChatOptions"
                  :key="option.id"
                  @click="selectChatOption(option)"
                  class="bg-white border-2 border-blue-400 text-blue-700 rounded-full px-4 py-2 hover:bg-blue-50 transition-colors text-sm flex items-center gap-2 shadow-sm hover:shadow-md"
                >
                  <Icon
                    :icon="option.icon"
                    width="18"
                    height="18"
                    class="text-blue-500"
                  />
                  <span class="font-medium">{{ option.text }}</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Input de chat fijo en la parte inferior -->
        <div v-if="showWelcomeMessage" class="border-t border-gray-200 p-4 bg-white">
          <input
            v-model="chatInput"
            type="text"
            placeholder="Chatea con Marbot"
            @focus="handleInputFocus"
            class="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>
    </Transition>

    <!-- Diálogo de cancelación para reservaciones no confirmadas -->
    <CancelReservationDialog
      :is-open="showCancelDialog"
      :reservation-id="reservationId"
      @close="handleCloseCancelDialog"
      @option-selected="handleCancelOption"
    />

    <!-- Diálogo de cancelación para reservaciones confirmadas -->
    <CancelConfirmedReservationDialog
      :is-open="showConfirmedCancelDialog"
      :reservation-id="reservationId"
      @close="handleCloseCancelDialog"
      @confirm-cancellation="handleConfirmedCancellationEvent"
    />
  </div>
</template>

<style scoped>
/* Animación del botón expandido */
.slide-fade-enter-active {
  animation: expand-width 0.4s ease-out;
}

.slide-fade-leave-active {
  animation: expand-width 0.3s ease-in reverse;
}

@keyframes expand-width {
  0% {
    width: 48px;
    height: 48px;
    padding: 0;
  }
  60% {
    width: 100%;
    height: 48px;
    padding: 0;
  }
  100% {
    width: 100%;
    height: auto;
    padding: 0;
  }
}

/* Animación del contenido dentro del botón */
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
  min-height: 48px;
}

/* Animación del chat desde abajo */
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

/* Animación de puntos de escritura */
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

/* Animación de opciones del chat */
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

/* Prevenir scroll en el fondo cuando el chat está abierto */
.overscroll-contain {
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
</style>

<script setup lang="ts">
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import CancelReservationDialog from "@/components/reservations/dialogs/CancelReservationDialog.vue";
import CancelConfirmedReservationDialog from "@/components/reservations/dialogs/CancelConfirmedReservationDialog.vue";
import { useCancelReservation } from "@/composables/reservations/useCancelReservation";

interface Props {
  reservationId?: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  reservationId: null,
});

// Emitir eventos para comunicación con el componente padre
const emit = defineEmits<{
  openChat: [];
  cancelReservation: [];
  cancelOptionSelected: [option: string];
}>();

// Estado para el botón de cancelación
const showCancelButton = ref(false);

// Usar el composable de cancelación
const {
  showCancelDialog,
  showConfirmedCancelDialog,
  openCancelDialog,
  closeCancelDialogs,
  handleCancellationOption,
  handleConfirmedCancellation,
} = useCancelReservation();

// Estado para el chat
const showChat = ref(false);
const isTyping = ref(false);
const showWelcomeMessage = ref(false);
const showChatOptions = ref(false);
const showFollowUpOptions = ref(false);
const chatInput = ref("");
const userMessage = ref("");
const botResponse = ref("");
const botFollowUp = ref("");

// Opciones iniciales del chat
const initialChatOptions = [
  {
    id: 1,
    text: "¿Cómo puedo hacer una reservación?",
    icon: "mdi:calendar-check",
  },
  {
    id: 2,
    text: "¿Cuáles son los horarios disponibles?",
    icon: "mdi:clock-outline",
  },
  {
    id: 3,
    text: "¿Qué documentos necesito?",
    icon: "mdi:file-document-outline",
  },
  {
    id: 4,
    text: "¿Cómo cancelo mi reservación?",
    icon: "mdi:cancel",
  },
  {
    id: 5,
    text: "¿Cuál es el costo de la visita?",
    icon: "mdi:currency-usd",
  },
  {
    id: 6,
    text: "Información sobre el material didáctico",
    icon: "mdi:book-open-page-variant",
  },
];

// Opciones de seguimiento (después de la primera pregunta)
const followUpChatOptions = [
  {
    id: 7,
    text: "¿Cómo genero una reservación?",
    icon: "mdi:calendar-plus",
  },
  {
    id: 8,
    text: "¿Cómo modifico una reservación?",
    icon: "mdi:calendar-edit",
  },
  {
    id: 9,
    text: "¿Cómo cancelo una reservación?",
    icon: "mdi:calendar-remove",
  },
  {
    id: 10,
    text: "¿Cómo solicito un reembolso por un anticipo?",
    icon: "mdi:cash-refund",
  },
];

// Opciones actuales del chat
const chatOptions = ref(initialChatOptions);

// Respuestas del bot para cada opción
const botResponses: Record<number, { response: string; followUp?: string }> = {
  1: {
    response:
      "Para hacer una reservación, debes completar el formulario de reservación seleccionando la fecha, hora y número de visitantes. Luego confirma tu reservación y recibirás un correo electrónico con los detalles.",
    followUp: "¿Hay algo más en lo que puedo asistirte?",
  },
  2: {
    response:
      "Nuestros horarios son de martes a domingo de 9 a 18 hrs excepto días festivos, puedes consultar la disponibilidad de nuestro calendario al generar una reservación.",
    followUp: "¿Hay algo más en lo que puedo asistirte?",
  },
  3: {
    response:
      "Para tu visita necesitas presentar una identificación oficial, el comprobante de reservación que recibirás por correo electrónico, y en caso de grupos escolares, la carta de autorización de la institución.",
    followUp: "¿Hay algo más en lo que puedo asistirte?",
  },
  4: {
    response:
      "Para cancelar tu reservación, puedes hacerlo desde el correo de confirmación que recibiste, o contactando directamente a nuestro equipo de atención. Es importante cancelar con al menos 24 horas de anticipación.",
    followUp: "¿Hay algo más en lo que puedo asistirte?",
  },
  5: {
    response:
      "El costo de la visita varía según el tipo de visitante y servicios adicionales. Los precios se muestran durante el proceso de reservación. Contamos con descuentos especiales para grupos escolares y personas de la tercera edad.",
    followUp: "¿Hay algo más en lo que puedo asistirte?",
  },
  6: {
    response:
      "Ofrecemos material didáctico especializado para complementar tu visita. Puedes solicitar guías educativas, hojas de actividades y material audiovisual. Todo esto se puede agregar durante el proceso de reservación.",
    followUp: "¿Hay algo más en lo que puedo asistirte?",
  },
  7: {
    response:
      "Para generar una reservación, accede al formulario de reservación, selecciona el tipo de visita, elige la fecha y hora disponible, completa los datos de los visitantes y confirma. Recibirás un correo electrónico con todos los detalles de tu reservación.",
    followUp: "¿Hay algo más en lo que puedo asistirte?",
  },
  8: {
    response:
      "Para modificar una reservación, accede al correo de confirmación que recibiste y selecciona la opción 'Modificar reservación'. También puedes contactar a nuestro equipo de soporte con tu número de reservación. Las modificaciones deben hacerse con al menos 48 horas de anticipación.",
    followUp: "¿Hay algo más en lo que puedo asistirte?",
  },
  9: {
    response:
      "Para cancelar una reservación, puedes hacerlo desde el correo de confirmación que recibiste, o contactando directamente a nuestro equipo de atención. Es importante cancelar con al menos 24 horas de anticipación para obtener reembolso completo si aplicara.",
    followUp: "¿Hay algo más en lo que puedo asistirte?",
  },
  10: {
    response:
      "Para solicitar un reembolso por anticipo, envía un correo a nuestro departamento de atención con tu número de reservación y comprobante de pago. Los reembolsos se procesan en un plazo de 5 a 10 días hábiles y se aplican según nuestras políticas de cancelación.",
    followUp: "¿Hay algo más en lo que puedo asistirte?",
  },
};

const toggleCancelButton = () => {
  showCancelButton.value = !showCancelButton.value;
};

const handleCancelReservation = () => {
  if (!props.reservationId) return;

  // TODO: Obtener el estado real de la reservación desde la API
  // Por ahora, asumimos que si hay un reservationId, es una reservación confirmada
  const reservationStatus = {
    id: props.reservationId,
    status: "Confirmada" as const, // Cambiado para mostrar el modal correcto
    isConfirmed: true,
  };

  // Abrir el modal apropiado según el estado
  openCancelDialog(props.reservationId, reservationStatus);
  showCancelButton.value = false;
  emit("cancelReservation");
};

const handleCloseCancelDialog = () => {
  closeCancelDialogs();
};

const handleCancelOption = async (option: string) => {
  console.log("✅ Opción de cancelación seleccionada:", option);

  const result = await handleCancellationOption(option);

  if (result?.success) {
    emit("cancelOptionSelected", option);
  } else {
    console.error("Error al cancelar:", result?.message);
  }
};

const handleConfirmedCancellationEvent = async (
  reservationId: number,
  reasonId: number
) => {
  console.log("✅ Cancelación confirmada:", { reservationId, reasonId });

  const result = await handleConfirmedCancellation(reservationId, reasonId);

  if (result?.success) {
    emit("cancelOptionSelected", `confirmed-${reasonId}`);
  } else {
    console.error("Error al cancelar:", result?.message);
  }
};

const toggleChat = () => {
  showChat.value = !showChat.value;
  if (showChat.value) {
    emit("openChat");
    // Prevenir scroll en el body
    document.body.style.overflow = "hidden";
    // Iniciar la secuencia de animación
    startTypingAnimation();
  } else {
    // Restaurar scroll en el body
    document.body.style.overflow = "";
  }
};

const closeChat = () => {
  showChat.value = false;
  isTyping.value = false;
  showWelcomeMessage.value = false;
  showChatOptions.value = false;
  showFollowUpOptions.value = false;
  chatInput.value = "";
  userMessage.value = "";
  botResponse.value = "";
  botFollowUp.value = "";
  // Resetear opciones a las iniciales
  chatOptions.value = initialChatOptions;
  // Restaurar scroll en el body
  document.body.style.overflow = "";
};

const startTypingAnimation = () => {
  // Resetear estados
  isTyping.value = false;
  showWelcomeMessage.value = false;

  // Mostrar animación de escritura después de 300ms
  setTimeout(() => {
    isTyping.value = true;
  }, 300);

  // Mostrar mensaje después de 2 segundos
  setTimeout(() => {
    isTyping.value = false;
    showWelcomeMessage.value = true;
    // Mostrar opciones automáticamente
    showChatOptions.value = true;
  }, 2300);
};

const handleInputFocus = () => {
  // No hacer nada en el focus ya que las opciones se muestran automáticamente
  // Las opciones iniciales se muestran al inicio
  // Las opciones de seguimiento se muestran después del mensaje del bot
};

const selectChatOption = (option: { id: number; text: string; icon: string }) => {
  console.log("✅ Opción seleccionada:", option.text);

  // Guardar el mensaje del usuario
  userMessage.value = option.text;

  // Ocultar las opciones (tanto iniciales como de seguimiento)
  showChatOptions.value = false;
  showFollowUpOptions.value = false;

  // Limpiar el input
  chatInput.value = "";

  // Simular que el bot está escribiendo
  isTyping.value = true;

  // Después de 1.5 segundos, mostrar la respuesta del bot
  setTimeout(() => {
    isTyping.value = false;
    const responseData = botResponses[option.id];
    if (responseData) {
      botResponse.value = responseData.response;

      // Mostrar la pregunta de seguimiento después de 1 segundo más
      setTimeout(() => {
        if (responseData.followUp) {
          botFollowUp.value = responseData.followUp;
          // Mostrar las opciones de seguimiento después de otro segundo
          setTimeout(() => {
            showFollowUpOptions.value = true;
          }, 500);
        }
      }, 1000);
    }
  }, 1500);
};
</script>
