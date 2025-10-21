<template>
  <form class="w-full space-y-6" @submit="onSubmit">
    <h3 class="text-2xl font-semibold">Vincula tu visita</h3>
    <InfoAlert
      class="mt-3"
      message="Para mejorar la experiencia en tu visita al museo te recomendaremos rutas y material didáctico con base en tu selección de conceptos económicos principales y secundarios."
    />
    <FormField v-slot="{ value, handleChange }" name="interestTopics">
      <FormItem>
        <FormLabel>Conceptos económicos principales</FormLabel>
        <FormControl>
          <OptionListField
            placeholder="Selecciona uno o más temas de interés"
            :options="keyConcepts"
            :model-value="value"
            @update:model-value="
              (newValue) => {
                handleChange(newValue);

                // Si el concepto principal seleccionado coincide con el secundario, limpiar el secundario
                if (newValue && values.secondaryTopics === newValue) {
                  setFieldValue('secondaryTopics', null);
                  console.log(
                    '🔄 Concepto principal seleccionado, limpiando selección secundaria'
                  );
                }

                // Solo validar este campo específico, no todos
                nextTick(() => {
                  validateField('interestTopics');
                });
              }
            "
            no-options-message="No hay conceptos económicos disponibles"
            variante-check="secondary"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <FormField v-slot="{ value, handleChange }" name="secondaryTopics">
      <FormItem>
        <FormLabel>Conceptos económicos secundarios</FormLabel>
        <FormControl>
          <OptionListField
            placeholder="Selecciona uno o más conceptos económicos secundarios"
            :options="filteredSecondaryConcepts"
            :model-value="value"
            @update:model-value="
              (newValue) => {
                handleChange(newValue);
                // Solo validar este campo específico, no todos
                nextTick(() => {
                  validateField('secondaryTopics');
                });
              }
            "
            no-options-message="No hay conceptos económicos secundarios disponibles"
            variante-check="secondary"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>
    <Separator class="my-10 bg-muted max-w-3/4 mx-auto" />

    <h1 class="text-2xl font-semibold">Representante de grupo</h1>
    <p class="text-base font-medium mb-2">
      Confirma tu participación como representante, o bien asigna esta función a otra
      persona.
    </p>
    <InfoAlert
      class="mt-3"
      :message-class="'text-black font-normal'"
      message-size="text-sm"
      title="Información"
      message="Ten en cuenta que quien asuma este rol deberá acudir a la visita y estar pendiente a las indicaciones del personal del MIDE para compartirlas con el resto del grupo."
    />

    <p class="text-base font-medium">
      ¿La persona que reserva es la misma que se presentará el día de la visita?
    </p>

    <div class="space-y-2">
      <div class="flex space-x-8">
        <FormField
          v-slot="{ value, handleChange }"
          type="checkbox"
          name="samePersonResponsibleYes"
        >
          <FormItem>
            <div class="flex items-center space-x-2">
              <FormLabel>Si</FormLabel>
              <FormControl>
                <Checkbox
                  variant="secondary"
                  :model-value="value"
                  :disabled="values.samePersonResponsibleNo === true"
                  @update:model-value="
                    (checked) => handleSamePersonResponsibleYes(checked, handleChange)
                  "
                />
              </FormControl>
            </div>
          </FormItem>
        </FormField>

        <FormField
          v-slot="{ value, handleChange }"
          type="checkbox"
          name="samePersonResponsibleNo"
        >
          <FormItem>
            <div class="flex items-center space-x-2">
              <FormLabel>No</FormLabel>
              <FormControl>
                <Checkbox
                  variant="secondary"
                  :model-value="value"
                  :disabled="values.samePersonResponsibleYes === true"
                  @update:model-value="
                    (checked) => handleSamePersonResponsibleNo(checked, handleChange)
                  "
                />
              </FormControl>
            </div>
          </FormItem>
        </FormField>
      </div>
      <!-- Mensaje de error unificado -->
      <div v-if="errors.samePersonResponsibleYes" class="text-sm text-red-600 mt-1">
        {{ errors.samePersonResponsibleYes }}
      </div>
    </div>

    <Separator class="my-10 bg-muted max-w-3/4 mx-auto" />
    <FormField
      v-if="values.samePersonResponsibleNo === true"
      v-slot="{ value, handleChange }"
      type="checkbox"
      name="notAssigned"
    >
      <FormItem>
        <div class="flex items-start space-x-2">
          <FormControl>
            <Checkbox
              variant="secondary"
              :model-value="value"
              @update:model-value="(checked) => handleNotAssigned(checked, handleChange)"
            />
          </FormControl>
          <FormLabel>Aún no asignado</FormLabel>
        </div>
      </FormItem>
    </FormField>
    <div
      v-if="
        (values.samePersonResponsibleYes || values.samePersonResponsibleNo) &&
        !values.notAssigned
      "
      class="space-y-5"
    >
      <FormField v-slot="{ componentField }" name="representativeName">
        <FormItem>
          <FormLabel>Nombre completo del representante</FormLabel>
          <FormControl>
            <Input
              type="text"
              placeholder="Nombre completo"
              v-bind="componentField"
              :disabled="values.samePersonResponsibleYes"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="representativeEmail">
        <FormItem>
          <FormLabel>Correo electrónico del representante</FormLabel>
          <FormControl>
            <Input
              type="email"
              placeholder="correo@correo.com"
              v-bind="componentField"
              :disabled="values.samePersonResponsibleYes"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
      <FormField v-slot="{ componentField }" name="representativePhone">
        <FormItem>
          <FormLabel>Teléfono del representante a 10 dígitos</FormLabel>
          <FormControl>
            <Input
              type="tel"
              placeholder="00 0000 - 0000"
              v-bind="componentField"
              :disabled="values.samePersonResponsibleYes"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>
    <h3 class="text-2xl font-semibold">Informacion adicional asistentes</h3>

    <FormField v-slot="{ value, handleChange }" name="ageRanges">
      <FormItem>
        <FormLabel>¿Cual es la edad promedio de los asistentes?</FormLabel>
        <FormControl>
          <CheckboxListField
            placeholder="Selecciona uno o más asistentes"
            :options="ageRanges"
            :model-value="value"
            @update:model-value="
              (newValue) => {
                handleChange(newValue);
                // Solo validar este campo específico, no todos
                nextTick(() => {
                  validateField('ageRanges');
                });
              }
            "
            no-options-message="No hay rangos de edad disponibles"
            variante-check="secondary"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField v-slot="{ value, handleChange }" name="roles">
      <FormItem>
        <FormLabel
          >¿Cual es el cargo de los asistentes?(Puedes seleccionar multiples opciones
          segun corresponda)
        </FormLabel>
        <FormControl>
          <CheckboxListField
            placeholder="Selecciona uno o más asistentes"
            :options="roles"
            :model-value="value"
            @update:model-value="
              (newValue) => {
                handleChange(newValue);
                // Solo validar este campo específico, no todos
                nextTick(() => {
                  validateField('roles');
                });
              }
            "
            no-options-message="No hay cargos disponibles"
            variante-check="secondary"
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <FormField
      v-if="hasDisabilityFromAPI"
      v-slot="{ value, handleChange }"
      name="specialNeeds"
    >
      <FormItem>
        <FormLabel
          >¿Que discapacidades identificaste entre las personas que te acompañaran a la
          visita?</FormLabel
        >
        <FormControl>
          <DisabilitySelector
            placeholder="Selecciona las opciones que necesites"
            :categories="disabilityCategories"
            :model-value="value"
            @update:model-value="
              (newValue) => {
                handleChange(newValue);
                // Solo validar este campo específico, no todos
                nextTick(() => {
                  validateField('specialNeeds');
                });
              }
            "
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <!-- Botones de acción -->
    <div class="flex space-x-2">
      <!-- Botón Continuar - siempre visible -->
      <Button type="submit" variant="secondary" class="flex-1" :disabled="isLoadingAny">
        <div v-if="isLoadingAny" class="flex items-center justify-center">
          <div
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
          ></div>
          Guardando...
        </div>
        <span v-else>Continuar</span>
      </Button>
    </div>
  </form>
