<template>
  <form @submit.prevent="onSubmit" class="space-y-4">
    <div class="space-y-2 mb-0">
      <FormField v-slot="{}" name="company">
        <FormItem v-auto-animate>
          <FormLabel class="text-sm font-medium mb-1">Nombre de Empresa</FormLabel>
          <!-- Selector de empresas -->
          <ClientOnly>
            <template #fallback>
              <div class="py-3 px-4 bg-secondary/10 rounded-full">
                <div class="flex items-center justify-between">
                  <span class="text-sm">Cargando empresas...</span>
                </div>
              </div>
            </template>
            <div>
              <div
                class="py-3 px-4 bg-secondary/10 cursor-pointer hover:bg-muted/80 transition-colors mb-0"
                :class="[
                  showCompanySelector ? 'rounded-t-md' : 'rounded-full',
                  selectedCompany ? 'bg-primary/40 border-primary/20' : '',
                ]"
                @click="toggleCompanySelector"
              >
                <div class="flex items-center justify-between">
                  <span
                    class="text-sm"
                    :class="selectedCompany ? 'font-semibold' : 'font-normal'"
                    >{{ companyHeaderText }}</span
                  >
                  <Icon v-if="showCompanySelector" icon="mdi:chevron-down-up" />
                  <Icon v-else icon="mdi:chevron-up-down" />
                </div>
              </div>
              <div
                v-if="showCompanySelector"
                ref="companySelector"
                class="mt-0 space-y-0 border border-t-0 border-muted rounded-b-md"
              >
                <!-- Botón para agregar nueva empresa -->
                <div class="p0 bg-background border-b border-muted">
                  <AddCompanyDialog
                    @add-company="addCompany"
                    @company-created-success="onCompanyCreatedSuccess"
                  >
                    <template #trigger>
                      <div
                        class="bg-primary/5 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors px-3 py-3"
                      >
                        <span class="text-sm text-primary"> Agregar nueva empresa </span>
                        <Icon icon="gridicons:add" class="w-4 h-4 text-primary" />
                      </div>
                    </template>
                  </AddCompanyDialog>
                </div>

                <!-- Indicador de carga -->
                <div v-if="visitorLoading" class="px-4 py-3 text-center">
                  <div class="flex items-center justify-between space-x-2">
                    <span class="text-sm text-muted-foreground"
                      >Cargando empresas...</span
                    >
                  </div>
                </div>

                <!-- Lista de empresas -->
                <div v-else-if="companies.length === 0" class="px-4 py-3 text-center">
                  <span class="text-sm text-muted-foreground"
                    >No hay empresas disponibles</span
                  >
                </div>

                <div
                  v-else
                  v-for="(comp, index) in companies"
                  :key="getOptionKey(comp.companyName || '')"
                  :class="getCompanyRowClasses(index, comp.companyName)"
                >
                  <div
                    class="flex items-center justify-between"
                    @click="selectCompany(comp)"
                  >
                    <span
                      class="text-sm"
                      :class="getCompanyNameClasses(comp.companyName)"
                    >
                      {{ comp.companyName }}
                    </span>
                    <div
                      v-if="selectedCompany === comp.companyName"
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

    <div v-auto-animate="{ duration: 200, easing: 'ease-out' }">
      <!-- Mostrar el resto del formulario solo si hay una empresa seleccionada -->
      <div v-if="selectedCompany">
        <Separator class="my-10 bg-muted max-w-3/4 mx-auto" />
        <h3 class="text-xl font-normal tracking-wide mb-2">Numero de asistentes</h3>
        <InfoAlert
          class="mt-2"
          :message-class="'not-italic'"
          :message-size="'text-sm'"
          message="Deja vacíos los campos que no aplique para tu visita."
        />
        <!-- Dropdown solo para Jóvenes y adultos -->
        <DropdownContent
          :show-options="showAdultsDropdown"
          :dropdowncounter="values.youngAdults || 0"
          @toggle-options-from-child="toggleAdultsDropdown"
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
              <FormField v-slot="{ componentField }" name="youngAdults">
                <FormItem v-auto-animate>
                  <FormLabel class="text-sm font-medium">Numero de Jovenes</FormLabel>
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      type="number"
                      placeholder="Ingrese el número de jóvenes (18-24 años)"
                      class="bg-muted border-0"
                    />
                  </FormControl>
                  <FormDescription> </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>
              <p class="text-sm mt-2 mb-3">
                Del total de jóvenes, que ingresaste anteriormente, por favor ingresa
                cuantos que pertenecen a los siguientes grupos:
              </p>
              <FormField v-slot="{ componentField }" name="youngAdultsDisability">
                <FormItem>
                  <FormLabel class="text-sm font-medium"
                    >Personas con discapacidad</FormLabel
                  >
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      type="number"
                      placeholder="Ingrese el número de jóvenes con discapacidad"
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

        <!-- Dropdown para adultos de 25-49 años -->
        <DropdownContent
          :show-options="showAdults25Dropdown"
          :dropdowncounter="values.adults25 || 0"
          @toggle-options-from-child="toggleAdults25Dropdown"
          :dropdowntitleclass="['text-sm font-medium mb-2']"
          :dropdownplaceholderclass="['bg-secondary/10 hover:bg-secondary/20']"
          :dropdowncontentclass="['p-3 bg-secondary/10 hover:bg-secondary/20']"
          class="mb-3"
        >
          <template #dropdownplaceholder>
            <span class="text-lg font-medium">Adultos (De 25 a 49 años)</span>
          </template>

          <template #dropdowncontent>
            <div class="p-3 bg-white border border-border rounded-xl space-y-0">
              <FormField v-slot="{ componentField }" name="adults25">
                <FormItem v-auto-animate>
                  <FormLabel class="text-sm font-medium">Numero de Adultos</FormLabel>
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      type="number"
                      placeholder="Ingrese el número de adultos (25-49 años)"
                      class="bg-muted border-0"
                    />
                  </FormControl>
                  <FormDescription> </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>
              <p class="text-sm mt-2 mb-3">
                Del total de adultos, que ingresaste anteriormente, por favor ingresa
                cuantos que pertenecen a los siguientes grupos:
              </p>
              <FormField v-slot="{ componentField }" name="adults25Disability">
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

        <!-- Dropdown para adultos de 60 años o más -->
        <DropdownContent
          :show-options="showAdults60Dropdown"
          :dropdowncounter="values.adults60 || 0"
          @toggle-options-from-child="toggleAdults60Dropdown"
          :dropdowntitleclass="['text-sm font-medium mb-2']"
          :dropdownplaceholderclass="['bg-secondary/10']"
          :dropdowncontentclass="['p-3 bg-secondary/10']"
          class="mb-3"
        >
          <template #dropdownplaceholder>
            <span class="text-lg font-medium">Adultos Mayores (60 años o más)</span>
          </template>

          <template #dropdowncontent>
            <div class="p-3 bg-white border border-border rounded-xl space-y-0">
              <FormField v-slot="{ componentField }" name="adults60">
                <FormItem v-auto-animate>
                  <FormLabel class="text-sm font-medium"
                    >Numero de Adultos Mayores</FormLabel
                  >
                  <FormControl>
                    <Input
                      v-bind="componentField"
                      type="number"
                      placeholder="Ingrese el número de adultos mayores (60+ años)"
                      class="bg-muted border-0"
                    />
                  </FormControl>
                  <FormDescription> </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>
              <p class="text-sm mt-2 mb-3">
                Del total de adultos mayores, que ingresaste anteriormente, por favor
                ingresa cuantos que pertenecen a los siguientes grupos:
              </p>
              <FormField v-slot="{ componentField }" name="adults60Disability">
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

        <Separator class="my-10 bg-muted max-w-3/4 mx-auto" />

        <h1 class="text-xl font-normal tracking-wide mb-2">Agenda tu visita</h1>

        <FormField v-slot="{ componentField }" name="visitDate">
          <FormItem v-auto-animate>
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
          <FormItem class="mt-4 overflow-hidden" v-auto-animate>
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
            <FormLabel class="text-sm font-medium overflow-hidden"
              >Objetivos de la visita</FormLabel
            >
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
          <!-- Botón condicional según el estado del paso 1 -->
          <Button type="submit" variant="secondary" class="flex-1" :disabled="isLoadingAny">
            <div v-if="isLoadingAny" class="flex items-center justify-center">
              <div
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
              ></div>
              {{ isStep1Complete ? "Modificando..." : "Guardando..." }}
            </div>
            <span v-else>{{ isStep1Complete ? "Modificar" : "Guardar y Continuar" }}</span>
          </Button>
        </div>
      </div>
    </div>
    <!-- Cierre del div condicional para empresa seleccionada -->
  </form>
