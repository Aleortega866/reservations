<template>
  <form @submit.prevent="onSubmit" class="space-y-4">
    <!-- Contenido específico para Reservación General -->
    <div class="space-y-4">
      <div>
        <h3 class="text-2xl text-[#3C3C3B] font-semibold">Vincula tu visita</h3>
        <InfoAlert 
          :message-class="'text-[#3C3C3B] font-normal'" 
          message-size="text-sm" 
          message="Para mejorar la experiencia en tu visita al museo te recomendaremos rutas  y material didáctico con base en tu selección de temas de interés."
          class="mt-2"
        />
      </div>

      <div class="space-y-4">

        <FormField v-slot="{ componentField }" name="interestTopicId" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
          <FormItem v-auto-animate>
            <FormLabel class="text-base text-[#3C3C3B] font-medium">Temas de interés</FormLabel>
            <FormControl>
              <OptionListField :model-value="componentField.modelValue" :options="interestTopics"
                placeholder="Por favor, selecciona una opción" label="" @update:model-value="(value) => {
                  console.log('🔄 OptionListField emitió:', value, typeof value)
                  componentField.onChange(value) }" placeholder-font-size="text-base" placeholder-class="placeholder:font-semibold font-medium" options-content-font-size="text-base" />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Separator class="my-8 bg-[#B3B3B3] max-w-3/4 rounded-full mx-auto" />

        <div>
          <h1 class="text-2xl text-[#3C3C3B] font-semibold">Datos del representante de la visita</h1>
          <InfoAlert class="mt-3" :message-class="'text-[#3C3C3B] font-normal'" message-size="text-sm" title="Información" message="Para confirmar su visita y garantizar una comunicación efectiva, proporciona tus datos de contacto. Esto permitirá enviar la confirmación y asegurar una experiencia fluida." />
          <Label class="text-base text-[#3C3C3B] font-medium mt-3 mb-1">¿Quién llena el formulario es el representante de la visita?</Label>

          <div class="flex space-x-8">
            <div class="flex items-center space-x-2">
              <FormField v-slot="{ componentField, handleChange }" name="isReservationPersonAlsoResponsibleSi">
                <FormItem class="mb-1">
                  <FormControl class="py-0.5">
                    <div class="flex space-x-4 py-1">
                      <div class="flex items-center space-x-2 cursor-pointer">
                        <Label for="yes"
                          class="text-base text-[#3C3C3B] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                          Si
                        </Label>
                        <Checkbox id="yes" :class="'rounded-full border-2'" class="w-6 h-6 cursor-pointer" variant="secondary" :model-value="componentField.modelValue"
                          @update:model-value="(checked) => handleIsReservationPersonAlsoResponsibleSi(!!checked, handleChange)" />
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              </FormField>
            </div>
            <div class="flex items-center space-x-2">
              <FormField v-slot="{ componentField, handleChange }" name="isReservationPersonAlsoResponsibleNo">
                <FormItem class="mb-1">
                  <FormControl class="py-0.5">
                    <div class="flex space-x-4 py-1">
                      <div class="flex items-center space-x-2 cursor-pointer">
                        <Label for="no"
                          class="text-base text-[#3C3C3B] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                          No
                        </Label>
                        <Checkbox id="no" :class="'rounded-full border-2'" class="w-6 h-6 cursor-pointer" variant="secondary" :model-value="componentField.modelValue"
                          @update:model-value="(checked) => handleIsReservationPersonAlsoResponsibleNo(!!checked, handleChange)" />
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              </FormField>
            </div>
          </div>
          <!-- MANEJO MANUAL DE ERRORES EN CHECKBOXES isReservationPersonAlsoResponsibleSi Y isReservationPersonAlsoResponsibleNo -->
          <div v-if="errors.isReservationPersonAlsoResponsibleSi || errors.isReservationPersonAlsoResponsibleNo" class="text-sm text-[#DB0000] mt-2.5">
            {{ errors.isReservationPersonAlsoResponsibleSi || errors.isReservationPersonAlsoResponsibleNo }}
          </div>

          <!-- Si isReservationPersonAlsoResponsible en su isReservationPersonAlsoResponsibleSi e isReservationPersonAlsoResponsibleNo ambas estan unselect entonces no se muestran los siguientes campos del representante de la visita -->
          <div v-if="isAnyReservationPersonAlsoResponsibleSelectedOption">
            <FormField v-if="!hasReservationPersonAlsoResponsible" v-slot="{ componentField, handleChange }" name="isResponsibleNotAssigned">
              <FormItem>
                <FormItem class="mt-2.5 mb-1">
                  <FormControl class="py-0.5">
                    <div class="flex space-x-4 py-1">
                      <div class="flex items-center space-x-2 cursor-pointer">
                        <Checkbox id="notassigned" :class="'rounded-full border-2'" class="w-6 h-6 cursor-pointer" variant="secondary" :model-value="componentField.modelValue"
                          @update:model-value="(checked) => handleIsResponsibleNotAssigned(!!checked, handleChange)" />
                        <Label for="notassigned"
                          class="text-base text-[#3C3C3B] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                          Aún no asignado
                        </Label>
                      </div>
                    </div>
                  </FormControl>
                </FormItem>
              </FormItem>
            </FormField>

            <!-- Campos del representante - Se muestran si es "Sí" o "No", pero NO si es "Aún no asignado" -->
            <div v-if="!values.isResponsibleNotAssigned">
              <div class="space-y-2 mt-3">
                <FormField v-slot="{ componentField }" name="fullName">
                  <FormItem>
                    <FormLabel class="text-base text-[#3C3C3B] font-medium">Nombre completo del representante {{ values.isReservationPersonAlsoResponsible ? '(datos auto rellenados)' : '' }}</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Nombre completo" :class="[{ 'cursor-text': !values.isReservationPersonAlsoResponsible }]" class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" v-bind="componentField" :disabled="values.isReservationPersonAlsoResponsible"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>

              <div class="space-y-2 mt-3">
                <FormField v-slot="{ componentField }" name="email">
                  <FormItem>
                    <FormLabel class="text-base text-[#3C3C3B] font-medium">Correo electrónico del representante {{ values.isReservationPersonAlsoResponsible ? '(datos auto rellenados)' : '' }}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="correo@correo.com" :class="[{ 'cursor-text': !values.isReservationPersonAlsoResponsible }]" class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" v-bind="componentField" :disabled="values.isReservationPersonAlsoResponsible"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>

              <div class="space-y-2 mt-3">
                <FormField v-slot="{ componentField }" name="phone">
                  <FormItem>
                    <FormLabel class="text-base text-[#3C3C3B] font-medium">Teléfono del representante a 10 dígitos {{ values.isReservationPersonAlsoResponsible ? '(datos auto rellenados)' : '' }}</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="00 0000 - 0000" :class="[{ 'cursor-text': !values.isReservationPersonAlsoResponsible }]" class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" v-bind="componentField" :disabled="values.isReservationPersonAlsoResponsible"/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                </FormField>
              </div>
            </div>
          </div>
        </div>

        <Separator class="my-8 bg-[#B3B3B3] max-w-3/4 rounded-full mx-auto" />

        <div class="space-y-2">
          <h1 class="text-2xl text-[#3C3C3B] font-semibold">¿De dónde nos visitas?</h1>
          <FormField v-slot="{ componentField, value }" name="whereAreYouVisitingFromId">
            <FormItem>
              <FormLabel class="text-base text-[#3C3C3B] font-medium">Municipio/Delegación/Alcaldia</FormLabel>
              <FormControl>
                <OptionListField
                  placeholder="Busca el municipio/delegación/alcaldía"
                  placeholder-font-size="text-base" 
                  placeholder-class="placeholder:font-semibold font-medium" 
                  options-content-font-size="text-base"
                  :options="municipalityOptions"
                  :model-value="value"
                  :searchable="true"
                  @update:model-value="(value) => {
                    console.log('🔄 OptionListField emitió:', value, typeof value)
                    componentField.onChange(value)
                  }"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <div v-show="hasDisabilityFromAPI" class="space-y-2">
          <FormField v-slot="{ value, handleChange, validate }" name="specialAssistances">
            <FormItem>
              <FormLabel class="text-base text-[#3C3C3B] font-medium">¿Alguna de las personas que te acompañan, o tú, tiene una condición que requiera asistencia o apoyo especial durante la visita?</FormLabel>
              <InfoAlert 
                :message-class="'text-[#3C3C3B] font-normal'" 
                message-size="text-sm" 
                message="En caso afirmativo, selecciona la opción correspondiente:"
                class="mt-2"
              />
              <FormControl>
                <DisabilitySelector placeholder="Por favor, selecciona las opciones que necesites" :categories="disabilityCategories"
                  :model-value="value" @update:model-value="(newValue) => {
                    handleChange(newValue, true)
                    nextTick(() => {
                      setErrors({ specialAssistances: undefined })
                      validate()
                    })
                  }" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

      </div>
    </div>

    <Button :disabled="isUpdating || !isValidForm" type="submit" variant="secondary" :class="[{ 'cursor-pointer': isValidForm }]" class="w-full text-lg font-medium mt-8 py-5">
      <div v-if="isUpdating" class="flex items-center justify-center">
        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          {{ isStepComplete(2) ? 'Guardando cambios...' : 'Guardando...' }}
      </div>
      <span v-else>{{ isStepComplete(2) ? 'Guardar cambios y continuar' : 'Guardar' }}</span>
    </Button>

  </form>