</template>

<script setup>
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import * as z from "zod";
import { onMounted, computed, nextTick, watch, onUnmounted } from "vue";
import CheckboxListField from "@/components/common/CheckboxListField.vue";
import OptionListField from "@/components/common/OptionListField.vue";
import { useSafeEvents } from "@/composables/ui/useSafeEvents";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import InfoAlert from "@/components/common/InfoAlert.vue";
import { Button } from "@/components/ui/button";
import DisabilitySelector from "@/components/reservations/formtypes/empresarial/steps/components/DisabilitySelector.vue";

import { useReservationCompanyStore } from "@/stores/reservation-company";
import { useReservationStepStatusStore } from "@/stores/reservation-step-status";
import { useAuthStore } from "@/stores/auth";
import { useAuth } from "@/lib/api/composables/auth";
import { useCatalog } from "@/composables/catalog/useCatalog";
import { useReservationCompany } from "@/composables/reservations/useReservationCompany";

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
  data: {
    type: Object,
    required: true,
  },
  reservationId: {
    type: Number,
    default: null,
  },
  headerData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits([
  "next",
  "back",
  "submit",
  "update:generalData",
  "navigate-to-step",
]);

// Store de reservaciones empresariales
const reservationCompanyStore = useReservationCompanyStore();

// Store de estado de pasos
const stepStatusStore = useReservationStepStatusStore();