</template>

<script setup>
import { watch, onMounted, ref, computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Icon } from "@iconify/vue";
import CalendarField from "~/components/common/CalendarField.vue";
import { useCatalog } from "@/composables/catalog/useCatalog";
import { useErrorHandler } from "@/composables/ui/useErrorHandler";
import { useToast } from "@/composables/ui/useToast";
import { useTimeSlots } from "@/composables/business/useTimeSlots";
import OptionListField from "~/components/common/OptionListField.vue";
import InfoAlert from "@/components/common/InfoAlert.vue";
import DropdownContent from "@/components/common/DropdownContent.vue";
import TimeSlotSelector from "@/components/common/TimeSlotSelector.vue";
import { useApiVisitor } from "@/lib/api/composables/visitor";
import { useAuth } from "@/lib/api/composables/auth";
import { useReservationCompany } from "@/composables/reservations/useReservationCompany";
import { useReservationStepLoader } from "@/composables/reservations/useReservationStepLoader";
import AddCompanyDialog from "@/components/profile/AddCompanyDialog.vue";

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

// Composable para manejo de autenticación
const { user } = useAuth();

// Composable para reservaciones empresariales
const {
  store,
  formData: reservationFormData,
  currentReservation,
  currentReservationId,
  createReservationStep1,
  updateReservationStep1,
  isCreating,
  isLoadingAny,
  error: reservationError,
  isStep1Valid,
} = useReservationCompany();