</template>

<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";
import { ref, watch, onMounted, computed, nextTick } from "vue";
import type { Ref, ComputedRef } from 'vue';
import { Separator } from "@/components/ui/separator";
import CheckboxListField from "@/components/common/CheckboxListField.vue";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from '@/components/ui/label'
import ReservationStepHeader from '@/components/reservations/ReservationStepHeader.vue'
import { Icon } from "@iconify/vue";
import { Checkbox } from "@/components/ui/checkbox";
import InfoAlert from "~/components/common/InfoAlert.vue";
import { Button } from '@/components/ui/button'
import OptionListField from "@/components/common/OptionListField.vue";
import DisabilitySelector from "@/components/reservations/formtypes/general/steps/components/DisabilitySelector.vue";
import { useReservationGeneral } from "@/composables/reservations/useReservationGeneral";
import { useReservationGeneralStore } from '@/stores/reservation-general'
import { useReservationStepStatusStore } from "@/stores/reservation-step-status";
import { useReservationStepLoader } from "@/composables/reservations/useReservationStepLoader";
import { useAuthStore } from '@/stores/auth'
import { useAuth } from "@/lib/api/composables/auth";
import { useCatalog } from "@/composables/catalog/useCatalog";
import { useMunicipality } from '@/composables/catalog/useMunicipality'