// Composable para manejo de autenticación
const { user, isAuthenticated } = useAuth();
const authStore = useAuthStore();

// Composable para manejo de catálogos
const { catalogs, fetchCatalogs } = useCatalog();

// Composable para reservaciones empresariales
const {
  store,
  formData: reservationFormData,
  currentReservationId,
  updateReservationStep2,
  loadStep1,
  loadStep2,
  isUpdating,
  isLoadingAny,
  error: reservationError,
  isStep2Valid,
  currentReservation,
  checkReservationHasDisability,
} = useReservationCompany();

// Composable para eventos seguros
const { addSafeEventListener, removeSafeEventListener } = useSafeEvents();

// Listeners para eventos de guardado de pasos
const handleStep2SavedEvent = (event) => {
  const { step, attendeeType, data } = event.detail;

  if (step === 2 && attendeeType === "empresarial" && data) {
    isLoadingHeaderData.value = true;
    setFormDataFromStep2Data(data);
    isLoadingHeaderData.value = false;
  }
};

const handleStep1SavedEvent = (event) => {
  const { step, attendeeType, reservationId } = event.detail;

  if (step === 1 && attendeeType === "empresarial" && reservationId) {
    setTimeout(async () => {
      try {
        const step2Data = await loadStep2(reservationId);
        if (step2Data) {
          setFormDataFromStep2Data(step2Data);
        }
      } catch (error) {
        console.error("Error al cargar datos del paso 2 desde evento:", error);
      }
    }, 500);
  }
};

// Función para setear datos del formulario desde datos del paso 2
const setFormDataFromStep2Data = async (data) => {
  // Asegurar que los catálogos estén cargados
  if (keyConcepts.value.length === 0) {
    await loadKeyConcepts();
  }
  if (secondaryConcepts.value.length === 0) {
    await loadSecondaryConcepts();
  }
  if (ageRanges.value.length === 0) {
    await loadAgeRanges();
  }
  if (roles.value.length === 0) {
    await loadRoles();
  }
  if (specialNeeds.value.length === 0) {
    await loadSpecialNeeds();
  }

  // Mapear los datos a los campos del formulario
  if (data.mainEconomicConceptId !== null && data.mainEconomicConceptId !== undefined) {
    setFieldValue("interestTopics", data.mainEconomicConceptId);
  }

  if (
    data.secondaryEconomicConceptId !== null &&
    data.secondaryEconomicConceptId !== undefined
  ) {
    setFieldValue("secondaryTopics", data.secondaryEconomicConceptId);
  }

  if (
    data.isReservationPersonAlsoResponsible !== undefined &&
    data.isReservationPersonAlsoResponsible !== null
  ) {
    setFieldValue("samePersonResponsibleYes", data.isReservationPersonAlsoResponsible);
    setFieldValue("samePersonResponsibleNo", !data.isReservationPersonAlsoResponsible);
  }

  if (
    data.isResponsibleNotAssigned !== undefined &&
    data.isResponsibleNotAssigned !== null
  ) {
    setFieldValue("notAssigned", data.isResponsibleNotAssigned);
  }

  if (data.fullName && data.fullName !== null && data.fullName !== undefined) {
    setFieldValue("representativeName", data.fullName);
  }

  if (data.email && data.email !== null && data.email !== undefined) {
    setFieldValue("representativeEmail", data.email);
  }

  if (data.phone && data.phone !== null && data.phone !== undefined) {
    setFieldValue("representativePhone", data.phone);
  }

  if (data.ageRangeIds && Array.isArray(data.ageRangeIds)) {
    setFieldValue("ageRanges", data.ageRangeIds);
  }

  if (data.positionTypeIds && Array.isArray(data.positionTypeIds)) {
    setFieldValue("roles", data.positionTypeIds);
  }

  if (data.specialAssistanceIds && Array.isArray(data.specialAssistanceIds)) {
    setFieldValue("specialNeeds", data.specialAssistanceIds);
  }
};

// Agregar listeners inmediatamente
addSafeEventListener("reservation-empresarial-step-saved", handleStep2SavedEvent);
addSafeEventListener("reservation-empresarial-step-saved", handleStep1SavedEvent);

// Variable reactiva para conceptos económicos principales
const keyConcepts = ref([]);
// Variable reactiva para conceptos económicos secundarios
const secondaryConcepts = ref([]);

