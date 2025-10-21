<template>
  <div class="space-y-4">

    <ReservationStep1
      v-if="getCurrentScreen() === 'reservation-step1'"
      :data="reservationData"
      :header-data="headerData"
      @submit="handleStep1Submit"
      @next="goToStep(2)"
      @navigate-to-step="handleNavigateToStep"
      @exit-linking-code="handleErrorLinkingCodeNavigateToReservations"
    />

    <ReservationStep2
      v-if="getCurrentScreen() === 'reservation-step2'"
      :type="reservationType"
      :data="reservationData"
      :header-data="headerData"
      :reservation-id="currentReservationId || undefined"
      @next="goToStep(3)"
      @back="goToStep(1)"
      @navigate-to-step="handleNavigateToStep"
    />

    <ReservationStep3
      v-if="getCurrentScreen() === 'reservation-step3'"
      :type="reservationType"
      :header-data="headerData"
      :reservation-id="currentReservationId || undefined"
      @complete="handleCompleteReservation"
      @back="goToStep(2)"
      @navigate-to-step="handleNavigateToStep"
    />
    <!-- <BottomNavigation
      :reservation-id="currentReservationId"
      @open-chat="handleOpenChat"
      @cancel-reservation="handleCancelReservation"
      @cancel-option-selected="handleCancelOptionSelected"
    /> -->
  </div>
</template>

<script setup lang="ts">
import { useReservationStepNavigation } from '@/composables/reservations/useReservationStepNavigation'
import { useReservationSchool } from '@/composables/reservations/useReservationSchool'
import { useReservationFormStore } from "@/stores/reservation-form";
import { useSafeEvents } from "@/composables/ui/useSafeEvents";
import { useDialogStore } from '@/stores/dialog'
import { computed, onMounted, ref, watch } from "vue";
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router';

// Props
defineProps({
  headerData: {
    type: Object,
    default: () => ({})
  }
})

import ReservationStep1 from "@/components/reservations/formtypes/escolar/steps/ReservationStep1.vue";
import ReservationStep2 from '@/components/reservations/formtypes/escolar/steps/ReservationStep2.vue';
import ReservationStep3 from '@/components/reservations/formtypes/escolar/steps/ReservationStep3.vue';
import BottomNavigation from "@/components/reservations/formtypes/empresarial/steps/components/BottomNavigation.vue";

// const emit = defineEmits<{
//   'form-changed': []
// }>();

// Composable para reservaciones generales
const {
  store,
  currentReservation,
  currentReservationId,
  formData,
  resetForm
} = useReservationSchool()

// Router para navegación
const router = useRouter()

// Composable para eventos seguros
const { emitStepNavigationEvent, emitReservationIdSetEvent } = useSafeEvents();

// Store de dialogo
const dialogStore = useDialogStore()
const { showDialog } = storeToRefs(dialogStore) // Necesaria que sea reactiva para ser vigilada por el watcher

// Datos de reservación (compatibilidad con componentes existentes)
const reservationType = ref('escolar')
const reservationData = computed(() => formData.value)

// Inicializar datos y paso
onMounted(() => {
  // Solo resetear si no hay una reservación existente
  const hasExistingReservation = currentReservationId?.value || store.currentReservationId;

  if (!hasExistingReservation) {
    // Resetear completamente el formulario (incluye limpieza de persistencia)
    console.log("🧹 Inicializando nueva reservación escolar - limpiando estado previo");
    resetForm();
  } 
  else {
    console.log("🔄 Cargando reservación existente - manteniendo datos:", hasExistingReservation );
  }
  
  // Debug: verificar que el composable esté funcionando
  console.log('🔍 GeneralForm mounted - currentReservation:', currentReservation?.value)
  console.log('🔍 GeneralForm mounted - currentReservationId:', currentReservationId?.value)
  console.log('🔍 GeneralForm mounted - currentStep:', store.currentStep)
  console.log('🔍 GeneralForm mounted - store:', store)
})

// Lógica de pasos
const { currentStep, goToStep } = useReservationStepNavigation()

// El currentReservationId ya está disponible desde el composable

// Función para manejar la navegación desde los pasos
const handleNavigateToStep = (step: number): void => {
  console.log('🔄 Navegando al paso:', step)
  goToStep(step)

  // Emitir evento para notificar que se navegó a un paso
  // Esto ayudará al header a verificar si los pasos anteriores están completos
  setTimeout(() => {
    emitStepNavigationEvent(step, "escolar", currentReservationId.value);
  }, 100);
}

