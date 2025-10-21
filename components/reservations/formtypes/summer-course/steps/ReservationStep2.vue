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
            placeholder="Selecciona un tema de interés"
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
            placeholder="Selecciona un concepto económico secundario"
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
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    </FormField>

    <h1 class="text-2xl font-semibold">Datos del representante de la visita</h1>
    <InfoAlert
      class="mt-3"
      :message-class="'text-black font-normal'"
      message-size="text-sm"
      title="Información"
      message="Para confirmar su visita y garantizar una comunicación efectiva, proporciona tus datos de contacto. Esto permitirá enviar la confirmación y asegurar una experiencia fluida."
    />

    <p class="text-sm font-medium">
      ¿La persona que realiza la reserva será también la responsable de la visita?
    </p>

    <div class="space-y-2">
      <div class="flex space-x-8">
        <FormField
          v-slot="{ value, handleChange }"
          type="checkbox"
          name="samePersonResponsibleYes"
        >
          <FormItem>
            <div class="flex items-start space-x-2">
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
            <div class="flex items-start space-x-2">
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

    <InfoAlert
      class="mt-3"
      :message-class="'text-black font-normal'"
      message-size="text-sm"
      title="Información"
      message="Recuerda que puedes cambiar al representante de la visita aunque otra persona este generando la reserva."
    />
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

    <FormField
      v-if="hasDisabilityFromAPI"
      v-slot="{ value, handleChange }"
      name="specialNeeds"
    >
      <FormItem>
        <FormLabel
          >¿Alguna de las personas que te acompañan, o tú, tiene una condición que
          requiere asistencia o apoyo especial durante la visita?</FormLabel
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
      <Button type="submit" variant="secondary" class="flex-1" :disabled="isUpdating">
        <div v-if="isUpdating" class="flex items-center justify-center">
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
import { onMounted, computed, nextTick, watch } from "vue";
import OptionListField from "@/components/common/OptionListField.vue";
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

import { useReservationSummerCourseStore } from "@/stores/reservation-summer-course";
import { useAuthStore } from "@/stores/auth";
import { useAuth } from "@/lib/api/composables/auth";
import { useCatalog } from "@/composables/catalog/useCatalog";
import { useReservationSummerCourse } from "@/composables/reservations/useReservationSummerCourse";
import { useReservationStepLoader } from "@/composables/reservations/useReservationStepLoader";
import { useToast } from "@/composables/ui/useToast";

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
const reservationSummerCourseStore = useReservationSummerCourseStore();

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
  createReservationStep2,
  updateReservationStep2,
  loadStep1,
  loadStep2,
  isUpdating,
  error: reservationError,
  isStep2Valid,
  currentReservation,
  checkReservationHasDisability,
} = useReservationSummerCourse();

// Composable para verificar el estado de los pasos
const { isStepComplete } = useReservationStepLoader();

// Toast notifications
const { showError } = useToast();

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
// Variable reactiva para necesidades especiales
const specialNeeds = ref([]);
// Variable reactiva para categorías de discapacidades
const disabilityCategories = ref([]);

// Variable reactiva para datos generales
const generalData = ref({});

// Variable reactiva para almacenar si la reservación tiene personas con discapacidad
const hasDisabilityFromAPI = ref(null);

// Computed para determinar si el paso 2 está completo usando el sistema existente
const isStep2Complete = computed(() => {
  const isComplete = isStepComplete.value(2);
  console.log("🔍 isStep2Complete usando useReservationStepLoader:", {
    currentReservationId: currentReservationId.value,
    currentReservation: currentReservation.value,
    isComplete,
  });
  return isComplete;
});

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
  const step1Data = currentReservation.value;

  if (step1Data) {
    return (
      step1Data.totalYoungAdultsWithDisabilities > 0 ||
      step1Data.totalAdultsWithDisabilities > 0 ||
      step1Data.totalSeniorsWithDisabilities > 0 ||
      step1Data.totalKidsWithDisabilities > 0 ||
      step1Data.totalTeenagersWithDisabilities > 0
    );
  }

  return false;
};

// Función para mapear datos del formulario al formato del API
const mapFormDataToApiRequest = (formData) => {
  return {
    mainEconomicConceptId: formData.interestTopics || null,
    secondaryEconomicConceptId: formData.secondaryTopics || null,
    isReservationPersonAlsoResponsible: formData.samePersonResponsibleYes || false,
    isResponsibleNotAssigned: formData.notAssigned || false,
    fullName: formData.representativeName || null,
    email: formData.representativeEmail || null,
    phone: formData.representativePhone || null,
    specialAssistances: formData.specialNeeds || [],
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
        .union([z.string(), z.number()])
        .refine((val) => val !== null && val !== undefined, {
          message: "Por favor selecciona un concepto económico principal",
        }),
      secondaryTopics: z
        .union([z.string(), z.number()])
        .refine((val) => val !== null && val !== undefined, {
          message: "Por favor selecciona un concepto económico secundario",
        }),
      samePersonResponsibleYes: z.boolean(),
      samePersonResponsibleNo: z.boolean(),
      notAssigned: z.boolean(),
      representativeName: z.string().optional(),
      representativeEmail: z.string().optional(),
      representativePhone: z.string().optional(),
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
  initialValues: {},
});

