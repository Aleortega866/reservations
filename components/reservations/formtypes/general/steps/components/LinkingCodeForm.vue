<template>
    <form @submit.prevent="onSubmit">
      <FormField v-slot="{ componentField }" name="linkingCode">
        <FormItem class="py-0.5">
          <FormLabel class="text-base text-[#3C3C3B] font-medium">Código de vinculación</FormLabel>
          <FormControl>
            <div class="relative w-full items-center p-1">
              <Input v-bind="componentField" @update:model-value="searchLinkingCode" type="text" placeholder="Ingresa el código de vinculación"
              class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate pr-13 pl-5" />
              <span v-show="values.linkingCode" class="absolute end-0 inset-y-0 flex items-center justify-center px-5">
                <Icon v-if="isAValidLinkingCode" icon="material-symbols:check-circle-rounded" width="auto" height="auto" class="text-[#003DA6]" />
                <Icon v-else-if="!isAValidLinkingCode" icon="material-symbols:cancel-rounded" width="auto" height="auto" class="text-[#003DA6]" />
              </span>
            </div>
          </FormControl>
          <FormDescription>
            <InfoAlert class="mt-1" :message-class="'text-black font-normal'" message-size="text-sm" title="Información" message="Si cuentas con un código de vinculación ingrésalo en este campo, de lo contrario modifica tu número de asistentes a menos de 15." />
          </FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>
      <Button :disabled="isLoading" type="submit" variant="secondary" class="w-full text-lg font-medium shadow-[4px_4px_16px_rgba(0,0,0,0.3)] cursor-pointer mt-14 py-5">
        <div v-if="isVerifingALinkingCode" class="flex items-center justify-center">
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          Agregando...
        </div>
        <span v-else>Agregar código de vinculación</span>
      </Button>
    </form>
</template>

<script setup lang="ts">
import { watch, onMounted, ref, computed } from "vue";
import type { Ref, ComputedRef } from 'vue';
import { useDebounceFn } from '@vueuse/core'
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Icon } from "@iconify/vue";
import { useCatalog } from '@/composables/catalog/useCatalog'
import InfoAlert from "~/components/common/InfoAlert.vue";
import { useReservationGeneral } from '@/composables/reservations/useReservationGeneral'

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: [Error, Object, null],
    default: null
  },
  retrySubmitLinkingCode: {
    type: Number,
    default: 3
  }
})

const emit = defineEmits(['assign-linking-code', 'return-to-reservartions', 'update-retry-submit-linking-code'])

// Composable para reservaciones generales
const {
  getAllLinkingCodes
} = useReservationGeneral()

// Composable para catálogos
const { fetchCatalogs, catalogs } = useCatalog()

// Schema de validación con Zod - Campo linkingCode para validacion aislada en un tipo de formulario en especifico
const formSchemaReservationGeneralStep1LinkingCode = toTypedSchema(
  z.object({
    linkingCode: z.union([z.string().min(7, 'El formato del código de vinculación no es válido').regex(/^[a-zA-Z0-9]+$/, {
        message: 'El formato del código de vinculación no es válido'
    }).nullable().default(null), z.literal('').transform(() => undefined)])
  })
);

// Formulario con vee-validate, Linking Code
const { handleSubmit, values, errors } = useForm({
  validationSchema: formSchemaReservationGeneralStep1LinkingCode,
  // Evitar validación inicial automática para no mostrar errores antes de interactuar
  validateOnMount: false,
  // Configurar valores iniciales
  initialValues: {
    linkingCode: null
  }
})

// Controla el estado del icono del input de linkingCode
const isAValidLinkingCode: ComputedRef<boolean> = computed(() => {
    return !!values.linkingCode && !errors.value?.linkingCode
})

// La cantidad de intentos para enviar el formulario de codigo de vinculacion
const retrySubmitLinkingCode = ref<number>(props.retrySubmitLinkingCode)

/**
 * Gasta 1 intento de los restantes para el reintento de envio del formulario de codigo de vinculacion. Cuando hay 0 intentos, regresa al formulario de reservaciones
 */