// Computed property para filtrar conceptos secundarios excluyendo el principal seleccionado
const filteredSecondaryConcepts = computed(() => {
  if (!values.interestTopics) {
    return secondaryConcepts.value;
  }

  // Filtrar y eliminar el concepto principal seleccionado de las opciones secundarias
  return secondaryConcepts.value.filter(
    (concept) => concept.value !== values.interestTopics
  );
});

// Variable reactiva para verificar si tiene personas con discapacidad desde el endpoint
const hasDisabilityFromAPI = ref(false);

// Variable reactiva para rangos de edad promedio
const ageRanges = ref([]);
// Variable reactiva para necesidades especiales
const specialNeeds = ref([]);
// Variable reactiva para roles/cargos
const roles = ref([]);
// Variable reactiva para categorías de discapacidades
const disabilityCategories = ref([]);

// Variable reactiva para datos generales
const generalData = ref({});

// Bandera para controlar si se están cargando datos del header
const isLoadingHeaderData = ref(false);

// Función para cargar conceptos económicos principales
const loadKeyConcepts = async () => {
  try {
    await fetchCatalogs({ tableName: "SecondaryConcepts" });
    const concepts = (catalogs.value || [])
      .filter((c) => c.tableName === "SecondaryConcepts" && c.enable)
      .map(({ id, value }) => ({ value: id, label: value, id }));
    keyConcepts.value = concepts.length
      ? concepts
      : [{ value: "no_disponible", label: "Opciones no disponibles" }];
  } catch (err) {
    console.error("❌ Error al cargar conceptos secundarios:", err);
    keyConcepts.value = [{ value: "no_disponible", label: "Opciones no disponibles" }];
  }
};

const loadSecondaryConcepts = async () => {
  try {
    await fetchCatalogs({ tableName: "SecondaryConcepts" });
    const concepts = (catalogs.value || [])
      .filter((c) => c.tableName === "SecondaryConcepts" && c.enable)
      .map(({ id, value }) => ({ value: id, label: value, id }));
    secondaryConcepts.value = concepts.length
      ? concepts
      : [{ value: "no_disponible", label: "Opciones no disponibles" }];
  } catch (err) {
    console.error("❌ Error al cargar conceptos secundarios:", err);
    secondaryConcepts.value = [
      { value: "no_disponible", label: "Opciones no disponibles" },
    ];
  }
};

const loadAgeRanges = async () => {
  try {
    await fetchCatalogs({ tableName: "AverageAge" });
    const data = (catalogs.value || [])
      .filter((c) => c.tableName === "AverageAge" && c.enable)
      .map(({ id, value }) => ({ value: id, label: value, id }));
    ageRanges.value = data.length
      ? data
      : [{ value: "no_disponible", label: "Opciones no disponibles" }];
  } catch (err) {
    console.error("❌ Error al cargar rangos de edad promedio:", err);
    ageRanges.value = [{ value: "no_disponible", label: "Opciones no disponibles" }];
  }
};

const loadRoles = async () => {
  try {
    await fetchCatalogs({ tableName: "PositionType" });
    const data = (catalogs.value || [])
      .filter((c) => c.tableName === "PositionType" && c.enable)
      .map(({ id, value }) => ({ value: id, label: value, id }));
    roles.value = data.length
      ? data
      : [{ value: "no_disponible", label: "Opciones no disponibles" }];
  } catch (err) {
    console.error("❌ Error al cargar roles/cargos:", err);
    roles.value = [{ value: "no_disponible", label: "Opciones no disponibles" }];
  }
};

const loadSpecialNeeds = async () => {
  try {
    await fetchCatalogs({ tableName: "SpecialAssistance" });
    const data = (catalogs.value || [])
      .filter((c) => c.tableName === "SpecialAssistance" && c.enable)
      .map(({ id, value }) => ({ value: id, label: value, id }));
    specialNeeds.value = data.length
      ? data
      : [{ value: "no_disponible", label: "Opciones no disponibles" }];
  } catch (err) {
    console.error("❌ Error al cargar necesidades especiales:", err);
    specialNeeds.value = [{ value: "no_disponible", label: "Opciones no disponibles" }];
  }
};