const props = defineProps({
  type: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  },
  reservationId: {
    type: Number,
    default: null
  },
  headerData: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['next', 'back', 'submit', 'update:generalData', 'navigate-to-step'])

// Store de reservaciones generales
const reservationGeneralStore = useReservationGeneralStore()

// Store de estado de pasos
const stepStatusStore = useReservationStepStatusStore();

// Composable para manejo de autenticación
const { user, isAuthenticated } = useAuth()
const authStore = useAuthStore()

// Composable para manejo de catálogos
const { catalogs, fetchCatalogs, fetchPublicCatalogs } = useCatalog();

// Composable para manejo de municipalidades
const { fetchMunicipalities, searchByMunicipality, municipalityOptions } = useMunicipality();

// Composable para reservaciones generales
const {
  store,
  currentReservationId,
  updateReservationGeneralStep2,
  loadStep2,
  isUpdating,
  error: reservationError,
  isStep2Valid,
  currentReservation,
  checkReservationHasDisability
} = useReservationGeneral()

// Composable para el estado de los pasos
const { isStepComplete } = useReservationStepLoader();

// Variable reactiva para temas de interés
const interestTopics = ref([])

// Variable reactiva para necesidades especiales
const specialAssistances = ref([])

// Variable reactiva para categorías de discapacidades
const disabilityCategories = ref([])

// Variable reactiva para datos generales
const generalData = ref({})

// Bandera para controlar si se están cargando datos del header
const isLoadingHeaderData = ref(false);

// Variable reactiva para verificar si tiene personas con discapacidad desde el endpoint
const hasDisabilityFromAPI = ref(false);

// Función para cargar temas de interés
const loadInterestEconomic = async () => {
  try {
    await fetchPublicCatalogs({ tableName: "SecondaryConcepts" })
    const topics = (catalogs.value || [])
      .filter(t => t.tableName === "SecondaryConcepts" && t.enable)
      .map(({ id, value }) => ({ value: id, label: value, id }))
    interestTopics.value = topics.length ? topics : [{ value: "no_disponible", label: "Opciones no disponibles" }]
  } catch (err) {
    console.error("❌ Error al cargar temas de interés:", err)
    interestTopics.value = [{ value: "no_disponible", label: "Opciones no disponibles" }]
  }
}

const loadSpecialAssistance = async () => {
  try {
    await fetchCatalogs({ tableName: "SpecialAssistance" })
    const data = (catalogs.value || [])
      .filter(c => c.tableName === "SpecialAssistance" && c.enable)
      .map(({ id, value }) => ({ value: id, label: value, id }))
    specialAssistances.value = data.length ? data : [{ value: "no_disponible", label: "Opciones no disponibles" }]
  } catch (err) {
    console.error("❌ Error al cargar necesidades especiales:", err)
    specialAssistances.value = [{ value: "no_disponible", label: "Opciones no disponibles" }]
  }
}