// Composable para verificar el estado de los pasos
const { isStepComplete } = useReservationStepLoader();

// Composable para catálogos
const { fetchCatalogs, catalogs } = useCatalog();

// Composable para visitor (empresas)
const {
  getVisitorCompanies,
  visitorCompanies,
  deleteVisitorCompany,
  loading: visitorLoading,
} = useApiVisitor();

// Composable para toast
const { showSuccess, showError } = useToast();

// Variables para el selector de empresas
const companies = computed(() => visitorCompanies.value);
const selectedCompany = ref("");
const showCompanySelector = ref(false);
const companySelector = ref();

// Función para obtener la clave única de un option
const getOptionKey = (option) => {
  return option;
};

// Función para obtener las clases CSS de las filas de empresas
const getCompanyRowClasses = (index, companyName) => {
  const baseClasses =
    "px-4 py-2 cursor-pointer border-t-1 border-secondary transition-colors";
  const alternatingClasses =
    index % 2 === 0
      ? "bg-secondary/20 hover:bg-secondary/40"
      : "bg-secondary/10 hover:bg-secondary/40";
  const selectedClasses =
    selectedCompany.value === companyName ? "bg-primary/20 border-primary/30" : "";

  return `${baseClasses} ${alternatingClasses} ${selectedClasses}`.trim();
};

// Función para obtener las clases CSS del nombre de la empresa
const getCompanyNameClasses = (companyName) => {
  return selectedCompany.value === companyName
    ? "text-primary font-medium"
    : "text-muted-foreground";
};

// Función para alternar la visibilidad del selector de empresas
const toggleCompanySelector = async () => {
  showCompanySelector.value = !showCompanySelector.value;

  // Si se está abriendo el selector, cargar las empresas
  if (showCompanySelector.value) {
    try {
      await refreshCompanies();
    } catch (error) {
      showError(
        "Error al cargar empresas",
        "No se pudieron cargar las empresas. Por favor, intenta nuevamente."
      );
    }
  }
};

// Función para seleccionar una empresa
const selectCompany = (comp) => {
  selectedCompany.value = comp?.companyName || "";
  showCompanySelector.value = false;
  // Actualizar el formulario con la empresa seleccionada
  setFieldValue("company", comp?.companyName || "");
  // Guardar también el ID de la empresa si está disponible (como string)
  if (comp?.id) {
    setFieldValue("companyId", String(comp.id));
  }
};

// Función para agregar una nueva empresa
const addCompany = async (payload) => {
  // Tras crear, recargar lista desde el backend
  await refreshCompanies();
  selectedCompany.value = payload?.name || "";
  showCompanySelector.value = false;
  // Actualizar el formulario con la nueva empresa
  setFieldValue("company", payload?.name || "");
  if (payload?.id) {
    setFieldValue("companyId", String(payload.id));
  }
};