const loadDisabilityCategories = async () => {
  try {
    await fetchCatalogs({ tableName: "SpecialAssistance" });
    const disabilities = (catalogs.value || []).filter(
      (c) => c.tableName === "SpecialAssistance" && c.enable
    );
    const categoriesMap = {
      movilidad: { id: "movilidad", name: "Movilidad reducida", subcategories: [] },
      visual: { id: "visual", name: "Discapacidad visual", subcategories: [] },
      auditiva: { id: "auditiva", name: "Discapacidad auditiva", subcategories: [] },
      cognitiva: { id: "cognitiva", name: "Discapacidad cognitiva", subcategories: [] },
      salud: { id: "salud", name: "Condición de salud", subcategories: [] },
      otro: { id: "otro", name: "Otro (especificar)", subcategories: [] },
    };
    const patterns = [
      { key: "Movilidad reducida", target: "movilidad" },
      { key: "Discapacidad visual", target: "visual" },
      { key: "Discapacidad auditiva", target: "auditiva" },
      { key: "Discapacidad cognitiva", target: "cognitiva", startsWith: true },
      { key: "Condición de salud", target: "salud", startsWith: true },
      { key: "Otro", target: "otro", startsWith: true },
    ];
    disabilities.forEach((d) => {
      const item = {
        id: d.id,
        name: d.value,
        description: d.description,
        disabled: !d.enable,
      };
      const match = patterns.find((p) =>
        p.startsWith ? d.value.startsWith(p.key) : d.value === p.key
      );
      if (match) categoriesMap[match.target].subcategories.push(item);
    });
    disabilityCategories.value = Object.values(categoriesMap).flatMap((cat) =>
      cat.subcategories.length === 1
        ? [{ ...cat.subcategories[0] }]
        : cat.subcategories.length > 1
        ? [cat]
        : []
    );
  } catch (err) {
    console.error("❌ Error al cargar categorías de discapacidades:", err);
    disabilityCategories.value = [];
  }
};

// Función para actualizar datos
const updateGeneralData = (updates) => {
  Object.assign(generalData.value, updates);
};

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
    "🔍 mapFormDataToApiRequest - formData.specialNeeds:",
    formData.specialNeeds
  );

  return {
    mainEconomicConceptId: formData.interestTopics || null,
    secondaryEconomicConceptId: formData.secondaryTopics || null,
    isReservationPersonAlsoResponsible: formData.samePersonResponsibleYes || false,
    isResponsibleNotAssigned: formData.notAssigned || false,
    fullName: formData.representativeName || "",
    email: formData.representativeEmail || "",
    phone: formData.representativePhone || "",
    positionTypeIds: formData.roles || [],
    ageRangeIds: formData.ageRanges || [],
    specialAssistanceIds:
      hasDisability && formData.specialNeeds && formData.specialNeeds.length > 0
        ? formData.specialNeeds
        : [],
  };
};

// Función independiente para manejar el checkbox "Si" (mismo responsable)
const handleSamePersonResponsibleYes = (checked, handleChange) => {
  handleChange(checked);

  if (checked) {
    setFieldValue("samePersonResponsibleNo", false);
    setFieldValue("notAssigned", false);

    // Llenar con datos del usuario si está disponible
    const currentUser = authStore.user || user.value;

    if (currentUser) {
      // Construir el nombre completo a partir de las propiedades disponibles
      const fullName = currentUser.name
        ? `${currentUser.name} ${currentUser.paternalLastName || ""} ${
            currentUser.maternalLastName || ""
          }`.trim()
        : "";

      const userData = {
        representativeName: fullName,
        representativeEmail: currentUser.email || "",
        representativePhone: currentUser.phoneNumber || "",
      };

      // Llenar los campos primero
      setFieldValue("representativeName", userData.representativeName);
      setFieldValue("representativeEmail", userData.representativeEmail);
      setFieldValue("representativePhone", userData.representativePhone);
      updateGeneralData(userData);

      // Solo validar los campos del representante después de llenarlos
      nextTick(() => {
        validateField("representativeName");
        validateField("representativeEmail");
        validateField("representativePhone");
      });
    }
  } else {
    // Cuando se desmarca "Si", limpiar los campos
    setFieldValue("representativeName", "");
    setFieldValue("representativeEmail", "");
    setFieldValue("representativePhone", "");
    updateGeneralData({
      representativeName: "",
      representativeEmail: "",
      representativePhone: "",
    });

    // Validar los campos después de limpiarlos
    nextTick(() => {
      validateField("representativeName");
      validateField("representativeEmail");
      validateField("representativePhone");
    });
  }
};

// Función independiente para manejar el checkbox "No" (diferente responsable)
const handleSamePersonResponsibleNo = (checked, handleChange) => {
  handleChange(checked);

  if (checked) {
    setFieldValue("samePersonResponsibleYes", false);
    setFieldValue("notAssigned", false);

    // Limpiar campos del representante
    setFieldValue("representativeName", "");
    setFieldValue("representativeEmail", "");
    setFieldValue("representativePhone", "");
    updateGeneralData({
      representativeName: "",
      representativeEmail: "",
      representativePhone: "",
    });

    // Solo validar los campos del representante después de limpiarlos
    nextTick(() => {
      validateField("representativeName");
      validateField("representativeEmail");
      validateField("representativePhone");
    });
  }
};