const loadDisabilityCategories = async () => {
  try {
    await fetchCatalogs({ tableName: "SpecialAssistance" })
    const disabilities = (catalogs.value || []).filter(c => c.tableName === "SpecialAssistance" && c.enable)
    const categoriesMap = {
      movilidad: { id: "movilidad", name: "Movilidad reducida", subcategories: [] },
      visual: { id: "visual", name: "Discapacidad visual", subcategories: [] },
      auditiva: { id: "auditiva", name: "Discapacidad auditiva", subcategories: [] },
      cognitiva: { id: "cognitiva", name: "Discapacidad cognitiva", subcategories: [] },
      salud: { id: "salud", name: "Condición de salud", subcategories: [] },
      otro: { id: "otro", name: "Otro (especificar)", subcategories: [] }
    }
    const patterns = [
      { key: "Movilidad reducida", target: "movilidad" },
      { key: "Discapacidad visual", target: "visual" },
      { key: "Discapacidad auditiva", target: "auditiva" },
      { key: "Discapacidad cognitiva", target: "cognitiva", startsWith: true },
      { key: "Condición de salud", target: "salud", startsWith: true },
      { key: "Otro", target: "otro", startsWith: true }
    ]
    disabilities.forEach(d => {
      const item = { id: d.id, name: d.value, description: d.description, disabled: !d.enable }
      const match = patterns.find(p => p.startsWith ? d.value.startsWith(p.key) : d.value === p.key)
      if (match) categoriesMap[match.target].subcategories.push(item)
    })
    disabilityCategories.value = Object.values(categoriesMap).flatMap(cat =>
      cat.subcategories.length === 1 ? [{ ...cat.subcategories[0] }] :
        cat.subcategories.length > 1 ? [cat] : []
    )
  } catch (err) {
    console.error("❌ Error al cargar categorías de discapacidades:", err)
    disabilityCategories.value = []
  }
}

// Función para actualizar datos
const updateGeneralData = (updates) => {
  Object.assign(generalData.value, updates)
}

// Función helper para verificar si hay discapacidad (usada en validación y mapeo)
const checkHasDisability = () => {
  // Verificar desde hasDisabilityFromAPI si está disponible
  if (hasDisabilityFromAPI.value !== null && hasDisabilityFromAPI.value !== undefined) {
    return hasDisabilityFromAPI.value;
  }

  // Fallback: Calcular desde datos locales
  const step1Data = stepStatusStore.stepStatus[1]?.data || currentReservation.value;

  if (step1Data) {
    return (
      step1Data.totalYoungAdultsWithDisabilities > 0 ||
      step1Data.totalAdultsWithDisabilities > 0 ||
      step1Data.totalSeniorsWithDisabilities > 0
    );
  }

  return false;
};

// Función para mapear datos del formulario al formato del API
const mapFormDataToApiRequest = (formData) => {
  const hasDisability = checkHasDisability();
  console.log("🔍 mapFormDataToApiRequest - hasDisability:", hasDisability);
  console.log(
    "🔍 mapFormDataToApiRequest - formData.specialAssistances:",
    formData.specialAssistances
  );
  return {
    reservationId: parseInt(String(props?.reservationId)),
    interestTopicId: formData.interestTopicId || null,
    isReservationPersonAlsoResponsible: formData.isReservationPersonAlsoResponsible || false,
    isResponsibleNotAssigned: formData.isResponsibleNotAssigned || false,
    fullName: formData.fullName || null,
    email: formData.email || null,
    phone: formData.phone || null,
    whereAreYouVisitingFromId: formData.whereAreYouVisitingFromId || null,
    specialAssistances: 
      hasDisability && formData.specialAssistances && formData.specialAssistances.length > 0
        ? formData.specialAssistances
        : [],
  }
}