// Función para manejar el resultado del paso 1
const handleStep1Submit = (result: any) => {
  console.log('📝 Resultado del paso 1 recibido:', result)
  console.log('📝 Tipo del resultado:', typeof result)
  console.log('📝 Resultado tiene ID?:', result && result.reservationId)
  console.log('📝 Resultado tiene response?:', result && result.response)
  
  // Extraer el ID del campo 'response' de la respuesta del API
  let reservationId = null
  
  if (result && result.response) {
    // El API devuelve el ID en el campo 'response'
    reservationId = result.response
    console.log('✅ ID extraído del campo response:', reservationId)
  } else if (result && result.reservationId) {
    // Fallback: si el ID está directamente en el objeto
    reservationId = result.reservationId
    console.log('✅ ID extraído del campo id:', reservationId)
  } else if (typeof result === 'number') {
    // Fallback: si el resultado es directamente un número
    reservationId = result
    console.log('✅ ID extraído como número directo:', reservationId)
  }
  
  // Establecer el ID y el objeto completo en el store si se pudo extraer
  if (reservationId) {
    store.setCurrentReservationId(reservationId)

    // También establecer el ID en el store principal para sincronización
    const reservationFormStore = useReservationFormStore();
    reservationFormStore.setReservationId(reservationId);
    console.log("✅ ID establecido en store principal:", reservationId);

    // También establecer el objeto completo de la reservación
    if (result && typeof result === 'object' && result.reservationId) {
      store.setCurrentReservation(result)
      console.log('✅ Objeto completo de reservación establecido en el store')
    }
    console.log('✅ ID establecido en el store:', reservationId)
  } else {
    console.error('❌ No se pudo extraer el ID de la reservación del resultado:', result)
  }
  
  // El ID de la reservación ya está disponible en el store
  console.log('✅ Reservación creada, ID disponible en store:', currentReservationId?.value)
  console.log('✅ Reservación completa:', currentReservation?.value)

  // Emitir evento cuando se establezca el ID de reservación
  setTimeout(() => {
    if (currentReservationId.value) {
      emitReservationIdSetEvent(currentReservationId.value, "escolar");
    }
  }, 100);
}

// Función para mostrar el componente correcto según el paso
const getCurrentScreen = (): string => {
  switch (currentStep.value) {
    case 1: return 'reservation-step1'
    case 2: return 'reservation-step2'
    case 3: return 'reservation-step3'
    default: return 'reservation-step1'
  }
}

// Funcion que espera hasta que SplashScreen resuelva como false para poder continuar con la ejecucion del codigo subsecuente
const waitForDialogToClose = (): Promise<void> => {
  return new Promise((resolve) => {
    const stop = watch(showDialog, (newVal) => {
              console.log('Se cierra')
      if (!newVal) {
        stop() // Detiene el watcher
        resolve()
      }
    })
  })
}


const handleCompleteReservation = async (finalData: any) => {
  try {
    // Guardar datos del paso 3 en el store
    store.updateStepData(3, finalData)
    
    // Marcar como completado en el store
    store.markAsCompleted()
    
    console.log('✅ Reservación completada, navegando a página de éxito')
    
    // Guardar el ID de la reservación antes de limpiar
    const reservationId = store.currentReservationId
    
    // Navegar a la página de éxito con el ID de la reservación
    if (reservationId) {
      dialogStore.toggleDialog(true, '¡RESERVACIÓN CREADA!', ['Has terminado tu reservación con éxito, revisaremos la información y te notificaremos de cualquier cambio o aclaración en tu reservación', 'Recuerda que puedes consultar el material didáctico en una liga que hemos enviado a tu correo electrónico o directamente en las reservaciones de tu cuenta.'])
      await waitForDialogToClose()
      await router.push(`/reservations/school/success?reservationId=${reservationId}`)
    } else {
      await router.push('/reservations/school/success')
    }
    
    // Limpiar toda la persistencia después de navegar exitosamente
    console.log('🧹 Limpiando persistencia después de completar reservación')
    store.clearPersistence()

    // También limpiar el store principal para que vuelva al selector de tipo
    const mainStore = useReservationFormStore();
    mainStore.resetForm();
    mainStore.clearAllSpecificStores();

  } catch (error) {
    console.error('Error al completar la reservación:', error)
  }
}

// Función para manejar la apertura del chat
const handleOpenChat = () => {
  console.log("💬 Abriendo chat de soporte");
  // Aquí puedes implementar la lógica para abrir el chat
};

// Función para manejar la cancelación de reservación
const handleCancelReservation = () => {
  console.log("❌ Cancelando reservación");
  // Aquí puedes implementar la lógica para cancelar la reservación
};

// Función para manejar la opción de cancelación seleccionada
const handleCancelOptionSelected = (option: string) => {
  console.log("🔍 Opción de cancelación seleccionada:", option);
  console.log("📄 ID de reservación:", currentReservationId.value);

  // Aquí puedes implementar la lógica según la opción seleccionada
  // Por ejemplo:
  // - 'conflictos-agenda': Redirigir a modificar fecha/hora
  // - 'organizacion-grupo': Redirigir a modificar número de asistentes
  // - 'transporte-presupuesto': Mostrar información de costos
  // - 'institucion-cancelo': Proceso de cancelación oficial
  // - 'ninguna': Proceso de cancelación definitiva
};

// Navega a la ruta principal de reservaciones despues de agotar los intentos de ingreso de codigo de vinculacion desde el formulario de reservaciones generales, step 1
const handleErrorLinkingCodeNavigateToReservations = async () => {
  await router.push('/reservations')

  // Limpiar toda la persistencia después de navegar exitosamente
  console.log('🧹 Limpiando persistencia')
  store.clearPersistence()
}

</script> 