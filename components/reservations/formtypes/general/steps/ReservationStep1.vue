<template>
  <div class="overflow-y-auto h-full">

    <Separator class="my-8 bg-[#B3B3B3] max-w-3/4 rounded-full mx-auto" />

    <form @submit.prevent="onSubmit">

      <h1 class="text-2xl text-[#3C3C3B] font-semibold">Número de asistentes</h1>
      <InfoAlert class="mt-3" :message-class="'text-[#3C3C3B] font-normal'" message-size="text-sm" title="Información" message="Deja vacíos los campos que no apliquen para tu visita." />

      <div class="py-5">
        <div class="text-base text-[#3C3C3B] font-medium mb-1">¿Asistes con menores de 3 años?</div>
        <div class="flex space-x-8">
          <FormField v-slot="{ componentField, handleChange }" name="attendingWithChildrenUnder3Yes">
            <FormItem class="mb-1">
              <FormControl class="py-0.5">
                <div class="flex space-x-4 py-1">
                  <div class="flex items-center space-x-2 cursor-pointer">
                    <Label for="yes"
                      class="text-base text-[#3C3C3B] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                      Si
                    </Label>
                    <Checkbox id="yes" :class="'rounded-full border-2'" class="w-6 h-6 cursor-pointer" variant="secondary" :model-value="componentField.modelValue"
                      @update:model-value="(checked) => handleAttendingWithChildrenUnder3Si(!!checked, handleChange)" />
                  </div>
                </div>
              </FormControl>
            </FormItem>
          </FormField>
          <FormField v-slot="{ componentField, handleChange }" name="attendingWithChildrenUnder3No">
            <FormItem class="mb-1">
              <FormControl class="py-0.5">
                <div class="flex space-x-4 py-1">
                  <div class="flex items-center space-x-2 cursor-pointer">
                    <Label for="no"
                      class="text-base text-[#3C3C3B] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                      No
                    </Label>
                    <Checkbox id="no" :class="'rounded-full border-2'" class="w-6 h-6 cursor-pointer" variant="secondary" :model-value="componentField.modelValue"
                      @update:model-value="(checked) => handleAttendingWithChildrenUnder3No(!!checked, handleChange)" />
                  </div>
                </div>
              </FormControl>
            </FormItem>
          </FormField>
        </div>
        <!-- MANEJO MANUAL DE ERRORES EN CHECKBOXES attendingWithChildrenUnder3Yes Y attendingWithChildrenUnder3No -->
        <div v-if="errors.attendingWithChildrenUnder3Yes || errors.attendingWithChildrenUnder3No" class="text-sm mt-1 text-[#DB0000]">
          {{ errors.attendingWithChildrenUnder3Yes || errors.attendingWithChildrenUnder3No }}
        </div>


        <!-- Campo condicional para menores de 3 años -->
        <FormField v-slot="{ componentField }" name="totalKidsUnderThree" v-if="hasAttendingWithChildrenUnder3">
          <FormItem class="mt-1 py-0.5">
            <FormLabel class="text-base text-[#3C3C3B] font-medium">¿Cuántos menores de edad?</FormLabel>
            <FormControl>
              <Input v-bind="componentField" type="number" placeholder="Ingresa el número de menores de edad que asistirán"
                class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" />
            </FormControl>
            <FormDescription>
              <InfoAlert class="mt-1" :message-class="'text-[#3C3C3B] font-normal'" message-size="text-sm" title="Información" message="Infantes de 3 años de edad o menores: sin costo." />
            </FormDescription>
            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <!-- Dropdown solo para Niños y niñas (De 4 a 14 años) -->
      <DropdownContent :show-options="showTotalKidsDropdown" :dropdowncounter="values.totalKids || 0" @toggle-options-from-child="toggleTotalKidsDropdown"
        :dropdowntitleclass="['text-sm font-medium mb-2']"
        :dropdownplaceholderclass="['bg-secondary/10 hover:bg-secondary/20']"
        :dropdowncontentclass="['p-3 bg-secondary/10 hover:bg-secondary/20']" class="mb-3">
        <template #dropdownplaceholder>
          <span class="text-lg text-[#3C3C3B] font-semibold">Niños y niñas (De 4 a 14 años)</span>
        </template>

        <template #dropdowncontent>
          <div class="p-3 bg-white border border-border rounded-xl space-y-0">
            <FormField v-slot="{ componentField }" name="totalKids">
              <FormItem>
                <FormLabel class="text-base text-[#3C3C3B] font-medium">Número de niños y niñas</FormLabel>
                <FormControl>
                  <Input v-bind="componentField" type="number" placeholder="Ingresa el número de niños y niñas que asistirán"
                    class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" />
                </FormControl>
                <FormDescription>

                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
            <p class="text-base text-[#3C3C3B] mt-2 mb-3">
              Del total de niños y niñas que ingresaste anteriormente, por favor, ingresa cuántos pertenecen a los siguientes grupos:
            </p>
            <FormField v-slot="{ componentField }" name="totalKidsWithDisabilities">
              <FormItem>
                <FormLabel class="text-base text-[#3C3C3B] font-medium">Personas con discapacidad</FormLabel>
                <FormControl>
                  <Input v-bind="componentField" type="number" placeholder="Ingresa el número de personas que asistirán"
                    class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" />
                </FormControl>
                <FormDescription>

                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
        </template>
      </DropdownContent>

      <!-- Dropdown solo para Adolescentes (De 15 a 17 años) -->
      <DropdownContent :show-options="showTotalTeenagersDropdown" :dropdowncounter="values.totalTeenagers || 0" @toggle-options-from-child="toggleTotalTeenagersDropdown"
        :dropdowntitleclass="['text-sm font-medium mb-2']"
        :dropdownplaceholderclass="['bg-secondary/10 hover:bg-secondary/20']"
        :dropdowncontentclass="['p-3 bg-secondary/10 hover:bg-secondary/20']" class="mb-3">
        <template #dropdownplaceholder>
          <span class="text-lg text-[#3C3C3B] font-semibold">Adolescentes (De 15 a 17 años)</span>
        </template>

        <template #dropdowncontent>
          <div class="p-3 bg-white border border-border rounded-xl space-y-0">
            <FormField v-slot="{ componentField }" name="totalTeenagers">
              <FormItem>
                <FormLabel class="text-base text-[#3C3C3B] font-medium">Número de adolescentes</FormLabel>
                <FormControl>
                  <Input v-bind="componentField" type="number" placeholder="Ingresa el número de adolescentes que asistirán"
                    class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" />
                </FormControl>
                <FormDescription>

                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
            <p class="text-base text-[#3C3C3B] mt-2 mb-3">
              Del total de adolescentes que ingresaste anteriormente, por favor, ingresa cuántos pertenecen a los siguientes grupos:
            </p>
            <FormField v-slot="{ componentField }" name="totalTeenagersWithDisabilities">
              <FormItem>
                <FormLabel class="text-base text-[#3C3C3B] font-medium">Personas con discapacidad</FormLabel>
                <FormControl>
                  <Input v-bind="componentField" type="number" placeholder="Ingresa el número de personas que asistirán"
                    class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" />
                </FormControl>
                <FormDescription>

                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
        </template>
      </DropdownContent>

      <!-- Dropdown solo para Jóvenes (De 18 a 24 años) -->
      <DropdownContent :show-options="showTotalYoungAdultsDropdown" :dropdowncounter="values.totalYoungAdults || 0" @toggle-options-from-child="toggleTotalYoungAdultsDropdown"
        :dropdowntitleclass="['text-sm font-medium mb-2']"
        :dropdownplaceholderclass="['bg-secondary/10 hover:bg-secondary/20']"
        :dropdowncontentclass="['p-3 bg-secondary/10 hover:bg-secondary/20']" class="mb-3">
        <template #dropdownplaceholder>
          <span class="text-lg text-[#3C3C3B] font-semibold">Jóvenes (De 18 a 24 años)</span>
        </template>

        <template #dropdowncontent>
          <div class="p-3 bg-white border border-border rounded-xl space-y-0">
            <FormField v-slot="{ componentField }" name="totalYoungAdults">
              <FormItem>
                <FormLabel class="text-base text-[#3C3C3B] font-medium">Número de jóvenes</FormLabel>
                <FormControl>
                  <Input v-bind="componentField" type="number" placeholder="Ingresa el número de jovenes que asistirán"
                    class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" />
                </FormControl>
                <FormDescription>

                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
            <p class="text-base text-[#3C3C3B] mt-2 mb-3">
              Del total de jóvenes que ingresaste anteriormente, por favor, ingresa cuántos pertenecen a los siguientes grupos:
            </p>
            <FormField v-slot="{ componentField }" name="totalYoungAdultsWithDisabilities">
              <FormItem>
                <FormLabel class="text-base text-[#3C3C3B] font-medium">Personas con discapacidad</FormLabel>
                <FormControl>
                  <Input v-bind="componentField" type="number" placeholder="Ingresa el número de personas que asistirán"
                    class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" />
                </FormControl>
                <FormDescription>

                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
        </template>
      </DropdownContent>

      <!-- Dropdown solo para Adultos (De 25 a 59 años) -->
      <DropdownContent :show-options="showTotalAdultsDropdown" :dropdowncounter="values.totalAdults || 0" @toggle-options-from-child="toggleTotalAdultsDropdown"
        :dropdowntitleclass="['text-sm font-medium mb-2']"
        :dropdownplaceholderclass="['bg-secondary/10 hover:bg-secondary/20']"
        :dropdowncontentclass="['p-3 bg-secondary/10 hover:bg-secondary/20']" class="mb-3">
        <template #dropdownplaceholder>
          <span class="text-lg text-[#3C3C3B] font-semibold">Adultos (De 25 a 59 años)</span>
        </template>

        <template #dropdowncontent>
          <div class="p-3 bg-white border border-border rounded-xl space-y-0">
            <FormField v-slot="{ componentField }" name="totalAdults">
              <FormItem>
                <FormLabel class="text-base text-[#3C3C3B] font-medium">Número de adultos</FormLabel>
                <FormControl>
                  <Input v-bind="componentField" type="number" placeholder="Ingresa el número de adultos que asistirán"
                    class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" />
                </FormControl>
                <FormDescription>

                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
            <p class="text-base text-[#3C3C3B] mt-2 mb-3">
              Del total de adultos que ingresaste anteriormente, por favor, ingresa cuántos pertenecen a los siguientes grupos:
            </p>
            <FormField v-slot="{ componentField }" name="totalAdultsWithDisabilities">
              <FormItem>
                <FormLabel class="text-base text-[#3C3C3B] font-medium">Personas con discapacidad</FormLabel>
                <FormControl>
                  <Input v-bind="componentField" type="number" placeholder="Ingresa el número de personas que asistirán"
                    class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" />
                </FormControl>
                <FormDescription>

                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
        </template>
      </DropdownContent>

      <!-- Dropdown solo para Adultos mayores (60 años o más) -->
      <DropdownContent :show-options="showTotalSeniorsDropdown" :dropdowncounter="values.totalSeniors || 0" @toggle-options-from-child="toggleTotalSeniorsDropdown"
        :dropdowntitleclass="['text-sm font-medium mb-2']"
        :dropdownplaceholderclass="['bg-secondary/10 hover:bg-secondary/20']"
        :dropdowncontentclass="['p-3 bg-secondary/10 hover:bg-secondary/20']" class="mb-3">
        <template #dropdownplaceholder>
          <span class="text-lg text-[#3C3C3B] font-semibold">Adultos mayores (60 años o más)</span>
        </template>

        <template #dropdowncontent>
          <div class="p-3 bg-white border border-border rounded-xl space-y-0">
            <FormField v-slot="{ componentField }" name="totalSeniors">
              <FormItem>
                <FormLabel class="text-base text-[#3C3C3B] font-medium">Número de adultos mayores</FormLabel>
                <FormControl>
                  <Input v-bind="componentField" type="number" placeholder="Ingresa el número de adultos mayoes que asistirán"
                    class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" />
                </FormControl>
                <FormDescription>

                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
            <p class="text-base text-[#3C3C3B] mt-2 mb-3">
              Del total de adultos mayores que ingresaste anteriormente, por favor, ingresa cuántos pertenecen a los siguientes grupos:
            </p>
            <FormField v-slot="{ componentField }" name="totalSeniorsWithDisabilities">
              <FormItem>
                <FormLabel class="text-base text-[#3C3C3B] font-medium">Personas con discapacidad</FormLabel>
                <FormControl>
                  <Input v-bind="componentField" type="number" placeholder="Ingresa el número de personas que asistirán"
                    class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" />
                </FormControl>
                <FormDescription>

                </FormDescription>
                <FormMessage />
              </FormItem>
            </FormField>
          </div>
        </template>
      </DropdownContent>

      <!-- Mensaje de descuento especial -->
      <div class="flex items-center space-x-2 my-5">
        <Icon icon="material-symbols:campaign-outline" class="text-[#003DA6] w-64 h-32 md:w-32 md:h-16" />
        <p class="text-base text-[#3C3C3B] font-semibold">
          ¡Descuento especial! Te recordamos que si eres estudiante o maestro y presentas tu credencial vigente en la taquilla, ¡obtendrás un descuento en tu entrada! No olvides traer tu identificación.
        </p>
      </div>

      <Separator class="my-8 bg-[#B3B3B3] max-w-3/4 rounded-full mx-auto" />

        <h1 class="text-2xl text-[#3C3C3B] font-semibold mb-3">Agenda tu visita</h1>
        
        <FormField v-slot="{ componentField }" name="reservationDate">
          <FormItem>
            <FormLabel class="text-base text-[#3C3C3B] font-medium">Fecha de visita</FormLabel>
            <FormControl>
              <CalendarField :model-value="componentField.modelValue" show-availability label="" placeholder="Selecciona una fecha de visita"
                :required="false" @update:model-value="componentField.onChange" :min-date="new Date()" :disabled-weekdays="[ 1 ]" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      
        <FormField v-slot="{ componentField }" name="checkInDateId">
          <FormItem class="mt-3">
            <FormLabel class="text-base text-[#3C3C3B] font-medium">Hora de visita</FormLabel>
            <FormControl>
              <TimeSlotSelector :model-value="componentField.modelValue || []" label="" :time-slots="timeSlots"
                :loading="loading" :error="error" @update:model-value="componentField.onChange" :show-all-time-slots="false"
                :show-info-availability="true" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
      
        <InfoAlert class="mt-2" :message-class="'text-[#3C3C3B] font-normal'" message-size="text-sm" title="Información" message="Al elegir horario, considera que el tiempo promedio de visita es de 2 horas. Sin embargo, al ser un recorrido libre, este tiempo puede variar según tu ritmo y el interés que pongas en explorar cada espacio." />
      
        <FormField v-slot="{ componentField }" name="visitObjectiveId" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
          <FormItem class="pt-4" v-auto-animate>
            <FormLabel class="text-base text-[#3C3C3B] font-medium">Objetivo de la visita</FormLabel>
            <FormControl>
              <OptionListField :model-value="componentField.modelValue" :options="visitObjectives"
                placeholder="Por favor, selecciona una opción" label="" @update:model-value="(value) => {
                  console.log('🔄 OptionListField emitió:', value, typeof value)
                  componentField.onChange(value) }" placeholder-font-size="text-base" placeholder-class="placeholder:font-semibold font-medium" options-content-font-size="text-base" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

      <Button :disabled="isCreating || isUpdating || !isValidForm || isValidToNavigate" type="submit" variant="secondary" :class="[{ 'cursor-pointer': isValidForm }]" class="w-full text-lg font-medium mt-8 py-5">
        <div v-if="isCreating || isUpdating" class="flex items-center justify-center">
          <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            {{ isStepComplete(1) ? 'Guardando cambios...' : 'Guardando...' }}
        </div>
        <span v-else>{{ isStepComplete(1) ? 'Guardar cambios y continuar' : 'Guardar' }}</span>
      </Button>

    </form>

    <!-- Modal de código de vinculación -->
    <Dialog v-model:open="showLinkingCode" @update:open="() => { if(retrySubmitLinkingCode === 0) return $emit('exit-linking-code') } ">
      <DialogContent class="sm:max-w-md rounded-[20px]">
        <DialogHeader>
          <DialogTitle class="text-start text-3xl text-[#3C3C3B] font-semibold mt-8">
            Has excedido el número de asistentes de una visita general
          </DialogTitle>
        </DialogHeader>
        <div v-show="hasAnyRetrySubmitLinkingCode" class="mb-12">
          <LinkingCodeForm :retry-submit-linking-code="retrySubmitLinkingCode" @return-to-reservartions="$emit('exit-linking-code')" @assign-linking-code="assignLinkingCode" @update-retry-submit-linking-code="updateRetrySubmitLinkingCode" />
        </div>
        <div v-show="!hasAnyRetrySubmitLinkingCode" class="mb-12">
          <div class="text-start text-base text-[#3C3C3B] font-medium">Se han agotado el número de intentos para agregar un código de vinculación a esta reservación. Se te regresará al menú principal. Desde ahí puedes volver a comenzar el proceso para crear una nueva reservación. </div>
        </div>
      </DialogContent>
    </Dialog>

  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, ref, computed, nextTick } from "vue";