// Función para manejar el evento de empresa creada exitosamente
const onCompanyCreatedSuccess = async (payload) => {
  try {
    console.log("🎉 onCompanyCreatedSuccess ejecutándose con payload:", payload);

    // Pequeño delay para asegurar que la API haya terminado de procesar
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Recargar la lista de empresas desde el backend
    console.log("🔄 Llamando a refreshCompanies...");
    await refreshCompanies();
    console.log("📊 Empresas después de refresh:", companies.value?.length || 0);

    // Buscar la empresa recién creada en la lista actualizada
    const newCompany = companies.value.find((comp) => comp.companyName === payload.name);
    console.log("🔍 Empresa encontrada en la lista:", newCompany);

    if (newCompany) {
      // Seleccionar la nueva empresa
      selectedCompany.value = newCompany.companyName;
      showCompanySelector.value = false;

      // Actualizar el formulario con la nueva empresa
      setFieldValue("company", newCompany.companyName);
      setFieldValue("companyId", String(newCompany.id));

      console.log("✅ Empresa seleccionada y formulario actualizado:", {
        name: newCompany.companyName,
        id: newCompany.id,
      });

      // Mostrar mensaje de éxito
      showSuccess(
        "¡Empresa agregada!",
        `La empresa "${newCompany.companyName}" ha sido agregada y seleccionada`
      );
    } else {
      console.warn("⚠️ No se encontró la empresa recién creada en la lista");
      // Fallback: usar los datos del payload
      selectedCompany.value = payload.name;
      showCompanySelector.value = false;
      setFieldValue("company", payload.name);

      showSuccess(
        "¡Empresa creada!",
        `La empresa "${payload.name}" ha sido creada exitosamente`
      );
    }
  } catch (error) {
    console.error("❌ Error en onCompanyCreatedSuccess:", error);
    showError(
      "Error al actualizar lista",
      "La empresa se creó pero no se pudo actualizar la lista. Por favor, recarga la página."
    );
  }
};

// Función para refrescar la lista de empresas
const refreshCompanies = async () => {
  try {
    console.log("🔄 refreshCompanies iniciado...");
    console.log("👤 Usuario actual:", user.value?.userId);

    // Obtener el ID del usuario actual
    if (user.value?.userId) {
      console.log("📡 Llamando a getVisitorCompanies...");
      await getVisitorCompanies({ visitorId: user.value.userId });
      console.log(
        "✅ Lista de empresas actualizada:",
        companies.value?.length || 0,
        "empresas"
      );
    } else {
      console.warn("⚠️ No hay usuario autenticado para cargar empresas");
    }
  } catch (error) {
    console.error("❌ Error al cargar empresas:", error);
    showError(
      "Error al cargar empresas",
      "No se pudieron cargar las empresas. Por favor, intenta nuevamente."
    );
  }
};

// Computed para el texto del header de empresas
const companyHeaderText = computed(() => {
  if (selectedCompany.value) {
    return selectedCompany.value;
  }

  const list = (companies.value || []).map((c) => c?.companyName).filter(Boolean);
  const total = list.length;
  if (total === 0) return "Selecciona una empresa";
  if (total === 1) return "Selecciona una empresa";
  if (total === 2) return "Selecciona una empresa";
  return "Selecciona una empresa";
});

// Computed para el estado de loading combinado
const loading = computed(
  () => props.loading || isCreating.value || timeSlotsLoading.value
);

// Computed para el estado de error combinado
const error = computed(
  () => props.error || reservationError?.value || timeSlotsError.value || null
);

// Computed para determinar si el paso 1 está completo usando el sistema existente
const isStep1Complete = computed(() => {
  const isComplete = isStepComplete.value(1);
  console.log("🔍 isStep1Complete usando useReservationStepLoader:", {
    currentReservationId: currentReservationId.value,
    currentReservation: currentReservation.value,
    isComplete,
  });
  return isComplete;
});

// Usar el composable para obtener los horarios desde la API
const {
  timeSlots,
  loading: timeSlotsLoading,
  error: timeSlotsError,
  loadTimeSlots,
} = useTimeSlots();

// Los objetivos de visitas que se cargarán desde el catálogo
const visitObjectives = ref([]);