const formSchema = toTypedSchema(
  z.object({
    interestTopicId: z.coerce.number().int().nullable(),
    isReservationPersonAlsoResponsible: z.boolean().default(true),
    isReservationPersonAlsoResponsibleSi: z.boolean().default(true),
    isReservationPersonAlsoResponsibleNo: z.boolean().default(false),
    isResponsibleNotAssigned: z.boolean().default(false),
    fullName: z.string().trim().nullable().optional(),
    email: z.string().trim().email('Por favor, ingresa un correo electrónico válido').nullable().optional(),
    phone: z.string().trim().regex(/^(?:\+\d{10,15}|\d{10})$/, 'Por favor, ingresa un número de teléfono válido').nullable().optional(),
    whereAreYouVisitingFromId: z.coerce.number().int().nullable(),
    specialAssistances: z.array(z.any()).optional(),
  }).superRefine((data, ctx) => {

    
  // Validación: isReservationPersonAlsoResponsibleSi o isReservationPersonAlsoResponsibleNo debe ser true
  if (!data.isReservationPersonAlsoResponsibleSi && !data.isReservationPersonAlsoResponsibleNo) {
    ctx.addIssue({
      path: ['isReservationPersonAlsoResponsibleSi'],
      code: z.ZodIssueCode.custom,
      message: 'Debes seleccionar al menos una opción relacionada con el representante de la visita.',
    });
    ctx.addIssue({
      path: ['isReservationPersonAlsoResponsibleNo'],
      code: z.ZodIssueCode.custom,
      message: 'Debes seleccionar al menos una opción relacionada con el representante de la visita.',
    })
  }
    


    const condition = (!data.isResponsibleNotAssigned && data.isReservationPersonAlsoResponsibleNo) || (data.isResponsibleNotAssigned && data.isReservationPersonAlsoResponsibleSi)
    
    if (condition) {
      if (!data.fullName) {
        ctx.addIssue({
          path: ['fullName'],
          code: z.ZodIssueCode.custom,
          message: 'Por favor, ingresa el nombre del representante',
        });
      }

      if (!data.email) {
        ctx.addIssue({
          path: ['email'],
          code: z.ZodIssueCode.custom,
          message: 'Por favor, ingresa un correo electrónico válido',
        });
      }

      if (!data.phone) {
        ctx.addIssue({
          path: ['phone'],
          code: z.ZodIssueCode.custom,
          message: 'Por favor, ingresa un número de teléfono válido',
        });
      }

    }

    // Validar necesidades especiales solo si hay personas con discapacidad
    if (data.specialAssistances !== undefined && data.specialAssistances.length === 0) {
      if(hasDisabilityFromAPI.value) {
        ctx.addIssue({
          code: "custom",
          message: "Por favor selecciona al menos una condición de asistencia especial",
          path: ["specialAssistances"],
        });
      }
    }
  })
);

const { handleSubmit, errors, setFieldValue, setErrors, validateField, values, meta } = useForm({
  // Evitar validación inicial automática para no mostrar errores antes de interactuar
  validateOnMount: false,
  // Configurar valores iniciales
  validationSchema: formSchema,
  initialValues: {
    interestTopicId: null,
    isReservationPersonAlsoResponsible: true,
    isReservationPersonAlsoResponsibleSi: true,
    isReservationPersonAlsoResponsibleNo: false,
    isResponsibleNotAssigned: false,
    fullName: null,
    email: null,
    phone: null,
    whereAreYouVisitingFromId: null,
    specialAssistances: [],
  }
});

// Accedemos al valor real del formulario para isReservationPersonAlsoResponsible
const hasReservationPersonAlsoResponsible = computed(() => {
  return !!values?.isReservationPersonAlsoResponsible || false;
});

// Indica si se deben mostrar los datos del representante de la visita dependiendo de si hay al menos una opcion seleccionada de "Si/No"
const isAnyReservationPersonAlsoResponsibleSelectedOption = computed(() => {
  return (!!values?.isReservationPersonAlsoResponsibleSi || !!values?.isReservationPersonAlsoResponsibleNo) || false;
});

// Si hay un usuario, devuelve un objeto con shape del schema form con data del usuario autenticado. Si no, devuelve este shape con datos vacios string ''
const getReservationPersonAlsoResponsibleUserInformation = (currentUser:any):Record<string, any>|null => {
  if(!currentUser) return null
  // Construir el nombre completo a partir de las propiedades disponibles
  const fullName = currentUser.name ? `${currentUser.name} ${currentUser.paternalLastName || ''} ${currentUser.maternalLastName || ''}`.trim() : null
  const userData = {
    fullName: fullName,
    email: currentUser.email || null,
    phone: currentUser.phoneNumber || null
  }
  return userData
}

// Indica si el esquema/form del paso 2 es valido o no
const isValidForm: ComputedRef<boolean> = computed(() => meta.value.valid && !meta.value.pending)

// Setea los campos del representante de la visita con los datos enviados o en su defecto con datos vacios string ''
const setReservationPersonAlsoResponsibleUserInformation = (userData?:any) => {
  if(userData) {
    // Llenar los campos primero
    setFieldValue('fullName', userData.fullName);
    setFieldValue('email', userData.email);
    setFieldValue('phone', userData.phone);
  } 
  else {
    // Limpiar los campos
    setFieldValue('fullName', null);
    setFieldValue('email', null);
    setFieldValue('phone', null);
  }
}

// Función independiente para manejar el checkbox "Si" (mismo responsable)
const handleIsReservationPersonAlsoResponsibleSi = (checked: boolean, handleChange: Function) => {
  handleChange(checked);

  setFieldValue('isReservationPersonAlsoResponsibleNo', false);
  setFieldValue('isReservationPersonAlsoResponsible', true);
  setFieldValue('isResponsibleNotAssigned', false);

  // Llenar con datos del usuario si está disponible
  const userData = getReservationPersonAlsoResponsibleUserInformation(authStore.user || user.value);
  
  if (userData) {
    // Llenar los campos primero
    setReservationPersonAlsoResponsibleUserInformation(userData)

    updateGeneralData(userData);
    // Solo validar los campos del representante después de llenarlos
    nextTick(() => {
      setErrors({ fullName: undefined });
      setErrors({ email: undefined });
      setErrors({ phone: undefined });
      validateField('fullName');
      validateField('email');
      validateField('phone');
    });
  }
}