import type { Ref, ComputedRef } from 'vue';
import { useDebounceFn } from '@vueuse/core'
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import * as z from "zod";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Icon } from "@iconify/vue";
import CalendarField from "@/components/common/CalendarField.vue";
import { useCatalog } from '@/composables/catalog/useCatalog'
import { useTimeSlots } from "@/composables/business/useTimeSlots";
import OptionListField from "@/components/common/OptionListField.vue";
import InfoAlert from "~/components/common/InfoAlert.vue";
import DropdownContent from '@/components/common/DropdownContent.vue'
import TimeSlotSelector from "@/components/common/TimeSlotSelector.vue";
import { useAuth } from '@/lib/api/composables/auth'
import { useReservationGeneral } from '@/composables/reservations/useReservationGeneral'
import LinkingCodeForm from "@/components/reservations/formtypes/general/steps/components/LinkingCodeForm.vue";
import { useReservationStepLoader } from "@/composables/reservations/useReservationStepLoader";
import { useDialogStore } from '@/stores/dialog'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: [Error, Object, null],
    default: null
  },
  headerData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['submit', 'cancel', 'navigate-to-step', 'exit-linking-code'])

// Composable para manejo de autenticación
const { user } = useAuth()

// Composable para reservaciones generales
const {
  store,
  getAllReservationGeneralObjectiveVisit,
  getAllLinkingCodes,
  currentReservationId,
  createReservationGeneralStep1,
  updateReservationGeneralStep1,
  isCreating,
  isUpdating,
  error: reservationError,
  isStep1Valid
} = useReservationGeneral()