// Función independiente para manejar el checkbox "Aún no asignado"
const handleNotAssigned = (checked, handleChange) => {
  handleChange(checked);

  if (checked) {
    setFieldValue("samePersonResponsibleYes", false);
    setFieldValue("samePersonResponsibleNo", true);

    // Limpiar campos del representante cuando se selecciona 'Aún no asignado'
    setFieldValue("representativeName", "");
    setFieldValue("representativeEmail", "");
    setFieldValue("representativePhone", "");
    updateGeneralData({
      representativeName: "",
      representativeEmail: "",
      representativePhone: "",
    });

    // Validar los campos después de limpiarlos
    nextTick(() => {
      validateField("representativeName");
      validateField("representativeEmail");
      validateField("representativePhone");
    });
  } else {
    // Cuando se desmarca "Aún no asignado", no hacer nada especial
    // Los campos permanecerán como estaban
  }
};

const formSchema = toTypedSchema(
  z
    .object({
      interestTopics: z
        .any()
        .refine(
          (val) => val !== null && val !== undefined,
          "Por favor selecciona un concepto económico principal"
        ),
      secondaryTopics: z
        .any()
        .refine(
          (val) => val !== null && val !== undefined,
          "Por favor selecciona un concepto económico secundario"
        ),
      samePersonResponsibleYes: z.boolean(),
      samePersonResponsibleNo: z.boolean(),
      notAssigned: z.boolean(),
      representativeName: z.string().optional(),
      representativeEmail: z.string().optional(),
      representativePhone: z.string().optional(),
      ageRanges: z
        .array(z.any())
        .min(1, "Por favor selecciona al menos un rango de edad"),
      roles: z.array(z.any()).min(1, "Por favor selecciona al menos un cargo"),
      specialNeeds: z.array(z.any()).optional(),
    })
    .superRefine((data, ctx) => {
      // Validar que se seleccione al menos una opción de responsable
      if (!data.samePersonResponsibleYes && !data.samePersonResponsibleNo) {
        ctx.addIssue({
          code: "custom",
          message:
            "Debes seleccionar si la persona que realiza la reserva será también la responsable",
          path: ["samePersonResponsibleYes"],
        });
      }

      // Validar datos del representante cuando se requiere
      const needsRepresentativeData =
        data.samePersonResponsibleYes ||
        (data.samePersonResponsibleNo && !data.notAssigned);

      if (needsRepresentativeData) {
        // Nombre
        if (!data.representativeName || data.representativeName.trim().length < 2) {
          ctx.addIssue({
            code: "custom",
            message: "El nombre es requerido y debe tener al menos 2 caracteres",
            path: ["representativeName"],
          });
        }

        // Email
        if (!data.representativeEmail) {
          ctx.addIssue({
            code: "custom",
            message: "El email es requerido",
            path: ["representativeEmail"],
          });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.representativeEmail)) {
          ctx.addIssue({
            code: "custom",
            message: "El email no es válido",
            path: ["representativeEmail"],
          });
        }

        // Teléfono
        if (!data.representativePhone) {
          ctx.addIssue({
            code: "custom",
            message: "El teléfono es requerido",
            path: ["representativePhone"],
          });
        } else if (data.representativePhone.length < 10) {
          ctx.addIssue({
            code: "custom",
            message: "El teléfono debe tener al menos 10 dígitos",
            path: ["representativePhone"],
          });
        } else if (data.representativePhone.length > 10) {
          ctx.addIssue({
            code: "custom",
            message: "El teléfono debe tener máximo 10 dígitos",
            path: ["representativePhone"],
          });
        }
      }

      // Validar necesidades especiales solo si hay personas con discapacidad
      if (checkHasDisability()) {
        if (!data.specialNeeds || data.specialNeeds.length === 0) {
          ctx.addIssue({
            code: "custom",
            message: "Por favor selecciona al menos una condición de asistencia especial",
            path: ["specialNeeds"],
          });
        }
      }
    })
);

const { handleSubmit, errors, setFieldValue, validateField, values } = useForm({
  validationSchema: formSchema,
  initialValues: {
    interestTopics: null,
    secondaryTopics: null,
    samePersonResponsibleYes: false,
    samePersonResponsibleNo: false,
    notAssigned: false,
    representativeName: "",
    representativeEmail: "",
    representativePhone: "",
    ageRanges: [],
    roles: [],
    specialNeeds: [],
  },
});