// Función independiente para manejar el checkbox "No" (diferente responsable)
const handleIsReservationPersonAlsoResponsibleNo = (checked: boolean, handleChange: Function) => {
  handleChange(checked);

  setFieldValue('isReservationPersonAlsoResponsibleSi', false);
  setFieldValue('isReservationPersonAlsoResponsible', false);
  setFieldValue('isResponsibleNotAssigned', false); // Duda quitar. Probar

  // Limpiar los campos
  setReservationPersonAlsoResponsibleUserInformation()

  updateGeneralData({
    fullName: null,
    email: null,
    phone: null
  });
  // Validar los campos después de limpiarlos
  nextTick(() => {
    setErrors({ fullName: undefined });
    setErrors({ email: undefined });
    setErrors({ phone: undefined });
    validateField('fullName');
    validateField('email');
    validateField('phone');
  });
}

// Función independiente para manejar el checkbox de "Aun no asignado"
const handleIsResponsibleNotAssigned = (checked: boolean, handleChange: Function) => {
  handleChange(checked)
  // Validar los campos después de limpiarlos
  nextTick(() => {
    setErrors({ fullName: undefined });
    setErrors({ email: undefined });
    setErrors({ phone: undefined });
    validateField('fullName');
    validateField('email');
    validateField('phone');
  });
}

 // Función para manejar el envío del formulario
 const onSubmit =  handleSubmit(async (formValues) => {
    
    try {      

      // Verificar si se están cargando datos del header
      if (isLoadingHeaderData.value) {
        console.log("⚠️ Formulario bloqueado - cargando datos del header");
        return;
      }

      // Imprimir valores actuales en consola
      console.log('=== VALORES DEL FORMULARIO PASO 2 ===')
      console.log('Tipo de reservación:', props.type)
      console.log('Datos generales:', props.data)
      console.log('Datos de reservación general:', generalData.value)
      console.log('Reservación actual:', currentReservation.value)
      console.log('ID de reservación actual:', store.currentReservationId)
      console.log('Store completo:', store)
      console.log('=====================================')
      
      console.log('✅ Formulario válido - Enviando datos al servidor')

      console.log('🔍 Formulario Step 2 - Datos enviados:', JSON.stringify(formValues, null, 2));
      
      // Verificar que hay una reservación activa
      if (!currentReservation.value && !store.currentReservationId) {
        console.error('❌ No hay una reservación activa')
        console.log('Error: No hay una reservación activa. Por favor regresa al paso 1.')
        return
      }
      
      // Si tenemos ID pero no el objeto completo, intentar cargar los datos
      if (!currentReservation.value && store.currentReservationId) {
        console.log('🔄 Cargando datos de la reservación desde el servidor...')
        try {
          const loaded = await loadStep2(store.currentReservationId)
          if (!loaded) {
            console.error('❌ No se pudieron cargar los datos de la reservación')
            console.log('Error: No se pudieron cargar los datos de la reservación. Por favor regresa al paso 1.')
            return
          }
        } catch (error) {
          console.error('❌ Error al cargar datos de la reservación:', error)
          console.log('Error al cargar los datos de la reservación. Por favor regresa al paso 1.')
          return
        }
      }
      // Mapear datos del formulario al formato del API
      const apiRequest = mapFormDataToApiRequest(formValues)
      
      // Actualizar los datos en el store antes de enviar
      store.updateFormData({
        reservationId: apiRequest.reservationId,
        interestTopicId: apiRequest.interestTopicId,
        isReservationPersonAlsoResponsible: apiRequest.isReservationPersonAlsoResponsible,
        isResponsibleNotAssigned: apiRequest.isResponsibleNotAssigned,
        fullName: apiRequest.fullName,
        email: apiRequest.email,
        phone: apiRequest.phone,
        whereAreYouVisitingFromId: apiRequest.whereAreYouVisitingFromId,
        specialAssistances: apiRequest.specialAssistances
      })
      
      // Llamar al endpoint PUT usando el composable
      const result = await updateReservationGeneralStep2()
      
      if (result) {
        console.log('✅ Paso 2 actualizado exitosamente:', result)
        
        // Emitir evento con los datos del formulario
        emit('submit', {
          type: props.type,
          data: props.data,
          generalData: formValues,
          reservation: result
        })
        
        // También emitir el evento next para continuar al siguiente paso
        emit('next')
      } else {
        console.error('❌ Error al actualizar el paso 2')
        console.log('Error al guardar los datos. Por favor intenta de nuevo.')
      }
      
    } catch (error) {
      console.error('❌ Error al procesar formulario:', error)
      console.log('Error al procesar el formulario. Por favor intenta de nuevo.')
    }
})