// Composable para catálogos
const { fetchCatalogs, catalogs } = useCatalog()

// Usar el composable para obtener los horarios desde la API
const {
  timeSlots,
  loading: timeSlotsLoading,
  error: timeSlotsError,
  loadTimeSlots,
} = useTimeSlots();

// Composable para el estado de los pasos
const { isStepComplete } = useReservationStepLoader();

// Store de dialogo
const dialogStore = useDialogStore()

// Computed para el estado de loading combinado
const loading = computed(() => props.loading || isCreating.value || isUpdating.value || timeSlotsLoading.value)

// Computed para el estado de error combinado
const error = computed(() => props.error || reservationError?.value || timeSlotsError.value || null)


// Los objetivos de visitas que se cargarán desde el catálogo
const visitObjectives = ref<Record<string, any>>([])

// Controla si despues de enviar el formulario devuelve una respuesta exitosa y es candidato a navegar entre pantallas. Bloquea el boton de formulario en caso de exito
const isValidToNavigate = ref<Boolean>(false)

// Función para cargar los objetivos de visita desde el catálogo
const loadVisitObjectivesBusiness = async () => {
  try {
    const visitObjetivesResponse = await getAllReservationGeneralObjectiveVisit()
    const objectives = visitObjetivesResponse.filter(catalog => 
      catalog.tableName === 'VisitObjectives' && catalog.enable
    )
    
    console.log('🔍 Objetivos de visita cargados (formato original):', objectives)
    
    // Transformar el formato para que value sea el id numérico
    const transformedObjectives = objectives.map(obj => ({
      value: obj.id, // Usar el ID numérico como value
      label: obj.value, // Usar el campo 'value' del catálogo como label
      id: obj.id
    }))
    
    console.log('🔍 Objetivos de visita transformados:', transformedObjectives)
    visitObjectives.value = transformedObjectives
  } catch (error) {
    console.error('❌ Error al cargar objetivos de visita:', error)
    // En caso de error, mostrar opciones no disponibles
    visitObjectives.value = [
      { value: "no_disponible", label: "Opciones no disponibles" }
    ]
  }
}