// Función para manejar el envío del formulario
const onSubmit = handleSubmit(async (formValues) => {
  try {
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
        const loaded = await loadStep1(store.currentReservationId);
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
      // Nuevos nombres de campos actualizados
      mainEconomicConceptId: apiRequest.mainEconomicConceptId || null,
      secondaryEconomicConceptId: apiRequest.secondaryEconomicConceptId || null,
      specialAssistances: apiRequest.specialAssistances || [],
      isReservationPersonAlsoResponsible: apiRequest.isReservationPersonAlsoResponsible,
      isResponsibleNotAssigned: apiRequest.isResponsibleNotAssigned,
      fullName: apiRequest.fullName,
      email: apiRequest.email,
      phone: apiRequest.phone,
      // Mantener compatibilidad con los campos del formulario
      samePersonResponsible: apiRequest.isReservationPersonAlsoResponsible,
      notAssigned: apiRequest.isResponsibleNotAssigned,
      representativeName: apiRequest.fullName,
      representativeEmail: apiRequest.email,
      representativePhone: apiRequest.phone,
      interestTopics: apiRequest.mainEconomicConceptId,
      secondaryTopics: apiRequest.secondaryEconomicConceptId,
      specialNeeds: apiRequest.specialAssistances,
    });

    // Determinar si es una actualización o creación basándose en si el paso 2 ya está completo
    const isUpdate = isStep2Complete.value;

    // Llamar al endpoint apropiado según sea actualización o creación
    let result;
    if (isUpdate) {
      console.log("🔄 Actualizando paso 2 existente...");
      result = await updateReservationStep2();
    } else {
      console.log("✨ Creando nuevo paso 2...");
      result = await createReservationStep2();
    }

    if (result) {
      console.log(
        `✅ Paso 2 ${isUpdate ? "actualizado" : "creado"} exitosamente:`,
        result
      );

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
      console.error(`❌ Error al ${isUpdate ? "actualizar" : "crear"} el paso 2`);
      alert("Error al guardar los datos. Por favor intenta de nuevo.");
    }
  } catch (error) {
    console.error("❌ Error al procesar formulario:", error);
    alert("Error al procesar el formulario. Por favor intenta de nuevo.");
  }
});

// ========================================
// WATCHERS
// ========================================