onMounted(async () => {

  // Llenar con datos del usuario si está disponible
  const userData = getReservationPersonAlsoResponsibleUserInformation(authStore.user || user.value);
  if (userData) {
    // Llenar los campos primero
    setReservationPersonAlsoResponsibleUserInformation(userData)
  }

  // Cargar catálogos
  await Promise.all([
    loadInterestEconomic(),
    fetchMunicipalities(),
    loadSpecialAssistance(),
    loadDisabilityCategories(),
  ])
  
  // Si tenemos ID de reservación pero no el objeto completo, cargarlo
  if (store.currentReservationId && !currentReservation.value) {
    console.log('🔄 Inicializando reservación desde ID persistido:', store.currentReservationId)
    try {
      const loaded = await loadStep2(store.currentReservationId)
      if (loaded) {
        console.log('✅ Reservación cargada exitosamente en onMounted')
        console.log('✅ currentReservation después de cargar:', currentReservation.value)
      } else if (loaded === false) {
        console.log("ℹ️ Carga omitida (ya está cargándose o se cargó recientemente)");
      } else {
        console.error('❌ No se pudo cargar la reservación en onMounted')
      }
    } catch (error) {
      console.error('❌ Error al cargar reservación en onMounted:', error)
    }
  } else if (currentReservation.value) {
    console.log('✅ Reservación ya disponible en onMounted:', currentReservation.value)
  } else {
    console.log('⚠️ No hay ID de reservación disponible en onMounted')
  }

  // Verificar si la reservación tiene personas con discapacidad desde el endpoint
  if (store.currentReservationId) {
    console.log("🔄 Verificando si la reservación tiene personas con discapacidad...");
    try {
      const hasDisability = await checkReservationHasDisability(store.currentReservationId);
      hasDisabilityFromAPI.value = hasDisability;
      console.log("✅ Resultado de verificación de discapacidad:", hasDisability);
    } catch (error) {
      console.error("❌ Error al verificar discapacidad:", error);
      hasDisabilityFromAPI.value = false;
    }
  }

});