// Función para cargar los objetivos de visita desde el catálogo
const loadVisitObjectives = async () => {
  try {
    // Usar fetchCatalogs directamente para obtener el formato completo
    await fetchCatalogs({ tableName: "VisitObjectivesBusiness" });
    const objectives = catalogs.value.filter(
      (catalog) => catalog.tableName === "VisitObjectivesBusiness" && catalog.enable
    );

    console.log("🔍 Objetivos de visita cargados (formato original):", objectives);

    // Transformar el formato para que value sea el id numérico
    const transformedObjectives = objectives.map((obj) => ({
      value: obj.id, // Usar el ID numérico como value
      label: obj.value, // Usar el campo 'value' del catálogo como label
      id: obj.id,
    }));

    console.log("🔍 Objetivos de visita transformados:", transformedObjectives);
    visitObjectives.value = transformedObjectives;
  } catch (error) {
    console.error("❌ Error al cargar objetivos de visita:", error);
    // En caso de error, mostrar opciones no disponibles
    visitObjectives.value = [
      { value: "no_disponible", label: "Opciones no disponibles" },
    ];
  }
};

// Estado para controlar la visibilidad del dropdown de adultos
const showAdultsDropdown = ref(true);

// Función para alternar la visibilidad del dropdown de adultos
const toggleAdultsDropdown = () => {
  showAdultsDropdown.value = !showAdultsDropdown.value;
  // Si se está abriendo, validar los campos para mostrar errores existentes
  if (showAdultsDropdown.value) {
    // validateField('youngAdults')
    // validateField('youngAdultsDisability')
  }
};

// Estado para controlar la visibilidad del dropdown de adultos de 25-49 años
const showAdults25Dropdown = ref(false);

// Función para alternar la visibilidad del dropdown de adultos de 25-49 años
const toggleAdults25Dropdown = () => {
  showAdults25Dropdown.value = !showAdults25Dropdown.value;
  // Si se está abriendo, validar los campos para mostrar errores existentes
  if (showAdults25Dropdown.value) {
    // validateField('adults25')
    // validateField('adults25Disability')
  }
};

// Estado para controlar la visibilidad del dropdown de adultos de 60+ años
const showAdults60Dropdown = ref(false);

// Función para alternar la visibilidad del dropdown de adultos de 60+ años
const toggleAdults60Dropdown = () => {
  showAdults60Dropdown.value = !showAdults60Dropdown.value;
  // Si se está abriendo, validar los campos para mostrar errores existentes
  if (showAdults60Dropdown.value) {
    // validateField('adults60')
    // validateField('adults60Disability')
  }
};

// Schema de validación con Zod - Solo campos actuales del formulario
const formSchema = toTypedSchema(
  z
    .object({
      // Campos principales (cuentan para la suma total)
      youngAdults: z
        .number()
        .int()
        .min(0, "Por favor ingresa un número válido")
        .default(0),
      adults25: z.number().int().min(0, "Por favor ingresa un número válido").default(0),
      adults60: z.number().int().min(0, "Por favor ingresa un número válido").default(0),

      // Campos de discapacidad
      youngAdultsDisability: z.number().int().min(0).default(0),
      adults25Disability: z.number().int().min(0).default(0),
      adults60Disability: z.number().int().min(0).default(0),

      // Empresa obligatoria
      company: z.string().min(1, "Por favor selecciona una empresa"),
      companyId: z
        .union([z.string(), z.number()])
        .transform((val) => String(val))
        .pipe(z.string().min(1, "Por favor selecciona una empresa")),

      // Fecha obligatoria
      visitDate: z.date({
        required_error: "Por favor selecciona una fecha de visita",
        invalid_type_error: "La fecha de visita no es válida",
      }),

      // Horarios obligatorios
      selectedTimeSlots: z
        .array(z.string())
        .min(1, "Por favor selecciona al menos un horario"),

      // Objetivo obligatorio
      visitObjectives: z
        .union([z.string(), z.number()])
        .refine(
          (val) =>
            val !== "" && val !== null && val !== undefined && val !== "no_disponible",
          { message: "Por favor selecciona un objetivo de visita" }
        ),
    })
    .refine(
      (data) => {
        const total =
          (data.youngAdults || 0) + (data.adults25 || 0) + (data.adults60 || 0);
        return total >= 10;
      },
      {
        message: "El número total de personas debe ser mínimo 10",
        path: ["form"], // error global, no en un input
      }
    )
);