// Función para manejar el envío del formulario
const onSubmit = handleSubmit(async (formValues) => {
  try {
    // Verificar si se están cargando datos del header
    if (isLoadingHeaderData.value) {
      console.log("⚠️ Formulario bloqueado - cargando datos del header");
      return;
    }

    // Imprimir valores actuales en consola
    console.log("=== VALORES DEL FORMULARIO PASO 2 ===");
    console.log("Tipo de reservación:", props.type);
    console.log("Datos generales:", props.data);
    console.log("Datos de reservación general:", generalData.value);
    console.log("Reservación actual:", currentReservation.value);
    console.log("ID de reservación actual:", store.currentReservationId);
    console.log("Store completo:", store);
    console.log("=====================================");

    console.log("✅ Formulario válido - Enviando datos al servidor");

    // Verificar que hay una reservación activa
    if (!currentReservation.value && !store.currentReservationId) {
      console.error("❌ No hay una reservación activa");
      alert("Error: No hay una reservación activa. Por favor regresa al paso 1.");
      return;
    }

    // Si tenemos ID pero no el objeto completo, intentar cargar los datos
    if (!currentReservation.value && store.currentReservationId) {
      console.log("🔄 Cargando datos de la reservación desde el servidor...");
      try {
        const loaded = await loadStep2(store.currentReservationId);
        if (!loaded) {
          console.error("❌ No se pudieron cargar los datos de la reservación");
          alert(
            "Error: No se pudieron cargar los datos de la reservación. Por favor regresa al paso 1."
          );
          return;
        }
      } catch (error) {
        console.error("❌ Error al cargar datos de la reservación:", error);
        alert(
          "Error al cargar los datos de la reservación. Por favor regresa al paso 1."
        );
        return;
      }
    }

    // Mapear datos del formulario al formato del API
    const apiRequest = mapFormDataToApiRequest(formValues);

    // Actualizar los datos en el store antes de enviar
    store.updateFormData({
      mainEconomicConceptId: apiRequest.mainEconomicConceptId,
      secondaryEconomicConceptId: apiRequest.secondaryEconomicConceptId,
      isReservationPersonAlsoResponsible: apiRequest.isReservationPersonAlsoResponsible,
      isResponsibleNotAssigned: apiRequest.isResponsibleNotAssigned,
      fullName: apiRequest.fullName,
      email: apiRequest.email,
      phone: apiRequest.phone,
      positionTypeIds: apiRequest.positionTypeIds,
      ageRangeIds: apiRequest.ageRangeIds,
      specialAssistanceIds: apiRequest.specialAssistanceIds,
      // Mantener compatibilidad con los campos del formulario
      samePersonResponsible: apiRequest.isReservationPersonAlsoResponsible,
      notAssigned: apiRequest.isResponsibleNotAssigned,
      representativeName: apiRequest.fullName,
      representativeEmail: apiRequest.email,
      representativePhone: apiRequest.phone,
      interestTopics: apiRequest.mainEconomicConceptId,
      secondaryTopics: apiRequest.secondaryEconomicConceptId,
      ageRanges: apiRequest.ageRangeIds,
      roles: apiRequest.positionTypeIds,
      specialNeeds: apiRequest.specialAssistanceIds,
    });

    // Llamar al endpoint PUT usando el composable
    const result = await updateReservationStep2();

    if (result) {
      console.log("✅ Paso 2 actualizado exitosamente:", result);

      // Emitir evento con los datos del formulario
      emit("submit", {
        type: props.type,
        data: props.data,
        generalData: formValues,
        reservation: result,
      });

      // También emitir el evento next para continuar al siguiente paso
      emit("next");
    } else {
      console.error("❌ Error al actualizar el paso 2");
      alert("Error al guardar los datos. Por favor intenta de nuevo.");
    }
  } catch (error) {
    console.error("❌ Error al procesar formulario:", error);
    alert("Error al procesar el formulario. Por favor intenta de nuevo.");
  }
});