// El limite de personas para el formulario general
// Por defecto es 15
// Puede cambiar de acuerdo al maximo de personas vinculado en el codigo de vinculacion
const _DEFAULT_MAX_PEOPLE_GENERAL_FORM = 15

// Guarda la cantidad maxima de personas por reservacion. Esta variable puede mutar su valor si se ingresa un codigo de vinculacion
const MAX_PEOPLE_GENERAL_FORM: Ref<number> = ref(_DEFAULT_MAX_PEOPLE_GENERAL_FORM)

// Schema de validación con Zod - Solo campos actuales del formulario
const formSchemaReservationGeneralStep1 = toTypedSchema(
  z.object({
    visitorId: z.number().int(),
    attendingWithChildrenUnder3: z.boolean().default(false),
    attendingWithChildrenUnder3Yes: z.boolean().default(false),
    attendingWithChildrenUnder3No: z.boolean().default(true),
    totalKidsUnderThree: z.union([z.literal('').transform(() => undefined), z.coerce.number().int().min(0, 'Por favor ingresa la cantidad de menores de 3 años')]).optional(),
    totalKids: z.union([z.literal('').transform(() => undefined), z.coerce.number().int().min(0, 'Por favor ingresa la cantidad de niños y niñas')]).default(0),
    totalTeenagers: z.union([z.literal('').transform(() => undefined), z.coerce.number().int().min(0, 'Por favor ingresa la cantidad de adolescentes')]).default(0),
    totalYoungAdults: z.union([z.literal('').transform(() => undefined), z.coerce.number().int().min(0, 'Por favor ingresa la cantidad de jovenes')]).default(0),
    totalAdults: z.union([z.literal('').transform(() => undefined), z.coerce.number().int().min(0, 'Por favor ingresa la cantidad de adultos')]).default(0),
    totalSeniors: z.union([z.literal('').transform(() => undefined), z.coerce.number().int().min(0, 'Por favor ingresa la cantidad de adultos mayores')]).default(0),
    reservationDate: z.date().nullable(),
    checkInDateId: z.array(z.any()).min(1, "Por favor selecciona al menos un horario"),
    visitObjectiveId: z.coerce.number().int().default(0),
    totalKidsWithDisabilities: z.union([z.literal('').transform(() => undefined), z.coerce.number().int().min(1, 'Por favor ingresa la cantidad de personas con discapacidad. Debe ser un numero mayor a 0')]).optional(),
    totalTeenagersWithDisabilities: z.union([z.literal('').transform(() => undefined), z.coerce.number().int().min(1, 'Por favor ingresa la cantidad de personas con discapacidad. Debe ser un numero mayor a 0')]).optional(),
    totalYoungAdultsWithDisabilities: z.union([z.literal('').transform(() => undefined), z.coerce.number().int().min(1, 'Por favor ingresa la cantidad de personas con discapacidad. Debe ser un numero mayor a 0')]).optional(),
    totalAdultsWithDisabilities: z.union([z.literal('').transform(() => undefined), z.coerce.number().int().min(1, 'Por favor ingresa la cantidad de personas con discapacidad. Debe ser un numero mayor a 0')]).optional(),
    totalSeniorsWithDisabilities: z.union([z.literal('').transform(() => undefined), z.coerce.number().int().min(1, 'Por favor ingresa la cantidad de personas con discapacidad. Debe ser un numero mayor a 0')]).optional(),
    linkingCode: z.union([z.string().min(7, 'El formato del código de vinculación no es válido').nullable().default(null), z.literal('').transform(() => undefined)])
  }).superRefine((data, ctx) => {

    // INICIA VALIDACION DE DATOS 'Debes ingresar al menos un valor mayor o igual a 1 en cualquiera de los campos'
    const totals = [
      data.totalKids,
      data.totalTeenagers,
      data.totalYoungAdults,
      data.totalAdults,
      data.totalSeniors
    ];
    if(!totals.some(val => val >= 1)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes ingresar al menos un valor mayor o igual a 1 en cualquiera de los campos',
        path: ['totalKids'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes ingresar al menos un valor mayor o igual a 1 en cualquiera de los campos',
        path: ['totalTeenagers'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes ingresar al menos un valor mayor o igual a 1 en cualquiera de los campos',
        path: ['totalYoungAdults'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes ingresar al menos un valor mayor o igual a 1 en cualquiera de los campos',
        path: ['totalAdults'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes ingresar al menos un valor mayor o igual a 1 en cualquiera de los campos',
        path: ['totalSeniors'],
      });
    }
    // TERMINA VALIDACION DE DATOS UNDEFINED = 'Por favor ingresa un número válido'
    
    // Validación condicional para totalKidsUnderThree
    if (data.attendingWithChildrenUnder3) {
      const value = data.totalKidsUnderThree;
      if (value === undefined || value === null || isNaN(value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Por favor ingresa la cantidad de menores de 3 años',
          path: ['totalKidsUnderThree'],
        });
      }
    }

    // INICIA VALIDACION PARA EVITAR QUE CUALQUIER CAMPO DISABILITY SEA MAYOR QUE EL CAMPO DE SU GRUPO
    if (data.totalKidsWithDisabilities !== undefined && data.totalKidsWithDisabilities > data.totalKids) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El número excede a la cantidad de niños y niñas que asistirán al museo. (Máximo ${data?.totalKids || 0})`,
        path: ['totalKidsWithDisabilities'],
      });
    }
    if (data.totalTeenagersWithDisabilities !== undefined && data.totalTeenagersWithDisabilities > data.totalTeenagers) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El número excede a la cantidad de adolescentes que asistirán al museo. (Máximo ${data?.totalTeenagers || 0})`,
        path: ['totalTeenagersWithDisabilities'],
      });
    }
    if (data.totalYoungAdultsWithDisabilities !== undefined && data.totalYoungAdultsWithDisabilities > data.totalYoungAdults) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El número excede a la cantidad de jóvenes que asistirán al museo. (Máximo ${data?.totalYoungAdults || 0})`,
        path: ['totalYoungAdultsWithDisabilities'],
      });
    }
    if (data.totalAdultsWithDisabilities !== undefined && data.totalAdultsWithDisabilities > data.totalAdults) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El número excede a la cantidad de adultos que asistirán al museo. (Máximo ${data?.totalAdults || 0})`,
        path: ['totalAdultsWithDisabilities'],
      });
    }
    if (data.totalSeniorsWithDisabilities !== undefined && data.totalSeniorsWithDisabilities > data.totalSeniors) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El número excede a la cantidad de adultos mayores que asistirán al museo. (Máximo ${data?.totalSeniors || 0})`,
        path: ['totalSeniorsWithDisabilities'],
      });
    }
    // TERMINA VALIDACION PARA EVITAR QUE CUALQUIER CAMPO DISABILITY SEA MAYOR QUE EL CAMPO DE SU GRUPO


    const maxTotalPeopleAllowed = isTotalPeopleUnderMaxPeopleGeneralForm.value && data.linkingCode === null ? _DEFAULT_MAX_PEOPLE_GENERAL_FORM : MAX_PEOPLE_GENERAL_FORM.value;
    
    if (totalPeople.value > maxTotalPeopleAllowed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El número de asistentes máximo permitido para esta reservación se ha sobrepasado. Disminuya el número de asistentes.',
        path: ['totalKids'],
      });

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El número de asistentes máximo permitido para esta reservación se ha sobrepasado. Disminuya el número de asistentes.',
        path: ['totalTeenagers'],
      });

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El número de asistentes máximo permitido para esta reservación se ha sobrepasado. Disminuya el número de asistentes.',
        path: ['totalYoungAdults'],
      });

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El número de asistentes máximo permitido para esta reservación se ha sobrepasado. Disminuya el número de asistentes.',
        path: ['totalAdults'],
      });

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El número de asistentes máximo permitido para esta reservación se ha sobrepasado. Disminuya el número de asistentes.',
        path: ['totalSeniors'],
      });
    }

    const allAttendingWithChildrenUnder3False = !data.attendingWithChildrenUnder3Yes && !data.attendingWithChildrenUnder3No;

    if (allAttendingWithChildrenUnder3False) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes seleccionar al menos una opción relacionada con niños menores de 3 años.',
        path: ['attendingWithChildrenUnder3Yes'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes seleccionar al menos una opción relacionada con niños menores de 3 años.',
        path: ['attendingWithChildrenUnder3No'],
      });
    }

    if (data.visitObjectiveId === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes seleccionar el objetivo de la visita.',
        path: ['visitObjectiveId'],
      });
    }

    // INICIA VALIDACION DE DATOS UNDEFINED = 'Por favor ingresa un número válido'
    if(data.totalKids === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Por favor ingresa la cantidad de niños y niñas',
        path: ['totalKids'],
      });
    }
    if(data.totalTeenagers === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Por favor ingresa la cantidad de adolescentes',
        path: ['totalTeenagers'],
      });
    }
    if(data.totalYoungAdults === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Por favor ingresa la cantidad de jovenes',
        path: ['totalYoungAdults'],
      });
    }
    if(data.totalAdults === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Por favor ingresa la cantidad de adultos',
        path: ['totalAdults'],
      });
    }
    if(data.totalSeniors === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Por favor ingresa la cantidad de adultos mayores',
        path: ['totalSeniors'],
      });
    }
    // TERMINA VALIDACION DE DATOS UNDEFINED = 'Por favor ingresa un número válido'

  })
);


// Formulario con vee-validate, Step 1 Completo
const { handleSubmit, values, setFieldValue, validateField, setErrors, errors, meta } = useForm({
  validationSchema: formSchemaReservationGeneralStep1,
  // Evitar validación inicial automática para no mostrar errores antes de interactuar
  validateOnMount: false,
  // Configurar valores iniciales
  initialValues: {
    visitorId: parseInt(String(user.value?.userId)),
    attendingWithChildrenUnder3: false,
    attendingWithChildrenUnder3Yes: false,
    attendingWithChildrenUnder3No: true,
    totalKids: 0,
    totalTeenagers: 0,
    totalYoungAdults: 0,
    totalAdults: 0,
    totalSeniors: 0,
    reservationDate: null,
    checkInDateId: [],
    visitObjectiveId: 0,
    linkingCode: null
  }
})

// La cantidad de intentos para enviar el formulario de codigo de vinculacion
const retrySubmitLinkingCode = ref<number>(3)

// Permite indicar si el formulario de envio de codigo de vinculacion debe ser mostrado o no
const hasAnyRetrySubmitLinkingCode = computed(() => {
  return !!(retrySubmitLinkingCode.value > 0)
});

// Estado para controlar la visibilidad del modal de código de vinculación
const showLinkingCode = ref<boolean>(false)

// Función para mostrar el modal de código de vinculación
const showLinkingCodeModal = (totalPeople:number,  event?:Event):void => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }
  console.log(totalPeople)
  showLinkingCode.value = true
};

// Estado para controlar la carga de la vinculación de un código de vinculación
const isCreatingLinkingCode = ref<boolean>(false)

/**
 * Establece el estado de loading para vincular un código de vinculación
 */
const setCreatingLinkingCode = (loading: boolean): void => {
  isCreatingLinkingCode.value = loading
}

// Estado para controlar la visibilidad del dropdown de niños
const showTotalKidsDropdown = ref(false)

// Función para alternar la visibilidad del dropdown de niños
const toggleTotalKidsDropdown = () => {
  showTotalKidsDropdown.value = !showTotalKidsDropdown.value
}

// Estado para controlar la visibilidad del dropdown de adolescentes
const showTotalTeenagersDropdown = ref(false)

// Función para alternar la visibilidad del dropdown de adolescentes
const toggleTotalTeenagersDropdown = () => {
  showTotalTeenagersDropdown.value = !showTotalTeenagersDropdown.value
}

// Estado para controlar la visibilidad del dropdown de jovenes
const showTotalYoungAdultsDropdown = ref(false)

// Función para alternar la visibilidad del dropdown de jovenes
const toggleTotalYoungAdultsDropdown = () => {
  showTotalYoungAdultsDropdown.value = !showTotalYoungAdultsDropdown.value
}

// Estado para controlar la visibilidad del dropdown de adultos
const showTotalAdultsDropdown = ref(false)

// Función para alternar la visibilidad del dropdown de adultos
const toggleTotalAdultsDropdown = () => {
  showTotalAdultsDropdown.value = !showTotalAdultsDropdown.value
}

// Estado para controlar la visibilidad del dropdown de adultos mayores
const showTotalSeniorsDropdown = ref(false)

// Función para alternar la visibilidad del dropdown de adultos mayores
const toggleTotalSeniorsDropdown = () => {
  showTotalSeniorsDropdown.value = !showTotalSeniorsDropdown.value
}

// Accedemos al valor real del formulario para attendingWithChildrenUnder3
const hasAttendingWithChildrenUnder3 = computed(() => {
  return !!values?.attendingWithChildrenUnder3 || false;
});

// Como Zod no revalida el objeto cuando algun elemento (como totalKidsUnderThree) desaparece del DOM entonces con este watch reescribimos el valor de este campo
// Cuando los menores de 3 años no se ocupen en el formulario
// Haciendo que las validaciones cursen correctamente
watch(() => hasAttendingWithChildrenUnder3.value, (newVal) => {
  if (!newVal) {
    setFieldValue('totalKidsUnderThree', undefined);
  }
});

// Indica si el esquema/form del paso 1 es valido o no
const isValidForm: ComputedRef<boolean> = computed(() => meta.value.valid && !meta.value.pending)

// Total de personas calculado
const totalPeople: ComputedRef<number> = computed(() => 
  (values.totalKids! || 0) +
  (values.totalTeenagers! || 0) +
  (values.totalYoungAdults! || 0) +
  (values.totalAdults! || 0) +
  (values.totalSeniors! || 0)
)

// Indica si se ha sobrepasado el tope de personas que permite el formulario
const isTotalPeopleUnderMaxPeopleGeneralForm: ComputedRef<boolean> = computed(() => totalPeople.value <= MAX_PEOPLE_GENERAL_FORM.value)

// La funcion debounce permitira ejecutar showLinkingCodeModal despues de un segundo y medio de inactividad
const debouncedShowLinkingCodeModal = useDebounceFn(async(newVal:number) => {
  if(newVal > _DEFAULT_MAX_PEOPLE_GENERAL_FORM && !values.linkingCode && retrySubmitLinkingCode.value > 0) return showLinkingCodeModal(Number(newVal))
}, 1500, { maxWait: 5000 })

// Watch que vigila la cantidad total de asistentes. Es necesario para determinar cuando abrir el modal de codigo de vinculacion
watch(() => totalPeople.value, (newVal) => {
  if(!currentReservationId.value) { // No debe de tener id de reservacion
      debouncedShowLinkingCodeModal(newVal)
  }
})

// Función para mapear los datos del formulario a la estructura de la API
const mapFormDataToApiRequest = (formValues: any) => {

  // Ahora el value es directamente el ID numérico
  const visitObjectiveId = formValues.visitObjectiveId


  // Validar que se haya seleccionado un objetivo válido
  if (!values.visitObjectiveId || values.visitObjectiveId === 0) {
    console.error('❌ No se seleccionó un objetivo de visita válido:', {
      valorSeleccionado: formValues.visitObjectiveId,
      objetivosDisponibles: visitObjectives.value
    })
    throw new Error('Por favor selecciona un objetivo de visita válido')
  }
  
  return {
    visitorId: parseInt(String(user.value?.userId)),
    attendingWithChildrenUnder3: formValues.attendingWithChildrenUnder3,
    totalKidsUnderThree: formValues.totalKidsUnderThree || 0,
    totalKids: formValues.totalKids || 0,
    totalTeenagers: formValues.totalTeenagers || 0,
    totalYoungAdults: formValues.totalYoungAdults || 0,
    totalAdults: formValues.totalAdults || 0,
    totalSeniors: formValues.totalSeniors || 0,
    reservationDate: formValues.reservationDate?.toISOString() || new Date().toISOString(),
    checkInDateId: parseInt(formValues.checkInDateId?.[0]) || 1,
    visitObjectiveId: parseInt(String(visitObjectiveId)),
    totalKidsWithDisabilities: formValues.totalKidsWithDisabilities || 0,
    totalTeenagersWithDisabilities: formValues.totalTeenagersWithDisabilities || 0,
    totalYoungAdultsWithDisabilities: formValues.totalYoungAdultsWithDisabilities || 0,
    totalAdultsWithDisabilities: formValues.totalAdultsWithDisabilities || 0,
    totalSeniorsWithDisabilities: formValues.totalSeniorsWithDisabilities || 0,
    linkingCode: formValues.linkingCode || null
  }
}

// Función independiente para manejar el checkbox Si "¿Asistes con menores de 3 años?"
const handleAttendingWithChildrenUnder3Si = (checked: boolean, handleChange: Function) => {
  handleChange(checked);
  if(checked){
    setFieldValue('attendingWithChildrenUnder3No', false);
    setFieldValue('attendingWithChildrenUnder3', true);
  }
  else {
    setFieldValue('attendingWithChildrenUnder3No', false);
    setFieldValue('attendingWithChildrenUnder3', false);
  }
  nextTick(() => {
    setErrors({ attendingWithChildrenUnder3: undefined })
    setErrors({ attendingWithChildrenUnder3Yes: undefined })
    setErrors({ attendingWithChildrenUnder3No: undefined })
    validateField('attendingWithChildrenUnder3')
    validateField('attendingWithChildrenUnder3Yes')
    validateField('attendingWithChildrenUnder3No')
  })
}

// Función independiente para manejar el checkbox No "¿Asistes con menores de 3 años?"
const handleAttendingWithChildrenUnder3No = (checked: boolean, handleChange: Function) => {
  handleChange(checked);
  setFieldValue('attendingWithChildrenUnder3Yes', false);
  setFieldValue('attendingWithChildrenUnder3', false);
  nextTick(() => {
    setErrors({ attendingWithChildrenUnder3: undefined })
    setErrors({ attendingWithChildrenUnder3Yes: undefined })
    setErrors({ attendingWithChildrenUnder3No: undefined })
    validateField('attendingWithChildrenUnder3')
    validateField('attendingWithChildrenUnder3Yes')
    validateField('attendingWithChildrenUnder3No')
  })
}

const assignLinkingCode = ({ linkingCodeFromDialog, retrySubmitLinkingCodeFromDialog, showLinkingCodeFromDialog }:{ linkingCodeFromDialog:Record<string, any> | null, retrySubmitLinkingCodeFromDialog:number, showLinkingCodeFromDialog:boolean }) => {
  setFieldValue('linkingCode', linkingCodeFromDialog?.code || null) // Se agrega el codigo de vinculacion al schema del formulario
  const description1 = linkingCodeFromDialog?.description || ''
  const description2 = `
      • Puedes realizar reservaciones de más de 15 asistentes
      • Tu boleto tiene un precio especial para el programa 
  `;
  dialogStore.toggleDialog(true, 'Se ha agregado con éxito el código de vinculación', [description1, description2])
  showLinkingCode.value = showLinkingCodeFromDialog // Se cierra el dialogo
  retrySubmitLinkingCode.value = !retrySubmitLinkingCodeFromDialog ? 0 : retrySubmitLinkingCodeFromDialog // Se setea a 0 el numero de intentos de verificacion del codigo de vinculacion
  MAX_PEOPLE_GENERAL_FORM.value = linkingCodeFromDialog?.maxTickets || MAX_PEOPLE_GENERAL_FORM.value // Se setea el valor maximo de personas que pueden registrarse como cupo para este formulario
}

const updateRetrySubmitLinkingCode = ({ linkingCodeFromDialog, retrySubmitLinkingCodeFromDialog, showLinkingCodeFromDialog }:{ linkingCodeFromDialog:Record<string, any> | null, retrySubmitLinkingCodeFromDialog:number, showLinkingCodeFromDialog:boolean }) => {
  setFieldValue('linkingCode', linkingCodeFromDialog?.code || null) // Se agrega el codigo de vinculacion al schema del formulario
  if(retrySubmitLinkingCodeFromDialog > 0) { // Se abre el splashscreen siempre y cuando queden intentos
    dialogStore.toggleDialog(true, 'Este código de vinculación no es válido', ['Por favor revisa los datos proporcionados o realiza una reservación para un número menor de 15 asistentes'])
  }
  if(retrySubmitLinkingCodeFromDialog === 0) { // Se cierra el dialogo cuando no queda ningun intento
      showLinkingCode.value = showLinkingCodeFromDialog 
  }
  retrySubmitLinkingCode.value = retrySubmitLinkingCodeFromDialog // Se setea a 0 el numero de intentos de verificacion del codigo de vinculacion
}

// Watcher para monitorear cambios en currentReservationId
watch(
  () => currentReservationId?.value,
  (newId, oldId) => {
    console.log("🔍 currentReservationId cambió:", { oldId, newId });
  },
  { immediate: true }
);

// Función independiente para manejar el checkbox "Terminos y condiciones"
const handleTermsAccepted = (checked: boolean, handleChange: Function) => {
  handleChange(checked);
}

onMounted(async () => {
  await loadVisitObjectivesBusiness()
  await loadTimeSlots();
  // Los valores iniciales ya están configurados en el formulario
  // Solo necesitamos asegurar que los campos estén limpios
  console.log('🔍 Formulario inicializado con valores:', values)
  
})

// Limpiar errores cuando se resuelve el error del servidor
watch(() => props.error, (newError) => {
  console.log('Error:', newError)
  if (!newError) {
    // Reset form when error is cleared
  }
})

// Watcher para detectar data enviada desde el header
watch(() => props.headerData, async (newHeaderData) => {
  if (newHeaderData && Object.keys(newHeaderData).length > 0) {
    console.log('📥 Data enviada desde el header:', newHeaderData)
    
    // Si hay data del paso 1, actualizar el formulario
    if (newHeaderData.step === 1 && newHeaderData.data) {
      console.log('🔄 Actualizando formulario con data del header:', newHeaderData.data)
      
      const data = newHeaderData.data

      // Imprimier el data para saber si estos vienen
      // visitorId
      
      // Mapear los datos del header a los campos del formulario
      // Checkboxes
      if(data.attendingWithChildrenUnder3) {
        setFieldValue('attendingWithChildrenUnder3', data.attendingWithChildrenUnder3)
        setFieldValue('attendingWithChildrenUnder3Yes', true)
        setFieldValue('attendingWithChildrenUnder3No', false)
      }
      else if(!data.attendingWithChildrenUnder3) {
        setFieldValue('attendingWithChildrenUnder3', data.attendingWithChildrenUnder3)
        setFieldValue('attendingWithChildrenUnder3Yes', false)
        setFieldValue('attendingWithChildrenUnder3No', true)
      }

      // Campos de fechas y horarios
      if (data.reservationDate) {
        setFieldValue('reservationDate', new Date(data.reservationDate))
      }
      if (data.checkInDateId) {
        setFieldValue('checkInDateId', [String(data.checkInDateId)])
      }

      // Campos de personas por rango de edad
      if (data.totalKidsUnderThree !== undefined) {
        setFieldValue('totalKidsUnderThree', data.totalKidsUnderThree)
      }
      if (data.totalKids !== undefined) {
        setFieldValue('totalKids', data.totalKids)
      }
      if (data.totalTeenagers !== undefined) {
        setFieldValue('totalTeenagers', data.totalTeenagers)
      }
      if (data.totalYoungAdults !== undefined) {
        setFieldValue('totalYoungAdults', data.totalYoungAdults)
      }
      if (data.totalAdults !== undefined) {
        setFieldValue('totalAdults', data.totalAdults)
      }
      if (data.totalSeniors !== undefined) {
        setFieldValue('totalSeniors', data.totalSeniors)
      }
      if (data.totalKidsWithDisabilities !== undefined) {
        if(data.totalKidsWithDisabilities > 0) {
          setFieldValue('totalKidsWithDisabilities', data.totalKidsWithDisabilities)
        }
      }
      if (data.totalTeenagersWithDisabilities !== undefined) {
        if(data.totalTeenagersWithDisabilities > 0) {
          setFieldValue('totalTeenagersWithDisabilities', data.totalTeenagersWithDisabilities)
        }
      }
      if (data.totalYoungAdultsWithDisabilities !== undefined) {
        if(data.totalYoungAdultsWithDisabilities > 0) {
          setFieldValue('totalYoungAdultsWithDisabilities', data.totalYoungAdultsWithDisabilities)
        }
      }
      if (data.totalAdultsWithDisabilities !== undefined) {
        if(data.totalAdultsWithDisabilities > 0) {
          setFieldValue('totalAdultsWithDisabilities', data.totalAdultsWithDisabilities)
        }
      }
      if (data.totalSeniorsWithDisabilities !== undefined) {
        if(data.totalSeniorsWithDisabilities > 0) {
          setFieldValue('totalSeniorsWithDisabilities', data.totalSeniorsWithDisabilities)
        }
      }
      
      // Campo de objetivos de visita
      if (data.visitObjectiveId) {
        // Asegurar que los objetivos estén cargados antes de setear
        if (visitObjectives.value.length === 0) {
          console.log('🔄 Cargando objetivos de visita antes de setear...')
          await loadVisitObjectivesBusiness()
        }
        
        // Buscar el objetivo por ID
        const objective = visitObjectives.value.find(obj => obj.value === data.id)
        console.log('🔍 Buscando objetivo con ID:', data.id)
        console.log('🔍 Objetivos disponibles:', visitObjectives.value)
        console.log('🔍 Objetivo encontrado:', objective)
        
        if (objective) {
          setFieldValue('visitObjectiveId', objective.id)
          console.log('✅ Objetivo seteado:', objective.label)
        } else {
          console.warn('⚠️ No se encontró el objetivo con ID:', data.id)
          // Si no se encuentra, setear el ID como fallback
          setFieldValue('visitObjectiveId', data.visitObjectiveId)
        }
      }

      // Campo de codigo de vinculacion
      if (data.linkingCode !== undefined) {
        setFieldValue('linkingCode', data.linkingCode)
        const response = await getAllLinkingCodes(String(data.linkingCode), true) //Obtiene todo el payload del codigo de vinculacion incluyendo los codigos ya usados para setear la variable que controla el maximo de asistentes del formulario
        console.log(response)
        if(response.length > 0) {
          MAX_PEOPLE_GENERAL_FORM.value = response[0]?.maxTickets || _DEFAULT_MAX_PEOPLE_GENERAL_FORM // Si maxTickets es null entonces asigna el valor por defecto del formulario
        }
      }

      console.log('✅ Formulario actualizado con datos del header')
    }
  }
}, { immediate: true, deep: true })

const onSubmit = handleSubmit(async (values) => {
  console.log('🔍 Formulario Step 1 - Datos enviados:', JSON.stringify(values, null, 2));

  // Validar manualmente el campo visitObjectiveId solo al enviar
  if (!values.visitObjectiveId || values.visitObjectiveId === 0) {
    console.log('❌ Objetivo de la visita no seleccionado')
    return
  }

  try {
    // Mapear datos del formulario a la API
    const apiRequest = mapFormDataToApiRequest(values)
    console.log('🚀 Enviando datos a la API:', apiRequest)

    let result = null

    if(isStepComplete.value(1)) {
      // Modificar reservación usando el composable
      delete apiRequest.linkingCode // Se elimina de la peticion de edicion debido a que el backend no debe de recibir esta propiedad
      result = await updateReservationGeneralStep1(apiRequest)
    }
    else {
      // Crear reservación usando el composable
      result = await createReservationGeneralStep1(apiRequest)
    }

    if (result) {
      console.log('✅ Reservación creada exitosamente:', result)
      isValidToNavigate.value = true // Respuesta exitosa y bloquea el boton de envio previo a la espera en ms de cambio de pantalla
      emit('submit', result) // Pasar el resultado al componente padre

      // Navegar al paso 2 después de un breve delay
      setTimeout(() => {
        isValidToNavigate.value = false // Desbloquea el boton justo antes de cambiar entre pantalla
        emit('navigate-to-step', 2)
      }, 1500)
    }
  } catch (error) {
    console.error('❌ Error al crear reservación:', error)
    // El error ya se maneja en el composable con toast
  }
})

</script>