// Formulario con vee-validate
const {
  handleSubmit,
  isValid,
  errors,
  values,
  setFieldValue,
  validateField,
  resetForm,
} = useForm({
  validationSchema: formSchema,
  // Evitar validación inicial automática para no mostrar errores antes de interactuar
  validateOnMount: false,
  // Habilitar validación automática cuando cambian los valores
  validateOnBlur: true,
  validateOnChange: true,
  // Configurar valores iniciales
  initialValues: {
    youngAdults: 0,
    youngAdultsDisability: 0,
    adults25: 0,
    adults25Disability: 0,
    adults60: 0,
    adults60Disability: 0,
    visitDate: undefined,
    selectedTimeSlots: [],
    company: "",
    companyId: "",
    visitObjectives: "",
  },
});

// Función para mapear los datos del formulario a la estructura de la API
const mapFormDataToApiRequest = (formValues) => {
  // Ahora el value es directamente el ID numérico
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
    visitorId: user.value?.userId,
    companyId: parseInt(String(formValues.companyId)), // Asegurar que sea número
    totalYoungAdults: formValues.youngAdults || 0,
    totalYoungAdultsWithDisabilities: formValues.youngAdultsDisability || 0,
    totalAdults: formValues.adults25 || 0,
    totalAdultsWithDisabilities: formValues.adults25Disability || 0,
    totalSeniors: formValues.adults60 || 0,
    totalSeniorsWithDisabilities: formValues.adults60Disability || 0,
    reservationDate: formValues.visitDate?.toISOString() || new Date().toISOString(),
    checkInDateId: parseInt(formValues.selectedTimeSlots?.[0]) || 1,
    visitObjectiveId: visitObjectiveId,
  };
};

// Watcher para el campo company
watch(
  () => values.company,
  (newValue) => {
    console.log("🔍 Campo company actualizado:", newValue);
    // Si el campo tiene valor, validar para limpiar errores
    if (newValue) {
      validateField("company");
      validateField("companyId");
    }
  },
  { immediate: true }
);

// Watchers para los campos de personas - forzar validación cuando cambien
watch(
  () => [values.youngAdults, values.adults25, values.adults60],
  () => {
    // Validar el campo youngAdults que tiene el error del schema
    validateField("youngAdults");
  },
  { deep: true }
);

// Watcher para monitorear cambios en currentReservationId
watch(
  () => currentReservationId?.value,
  (newId, oldId) => {
    console.log("🔍 currentReservationId cambió:", { oldId, newId });
  },
  { immediate: true }
);

onMounted(async () => {
  await loadVisitObjectives();
  await loadTimeSlots();

  // Los valores iniciales ya están configurados en el formulario
  // Solo necesitamos asegurar que los campos estén limpios
  console.log("🔍 Formulario inicializado con valores:", values);

  // Debug: verificar el estado del currentReservationId al montar
  console.log(
    "🔍 ReservationStep1 mounted - currentReservationId:",
    currentReservationId?.value
  );
});

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