// Watcher para detectar data enviada desde el header
watch(
  () => props.headerData,
  async (newHeaderData) => {
    if (newHeaderData && Object.keys(newHeaderData).length > 0) {
      console.log("📥 Data enviada desde el header:", newHeaderData);

      // Solo procesar datos del paso 2, ignorar datos de otros pasos
      if (newHeaderData.step === 2 && newHeaderData.data) {
        console.log(
          "🔄 Actualizando formulario con data del header:",
          newHeaderData.data
        );

        // Verificar que los datos contengan campos específicos del paso 2
        const hasStep2Fields =
          newHeaderData.data.hasOwnProperty("mainEconomicConceptId") ||
          newHeaderData.data.hasOwnProperty("isReservationPersonAlsoResponsible");

        if (!hasStep2Fields) {
          console.log(
            "⚠️ Ignorando datos que no parecen ser del paso 2:",
            newHeaderData.data
          );
          return;
        }

        const data = newHeaderData.data;

        // Mapear los datos del header a los campos del formulario
        // Campos del paso 2 según la respuesta del API
        console.log("🔍 Datos específicos del paso 2:", {
          mainEconomicConceptId: data.mainEconomicConceptId,
          secondaryEconomicConceptId: data.secondaryEconomicConceptId,
          fullName: data.fullName,
          email: data.email,
          phone: data.phone,
          isReservationPersonAlsoResponsible: data.isReservationPersonAlsoResponsible,
          isResponsibleNotAssigned: data.isResponsibleNotAssigned,
          specialAssistances: data.specialAssistances,
        });

        // Mapear conceptos económicos principales
        if (
          data.mainEconomicConceptId !== null &&
          data.mainEconomicConceptId !== undefined
        ) {
          // Asegurar que los conceptos estén cargados antes de setear
          if (keyConcepts.value.length === 0) {
            console.log("🔄 Cargando conceptos principales antes de setear...");
            await loadKeyConcepts();
          }

          // Buscar el concepto por ID
          const concept = keyConcepts.value.find(
            (c) => c.id === data.mainEconomicConceptId
          );
          if (concept) {
            setFieldValue("interestTopics", concept.id);
            console.log("✅ Concepto principal seteado:", concept.name);
          } else {
            console.warn(
              "⚠️ No se encontró el concepto principal con ID:",
              data.mainEconomicConceptId
            );
          }
        }

        // Mapear conceptos económicos secundarios
        if (
          data.secondaryEconomicConceptId !== null &&
          data.secondaryEconomicConceptId !== undefined
        ) {
          // Asegurar que los conceptos secundarios estén cargados antes de setear
          if (secondaryConcepts.value.length === 0) {
            console.log("🔄 Cargando conceptos secundarios antes de setear...");
            await loadSecondaryConcepts();
          }

          // Buscar el concepto por ID
          const concept = secondaryConcepts.value.find(
            (c) => c.id === data.secondaryEconomicConceptId
          );
          if (concept) {
            setFieldValue("secondaryTopics", concept.id);
            console.log("✅ Concepto secundario seteado:", concept.name);
          } else {
            console.warn(
              "⚠️ No se encontró el concepto secundario con ID:",
              data.secondaryEconomicConceptId
            );
          }
        }

        // Mapear datos de contacto
        if (data.fullName) {
          setFieldValue("representativeName", data.fullName);
        }
        if (data.email) {
          setFieldValue("representativeEmail", data.email);
        }
        if (data.phone) {
          setFieldValue("representativePhone", data.phone);
        }

        // Mapear responsabilidad
        // Solo marcar checkboxes si hay datos guardados del paso 2
        // Si isResponsibleNotAssigned es true, significa que el usuario seleccionó "No"
        // Si isReservationPersonAlsoResponsible es true, significa que seleccionó "Sí"
        // Si ambos son false, no marcar nada (el usuario aún no ha seleccionado)
        if (
          data.isReservationPersonAlsoResponsible !== null &&
          data.isReservationPersonAlsoResponsible !== undefined
        ) {
          if (data.isReservationPersonAlsoResponsible === true) {
            // Usuario seleccionó "Sí, la misma persona"
            setFieldValue("samePersonResponsibleYes", true);
            setFieldValue("samePersonResponsibleNo", false);
            console.log("✅ Responsabilidad: misma persona (Sí)");
          } else if (
            data.fullName ||
            data.email ||
            data.phone ||
            data.isResponsibleNotAssigned === true
          ) {
            // Si hay datos de contacto O isResponsibleNotAssigned es true,
            // significa que el usuario seleccionó "No" previamente
            setFieldValue("samePersonResponsibleYes", false);
            setFieldValue("samePersonResponsibleNo", true);
            console.log("✅ Responsabilidad: persona diferente (No)");
          } else {
            // No hay datos suficientes para determinar la selección, dejar ambos sin marcar
            setFieldValue("samePersonResponsibleYes", false);
            setFieldValue("samePersonResponsibleNo", false);
            console.log("ℹ️ Responsabilidad: sin selección previa");
          }
        }

        // Mapear si no está asignado
        if (
          data.isResponsibleNotAssigned !== null &&
          data.isResponsibleNotAssigned !== undefined
        ) {
          setFieldValue("notAssigned", data.isResponsibleNotAssigned);
          console.log("✅ Estado de asignación seteado:", data.isResponsibleNotAssigned);
        }

        // Mapear asistencia especial
        if (
          data.specialAssistances &&
          Array.isArray(data.specialAssistances) &&
          data.specialAssistances.length > 0
        ) {
          // Asegurar que las necesidades especiales estén cargadas antes de setear
          if (specialNeeds.value.length === 0) {
            console.log("🔄 Cargando necesidades especiales antes de setear...");
            await loadSpecialNeeds();
          }

          // Mapear los IDs de asistencia especial a los valores del formulario
          const selectedNeeds = data.specialAssistances
            .map((id) => {
              const need = specialNeeds.value.find((n) => n.id === id);
              return need ? need.id : id;
            })
            .filter(Boolean);

          setFieldValue("specialNeeds", selectedNeeds);
          console.log("✅ Necesidades especiales seteadas:", selectedNeeds);
        }

        console.log("✅ Formulario actualizado con data del header");
      }
    }
  },
  { immediate: true, deep: true }
);

// ========================================
// LIFECYCLE HOOKS
// ========================================

onMounted(async () => {
  // Cargar catálogos
  await Promise.all([
    loadKeyConcepts(),
    loadSecondaryConcepts(),
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
      // Cargar datos del paso 2 (no del paso 1)
      const loaded = await loadStep2(store.currentReservationId);
      if (loaded) {
        console.log("✅ Datos del paso 2 cargados exitosamente en onMounted");
        console.log("✅ currentReservation después de cargar:", currentReservation.value);

        // Setear los datos directamente en el formulario desde formData del store
        // Simular un headerData update para que el watcher lo procese
        console.log("🔄 Seteando datos del paso 2 en el formulario desde formData...");
        await nextTick();
        // Emitir evento interno para que el watcher lo procese
        props.headerData.step = 2;
        props.headerData.data = loaded;
        props.headerData.source = "onMounted";
      } else if (loaded === false) {
        console.log("ℹ️ Carga omitida (ya está cargándose o se cargó recientemente)");
      } else {
        console.error("❌ No se pudieron cargar los datos del paso 2 en onMounted");
      }
    } catch (error) {
      console.error("❌ Error al cargar datos del paso 2 en onMounted:", error);
    }
  } else if (currentReservation.value) {
    console.log("✅ Reservación ya disponible en onMounted:", currentReservation.value);
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
</script>
