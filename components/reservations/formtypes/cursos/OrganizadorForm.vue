<template>
  <div class="space-y-4">
    <Separator class="my-4" />

    <ReservationStep1
      v-if="getCurrentScreen() === 'reservation-step1'"
      :data="reservationData"
      @submit="handleStep1Submit"
      @next="goToStep(2)"
      @navigate-to-step="handleNavigateToStep"
    />

    <ReservationStep2
      v-if="getCurrentScreen() === 'reservation-step2'"
      :type="reservationType"
      :data="reservationData"
      :reservation-id="currentReservationId || undefined"
      @next="goToStep(3)"
      @back="goToStep(1)"
    />

    <ReservationStep3
      v-if="getCurrentScreen() === 'reservation-step3'"
      :type="reservationType"
      :reservation-id="currentReservationId || undefined"
      @complete="handleCompleteReservation"
      @back="goToStep(2)"
    />

  </div>
</template>

<script setup lang="ts">
import { useReservationStepNavigation } from '@/composables/reservations/useReservationStepNavigation'
import { useReservationCompany } from '@/composables/reservations/useReservationCompany'
import { computed, onMounted, ref } from "vue";
import { useRouter } from 'vue-router';

import ReservationStep1 from "@/components/reservations/formtypes/cursos/steps/ReservationStep1.vue";
import ReservationStep2 from '@/components/reservations/formtypes/cursos/steps/ReservationStep2.vue';
import ReservationStep3 from '@/components/reservations/formtypes/cursos/steps/ReservationStep3.vue';

// const emit = defineEmits<{
//   'form-changed': []
// }>();

// Composable para reservaciones empresariales
const {
  store,
  currentReservation,
  currentReservationId,
  formData,
  resetForm
} = useReservationCompany()

// Router para navegación
const router = useRouter()

// Datos de reservación (compatibilidad con componentes existentes)
const reservationType = ref('empresarial')
const reservationData = computed(() => formData.value)

// Inicializar datos y paso
onMounted(() => {
  // Resetear el formulario al cargar
  resetForm()
  
  // Debug: verificar que el composable esté funcionando
  console.log('🔍 EmpresarialForm mounted - currentReservation:', currentReservation?.value)
  console.log('🔍 EmpresarialForm mounted - currentReservationId:', currentReservationId?.value)
  console.log('🔍 EmpresarialForm mounted - store:', store)
})

// Lógica de pasos
const { currentStep, goToStep } = useReservationStepNavigation()

// El currentReservationId ya está disponible desde el composable

// Función para manejar la navegación desde los pasos
const handleNavigateToStep = (step: number) => {
  console.log('🔄 Navegando al paso:', step)
  goToStep(step)
}

// Función para manejar el resultado del paso 1
const handleStep1Submit = (result: any) => {
  console.log('📝 Resultado del paso 1 recibido:', result)
  console.log('📝 Tipo del resultado:', typeof result)
  console.log('📝 Resultado tiene ID?:', result && result.id)
  console.log('📝 Resultado tiene response?:', result && result.response)
  
  // Extraer el ID del campo 'response' de la respuesta del API
  let reservationId = null
  
  if (result && result.response) {
    // El API devuelve el ID en el campo 'response'
    reservationId = result.response
    console.log('✅ ID extraído del campo response:', reservationId)
  } else if (result && result.id) {
    // Fallback: si el ID está directamente en el objeto
    reservationId = result.id
    console.log('✅ ID extraído del campo id:', reservationId)
  } else if (typeof result === 'number') {
    // Fallback: si el resultado es directamente un número
    reservationId = result
    console.log('✅ ID extraído como número directo:', reservationId)
  }
  
  // Establecer el ID y el objeto completo en el store si se pudo extraer
  if (reservationId) {
    store.setCurrentReservationId(reservationId)
    // También establecer el objeto completo de la reservación
    if (result && typeof result === 'object' && result.id) {
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
}

// Función para mostrar el componente correcto según el paso
const getCurrentScreen = () => {
  switch (currentStep.value) {
    case 1: return 'reservation-step1'
    case 2: return 'reservation-step2'
    case 3: return 'reservation-step3'
    default: return 'reservation-step1'
  }
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
      await router.push(`/reservations/empresarial/success?reservationId=${reservationId}`)
    } else {
      await router.push('/reservations/empresarial/success')
    }
    
    // Limpiar toda la persistencia después de navegar exitosamente
    console.log('🧹 Limpiando persistencia después de completar reservación')
    store.clearPersistence()
    
  } catch (error) {
    console.error('Error al completar la reservación:', error)
  }
}

</script> 