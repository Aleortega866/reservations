<template>
  <form @submit.prevent="onSubmit" class="space-y-4">
    <div class="space-y-2 mb-4">
      <FormField v-slot="{}" name="institution">
        <FormItem>
          <FormLabel class="text-sm font-medium mb-1">Nombre de Institución</FormLabel>
          <!-- Selector de instituciones -->
          <ClientOnly>
            <template #fallback>
              <div class="py-3 px-4 bg-secondary/10 rounded-full">
                <div class="flex items-center justify-between">
                  <span class="text-sm">Cargando instituciones...</span>
                </div>
              </div>
            </template>
            <div>
              <div
                class="py-3 px-4 bg-secondary/10 cursor-pointer hover:bg-muted/80 transition-colors mb-0"
                :class="[
                  showInstitutionSelector ? 'rounded-t-md' : 'rounded-full',
                  selectedInstitution ? 'bg-primary/40 border-primary/20' : '',
                ]"
                @click="toggleInstitutionSelector"
              >
                <div class="flex items-center justify-between">
                  <span
                    class="text-sm"
                    :class="selectedInstitution ? 'font-semibold' : 'font-normal'"
                    >{{ institutionHeaderText }}</span
                  >
                  <Icon v-if="showInstitutionSelector" icon="mdi:chevron-down-up" />
                  <Icon v-else icon="mdi:chevron-up-down" />
                </div>
              </div>
              <div
                v-if="showInstitutionSelector"
                ref="institutionSelector"
                class="mt-0 space-y-0 border border-t-0 border-muted rounded-b-md"
              >
                <!-- Botón para agregar nueva institución -->
                <div class="p-0 bg-background border-b border-muted">
                  <AddInstitutionDialog @add-institutions="addInstitution">
                    <template #trigger>
                      <div
                        class="bg-primary/20 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors px-3 py-3"
                      >
                        <span class="text-sm text-primary">
                          Agregar nueva institución
                        </span>
                        <Icon icon="gridicons:add" class="w-6 h-6 text-primary" />
                      </div>
                    </template>
                  </AddInstitutionDialog>
                </div>

                <!-- Indicador de carga -->
                <div v-if="institutionLoading" class="px-4 py-3 text-center">
                  <div class="flex items-center justify-between space-x-2">
                    <span class="text-sm text-muted-foreground"
                      >Cargando instituciones...</span
                    >
                  </div>
                </div>

                <!-- Lista de instituciones -->
                <div v-else-if="institutions.length === 0" class="px-4 py-3 text-center">
                  <span class="text-sm text-muted-foreground"
                    >No hay instituciones disponibles</span
                  >
                </div>

                <div
                  v-else
                  v-for="(inst, index) in institutions"
                  :key="getOptionKey(inst.institutionName || '')"
                  :class="getInstitutionRowClasses(index, inst.institutionName)"
                >
                  <div
                    class="flex items-center justify-between"
                    @click="selectInstitution(inst)"
                  >
                    <span
                      class="text-sm"
                      :class="getInstitutionNameClasses(inst.institutionName)"
                    >
                      {{ inst.institutionName }}
                    </span>
                    <div
                      v-if="selectedInstitution === inst.institutionName"
                      class="flex items-center space-x-2"
                    >
                      <Icon icon="mdi:check-circle" class="w-4 h-4 text-primary" />
                      <span class="text-xs text-primary font-medium">Seleccionada</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ClientOnly>

          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <!-- Mostrar el resto de campos solo cuando se haya seleccionado una institución -->
    <Transition name="fade" appear>
      <div v-if="selectedInstitution" class="space-y-4">
        <Separator class="my-10 bg-muted max-w-3/4 mx-auto" />

        <h3 class="text-xl font-normal tracking-wide mb-2">Numero de asistentes</h3>

        <InfoAlert
          class="mt-2"
          :message-class="'not-italic'"
          :message-size="'text-sm'"
          message="Deja vacíos los campos que no aplique para tu visita."
        />

        <!-- Dropdown para niños -->
        <DropdownContent
          :show-options="showKidsDropdown"
          :dropdowncounter="values.totalKids || 0"
          @toggle-options-from-child="toggleKidsDropdown"
          :dropdowntitleclass="['text-sm font-medium mb-2']"
          :dropdownplaceholderclass="['bg-secondary/10 hover:bg-secondary/20']"
          :dropdowncontentclass="['p-3 bg-secondary/10 hover:bg-secondary/20']"
          class="mb-3"
        >
          <template #dropdownplaceholder>
            <span class="text-lg font-medium">Niños y niñas (De 4 a 14 años)</span>
          </template>

          <template #dropdowncontent>
            <div class="p-3 bg-white border border-border rounded-xl space-y-0">
              <FormField v-slot="{ componentField }" name="totalKids">
                <FormItem>
                  <FormLabel class="text-sm font-medium">Número de Niños</FormLabel>
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      type="number"
                      placeholder="Ingrese el número de niños"
                      class="bg-muted border-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>
              <p class="text-sm mt-2 mb-3">
                Del total de niños y niñas, que ingresaste anteriormente, por favor
                ingresa cuantos que pertenecen a los siguientes grupos:
              </p>
              <FormField v-slot="{ componentField }" name="totalKidsDisability">
                <FormItem>
                  <FormLabel class="text-sm font-medium"
                    >Personas con discapacidad</FormLabel
                  >
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      type="number"
                      placeholder="Ingrese el número de niños con discapacidad"
                      class="bg-muted border-0"
                    />
                  </FormControl>
                  <FormDescription> </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
          </template>
        </DropdownContent>

        <!-- Dropdown para adolescentes -->
        <DropdownContent
          :show-options="showAdolescentsDropdown"
          :dropdowncounter="values.totalAdolescents || 0"
          @toggle-options-from-child="toggleAdolescentsDropdown"
          :dropdowntitleclass="['text-sm font-medium mb-2']"
          :dropdownplaceholderclass="['bg-secondary/10 hover:bg-secondary/20']"
          :dropdowncontentclass="['p-3 bg-secondary/10 hover:bg-secondary/20']"
          class="mb-3"
        >
          <template #dropdownplaceholder>
            <span class="text-lg font-medium">Adolescentes (De 15 a 17 años)</span>
          </template>

          <template #dropdowncontent>
            <div class="p-3 bg-white border border-border rounded-xl space-y-0">
              <FormField v-slot="{ componentField }" name="totalAdolescents">
                <FormItem>
                  <FormLabel class="text-sm font-medium"
                    >Número de Adolescentes</FormLabel
                  >
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      type="number"
                      placeholder="Ingrese el número de adolescentes"
                      class="bg-muted border-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <p class="text-sm mt-2 mb-3">
                Del total de adolescentes, que ingresaste anteriormente, por favor ingresa
                cuantos que pertenecen a los siguientes grupos:
              </p>
              <FormField v-slot="{ componentField }" name="totalAdolescentsDisability">
                <FormItem>
                  <FormLabel class="text-sm font-medium"
                    >Personas con discapacidad</FormLabel
                  >
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      type="number"
                      placeholder="Ingrese el número de adolescentes con discapacidad"
                      class="bg-muted border-0"
                    />
                  </FormControl>
                  <FormDescription> </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
          </template>
        </DropdownContent>

        <!-- Dropdown para jovenes -->
        <DropdownContent
          :show-options="showYouthDropdown"
          :dropdowncounter="values.totalYouth || 0"
          @toggle-options-from-child="toggleYouthDropdown"
          :dropdowntitleclass="['text-sm font-medium mb-2']"
          :dropdownplaceholderclass="['bg-secondary/10 hover:bg-secondary/20']"
          :dropdowncontentclass="['p-3 bg-secondary/10 hover:bg-secondary/20']"
          class="mb-3"
        >
          <template #dropdownplaceholder>
            <span class="text-lg font-medium">Jovenes (De 18 a 24 años)</span>
          </template>

          <template #dropdowncontent>
            <div class="p-3 bg-white border border-border rounded-xl space-y-0">
              <FormField v-slot="{ componentField }" name="totalYouth">
                <FormItem>
                  <FormLabel class="text-sm font-medium">Número de Jovenes</FormLabel>
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      type="number"
                      placeholder="Ingrese el número de jóvenes"
                      class="bg-muted border-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <p class="text-sm mt-2 mb-3">
                Del total de jovenes, que ingresaste anteriormente, por favor ingresa
                cuantos que pertenecen a los siguientes grupos:
              </p>
              <FormField v-slot="{ componentField }" name="totalYouthDisability">
                <FormItem>
                  <FormLabel class="text-sm font-medium"
                    >Personas con discapacidad</FormLabel
                  >
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      type="number"
                      placeholder="Ingrese el número de jovenes con discapacidad"
                      class="bg-muted border-0"
                    />
                  </FormControl>
                  <FormDescription> </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
          </template>
        </DropdownContent>

        <!-- Dropdown para adultos -->
        <DropdownContent
          :show-options="showAdultsDropdown"
          :dropdowncounter="values.totalAdults || 0"
          @toggle-options-from-child="toggleAdultsDropdown"
          :dropdowntitleclass="['text-sm font-medium mb-2']"
          :dropdownplaceholderclass="['bg-secondary/10 hover:bg-secondary/20']"
          :dropdowncontentclass="['p-3 bg-secondary/10 hover:bg-secondary/20']"
          class="mb-3"
        >
          <template #dropdownplaceholder>
            <span class="text-lg font-medium">Adultos (De 25 a 59 años)</span>
          </template>

          <template #dropdowncontent>
            <div class="p-3 bg-white border border-border rounded-xl space-y-0">
              <FormField v-slot="{ componentField }" name="totalAdults">
                <FormItem>
                  <FormLabel class="text-sm font-medium">Número de Adultos</FormLabel>
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      type="number"
                      placeholder="Ingrese el número de adultos"
                      class="bg-muted border-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <p class="text-sm mt-2 mb-3">
                Del total de adultos, que ingresaste anteriormente, por favor ingresa
                cuantos que pertenecen a los siguientes grupos:
              </p>
              <FormField v-slot="{ componentField }" name="totalAdultsDisability">
                <FormItem>
                  <FormLabel class="text-sm font-medium"
                    >Personas con discapacidad</FormLabel
                  >
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      type="number"
                      placeholder="Ingrese el número de adultos con discapacidad"
                      class="bg-muted border-0"
                    />
                  </FormControl>
                  <FormDescription> </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
          </template>
        </DropdownContent>

        <!-- Dropdown para adultos mayores -->
        <DropdownContent
          :show-options="showSeniorsDropdown"
          :dropdowncounter="values.totalSeniors || 0"
          @toggle-options-from-child="toggleSeniorsDropdown"
          :dropdowntitleclass="['text-sm font-medium mb-2']"
          :dropdownplaceholderclass="['bg-secondary/10 hover:bg-secondary/20']"
          :dropdowncontentclass="['p-3 bg-secondary/10 hover:bg-secondary/20']"
          class="mb-3"
        >
          <template #dropdownplaceholder>
            <span class="text-lg font-medium">Adultos Mayores (De 60 años o más)</span>
          </template>

          <template #dropdowncontent>
            <div class="p-3 bg-white border border-border rounded-xl space-y-0">
              <FormField v-slot="{ componentField }" name="totalSeniors">
                <FormItem>
                  <FormLabel class="text-sm font-medium"
                    >Número de Adultos Mayores</FormLabel
                  >
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      type="number"
                      placeholder="Ingrese el número de adultos mayores"
                      class="bg-muted border-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              </FormField>

              <p class="text-sm mt-2 mb-3">
                Del total de adultos mayores, que ingresaste anteriormente, por favor
                ingresa cuantos que pertenecen a los siguientes grupos:
              </p>
              <FormField v-slot="{ componentField }" name="totalSeniorsDisability">
                <FormItem>
                  <FormLabel class="text-sm font-medium"
                    >Personas con discapacidad</FormLabel
                  >
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      type="number"
                      placeholder="Ingrese el número de adultos mayores con discapacidad"
                      class="bg-muted border-0"
                    />
                  </FormControl>
                  <FormDescription> </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>
            </div>
          </template>
        </DropdownContent>

        <!-- Mensaje de descuento especial -->
        <div class="flex items-center space-x-2 my-2">
          <Icon icon="mage:megaphone-a" width="185" height="50" class="text-accent" />
          <p class="text-base font-normal">
            ¡Descuento especial! Te recordamos que si eres estudiante o maestro y
            presentas tu credencial vigente en la taquilla, ¡obtendrás un descuento en tu
            entrada! No olvides traer tu identificación.
          </p>
        </div>
        <Separator class="my-10 bg-muted max-w-3/4 mx-auto" />

        <h1 class="text-xl font-normal tracking-wide mb-2">Agenda tu visita</h1>

        <FormField v-slot="{ componentField }" name="visitDate">
          <FormItem>
            <FormLabel class="text-sm font-medium">Fecha de visita</FormLabel>
            <FormControl>
              <CalendarField
                :model-value="componentField.modelValue"
                show-availability
                label=""
                placeholder="Selecciona una fecha de visita"
                :required="false"
                @update:model-value="componentField.onChange"
                :min-date="new Date()"
                :disabled-weekdays="[1]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="selectedTimeSlots">
          <FormItem class="mt-4 overflow-hidden">
            <FormLabel class="text-sm font-medium">Horarios Disponibles</FormLabel>
            <FormControl>
              <TimeSlotSelector
                :model-value="componentField.modelValue || []"
                label=""
                :time-slots="timeSlots"
                :loading="loading"
                :error="error"
                @update:model-value="componentField.onChange"
                :show-all-time-slots="false"
                :show-info-availability="true"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <InfoAlert
          class="my-3"
          title="Información"
          message="Al elegir horario, considera que el tiempo promedio de visita es de 2
        horas. Sin embargo, al ser un recorrido libre, este tiempo puede
        variar según tu ritmo y el interés que pongas en explorar cada
        espacio."
        />

        <FormField v-slot="{ componentField }" name="visitObjectives">
          <FormItem v-auto-animate>
            <FormLabel class="text-sm font-medium">Objetivos de la visita</FormLabel>
            <FormControl>
              <OptionListField
                :model-value="componentField.modelValue"
                :options="visitObjectives"
                placeholder="Selecciona un objetivo"
                label=""
                @update:model-value="
                  (value) => {
                    console.log('🔄 OptionListField emitió:', value, typeof value);
                    componentField.onChange(value);
                  }
                "
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>
        <!-- Mensaje de error global -->
        <div v-if="errors" class="text-red-500 text-sm mt-4">
          {{ errors.form }}
        </div>

        <!-- Botones de acción -->
        <div class="flex space-x-2 pt-4">
          <Button type="submit" variant="secondary" class="flex-1" :disabled="loading">
            <div v-if="loading" class="flex items-center justify-center">
              <div
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
              ></div>
              {{ isStep1Complete ? "Modificando..." : "Guardando..." }}
            </div>
            <span v-else>{{ isStep1Complete ? "Continuar" : "Continuar" }}</span>
          </Button>
        </div>
      </div>
    </Transition>
  </form>