// Watcher para detectar data enviada desde el header
watch(
  () => props.headerData,
  async (newHeaderData) => {
    if (newHeaderData && Object.keys(newHeaderData).length > 0) {
      console.log("📥 Data enviada desde el header:", newHeaderData);

      // Si hay data del paso 1, actualizar el formulario
      if (newHeaderData.step === 1 && newHeaderData.data) {
        console.log(
          "🔄 Actualizando formulario con data del header:",
          newHeaderData.data
        );

        const data = newHeaderData.data;

        // Mapear los datos del header a los campos del formulario
        // Campos de empresa
        if (data.companyId) {
          setFieldValue("companyId", String(data.companyId));

          // Asegurar que las empresas estén cargadas antes de buscar
          if (companies.value.length === 0) {
            console.log("🔄 Cargando empresas antes de setear el nombre...");
            await refreshCompanies();
          }

          // Buscar el nombre de la empresa por ID
          const company = companies.value.find((c) => c.id === data.companyId);
          console.log("🔍 Buscando empresa con ID:", data.companyId);
          console.log("🔍 Empresas disponibles:", companies.value);
          console.log("🔍 Empresa encontrada:", company);

          if (company) {
            setFieldValue("company", company.companyName);
            selectedCompany.value = company.companyName;
            console.log("✅ Empresa seteada:", company.companyName);
          } else {
            console.warn("⚠️ No se encontró la empresa con ID:", data.companyId);
            // Si no se encuentra, al menos setear el ID como fallback
            setFieldValue("company", String(data.companyId));
            selectedCompany.value = String(data.companyId);
          }
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
            console.log("🔄 Cargando objetivos de visita antes de setear...");
            await loadVisitObjectives();
          }

          // Buscar el objetivo por ID
          const objective = visitObjectives.value.find(
            (obj) => obj.value === data.visitObjectiveId
          );
          console.log("🔍 Buscando objetivo con ID:", data.visitObjectiveId);
          console.log("🔍 Objetivos disponibles:", visitObjectives.value);
          console.log("🔍 Objetivo encontrado:", objective);

          if (objective) {
            setFieldValue("visitObjectives", objective.value);
            console.log("✅ Objetivo seteado:", objective.label);
          } else {
            console.warn("⚠️ No se encontró el objetivo con ID:", data.visitObjectiveId);
            // Si no se encuentra, setear el ID como fallback
            setFieldValue("visitObjectives", data.visitObjectiveId);
          }
        }

        // Campos de personas por rango de edad
        if (data.totalYoungAdults !== undefined) {
          setFieldValue("youngAdults", data.totalYoungAdults);
        }
        if (data.totalYoungAdultsWithDisabilities !== undefined) {
          setFieldValue("youngAdultsDisability", data.totalYoungAdultsWithDisabilities);
        }
        if (data.totalAdults !== undefined) {
          setFieldValue("adults25", data.totalAdults);
        }
        if (data.totalAdultsWithDisabilities !== undefined) {
          setFieldValue("adults25Disability", data.totalAdultsWithDisabilities);
        }
        if (data.totalSeniors !== undefined) {
          setFieldValue("adults60", data.totalSeniors);
        }
        if (data.totalSeniorsWithDisabilities !== undefined) {
          setFieldValue("adults60Disability", data.totalSeniorsWithDisabilities);
        }

        console.log("✅ Formulario actualizado con datos del header");
      }
    }
  },
  { immediate: true, deep: true }
);

const onSubmit = handleSubmit(async (values) => {
  console.log("🔍 Formulario Step 1 - Datos enviados:", JSON.stringify(values, null, 2));

  // Validar manualmente el campo visitObjectives solo al enviar
  if (
    !values.visitObjectives ||
    values.visitObjectives === "" ||
    values.visitObjectives === "no_disponible" ||
    values.visitObjectives === null ||
    values.visitObjectives === undefined
  ) {
    console.log("❌ Objetivo de la visita no seleccionado");
    showError("Campo requerido", "Por favor selecciona un objetivo de la visita");
    return;
  }

  try {
    // Mapear datos del formulario a la API
    const apiRequest = mapFormDataToApiRequest(values);
    console.log("🚀 Enviando datos a la API:", apiRequest);
    console.log("🔍 Valores del formulario:", values);
    console.log("🔍 apiRequest keys:", Object.keys(apiRequest));

    // Usar el computed property reactivo para determinar si el paso 1 está completo
    console.log("🔍 Verificando si el paso 1 está completo:", {
      currentReservationId: currentReservationId.value,
      currentReservation: currentReservation.value,
      isStep1Complete: isStep1Complete.value,
      formData: reservationFormData.value,
    });

    let result;
    if (isStep1Complete.value) {
      // Si el paso 1 ya está completo, actualizar en lugar de crear
      console.log("🔄 Paso 1 ya está completo, actualizando...");
      result = await updateReservationStep1(apiRequest);
    } else {
      // Si el paso 1 no está completo, crear nueva reservación
      console.log("🆕 Paso 1 no está completo, creando nueva reservación...");
      result = await createReservationStep1(apiRequest);
    }

    if (result) {
      console.log("✅ Reservación procesada exitosamente:", result);
      emit("submit", result); // Pasar el resultado al componente padre

      // Navegar al paso 2 después de un breve delay
      setTimeout(() => {
        emit("navigate-to-step", 2);
      }, 1500);
    }
  } catch (error) {
    console.error("❌ Error al procesar reservación:", error);
    // El error ya se maneja en el composable con toast
  }
});
</script>