onMounted(async () => {
  // Cargar catálogos
  await Promise.all([
    loadKeyConcepts(),
    loadSecondaryConcepts(),
    loadAgeRanges(),
    loadRoles(),
    loadSpecialNeeds(),
    loadDisabilityCategories(),
  ]);

  // Si tenemos ID de reservación pero no el objeto completo, cargarlo
  if (store.currentReservationId && !currentReservation.value) {
    console.log(
      "🔄 Inicializando reservación desde ID persistido:",
      store.currentReservationId
    );
    try {
      const loaded = await loadStep2(store.currentReservationId);
      if (loaded) {
        console.log("✅ Reservación cargada exitosamente en onMounted");
        console.log("✅ currentReservation después de cargar:", currentReservation.value);

        // Verificar si hay datos del paso 2 en el store y setearlos
        const step2Data = store.formData;
        if (step2Data && step2Data.mainEconomicConceptId) {
          await setFormDataFromStep2Data(step2Data);
        }
      } else if (loaded === false) {
        console.log("ℹ️ Carga omitida (ya está cargándose o se cargó recientemente)");
      } else {
        console.error("❌ No se pudo cargar la reservación en onMounted");
      }
    } catch (error) {
      console.error("❌ Error al cargar reservación en onMounted:", error);
    }
  } else if (currentReservation.value) {
    console.log("✅ Reservación ya disponible en onMounted:", currentReservation.value);

    // Verificar datos del paso 2 si ya hay una reservación
    const step2Data = store.formData;
    if (step2Data && (step2Data.mainEconomicConceptId || step2Data.fullName)) {
      await setFormDataFromStep2Data(step2Data);
    }
  } else {
    console.log("⚠️ No hay ID de reservación disponible en onMounted");
  }

  // Verificar si la reservación tiene personas con discapacidad desde el endpoint
  if (store.currentReservationId) {
    console.log("🔄 Verificando si la reservación tiene personas con discapacidad...");
    try {
      const hasDisability = await checkReservationHasDisability(
        store.currentReservationId
      );
      hasDisabilityFromAPI.value = hasDisability;
      console.log("✅ Resultado de verificación de discapacidad:", hasDisability);
    } catch (error) {
      console.error("❌ Error al verificar discapacidad:", error);
      hasDisabilityFromAPI.value = false;
    }
  }
});

// Cleanup de listeners al desmontar el componente
onUnmounted(() => {
  removeSafeEventListener("reservation-empresarial-step-saved", handleStep2SavedEvent);
  removeSafeEventListener("reservation-empresarial-step-saved", handleStep1SavedEvent);
});

// Watcher para detectar data enviada desde el header
watch(
  () => props.headerData,
  async (newHeaderData) => {
    if (newHeaderData && Object.keys(newHeaderData).length > 0) {
      // Si hay data del paso 2, actualizar el formulario
      if (newHeaderData.step === 2 && newHeaderData.data) {
        isLoadingHeaderData.value = true;

        const data = newHeaderData.data;

        // Conceptos económicos principales
        if (
          data.mainEconomicConceptId !== null &&
          data.mainEconomicConceptId !== undefined
        ) {
          if (keyConcepts.value.length === 0) {
            await loadKeyConcepts();
          }

          const concept = keyConcepts.value.find(
            (c) => c.value === data.mainEconomicConceptId
          );

          if (concept) {
            setFieldValue("interestTopics", concept.value);
          } else {
            setFieldValue("interestTopics", data.mainEconomicConceptId);
          }
        }

        // Conceptos económicos secundarios
        if (
          data.secondaryEconomicConceptId !== null &&
          data.secondaryEconomicConceptId !== undefined
        ) {
          if (secondaryConcepts.value.length === 0) {
            await loadSecondaryConcepts();
          }

          const secondaryConcept = secondaryConcepts.value.find(
            (c) => c.value === data.secondaryEconomicConceptId
          );

          if (secondaryConcept) {
            setFieldValue("secondaryTopics", secondaryConcept.value);
          } else {
            setFieldValue("secondaryTopics", data.secondaryEconomicConceptId);
          }
        }

        // Datos del representante
        if (
          data.isReservationPersonAlsoResponsible !== undefined &&
          data.isReservationPersonAlsoResponsible !== null
        ) {
          setFieldValue(
            "samePersonResponsibleYes",
            data.isReservationPersonAlsoResponsible
          );
          setFieldValue(
            "samePersonResponsibleNo",
            !data.isReservationPersonAlsoResponsible
          );
        }

        if (
          data.isResponsibleNotAssigned !== undefined &&
          data.isResponsibleNotAssigned !== null
        ) {
          setFieldValue("notAssigned", data.isResponsibleNotAssigned);
        }

        if (data.fullName && data.fullName !== null && data.fullName !== undefined) {
          setFieldValue("representativeName", data.fullName);
        }

        if (data.email && data.email !== null && data.email !== undefined) {
          setFieldValue("representativeEmail", data.email);
        }

        if (data.phone && data.phone !== null && data.phone !== undefined) {
          setFieldValue("representativePhone", data.phone);
        }

        // Rangos de edad
        if (data.ageRangeIds && Array.isArray(data.ageRangeIds)) {
          setFieldValue("ageRanges", data.ageRangeIds);
        }

        // Roles/cargos
        if (data.positionTypeIds && Array.isArray(data.positionTypeIds)) {
          setFieldValue("roles", data.positionTypeIds);
        }

        // Necesidades especiales
        if (data.specialAssistanceIds && Array.isArray(data.specialAssistanceIds)) {
          setFieldValue("specialNeeds", data.specialAssistanceIds);
        }

        isLoadingHeaderData.value = false;
      }
    }
  },
  { immediate: true, deep: true }
);
</script>