</template>

<script setup>
// ========================================
// IMPORTS
// ========================================

// Vue Core
import { watch, onMounted, ref, computed } from "vue";

// Form Validation
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import * as z from "zod";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Icon } from "@iconify/vue";

// Common Components
import CalendarField from "~/components/common/CalendarField.vue";
import OptionListField from "~/components/common/OptionListField.vue";
import InfoAlert from "@/components/common/InfoAlert.vue";
import DropdownContent from "@/components/common/DropdownContent.vue";
import TimeSlotSelector from "@/components/common/TimeSlotSelector.vue";
import AddInstitutionDialog from "@/components/profile/AddInstitutionDialog.vue";

// Composables
import { useCatalog } from "@/composables/catalog/useCatalog";
import { useApiVisitor } from "@/lib/api/composables/visitor";
import { useAuth } from "@/lib/api/composables/auth";
import { useReservationSummerCourse } from "@/composables/reservations/useReservationSummerCourse";
import { useReservationStepLoader } from "@/composables/reservations/useReservationStepLoader";
import { useTimeSlots } from "@/composables/business/useTimeSlots";
import { useToast } from "@/composables/ui/useToast";

// ========================================
// PROPS & EMITS
// ========================================

const props = defineProps({
  data: {
    type: Object,
    default: () => ({}),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: [Error, Object, null],
    default: null,
  },
  headerData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["submit", "cancel", "navigate-to-step"]);

// ========================================
// COMPOSABLES
// ========================================

// Autenticación
const { user } = useAuth();

// Reservaciones de cursos de verano
const {
  store,
  formData: reservationFormData,
  currentReservation,
  currentReservationId,
  createReservationStep1,
  updateReservationStep1,
  isCreating,
  isUpdating,
  isLoading,
  error: reservationError,
  isStep1Valid,
} = useReservationSummerCourse();

// Composable para verificar el estado de los pasos
const { isStepComplete } = useReservationStepLoader();

// Catálogos
const { fetchCatalogs, catalogs } = useCatalog();

// Instituciones (visitor)
const {
  getVisitorInstitutions,
  visitorInstitutions,
  loading: institutionLoading,
} = useApiVisitor();

// Toast notifications
const { showError } = useToast();

// Usar el composable para obtener los horarios desde la API
const {
  timeSlots,
  loading: timeSlotsLoading,
  error: timeSlotsError,
  loadTimeSlots,
} = useTimeSlots();

// ========================================
// REACTIVE VARIABLES
// ========================================

// Instituciones
const selectedInstitution = ref("");
const showInstitutionSelector = ref(false);
const institutionSelector = ref();

// Catálogos
const visitObjectives = ref([]);

// Dropdowns de grupos de edad
const showKidsDropdown = ref(false);
const showAdolescentsDropdown = ref(false);
const showYouthDropdown = ref(false);
const showAdultsDropdown = ref(false);
const showSeniorsDropdown = ref(false);

// Los timeSlots ahora se obtienen del composable useTimeSlots

// ========================================
// COMPUTED PROPERTIES
// ========================================

// Instituciones
const institutions = computed(() => visitorInstitutions.value);

const institutionHeaderText = computed(() => {
  if (selectedInstitution.value) {
    return selectedInstitution.value;
  }

  const list = (institutions.value || []).map((i) => i?.institutionName).filter(Boolean);
  const total = list.length;
  if (total === 0) return "Selecciona una institución";
  if (total === 1) return "Selecciona una institución";
  if (total === 2) return "Selecciona una institución";
  return "Selecciona una institución";
});

// Estados combinados
const loading = computed(
  () =>
    props.loading ||
    isCreating.value ||
    isUpdating.value ||
    isLoading.value ||
    timeSlotsLoading.value
);

const error = computed(
  () => props.error || reservationError?.value || timeSlotsError.value || null
);

// Computed para determinar si el paso 1 está completo usando el sistema existente
const isStep1Complete = computed(() => {
  const isComplete = isStepComplete.value(1);

  return isComplete;
});

// ========================================
// FORM SCHEMA & CONFIGURATION
// ========================================

const formSchema = toTypedSchema(
  z
    .object({
      // Campos de personas por rango de edad - opcionales con valores por defecto
      totalKids: z
        .number()
        .int()
        .min(0, "El número de niños debe ser mayor o igual a 0")
        .default(0),
      totalKidsDisability: z
        .number()
        .int()
        .min(0, "El número de niños con discapacidad debe ser mayor o igual a 0")
        .default(0),
      totalAdolescents: z
        .number()
        .int()
        .min(0, "El número de adolescentes debe ser mayor o igual a 0")
        .default(0),
      totalAdolescentsDisability: z
        .number()
        .int()
        .min(0, "El número de adolescentes con discapacidad debe ser mayor o igual a 0")
        .default(0),
      totalYouth: z
        .number()
        .int()
        .min(0, "El número de jóvenes debe ser mayor o igual a 0")
        .default(0),
      totalYouthDisability: z
        .number()
        .int()
        .min(0, "El número de jóvenes con discapacidad debe ser mayor o igual a 0")
        .default(0),
      totalAdults: z
        .number()
        .int()
        .min(0, "El número de adultos debe ser mayor o igual a 0")
        .default(0),
      totalAdultsDisability: z
        .number()
        .int()
        .min(0, "El número de adultos con discapacidad debe ser mayor o igual a 0")
        .default(0),
      totalSeniors: z
        .number()
        .int()
        .min(0, "El número de adultos mayores debe ser mayor o igual a 0")
        .default(0),
      totalSeniorsDisability: z
        .number()
        .int()
        .min(
          0,
          "El número de adultos mayores con discapacidad debe ser mayor o igual a 0"
        )
        .default(0),

      // Campos de fecha y horario - requeridos
      visitDate: z.date({
        required_error: "Por favor selecciona una fecha de visita",
        invalid_type_error: "La fecha seleccionada no es válida",
      }),
      selectedTimeSlots: z
        .array(z.string())
        .min(1, "Por favor selecciona al menos un horario"),

      // Campos de institución - requeridos
      institution: z.string().min(1, "Por favor selecciona una institución"),
      institutionId: z
        .union([z.string(), z.number()])
        .transform((val) => String(val))
        .pipe(z.string().min(1, "Por favor selecciona una institución")),

      // Campo de objetivos - requerido
      visitObjectives: z
        .union([z.string(), z.number()])
        .refine(
          (val) =>
            val !== null && val !== undefined && val !== "" && val !== "no_disponible",
          { message: "Por favor selecciona un objetivo de visita válido" }
        ),
    })
    .refine(
      (data) => {
        const total =
          (data.totalKids || 0) +
          (data.totalAdolescents || 0) +
          (data.totalYouth || 0) +
          (data.totalAdults || 0) +
          (data.totalSeniors || 0);
        return total >= 10;
      },
      {
        message: "El número total de personas debe ser mínimo 10",
        path: ["form"], // error global, no en un input
      }
    )
);

// Formulario con vee-validate
const { handleSubmit, values, setFieldValue, validateField, errors } = useForm({
  validationSchema: formSchema,
  // Evitar validación inicial automática para no mostrar errores antes de interactuar
  validateOnMount: false,
  // Configurar valores iniciales
  initialValues: {
    // Campos de personas por rango de edad
    totalKids: 0,
    totalKidsDisability: 0,
    totalAdolescents: 0,
    totalAdolescentsDisability: 0,
    totalYouth: 0,
    totalYouthDisability: 0,
    totalAdults: 0,
    totalAdultsDisability: 0,
    totalSeniors: 0,
    totalSeniorsDisability: 0,

    // Campos de fecha y horario
    visitDate: undefined,
    selectedTimeSlots: [],

    // Campos de institución
    institution: "",
    institutionId: "",

    // Campo de objetivos
    visitObjectives: null,
  },
});

// ========================================
// FUNCTIONS
// ========================================

// ========================================
// INSTITUTION FUNCTIONS
// ========================================

// Función para obtener la clave única de un option
const getOptionKey = (option) => {
  return option;
};

// Función para obtener las clases CSS de las filas de instituciones
const getInstitutionRowClasses = (index, institutionName) => {
  const baseClasses =
    "px-4 py-2 cursor-pointer border-t-1 border-secondary transition-colors";
  const alternatingClasses =
    index % 2 === 0
      ? "bg-secondary/20 hover:bg-secondary/40"
      : "bg-secondary/10 hover:bg-secondary/40";
  const selectedClasses =
    selectedInstitution.value === institutionName
      ? "bg-primary/20 border-primary/30"
      : "";

  return `${baseClasses} ${alternatingClasses} ${selectedClasses}`.trim();
};

// Función para obtener las clases CSS del nombre de la institución
const getInstitutionNameClasses = (institutionName) => {
  return selectedInstitution.value === institutionName
    ? "text-primary font-medium"
    : "text-muted-foreground";
};

// Función para alternar la visibilidad del selector de instituciones
const toggleInstitutionSelector = async () => {
  showInstitutionSelector.value = !showInstitutionSelector.value;

  // Si se está abriendo el selector, cargar las instituciones
  if (showInstitutionSelector.value) {
    try {
      await refreshInstitutions();
    } catch (error) {
      showError(
        "Error al cargar instituciones",
        "No se pudieron cargar las instituciones. Por favor, intenta nuevamente."
      );
    }
  }
};

// Función para seleccionar una institución
const selectInstitution = (inst) => {
  selectedInstitution.value = inst?.institutionName || "";
  showInstitutionSelector.value = false;
  // Actualizar el formulario con la institución seleccionada
  setFieldValue("institution", inst?.institutionName || "");
  // Guardar también el ID de la institución si está disponible (como string)
  if (inst?.id) {
    setFieldValue("institutionId", String(inst.id));
  }
};

// Función para agregar una nueva institución
const addInstitution = async (institutionsList) => {
  // Tras crear, recargar lista desde el backend
  await refreshInstitutions();

  // El evento add-institutions emite un array de strings (nombres de instituciones)
  // Tomamos el primer elemento del array
  const institutionName = institutionsList[0] || "";

  selectedInstitution.value = institutionName;
  showInstitutionSelector.value = false;
  // Actualizar el formulario con la nueva institución
  setFieldValue("institution", institutionName);

  // Buscar el ID de la institución en la lista actualizada
  const institution = institutions.value.find(
    (inst) => inst.institutionName === institutionName
  );
  if (institution?.id) {
    setFieldValue("institutionId", String(institution.id));
  }
};

// Función para refrescar la lista de instituciones
const refreshInstitutions = async () => {
  try {
    // Obtener el ID del usuario actual
    if (user.value?.userId) {
      await getVisitorInstitutions({ visitorId: user.value.userId });
    }
  } catch (error) {
    console.error("❌ Error al cargar instituciones:", error);
  }
};

// ========================================
// CATALOG FUNCTIONS
// ========================================

/**TODO: Cambiar a VisitObjectivesBusiness a VisitObjectivesSummerCourse */

// Función para cargar los objetivos de visita desde el catálogo
const loadVisitObjectives = async () => {
  try {
    // Usar fetchCatalogs directamente para obtener el formato completo
    await fetchCatalogs({ tableName: "VisitObjectivesBusiness" });
    const objectives = catalogs.value.filter(
      (catalog) => catalog.tableName === "VisitObjectivesBusiness" && catalog.enable
    );

    // Transformar el formato para que value sea el id numérico
    const transformedObjectives = objectives.map((obj) => ({
      value: obj.id, // Usar el ID numérico como value
      label: obj.value, // Usar el campo 'value' del catálogo como label
      id: obj.id,
    }));
    visitObjectives.value = transformedObjectives;
  } catch (error) {
    console.error("❌ Error al cargar objetivos de visita:", error);
    // En caso de error, mostrar opciones no disponibles
    visitObjectives.value = [
      { value: "no_disponible", label: "Opciones no disponibles" },
    ];
  }
};

// ========================================
// DROPDOWN FUNCTIONS
// ========================================

// Función para alternar la visibilidad del dropdown de niños
const toggleKidsDropdown = () => {
  showKidsDropdown.value = !showKidsDropdown.value;
};

// Función para alternar la visibilidad del dropdown de adolescentes
const toggleAdolescentsDropdown = () => {
  showAdolescentsDropdown.value = !showAdolescentsDropdown.value;
};

// Función para alternar la visibilidad del dropdown de jóvenes
const toggleYouthDropdown = () => {
  showYouthDropdown.value = !showYouthDropdown.value;
};

// Función para alternar la visibilidad del dropdown de adultos
const toggleAdultsDropdown = () => {
  showAdultsDropdown.value = !showAdultsDropdown.value;
};

// Función para alternar la visibilidad del dropdown de adultos mayores
const toggleSeniorsDropdown = () => {
  showSeniorsDropdown.value = !showSeniorsDropdown.value;
};

// ========================================
// FORM FUNCTIONS
// ========================================

// Función para mapear los datos del formulario a la estructura de la API (ReservationSummerCourseStep1CreateCmd)
const mapFormDataToApiRequest = (formValues) => {
  // El value es directamente el ID numérico del objetivo de visita
  const visitObjectiveId = formValues.visitObjectives;

  // Validar que se haya seleccionado un objetivo válido
  if (
    !visitObjectiveId ||
    visitObjectiveId === "no_disponible" ||
    visitObjectiveId === undefined ||
    visitObjectiveId === null ||
    visitObjectiveId === ""
  ) {
    console.error("❌ No se seleccionó un objetivo de visita válido:", {
      valorSeleccionado: formValues.visitObjectives,
      objetivosDisponibles: visitObjectives.value,
    });
    throw new Error("Por favor selecciona un objetivo de visita válido");
  }

  return {
    // ID del visitante
    visitorId: user.value?.userId,

    // ID del objetivo de visita
    visitObjectiveId: visitObjectiveId,

    // Campos de personas por rango de edad (niños)
    totalKids: formValues.totalKids || 0,
    totalKidsWithDisabilities: formValues.totalKidsDisability || 0,

    // Campos de adultos
    totalAdults: formValues.totalAdults || 0,
    totalAdultsWithDisabilities: formValues.totalAdultsDisability || 0,

    // Campos de adultos mayores
    totalSeniors: formValues.totalSeniors || 0,
    totalSeniorsWithDisabilities: formValues.totalSeniorsDisability || 0,

    // Campos de jóvenes adultos
    totalYoungAdults: formValues.totalYouth || 0,
    totalYoungAdultsWithDisabilities: formValues.totalYouthDisability || 0,

    // Campos de adolescentes (teenagers)
    totalTeenagers: formValues.totalAdolescents || 0,
    totalTeenagersWithDisabilities: formValues.totalAdolescentsDisability || 0,

    // Campos de fecha y horario
    reservationDate: formValues.visitDate?.toISOString() || new Date().toISOString(),
    checkInDateId: parseInt(formValues.selectedTimeSlots?.[0]) || 1,

    // Campos de institución
    institutionNameId: parseInt(String(formValues.institutionId)),

    // ID del usuario que modifica
    userModifiedId: user.value?.userId || 0,
  };
};

// ========================================
// WATCHERS & LIFECYCLE HOOKS
// ========================================

// Watcher para el campo institution
watch(
  () => values.institution,
  (newValue) => {
    // Si el campo tiene valor, validar para limpiar errores
    if (newValue) {
      validateField("institution");
      validateField("institutionId");
    }
  },
  { immediate: true }
);

// Watchers para los campos de personas - forzar validación cuando cambien
watch(
  () => [
    values.totalKids,
    values.totalAdolescents,
    values.totalYouth,
    values.totalAdults,
    values.totalSeniors,
  ],
  () => {
    // Validar el campo totalKids que tiene el error del schema
    validateField("totalKids");
  },
  { deep: true }
);

// Limpiar errores cuando se resuelve el error del servidor
watch(
  () => props.error,
  (newError) => {
    console.log("Error:", newError);
    if (!newError) {
      // Reset form when error is cleared
    }
  }
);

// ========================================
// WATCHERS
// ========================================

// Watcher para detectar data enviada desde el header
watch(
  () => props.headerData,
  async (newHeaderData) => {
    if (newHeaderData && Object.keys(newHeaderData).length > 0) {
      // Si hay data del paso 1, actualizar el formulario
      if (newHeaderData.step === 1 && newHeaderData.data) {
        const data = newHeaderData.data;

        // Debug: verificar qué datos están llegando

        // Mapear los datos del header a los campos del formulario
        // Campos de institución
        if (data.institutionNameId) {
          setFieldValue("institutionId", String(data.institutionNameId));

          // Asegurar que las instituciones estén cargadas antes de buscar
          if (institutions.value.length === 0) {
            await refreshInstitutions();
          }

          // Buscar el nombre de la institución por ID
          const institution = institutions.value.find(
            (i) => i.id === data.institutionNameId
          );

          if (institution) {
            setFieldValue("institution", institution.institutionName);
            selectedInstitution.value = institution.institutionName;
            console.log("✅ Institución seteada:", institution.institutionName);
          } else {
            console.warn(
              "⚠️ No se encontró la institución con ID:",
              data.institutionNameId
            );
            // Si no se encuentra, al menos setear el ID como fallback
            setFieldValue("institution", String(data.institutionNameId));
            selectedInstitution.value = String(data.institutionNameId);
          }
        } else {
          console.warn("⚠️ No hay institutionNameId en los datos del header:", data);
        }

        // Campos de fechas y horarios
        if (data.reservationDate) {
          setFieldValue("visitDate", new Date(data.reservationDate));
        }
        if (data.checkInDateId) {
          setFieldValue("selectedTimeSlots", [String(data.checkInDateId)]);
        }

        // Campo de objetivos de visita
        if (data.visitObjectiveId) {
          // Asegurar que los objetivos estén cargados antes de setear
          if (visitObjectives.value.length === 0) {
            await loadVisitObjectives();
          }

          // Buscar el objetivo por ID
          const objective = visitObjectives.value.find(
            (obj) => obj.value === data.visitObjectiveId
          );

          if (objective) {
            setFieldValue("visitObjectives", objective.value);
          } else {
            // Si no se encuentra, setear el ID como fallback
            setFieldValue("visitObjectives", data.visitObjectiveId);
          }
        }

        // Campos de personas por rango de edad (mapeo según ReservationSummerCourseStep1CreateCmd)
        if (data.totalKids !== undefined) {
          setFieldValue("totalKids", data.totalKids);
        }
        if (data.totalKidsWithDisabilities !== undefined) {
          setFieldValue("totalKidsDisability", data.totalKidsWithDisabilities);
        }
        if (data.totalTeenagers !== undefined) {
          setFieldValue("totalAdolescents", data.totalTeenagers);
        }
        if (data.totalTeenagersWithDisabilities !== undefined) {
          setFieldValue(
            "totalAdolescentsDisability",
            data.totalTeenagersWithDisabilities
          );
        }
        if (data.totalYoungAdults !== undefined) {
          setFieldValue("totalYouth", data.totalYoungAdults);
        }
        if (data.totalYoungAdultsWithDisabilities !== undefined) {
          setFieldValue("totalYouthDisability", data.totalYoungAdultsWithDisabilities);
        }
        if (data.totalAdults !== undefined) {
          setFieldValue("totalAdults", data.totalAdults);
        }
        if (data.totalAdultsWithDisabilities !== undefined) {
          setFieldValue("totalAdultsDisability", data.totalAdultsWithDisabilities);
        }
        if (data.totalSeniors !== undefined) {
          setFieldValue("totalSeniors", data.totalSeniors);
        }
        if (data.totalSeniorsWithDisabilities !== undefined) {
          setFieldValue("totalSeniorsDisability", data.totalSeniorsWithDisabilities);
        }
      }
    }
  },
  { immediate: true, deep: true }
);

// ========================================
// LIFECYCLE HOOKS
// ========================================

onMounted(async () => {
  console.log("🔍 ===== ReservationStep1 MOUNTED =====");
  console.log("  📌 currentReservationId.value:", currentReservationId?.value);
  console.log("  📌 currentReservation.value:", currentReservation?.value);
  console.log("  📌 currentReservation.value?.id:", currentReservation?.value?.id);

  await loadVisitObjectives();
  await loadTimeSlots();
  await refreshInstitutions();

  // Ya no necesitamos cargar datos aquí porque el watcher de headerData
  // se encarga de eso automáticamente cuando llegan los datos del paso 1
  console.log("✅ Datos del formulario se cargarán desde headerData watcher");
  console.log("🔍 ===== FIN ReservationStep1 MOUNTED =====");
});

// ========================================
// FORM SUBMISSION
// ========================================

const onSubmit = handleSubmit(async (values) => {
  try {
    // Debug: verificar el estado actual con detalle
    console.log("🔍 ===== INICIO onSubmit - Estado actual =====");
    console.log("  📌 currentReservationId.value:", currentReservationId.value);
    console.log("  📌 Tipo de currentReservationId:", typeof currentReservationId.value);
    console.log("  📌 currentReservation.value:", currentReservation.value);
    console.log("  📌 currentReservation.value?.id:", currentReservation.value?.id);

    // Mapear datos del formulario a la API
    const apiRequest = mapFormDataToApiRequest(values);

    let result;
    // Si existe un ID de reservación, entonces actualizar. Si no, crear nueva.
    const hasReservationId = currentReservationId.value && currentReservationId.value > 0;
    console.log("  📌 hasReservationId (decisión):", hasReservationId);

    if (hasReservationId) {
      // Ya existe una reservación, actualizar
      console.log("🔄 Reservación existente detectada, ACTUALIZANDO...");
      result = await updateReservationStep1(apiRequest);
    } else {
      // No existe reservación, crear nueva
      console.log("🆕 No existe reservación, CREANDO nueva...");
      result = await createReservationStep1(apiRequest);
    }

    if (result) {
      console.log("✅ Reservación procesada exitosamente:", result);
      console.log("  📌 result.id:", result.id);
      emit("submit", result); // Pasar el resultado al componente padre

      // Navegar al paso 2 después de un breve delay
      setTimeout(() => {
        emit("navigate-to-step", 2);
      }, 1500);
    }
    console.log("🔍 ===== FIN onSubmit =====");
  } catch (error) {
    console.error("❌ Error al procesar reservación:", error);
    // El error ya se maneja en el composable con toast
  }
});
</script>

<style scoped></style>