const markRetrySubmitLinkingCode = (): void => {
    retrySubmitLinkingCode.value-=1
    const updatedRetrySubmitLinkingCode = retrySubmitLinkingCode.value
  
  if(updatedRetrySubmitLinkingCode <= 0) {
    console.log('Navegando fuera')
    // Emite el ultimo valor pero sin cerrar el modal para que de tiempo de mostrar el nuevo mensaje dentro de la ventana de tiempo
    emit('update-retry-submit-linking-code', { linkingCodeFromDialog: null, retrySubmitLinkingCodeFromDialog: updatedRetrySubmitLinkingCode, showLinkingCodeFromDialog: true })
    // Navegar a pagina de reservaciones generales, invocando a metodo en GeneralForm
    setTimeout(() => {
        // Lo emite despues del tiempp establecido
        emit('update-retry-submit-linking-code', { linkingCodeFromDialog: null, retrySubmitLinkingCodeFromDialog: updatedRetrySubmitLinkingCode, showLinkingCodeFromDialog: false })
        emit('return-to-reservartions')
    }, 10000)
  }
  else {
    // Lo emite inmediatamente
    emit('update-retry-submit-linking-code', { linkingCodeFromDialog: null, retrySubmitLinkingCodeFromDialog: updatedRetrySubmitLinkingCode, showLinkingCodeFromDialog: false })
  }
}

// Guarda el codigo de vinculacion obtenido de la respuesta por getAllLinkingCodes
const retrievedLinkingCode: Ref<Array<any>> = ref([])

// Estado para controlar la carga de obtencion de codigos de vinculacion
const isLoadingLinkingCode = ref<boolean>(false)

/**
 * Establece el estado de loading para la espera de la obtencion de codigos de vinculacion
 */
const setLoadingLinkingCode = (loading: boolean): void => {
  isLoadingLinkingCode.value = loading
}

// Estado para controlar el estado cuando se verifica el codigo de vinculacion
const isVerifingALinkingCode = ref<boolean>(false)

/**
 * Establece el estado de loading cuando se esta verificando el codigo de vinculacion
 */
const setVerifingALinkingCode = (loading: boolean): void => {
  isVerifingALinkingCode.value = loading
}

// Verifica si hay algun estado de carga para desactivar algunos componentes
const isLoading = computed(() => {
    return isLoadingLinkingCode.value || isVerifingALinkingCode.value
})

onMounted(async () => {
    const response = await getAllLinkingCodes('COP0010')
    console.log('CODIGO', response)
})

// La funcion debounce permitira ejecutar getAllLinkingCodes despues de un segundo de inactividad
const debouncedSearchingLinkingCode = useDebounceFn(async(code:string) => {
    if(!isAValidLinkingCode.value) return
    setLoadingLinkingCode(true)
    const response = await getAllLinkingCodes(String(code))
    retrievedLinkingCode.value = [...response]
    setLoadingLinkingCode(false)
    console.log(response)
}, 1000, { maxWait: 5000 })

// Permite ser llamada por el evento @update del model cada vez que se actualice el campo de texto Input
type TypeNewCode = string | number
const searchLinkingCode = async(newCode:TypeNewCode):Promise<void> => {
    debouncedSearchingLinkingCode(String(newCode).trim().toUpperCase())
}

const onSubmit = handleSubmit(async({ linkingCode }):Promise<undefined|void> => {
    console.log(linkingCode)
    if(!linkingCode) return // Si es null entonces no envia el formulario
    if(retrievedLinkingCode.value.length > 0 && retrievedLinkingCode.value[0]?.code.trim().toUpperCase() === linkingCode.trim().toUpperCase()) {
        setVerifingALinkingCode(true)
        setTimeout(() => { // Simulacion de envio a funcion verificadora
            setVerifingALinkingCode(false)
            emit('assign-linking-code', { linkingCodeFromDialog: retrievedLinkingCode.value[0], retrySubmitLinkingCodeFromDialog: retrySubmitLinkingCode.value, showLinkingCodeFromDialog: false }) // Se emite el linkingCode exitoso al padre
        }, 2000);
    }
    else {  
        markRetrySubmitLinkingCode() // Se marca el intento
    }
})

</script>