// Watcher para detectar data enviada desde el header (igual que en Step 1)
watch(() => props.headerData, async (newHeaderData) => {
    console.log("🔍 Step 2 - Watcher headerData ejecutado:", newHeaderData);
    console.log("🔍 Step 2 - props.headerData:", props.headerData);

    if (newHeaderData && Object.keys(newHeaderData).length > 0) {
      console.log("📥 Data enviada desde el header en Step 2:", newHeaderData);
      console.log("🔍 newHeaderData.step:", newHeaderData.step);
      console.log("🔍 newHeaderData.data:", newHeaderData.data);

      // Si hay data del paso 2, actualizar el formulario
      if (newHeaderData.step === 2 && newHeaderData.data) {
        // Activar bandera para evitar validación automática
        isLoadingHeaderData.value = true;
        console.log(
          "🔄 Actualizando formulario Step 2 con data del header:",
          newHeaderData.data
        );
        console.log("🔍 Datos específicos del paso 2:", {
          interestTopicId: newHeaderData.data.interestTopicId,
          isReservationPersonAlsoResponsible: newHeaderData.data.isReservationPersonAlsoResponsible,
          isResponsibleNotAssigned: newHeaderData.data.isResponsibleNotAssigned,
          fullName: newHeaderData.data.fullName,
          email: newHeaderData.data.email,
          phone: newHeaderData.data.phone,
          whereAreYouVisitingFromId: newHeaderData.data.whereAreYouVisitingFromId,
          specialAssistances: newHeaderData.data.specialAssistances
        });

        console.log("🔍 Datos completos recibidos:", newHeaderData.data);

        const data = newHeaderData.data;

        // Mapear los datos del header a los campos del formulario del Step 2
        // Temas de interes
        if (data.interestTopicId !== undefined && data.interestTopicId !== null) {
          // Asegurar que los temas estén cargados antes de setear
          if (interestTopics.value.length === 0) {
            console.log("🔄 Cargando temas de interés antes de setear...");
            await loadInterestEconomic();
          }
          // Buscar el tema de interés por ID
          const interestEconomic = interestTopics.value.find((i) => i.id === data.interestTopics);
          console.log("🔍 Buscando tema de interés con ID:", data.interestTopicId);
          console.log("🔍 Temas de interés disponibles:", interestTopics.value);
          console.log("🔍 Tema de interés encontrado:", interestEconomic);

          if (interestEconomic) {
            setFieldValue("interestTopicId", interestEconomic.value);
            console.log("✅ Tema de interés seteado:", interestEconomic.label);
            console.log("🔍 Verificando setFieldValue - interestTopicId:",values.interestTopicId);
          } else {
            console.warn("⚠️ No se encontró el tema de interés con ID:", data.interestTopicId);
            setFieldValue("interestTopicId", data.interestTopicId);
            console.log("🔍 Verificando setFieldValue - interestTopicId (fallback):", values.interestTopicId);
          }
        }

        // Datos del representante
        if (data.isReservationPersonAlsoResponsible !== undefined && data.isReservationPersonAlsoResponsible !== null) {
          setFieldValue("isReservationPersonAlsoResponsible", data.isReservationPersonAlsoResponsible);
          setFieldValue("isReservationPersonAlsoResponsibleSi", data.isReservationPersonAlsoResponsible);
          setFieldValue("isReservationPersonAlsoResponsibleNo",!data.isReservationPersonAlsoResponsible);
          if(data.isReservationPersonAlsoResponsible === false) { // Se agrega esta condicion para validar el flujo de API donde todas las banderas sean false. Como onMounted setea por defecto estos campos al usuario autenticado entonces hay que setear bien de nuevo estos campos de acuerdo a la espuesta API
            setFieldValue("fullName", null);
            setFieldValue("email", null);
            setFieldValue("phone", null);
          }
          console.log("✅ Datos de responsable seteados:", {
            isReservationPersonAlsoResponsible: data.isReservationPersonAlsoResponsible,
            isReservationPersonAlsoResponsibleSi: data.isReservationPersonAlsoResponsible,
            isReservationPersonAlsoResponsibleNo: !data.isReservationPersonAlsoResponsible,
          });
        }

        if (data.isResponsibleNotAssigned !== undefined && data.isResponsibleNotAssigned !== null) {
          setFieldValue("isResponsibleNotAssigned", data.isResponsibleNotAssigned);
          console.log("✅ isResponsibleNotAssigned seteado:", data.isResponsibleNotAssigned);
        }

        if (data.fullName && data.fullName !== null && data.fullName !== undefined) {
          setFieldValue("fullName", data.fullName);
          console.log("✅ fullName seteado:", data.fullName);
        }

        if (data.email && data.email !== null && data.email !== undefined) {
          setFieldValue("email", data.email);
          console.log("✅ email seteado:", data.email);
        }

        if (data.phone && data.phone !== null && data.phone !== undefined) {
          setFieldValue("phone", data.phone);
          console.log("✅ phone seteado:", data.phone);
        }

        // De donde nos visitas (municipalidades)
        if (data.whereAreYouVisitingFromId !== undefined && data.whereAreYouVisitingFromId !== null) {
          // Asegurar que los temas estén cargados antes de setear
          if (municipalityOptions.value.length === 0) {
            console.log("🔄 Cargando municipios antes de setear...");
            await fetchMunicipalities();
          }
          // Buscar el municipio por ID
          const municipality = municipalityOptions.value.find((m) => m.id === data.whereAreYouVisitingFromId);
          console.log("🔍 Buscando municipio con ID:", data.whereAreYouVisitingFromId);
          console.log("🔍 Municipios disponibles:", municipalityOptions.value);
          console.log("🔍 Municipio encontrado:", municipality);

          if (municipality) {
            setFieldValue("whereAreYouVisitingFromId", municipality.value);
            console.log("✅ Municipio seteado:", municipality.label);
            console.log("🔍 Verificando setFieldValue - whereAreYouVisitingFromId:",values.whereAreYouVisitingFromId);
          } else {
            console.warn("⚠️ No se encontró el municipio con ID:", data.whereAreYouVisitingFromId);
            setFieldValue("whereAreYouVisitingFromId", data.whereAreYouVisitingFromId);
            console.log("🔍 Verificando setFieldValue - whereAreYouVisitingFromId (fallback):", values.whereAreYouVisitingFromId);
          }
        }

        // Necesidades especiales
        if (data.specialAssitances && Array.isArray(data.specialAssitances)) {
          setFieldValue("specialAssistances", data.specialAssitances);
          console.log("✅ specialAssistances seteado:", data.specialAssistances);
        }

        console.log("✅ Formulario Step 2 actualizado con datos del header");
        console.log("🔍 Valores finales del formulario:", {
          interestTopicId: values.interestTopicId,
          isReservationPersonAlsoResponsible: values.isReservationPersonAlsoResponsible,
          isResponsibleNotAssigned: values.isResponsibleNotAssigned,
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          whereAreYouVisitingFromId: values.whereAreYouVisitingFromId,
          specialAssistances: values.specialAssistances
        });

        // Desactivar bandera después de cargar datos
        isLoadingHeaderData.value = false;
      }
    }
  },
  { immediate: true, deep: true }
);
</script>