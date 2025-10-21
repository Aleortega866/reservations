<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <slot name="trigger">
        <Button variant="outline">Agregar institución</Button>
      </slot>
    </DialogTrigger>
    <DialogContent class="p-4 pr-2 max-w-7xl w-full">
      <DialogHeader>
        <DialogTitle class="text-2xl text-left text-card-foreground font-semibold pt-5">
          Catálogo de instituciones educativas
        </DialogTitle>
      </DialogHeader>
      <div class="max-h-[70vh] overflow-y-auto space-y-4 pr-1">
        <Transition name="slide-fade" appear>
          <div v-if="showFilters" class="mt-2">
            <div
              class="flex items-center justify-between font-extrabold text-base cursor-pointer select-none"
              @click="toggleFilters"
            >
              Campos para filtrar
              <Icon
                icon="lucide:chevron-up"
                width="20"
                height="20"
                class="ml-1 transition-transform"
                :class="{ 'rotate-180': showFilters }"
              />
            </div>

            <div v-show="showFilters" class="mt-3 space-y-3">
              <!-- Tipo de institución -->
              <OptionListField
                label="Tipo de institución"
                placeholder="Selecciona el tipo de institución"
                v-model="tipoInstitucionFiltro"
                :options="tiposInstitucion"
                :disabled="loadingTipos"
              />

              <!-- Ubicación de la Institución -->
              <div class="mb-4">
                <label class="block font-semibold">Ubicación de la Institución</label>
                <div class="mt-2 space-y-3">
                  <OptionListField
                    label="Entidad Federativa"
                    placeholder="Selecciona la entidad"
                    v-model="entidadSeleccionada"
                    :options="entidades"
                    :disabled="loadingEntidades"
                  />
                  <OptionListField
                    label="Municipio/Delegación/Alcaldía"
                    placeholder="Selecciona el municipio"
                    v-model="municipioSeleccionado"
                    :options="localMunicipalities"
                    :disabled="!entidadSeleccionada"
                  />
                  <OptionListField
                    label="Localidad"
                    placeholder="Selecciona la localidad"
                    v-model="localidadSeleccionada"
                    :options="localLocalities"
                    :disabled="!municipioSeleccionado"
                  />

                  <OptionListField
                    label="Código Postal"
                    placeholder="Selecciona el código postal"
                    v-model="cpSeleccionado"
                    :searchable="true"
                    :options="codigosPostales"
                    :disabled="false"
                  />
                </div>
              </div>

              <!-- Información de estado de carga -->
              <div
                v-if="loadingCCT"
                class="p-3 bg-blue-50 border border-blue-200 rounded-md"
              >
                <div class="flex items-center space-x-2">
                  <div
                    class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"
                  ></div>
                  <span class="text-sm text-blue-700">Cargando instituciones...</span>
                </div>
              </div>

              <!-- Información de error -->
              <div v-if="cctError" class="p-3 bg-red-50 border border-red-200 rounded-md">
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-red-700">Error: {{ cctError }}</span>
                </div>
              </div>

              <!-- Botón para limpiar filtros -->
              <div class="flex justify-end">
                <Button @click="limpiarFiltros" variant="outline" class="text-sm">
                  Limpiar filtros
                </Button>
              </div>
            </div>
          </div>
        </Transition>
        <!-- Componente de búsqueda según el estado de los filtros -->

        <CCTOnlySearch
          v-if="!showFilters"
          v-model="tipoInstitucion"
          label="Busca tu institución por nombre o clave (CCT) y súmala a tu perfil para agilizar tu próxima reservación."
          :options="filteredInstitutions"
          :auto-open="showFilterSelectCheck"
          ref="filterSelectCheckRef"
          @institutions-selected="handleInstitutionsSelected"
        />

        <CCTAndNameSearch
          v-else
          v-model="tipoInstitucion"
          label="Busca por CCT o nombre de la institución"
          :options="filteredInstitutions"
          :auto-open="showFilterSelectCheck"
          ref="cctAndNameSearchRef"
          :state-id="selectedStateId ?? 1"
          :municipality-id="selectedMunicipalityId ?? undefined"
          :locality-id="cctParams.localityId"
          :postal-code="cctParams.postalCode"
          :educational-control-type-id="cctParams.educationalControlTypeId"
          :education-shift-id="cctParams.educationShiftId"
        />

        <!-- Botón para guardar las instituciones seleccionadas -->
        <div v-if="tipoInstitucion.length > 0" class="mt-4 p-1">
          <label class="block text-sm font-medium text-muted-foreground mb-3">
            {{
              tipoInstitucion.length > 1
                ? "Instituciones Educativas por agregar"
                : "Institución Educativa por agregar"
            }}
          </label>
          <!-- Lista de instituciones seleccionadas -->
          <div class="mb-4 space-y-2 max-h-32 overflow-y-auto">
            <div
              v-for="institutionValue in tipoInstitucion"
              :key="institutionValue"
              class="flex items-center justify-between px-3 py-2 bg-secondary/40 rounded-full border"
            >
              <div class="flex-1">
                <span class="text-sm font-medium text-foreground">
                  {{ getInstitutionLabel(institutionValue) }}
                </span>
                <span class="text-xs text-muted-foreground block">
                  {{ getInstitutionCCT(institutionValue) }}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                @click="removeInstitution(institutionValue)"
                class="!p-0 !w-8 !h-8 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full transition-colors"
              >
                <Icon
                  icon="tdesign:delete-1"
                  style="color: #fff; width: 20px; height: 20px"
                />
              </Button>
            </div>
          </div>

          <InfoAlert
            message="Por favor, confirma que las instituciones que vas a agregar sean correctas antes de guardar la información"
            class="mb-4"
          />

          <Button
            variant="default"
            class="w-full"
            @click="guardarInstituciones"
            :disabled="visitorLoading || checkingDuplicates"
          >
            <span v-if="visitorLoading" class="flex items-center space-x-2">
              <div
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
              ></div>
              <span>Guardando...</span>
            </span>
            <span v-else-if="checkingDuplicates" class="flex items-center space-x-2">
              <div
                class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
              ></div>
              <span>Verificando...</span>
            </span>
            <span v-else
              >Guardar {{ tipoInstitucion.length }} institución{{
                tipoInstitucion.length > 1 ? "es" : ""
              }}</span
            >
          </Button>
        </div>

        <!-- Bloque informativo: ¿No encuentras tu institución? -->
        <div v-if="!showFilters" class="mt-1 p-0">
          <div class="flex items-center mb-2">
            <div class="flex-1 border-t border-muted"></div>
            <span class="mx-2 text-muted-foreground text-lg">△</span>
            <div class="flex-1 border-t border-muted"></div>
          </div>
          <div class="font-semibold text-card-foreground text-xl leading-tight mb-1">
            ¿No encuentras tu institución?
          </div>
          <div class="text-sm mb-2">
            Personaliza tu búsqueda usando uno o más filtros.
          </div>
          <div
            v-if="!showFilters"
            class="flex items-center justify-between font-base text-base cursor-pointer select-none"
            @click="toggleFilters"
          >
            Campos para filtrar

            <Icon
              v-if="showFilters"
              icon="mdi:chevron-down-up"
              class="w-5 h-5 pointer-events-none"
            />
            <Icon v-else icon="mdi:chevron-up-down" class="w-5 h-5 pointer-events-none" />
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, watchEffect } from "vue";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import CCTOnlySearch from "@/components/profile/CCTOnlySearch.vue";
import CCTAndNameSearch from "@/components/profile/CCTAndNameSearch.vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import OptionListField from "@/components/common/OptionListField.vue";
import { useCatalog } from "@/composables/catalog/useCatalog";
import { useInstitutions } from "@/composables/catalog/useInstitutions";
import { usePostalCodes } from "@/composables/catalog/usePostalCodes";
import { useApiVisitor } from "@/lib/api/composables/visitor";
import { useAuth } from "@/lib/api/composables/auth";
import { useToast } from "@/composables/ui/useToast";
import InfoAlert from "@/components/common/InfoAlert.vue";

const emit = defineEmits<{
  "add-institutions": [institutions: string[]];
}>();

const open = ref(false);
const selectedInstitutions = ref<string[]>([]);
const searchQuery = ref("");
const showOptions = ref(false);
const showFilters = ref(false);
const showFilterSelectCheck = ref(false);
const filterSelectCheckRef = ref();
const cctAndNameSearchRef = ref();

// Variables para los catálogos
const tiposInstitucion = ref<Array<{ value: string; label: string }>>([]);
const loadingTipos = ref(false);
const turnosEducativos = ref<Array<{ value: string; label: string }>>([]);
const loadingTurnos = ref(false);
const entidades = ref<Array<{ value: string; label: string }>>([]);
const loadingEntidades = ref(false);

// Composable para catálogos
const {
  fetchCatalogs,
  catalogs,
  loading: catalogLoading,
  error: catalogError,
} = useCatalog();
const {
  institutions,
  municipalities,
  localities,
  loading: institutionsLoading,
  error: institutionsError,
  hasInstitutions,
  hasMunicipalities,
  hasLocalities,
  getAllInstitutionCCT,
  getInstitutionByCCT,
  getMunicipalities,
  getLocalities,
  clearError: clearInstitutionsError,
} = useInstitutions();

// Composable para códigos postales
const {
  postalCodes,
  postalCodeOptions,
  loading: postalCodesLoading,
  error: postalCodesError,
  fetchPostalCodes,
  searchByPostalCode,
  searchByMunicipality,
} = usePostalCodes();

// Composable para visitor
const {
  createVisitorInstitution,
  getVisitorInstitutions,
  loading: visitorLoading,
} = useApiVisitor();

// Estado para verificación de duplicados
const checkingDuplicates = ref(false);

// Composable para auth
const { user } = useAuth();

// Composable para toast
const { showSuccess, showError } = useToast();

// Variables locales para manejar los IDs seleccionados
const selectedStateId = ref<number | null>(null);
const selectedMunicipalityId = ref<number | null>(null);

// Variables locales para manejar los datos geográficos
const localMunicipalities = ref<any[]>([]);
const localLocalities = ref<any[]>([]);

// Variables para el servicio CCT
const cctInstitutions = ref<any[]>([]);
const loadingCCT = ref(false);
const cctError = ref<string | null>(null);

// Variables reactivas para los filtros
const entidadSeleccionada = ref("");
const municipioSeleccionado = ref("");
const localidadSeleccionada = ref("");
const cpSeleccionado = ref("");
const tipoInstitucionFiltro = ref("");
const turnoEducativoFiltro = ref("");
const busquedaNombreCCT = ref("");
const tipoInstitucion = ref<string[]>([]);

// Variable para almacenar las instituciones seleccionadas completas
const selectedInstitutionsComplete = ref<any[]>([]);

// Parámetros para el servicio CCT (con valores por defecto)
const cctParams = ref({
  stateId: 1, // Requerido - valor por defecto
  pageNumber: 1, // Requerido
  pageSize: 50, // Requerido - aumentado para mostrar más resultados
  institutionName: undefined as string | undefined,
  cct: undefined as string | undefined,
  municipalityId: undefined as number | undefined,
  localityId: undefined as number | undefined,
  postalCode: undefined as string | undefined,
  educationalControlTypeId: undefined as number | undefined,
  educationShiftId: undefined as number | undefined,
});

// Función para manejar las instituciones seleccionadas completas
const handleInstitutionsSelected = (institutions: any[]) => {
  console.log(
    "🎯 AddInstitutionDialog - Instituciones seleccionadas completas recibidas:",
    institutions
  );
  selectedInstitutionsComplete.value = institutions;

  // Log detallado de cada institución
  institutions.forEach((institution, index) => {
    console.log(`📋 Institución ${index + 1}:`, {
      id: institution.value,
      nombre: institution.label,
      ubicacion: institution.location,
      tipo: institution.type,
      estado: institution.status,
      descripcion: institution.description,
    });
  });
};

// Watcher para debuggear cambios en tipoInstitucion
watch(
  tipoInstitucion,
  (newValue: string[]) => {
    console.log("🔄 AddInstitutionDialog - tipoInstitucion cambió:", newValue);
  },
  { deep: true }
);

// Watcher para resetear showOptions cuando se abra el modal
watch(
  open,
  (newValue: boolean) => {
    if (newValue) {
      showOptions.value = false;
      showFilterSelectCheck.value = false;
      // Cerrar los filtros cuando se abre el diálogo
      showFilters.value = false;
      // Resetear todas las variables de filtro
      entidadSeleccionada.value = "";
      municipioSeleccionado.value = "";
      localidadSeleccionada.value = "";
      cpSeleccionado.value = "";
      tipoInstitucionFiltro.value = "";
      turnoEducativoFiltro.value = "";
      busquedaNombreCCT.value = "";
      tipoInstitucion.value = [];
      selectedInstitutionsComplete.value = [];
      // Resetear parámetros CCT
      cctParams.value = {
        stateId: 1,
        pageNumber: 1,
        pageSize: 50,
        institutionName: undefined,
        cct: undefined,
        municipalityId: undefined,
        localityId: undefined,
        postalCode: undefined,
        educationalControlTypeId: undefined,
        educationShiftId: undefined,
      };
      // Cargar los catálogos desde la API
      loadTiposInstitucion();
      loadTurnosEducativos();
      loadEntidades();
      // Cargar códigos postales desde la API
      fetchPostalCodes();
      // Cargar instituciones CCT iniciales
      loadCCTInstitutions();
    }
  },
  { immediate: true }
);

// Watcher para cerrar FilterSelectCheck cuando se abran los filtros
watch(showFilters, (newValue: boolean) => {
  if (newValue) {
    // Si se abren los filtros, cerrar las opciones del FilterSelectCheck
    showFilterSelectCheck.value = false;
  } else {
    // Si se cierran los filtros, permitir que el FilterSelectCheck se abra
    showFilterSelectCheck.value = true;
  }
});

// Función para cargar instituciones CCT
const loadCCTInstitutions = async () => {
  try {
    loadingCCT.value = true;
    cctError.value = null;

    // Crear una copia limpia de los parámetros, removiendo propiedades undefined
    const cleanParams: any = {
      stateId: cctParams.value.stateId,
      pageNumber: cctParams.value.pageNumber,
      pageSize: cctParams.value.pageSize,
    };

    // Solo agregar propiedades que no sean undefined
    if (cctParams.value.institutionName)
      cleanParams.institutionName = cctParams.value.institutionName;
    if (cctParams.value.cct) cleanParams.cct = cctParams.value.cct;
    if (cctParams.value.municipalityId)
      cleanParams.municipalityId = cctParams.value.municipalityId;
    if (cctParams.value.localityId) cleanParams.localityId = cctParams.value.localityId;
    if (cctParams.value.postalCode) cleanParams.postalCode = cctParams.value.postalCode;
    if (cctParams.value.educationalControlTypeId)
      cleanParams.educationalControlTypeId = cctParams.value.educationalControlTypeId;
    if (cctParams.value.educationShiftId)
      cleanParams.educationShiftId = cctParams.value.educationShiftId;

    console.log("🔍 Cargando instituciones CCT con parámetros limpios:", cleanParams);

    // Si no hay filtros activos, usar búsqueda solo por CCT
    // Si hay filtros activos, usar búsqueda con filtros
    let result: any[] = [];
    if (!showFilters.value) {
      // Sin filtros: usar búsqueda solo por CCT
      if (cleanParams.cct) {
        result = await getInstitutionByCCT({
          cct: cleanParams.cct,
          pageNumber: cleanParams.pageNumber,
          pageSize: cleanParams.pageSize,
        });
      }
    } else {
      // Con filtros: usar búsqueda con filtros
      result = await getAllInstitutionCCT(cleanParams);
    }

    console.log("✅ Instituciones CCT cargadas:", result);

    // Transformar las instituciones al formato esperado por FilterSelectCheck
    // SOLUCIÓN AL PROBLEMA DE IDs DUPLICADOS: Usar identificador único compuesto
    cctInstitutions.value = result.map((institution: any) => ({
      value: `${institution.id}_${institution.cctId}_${institution.cct}`, // Identificador único compuesto
      label: institution.institutionName || "Sin nombre",
      type: "Institución Educativa",
      location: `CCT: ${institution.cct || "N/A"}`,
      status: "Registrada SEP",
      description: `Institución con CCT: ${institution.cct || "N/A"}`,
      // Guardar los IDs originales para referencia
      originalId: institution.id,
      originalCctId: institution.cctId,
      originalCct: institution.cct,
    }));

    console.log(
      "🔄 Instituciones transformadas y guardadas en cctInstitutions:",
      cctInstitutions.value
    );
    console.log(
      "📊 Total de instituciones en cctInstitutions:",
      cctInstitutions.value.length
    );
  } catch (error) {
    console.error("❌ Error cargando instituciones CCT:", error);
    cctError.value = error instanceof Error ? error.message : "Error desconocido";
  } finally {
    loadingCCT.value = false;
  }
};

// Watcher para entidad seleccionada
watch(entidadSeleccionada, (newValue: string) => {
  console.log("🏛️ Entidad seleccionada:", newValue);

  if (newValue) {
    selectedStateId.value = parseInt(newValue);
    cctParams.value.stateId = parseInt(newValue);

    console.log("📍 Actualizando stateId en parámetros CCT:", cctParams.value.stateId);

    // Cargar municipios cuando se selecciona una entidad
    getMunicipalities(parseInt(newValue));

    // NO llamar loadCCTInstitutions aquí - se hará en el watcher consolidado
  } else {
    selectedStateId.value = null;
    cctParams.value.stateId = 1; // Volver al valor por defecto

    // Limpiar municipios cuando no hay entidad seleccionada
    localMunicipalities.value = [];
  }
});

// Watcher para municipio seleccionado
watch(municipioSeleccionado, (newValue: string) => {
  console.log("🏘️ Municipio seleccionado:", newValue);

  if (newValue && selectedStateId.value) {
    selectedMunicipalityId.value = parseInt(newValue);
    cctParams.value.municipalityId = parseInt(newValue);

    console.log(
      "📍 Actualizando municipalityId en parámetros CCT:",
      cctParams.value.municipalityId
    );

    // Cargar localidades cuando se selecciona un municipio
    getLocalities(parseInt(entidadSeleccionada.value), parseInt(newValue));

    // Buscar códigos postales del municipio seleccionado
    const selectedMunicipality = localMunicipalities.value.find(
      (m: any) => m.value === newValue
    );
    if (selectedMunicipality) {
      searchByMunicipality(selectedMunicipality.label);
    }

    // NO llamar loadCCTInstitutions aquí - se hará en el watcher consolidado
  } else {
    selectedMunicipalityId.value = null;
    cctParams.value.municipalityId = undefined;

    // Limpiar localidades cuando no hay municipio seleccionado
    localLocalities.value = [];
    // Recargar todos los códigos postales cuando no hay municipio seleccionado
    fetchPostalCodes();
  }
});

// Watcher para localidad seleccionada
watch(localidadSeleccionada, (newValue: string) => {
  console.log("🏠 Localidad seleccionada:", newValue);

  if (newValue) {
    cctParams.value.localityId = parseInt(newValue);
    console.log(
      "📍 Actualizando localityId en parámetros CCT:",
      cctParams.value.localityId
    );
    // NO llamar loadCCTInstitutions aquí - se hará en el watcher consolidado
  } else {
    cctParams.value.localityId = undefined;
  }
});

// Watcher para código postal seleccionado
watch(cpSeleccionado, (newValue: string) => {
  console.log("📮 Código postal seleccionado:", newValue);

  if (newValue) {
    cctParams.value.postalCode = newValue;
    console.log(
      "📍 Actualizando postalCode en parámetros CCT:",
      cctParams.value.postalCode
    );
    // NO llamar loadCCTInstitutions aquí - se hará en el watcher consolidado
  } else {
    cctParams.value.postalCode = undefined;
  }
});

// Watcher para tipo de institución
watch(tipoInstitucionFiltro, (newValue: string) => {
  console.log("🎓 Tipo de institución seleccionado:", newValue);

  if (newValue) {
    cctParams.value.educationalControlTypeId = parseInt(newValue);
    console.log(
      "📍 Actualizando educationalControlTypeId en parámetros CCT:",
      cctParams.value.educationalControlTypeId
    );
    // NO llamar loadCCTInstitutions aquí - se hará en el watcher consolidado
  } else {
    cctParams.value.educationalControlTypeId = undefined;
  }
});

// Watcher para turno educativo
watch(turnoEducativoFiltro, (newValue: string) => {
  console.log("⏰ Turno educativo seleccionado:", newValue);

  if (newValue) {
    cctParams.value.educationShiftId = parseInt(newValue);
    console.log(
      "📍 Actualizando educationShiftId en parámetros CCT:",
      cctParams.value.educationShiftId
    );
    // NO llamar loadCCTInstitutions aquí - se hará en el watcher consolidado
  } else {
    cctParams.value.educationShiftId = undefined;
  }
});

// Watcher para transformar los municipios cuando cambien
watchEffect(() => {
  const newMunicipalities = municipalities.value;
  if (newMunicipalities && newMunicipalities.length > 0) {
    localMunicipalities.value = newMunicipalities.map((item: any) => ({
      value: item.id?.toString() || "",
      label: item.value || item.name || "",
    }));
    console.log("🏘️ Municipios actualizados:", localMunicipalities.value);
  } else {
    localMunicipalities.value = [];
  }
});

// Watcher para transformar las localidades cuando cambien
watchEffect(() => {
  const newLocalities = localities.value;
  if (newLocalities && newLocalities.length > 0) {
    localLocalities.value = newLocalities.map((item: any) => ({
      value: item.id?.toString() || "",
      label: item.value || item.name || "",
    }));
    console.log("🏠 Localidades actualizadas:", localLocalities.value);
  } else {
    localLocalities.value = [];
  }
});

// SOLUCIÓN AL PROBLEMA DE DOBLES PETICIONES:
// Watcher consolidado que maneja todos los cambios de filtros con debounce
let debounceTimer: NodeJS.Timeout | null = null;

watch(
  () => [
    cctParams.value.stateId,
    cctParams.value.municipalityId,
    cctParams.value.localityId,
    cctParams.value.postalCode,
    cctParams.value.educationalControlTypeId,
    cctParams.value.educationShiftId,
  ],
  () => {
    console.log("🔄 Filtros actualizados, programando recarga de instituciones...");

    // Cancelar el timer anterior si existe
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Programar la recarga con un delay de 300ms para evitar múltiples llamadas
    // Esto previene que se hagan múltiples peticiones cuando cambian varios filtros rápidamente
    debounceTimer = setTimeout(() => {
      console.log("🚀 Ejecutando recarga consolidada de instituciones CCT");
      loadCCTInstitutions();
    }, 300);
  },
  { deep: true }
);

// Usar el composable de códigos postales en lugar del array estático
const codigosPostales = computed(() => postalCodeOptions.value);

// Computed para las instituciones filtradas (usar las del servicio CCT)
const filteredInstitutions = computed(() => {
  console.log("🔄 Filtrando instituciones:", cctInstitutions.value);
  return cctInstitutions.value;
});

function toggleFilters() {
  showFilters.value = !showFilters.value;
}

// Función para cargar los tipos de institución desde la API
const loadTiposInstitucion = async () => {
  try {
    loadingTipos.value = true;
    await fetchCatalogs({ tableName: "EducationControl" });
    if (catalogs.value && Array.isArray(catalogs.value)) {
      tiposInstitucion.value = catalogs.value.map((item: any) => ({
        value: item.id?.toString() || item.value || "",
        label: item.value || item.description || "",
      }));
      console.log("🎓 Tipos de institución cargados:", tiposInstitucion.value);
    }
  } catch (error) {
    console.error("❌ Error cargando tipos de institución:", error);
    // Fallback a opciones básicas si falla la API
    tiposInstitucion.value = [
      { value: "preescolar", label: "Preescolar" },
      { value: "primaria", label: "Primaria" },
      { value: "secundaria", label: "Secundaria" },
      { value: "media-superior", label: "Media Superior" },
      { value: "superior", label: "Superior" },
      { value: "otra", label: "Otra" },
    ];
  } finally {
    loadingTipos.value = false;
  }
};

// Función para cargar las entidades desde la API
const loadEntidades = async () => {
  try {
    loadingEntidades.value = true;
    await fetchCatalogs({ tableName: "RepublicStates" });
    if (catalogs.value && Array.isArray(catalogs.value)) {
      entidades.value = catalogs.value.map((item: any) => ({
        value: item.id?.toString() || item.value || "",
        label: item.value || item.description || "",
      }));
      console.log("🏛️ Entidades cargadas:", entidades.value);
    }
  } catch (error) {
    console.error("❌ Error cargando entidades:", error);
    // Fallback a opciones básicas si falla la API
    entidades.value = [
      { value: "cdmx", label: "CDMX" },
      { value: "edomex", label: "Estado de México" },
      { value: "jal", label: "Jalisco" },
      { value: "nl", label: "Nuevo León" },
      { value: "mor", label: "Morelos" },
      { value: "pue", label: "Puebla" },
      { value: "ver", label: "Veracruz" },
    ];
  } finally {
    loadingEntidades.value = false;
  }
};

// Función para cargar los turnos educativos desde la API
const loadTurnosEducativos = async () => {
  try {
    loadingTurnos.value = true;
    await fetchCatalogs({ tableName: "EducationShifts" });
    if (catalogs.value && Array.isArray(catalogs.value)) {
      turnosEducativos.value = catalogs.value.map((item: any) => ({
        value: item.id?.toString() || item.value || "",
        label: item.value || item.description || "",
      }));
      console.log("⏰ Turnos educativos cargados:", turnosEducativos.value);
    }
  } catch (error) {
    console.error("❌ Error cargando turnos educativos:", error);
    // Fallback a opciones básicas si falla la API
    turnosEducativos.value = [
      { value: "matutino", label: "Matutino" },
      { value: "vespertino", label: "Vespertino" },
      { value: "nocturno", label: "Nocturno" },
      { value: "mixto", label: "Mixto" },
    ];
  } finally {
    loadingTurnos.value = false;
  }
};

// Función para verificar si una institución ya está asignada al usuario
const verificarInstitucionesExistentes = async (visitorId: number): Promise<string[]> => {
  try {
    checkingDuplicates.value = true;
    const existingInstitutions = await getVisitorInstitutions({ visitorId });
    return existingInstitutions.map((inst: any) =>
      inst.institutionName.toLowerCase().trim()
    );
  } catch (error) {
    console.warn("⚠️ Error verificando instituciones existentes:", error);
    return [];
  } finally {
    checkingDuplicates.value = false;
  }
};

// Función para guardar las instituciones seleccionadas
const guardarInstituciones = async () => {
  try {
    console.log("🚀 Iniciando guardarInstituciones");
    console.log(
      "📊 Estado inicial de cctInstitutions:",
      cctInstitutions.value.length,
      "instituciones"
    );
    console.log("📋 Contenido de cctInstitutions:", cctInstitutions.value);

    // Validaciones iniciales
    if (!user.value?.userId) {
      console.error("❌ Usuario no autenticado");
      showError("Usuario no autenticado. Inicia sesión nuevamente.");
      return;
    }

    // Validar que las instituciones seleccionadas existan en la lista cargada
    console.log("🔍 Instituciones seleccionadas:", tipoInstitucion.value);
    console.log(
      "📋 Instituciones disponibles en cctInstitutions:",
      cctInstitutions.value.map((inst) => ({ value: inst.value, label: inst.label }))
    );

    // Procesar todas las instituciones seleccionadas
    // Si cctInstitutions está vacío, intentar recargar las instituciones o procesar con la información disponible
    let validInstitutions = tipoInstitucion.value;

    // Si cctInstitutions está vacío, intentar recargar las instituciones
    if (cctInstitutions.value.length === 0) {
      console.warn("⚠️ cctInstitutions está vacío, intentando recargar...");
      try {
        // Si tenemos instituciones seleccionadas, intentar recargar con el CCT específico
        if (tipoInstitucion.value.length > 0) {
          const firstInstitution = tipoInstitucion.value[0];
          console.log("🔍 Intentando recargar con CCT:", firstInstitution);

          // Si el valor parece ser un CCT (numérico), usarlo para la búsqueda
          if (/^[0-9]+$/.test(firstInstitution)) {
            cctParams.value.cct = firstInstitution;
            console.log("📝 Actualizando cctParams.cct:", cctParams.value.cct);
          }
        }

        await loadCCTInstitutions();
        console.log("🔄 Instituciones recargadas:", cctInstitutions.value.length);
      } catch (error) {
        console.error("❌ Error recargando instituciones:", error);
      }
    }

    // Filtrar instituciones válidas según el modo de búsqueda
    validInstitutions = tipoInstitucion.value.filter((institutionValue) => {
      console.log(`🔎 Verificando institución "${institutionValue}"`);
      console.log(
        `📊 Modo de búsqueda: ${
          showFilters.value
            ? "Con filtros (CCTAndNameSearch)"
            : "Solo CCT (CCTOnlySearch)"
        }`
      );

      let institution = null;

      if (!showFilters.value) {
        // Búsqueda solo por CCT: verificar en selectedInstitutionsComplete
        institution = selectedInstitutionsComplete.value.find(
          (inst) => inst.value === institutionValue
        );
        console.log(
          `🔍 Buscando en selectedInstitutionsComplete:`,
          institution ? "ENCONTRADA" : "NO ENCONTRADA"
        );

        if (institution) {
          console.log(
            `✅ Institución "${institutionValue}" válida (encontrada en selectedInstitutionsComplete)`
          );
          return true;
        }
      } else {
        // Búsqueda con filtros: verificar en cctInstitutions
        institution = cctInstitutions.value.find(
          (inst) => inst.value === institutionValue
        );
        console.log(
          `🔍 Buscando en cctInstitutions:`,
          institution ? "ENCONTRADA" : "NO ENCONTRADA"
        );

        if (institution) {
          console.log(
            `✅ Institución "${institutionValue}" válida (encontrada en cctInstitutions)`
          );
          return true;
        }
      }

      // Si no encontramos la institución, verificar si podemos extraer info del value
      const parts = institutionValue.split("_");
      if (parts.length >= 3) {
        console.log(
          `✅ Institución "${institutionValue}" será procesada usando información del value compuesto`
        );
        return true; // Permitir procesar usando el value compuesto
      } else {
        // Si el value no tiene el formato esperado, pero parece ser un CCT válido
        if (
          institutionValue &&
          institutionValue.length >= 3 &&
          /^[0-9]+$/.test(institutionValue)
        ) {
          console.log(
            `✅ Institución "${institutionValue}" parece ser un CCT válido, se procesará`
          );
          return true;
        } else {
          console.error(
            `❌ Institución "${institutionValue}" no se puede procesar - formato inválido`
          );
          return false;
        }
      }
    });

    console.log("✅ Instituciones válidas encontradas:", validInstitutions);

    if (validInstitutions.length === 0) {
      console.error("❌ No se encontraron instituciones válidas");
      console.error("📊 Resumen del problema:");
      console.error("  - Instituciones seleccionadas:", tipoInstitucion.value.length);
      console.error("  - Instituciones disponibles:", cctInstitutions.value.length);
      console.error("  - Instituciones válidas:", validInstitutions.length);
      showError("No se encontraron instituciones válidas para guardar.");
      return;
    }

    if (validInstitutions.length !== tipoInstitucion.value.length) {
      console.warn("⚠️ Algunas instituciones seleccionadas no son válidas");
      showError(
        "Algunas instituciones seleccionadas no son válidas. Se guardarán solo las válidas."
      );
    }

    // Verificar instituciones duplicadas
    const visitorId = parseInt(user.value.userId);
    const existingInstitutionNames = await verificarInstitucionesExistentes(visitorId);

    const newInstitutions = validInstitutions.filter((institutionValue) => {
      let institution = null;

      // Buscar la institución según el modo de búsqueda
      if (!showFilters.value) {
        // Búsqueda solo por CCT: buscar en selectedInstitutionsComplete
        institution = selectedInstitutionsComplete.value.find(
          (inst) => inst.value === institutionValue
        );
      } else {
        // Búsqueda con filtros: buscar en cctInstitutions
        institution = cctInstitutions.value.find(
          (inst) => inst.value === institutionValue
        );
      }

      // Si no encontramos la institución, intentar extraer el nombre del value
      let institutionName = "";
      if (institution) {
        institutionName = institution.label.toLowerCase().trim();
      } else {
        // Extraer información del value compuesto como fallback
        const parts = institutionValue.split("_");
        if (parts.length >= 3) {
          // Usar el CCT como identificador único para evitar duplicados
          institutionName = `institución cct ${parts[2]}`.toLowerCase().trim();
        } else {
          // Si no podemos extraer información, asumir que es nueva
          institutionName = institutionValue.toLowerCase().trim();
        }
      }

      return !existingInstitutionNames.includes(institutionName);
    });

    if (newInstitutions.length === 0) {
      console.log(
        "⚠️ Todas las instituciones seleccionadas ya están asignadas al usuario"
      );
      showError("Todas las instituciones seleccionadas ya están asignadas a tu perfil.");
      return;
    }

    if (newInstitutions.length !== validInstitutions.length) {
      const duplicateCount = validInstitutions.length - newInstitutions.length;
      console.warn(
        `⚠️ ${duplicateCount} institución${duplicateCount > 1 ? "es" : ""} ya está${
          duplicateCount > 1 ? "n" : ""
        } asignada${duplicateCount > 1 ? "s" : ""}`
      );
      showError(
        `${duplicateCount} institución${duplicateCount > 1 ? "es" : ""} ya está${
          duplicateCount > 1 ? "n" : ""
        } asignada${
          duplicateCount > 1 ? "s" : ""
        } a tu perfil. Se guardarán solo las nuevas.`
      );
    }

    console.log("🚀 Guardando instituciones seleccionadas:", newInstitutions);

    const totalInstitutions = newInstitutions.length;
    let processedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Procesar instituciones una por una para mejor control de errores
    for (let index = 0; index < newInstitutions.length; index++) {
      const institutionValue = newInstitutions[index];

      try {
        // Buscar la institución según el modo de búsqueda
        console.log(`🔍 Buscando institución con value: "${institutionValue}"`);
        console.log(
          `📊 Modo de búsqueda: ${
            showFilters.value
              ? "Con filtros (CCTAndNameSearch)"
              : "Solo CCT (CCTOnlySearch)"
          }`
        );

        let institution = null;

        if (!showFilters.value) {
          // Búsqueda solo por CCT: usar selectedInstitutionsComplete (información del CCTOnlySearch)
          console.log(
            `📋 Instituciones completas disponibles (CCTOnlySearch):`,
            selectedInstitutionsComplete.value.map((inst) => ({
              value: inst.value,
              label: inst.label,
            }))
          );
          institution = selectedInstitutionsComplete.value.find(
            (inst) => inst.value === institutionValue
          );

          if (!institution) {
            console.log(
              `🔍 No encontrada en selectedInstitutionsComplete, buscando en cctInstitutions como fallback...`
            );
            institution = cctInstitutions.value.find(
              (inst) => inst.value === institutionValue
            );
          }
        } else {
          // Búsqueda con filtros: usar cctInstitutions (información del CCTAndNameSearch)
          console.log(
            `📋 Instituciones disponibles (CCTAndNameSearch):`,
            cctInstitutions.value.map((inst) => ({
              value: inst.value,
              label: inst.label,
            }))
          );
          institution = cctInstitutions.value.find(
            (inst) => inst.value === institutionValue
          );

          if (!institution) {
            console.log(
              `🔍 No encontrada en cctInstitutions, buscando en selectedInstitutionsComplete como fallback...`
            );
            institution = selectedInstitutionsComplete.value.find(
              (inst) => inst.value === institutionValue
            );
          }
        }

        console.log(`🎯 Institución encontrada:`, institution);

        let institutionId = 0;
        let institutionName = "";
        let institutionCct = "";

        if (institution) {
          // Si encontramos la institución, usar su información completa
          institutionId = institution.originalId || parseInt(institution.value) || 0;
          institutionName = institution.label || "";
          institutionCct =
            institution.originalCct || institution.location?.replace("CCT: ", "") || "";
          console.log(`✅ Usando datos de la institución encontrada:`, {
            institutionId,
            institutionName,
            institutionCct,
          });
        } else {
          // Si no encontramos la institución, extraer del value compuesto o usar el CCT directamente
          console.warn(
            `⚠️ Institución no encontrada, extrayendo del value: ${institutionValue}`
          );
          const parts = institutionValue.split("_");
          if (parts.length >= 3) {
            // Formato: ID_CCTID_CCT
            institutionId = parseInt(parts[0]) || 0;
            institutionCct = parts[2] || "";
            institutionName = `Institución CCT: ${institutionCct}`;
          } else if (
            institutionValue &&
            /^[0-9]+$/.test(institutionValue) &&
            institutionValue.length >= 3
          ) {
            // Solo tenemos el CCT, usar valores por defecto
            institutionId = 0; // Se usará un ID por defecto
            institutionCct = institutionValue;
            institutionName = `Institución CCT: ${institutionCct}`;
            console.log(`✅ Procesando CCT directo: ${institutionCct}`);
          } else {
            console.error(
              `❌ No se puede extraer información del value: ${institutionValue}`
            );
            errors.push(`Institución ${index + 1}: Formato de value inválido`);
            errorCount++;
            continue;
          }
        }

        // Validar datos requeridos
        // Permitir ID 0 cuando solo tenemos el CCT (se usará un ID por defecto en el API)
        if (institutionId === undefined || institutionId === null) {
          console.error(`❌ ID de institución inválido: ${institutionValue}`);
          errors.push(`Institución ${index + 1}: ID inválido`);
          errorCount++;
          continue;
        }

        if (!institutionName || institutionName.trim() === "") {
          console.error(`❌ Nombre de institución vacío: ${institutionValue}`);
          errors.push(`Institución ${index + 1}: Nombre vacío`);
          errorCount++;
          continue;
        }

        // Crear la petición para crear la institución del visitante
        const requestData = {
          visitorId,
          institutionId: institutionId,
          institutionName: institutionName.trim(),
          isSepRegistered: true, // Las instituciones CCT están registradas en SEP
          educationControlId: tipoInstitucionFiltro.value
            ? parseInt(tipoInstitucionFiltro.value)
            : 1,
          municipalityId: selectedMunicipalityId.value || 1,
          postalCodeId: cpSeleccionado.value ? parseInt(cpSeleccionado.value) : 1,
        };

        console.log(
          `📝 Creando institución ${index + 1}/${totalInstitutions}:`,
          requestData
        );

        const result = await createVisitorInstitution(requestData);

        // Verificar si la respuesta es exitosa según diferentes estructuras de API
        const resultAny = result as any;
        const isSuccess =
          result &&
          (resultAny.success === true ||
            resultAny.code === 200 ||
            resultAny.isValid === true);

        if (isSuccess) {
          processedCount++;
          console.log(
            `✅ Institución ${index + 1}/${totalInstitutions} creada exitosamente:`,
            result
          );
        } else {
          console.error(
            `❌ Error en respuesta de API para institución ${index + 1}:`,
            result
          );
          const errorMsg =
            resultAny?.comments || resultAny?.message || "Error en respuesta de API";
          errors.push(`Institución ${index + 1}: ${errorMsg}`);
          errorCount++;
        }
      } catch (error) {
        console.error(
          `❌ Error creando institución ${index + 1}/${totalInstitutions}:`,
          error
        );
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        errors.push(`Institución ${index + 1}: ${errorMessage}`);
        errorCount++;
      }
    }

    // Mostrar resultados
    if (processedCount > 0) {
      console.log("🎉 Instituciones guardadas exitosamente:", processedCount);

      let successMessage = `Se guardaron ${processedCount} de ${totalInstitutions} institución${
        totalInstitutions > 1 ? "es" : ""
      } exitosamente`;

      if (errorCount > 0) {
        successMessage += `. ${errorCount} institución${
          errorCount > 1 ? "es" : ""
        } falló${errorCount > 1 ? "ron" : ""}.`;
        console.warn("⚠️ Errores durante el guardado:", errors);
      }

      // Mostrar toast de éxito
      showSuccess(successMessage);

      // Emitir evento para notificar al componente padre
      // Convertir los CCTs a nombres de instituciones para el evento
      const institutionNames = newInstitutions.map((institutionValue) => {
        let institution = null;

        // Buscar la institución según el modo de búsqueda
        if (!showFilters.value) {
          // Búsqueda solo por CCT: buscar en selectedInstitutionsComplete
          institution = selectedInstitutionsComplete.value.find(
            (inst) => inst.value === institutionValue
          );
        } else {
          // Búsqueda con filtros: buscar en cctInstitutions
          institution = cctInstitutions.value.find(
            (inst) => inst.value === institutionValue
          );
        }

        // Retornar el nombre de la institución si se encuentra, sino el CCT como fallback
        return institution ? institution.label : institutionValue;
      });

      emit("add-institutions", institutionNames);

      // Cerrar el diálogo
      open.value = false;

      // Limpiar selección
      tipoInstitucion.value = [];
    } else {
      console.error("❌ No se pudo guardar ninguna institución");
      const errorMessage =
        errorCount > 0
          ? `No se pudo guardar ninguna institución. Errores: ${errors.join(", ")}`
          : "No se pudo guardar ninguna institución. Intenta nuevamente.";
      showError(errorMessage);
    }
  } catch (error) {
    console.error("❌ Error general guardando instituciones:", error);
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    showError(`Error al guardar las instituciones: ${errorMessage}`);
  }
};

// Función para obtener el nombre de la institución desde el value compuesto
const getInstitutionLabel = (institutionValue: string): string => {
  console.log("🔍 Buscando institución con value:", institutionValue);
  console.log(
    `📊 Modo de búsqueda: ${
      showFilters.value ? "Con filtros (CCTAndNameSearch)" : "Solo CCT (CCTOnlySearch)"
    }`
  );

  let institution = null;

  if (!showFilters.value) {
    // Búsqueda solo por CCT: buscar primero en selectedInstitutionsComplete
    console.log(
      "📋 Instituciones completas disponibles (CCTOnlySearch):",
      selectedInstitutionsComplete.value.map((inst) => ({
        value: inst.value,
        label: inst.label,
      }))
    );
    institution = selectedInstitutionsComplete.value.find(
      (inst) => inst.value === institutionValue
    );

    // Si no se encuentra, buscar en cctInstitutions como fallback
    if (!institution) {
      console.log(
        "🔍 No encontrada en selectedInstitutionsComplete, buscando en cctInstitutions..."
      );
      institution = cctInstitutions.value.find((inst) => inst.value === institutionValue);
    }
  } else {
    // Búsqueda con filtros: buscar primero en cctInstitutions
    console.log(
      "📋 Instituciones disponibles (CCTAndNameSearch):",
      cctInstitutions.value.map((inst) => ({ value: inst.value, label: inst.label }))
    );
    institution = cctInstitutions.value.find((inst) => inst.value === institutionValue);

    // Si no se encuentra, buscar en selectedInstitutionsComplete como fallback
    if (!institution) {
      console.log(
        "🔍 No encontrada en cctInstitutions, buscando en selectedInstitutionsComplete..."
      );
      institution = selectedInstitutionsComplete.value.find(
        (inst) => inst.value === institutionValue
      );
    }
  }

  if (!institution) {
    console.warn("⚠️ Institución no encontrada en ninguna lista:", institutionValue);
    // Intentar extraer el nombre del value si es posible
    const parts = institutionValue.split("_");
    if (parts.length >= 3) {
      return `Institución CCT: ${parts[2]}`; // parts[2] debería ser el CCT
    } else if (institutionValue && /^[0-9]+$/.test(institutionValue)) {
      // Si el value es solo un CCT numérico, crear un nombre descriptivo
      return `Institución CCT: ${institutionValue}`;
    }
  }

  return institution?.label || "Institución no encontrada";
};

// Función para obtener el CCT de la institución desde el value compuesto
const getInstitutionCCT = (institutionValue: string): string => {
  let institution = null;

  if (!showFilters.value) {
    // Búsqueda solo por CCT: buscar primero en selectedInstitutionsComplete
    institution = selectedInstitutionsComplete.value.find(
      (inst) => inst.value === institutionValue
    );

    // Si no se encuentra, buscar en cctInstitutions como fallback
    if (!institution) {
      institution = cctInstitutions.value.find((inst) => inst.value === institutionValue);
    }
  } else {
    // Búsqueda con filtros: buscar primero en cctInstitutions
    institution = cctInstitutions.value.find((inst) => inst.value === institutionValue);

    // Si no se encuentra, buscar en selectedInstitutionsComplete como fallback
    if (!institution) {
      institution = selectedInstitutionsComplete.value.find(
        (inst) => inst.value === institutionValue
      );
    }
  }

  if (!institution) {
    // Intentar extraer el CCT del value si es posible
    const parts = institutionValue.split("_");
    if (parts.length >= 3) {
      return parts[2]; // parts[2] debería ser el CCT
    } else if (institutionValue && /^[0-9]+$/.test(institutionValue)) {
      // Si el value es solo un CCT numérico, devolverlo directamente
      return institutionValue;
    }
  }

  return (
    institution?.originalCct ||
    institution?.location?.replace("CCT: ", "") ||
    "CCT no disponible"
  );
};

// Función para remover una institución de la selección
const removeInstitution = (institutionValue: string) => {
  const index = tipoInstitucion.value.indexOf(institutionValue);
  if (index > -1) {
    tipoInstitucion.value.splice(index, 1);
  }
};

// Función para limpiar todos los filtros
const limpiarFiltros = () => {
  console.log("🧹 Limpiando todos los filtros");

  // Limpiar variables de filtro
  entidadSeleccionada.value = "";
  municipioSeleccionado.value = "";
  localidadSeleccionada.value = "";
  cpSeleccionado.value = "";
  tipoInstitucionFiltro.value = "";
  turnoEducativoFiltro.value = "";
  busquedaNombreCCT.value = "";

  // Resetear IDs seleccionados
  selectedStateId.value = null;
  selectedMunicipalityId.value = null;

  // Limpiar datos locales
  localMunicipalities.value = [];
  localLocalities.value = [];

  // Resetear parámetros CCT
  cctParams.value = {
    stateId: 1,
    pageNumber: 1,
    pageSize: 50,
    institutionName: undefined,
    cct: undefined,
    municipalityId: undefined,
    localityId: undefined,
    postalCode: undefined,
    educationalControlTypeId: undefined,
    educationShiftId: undefined,
  };

  // Limpiar instituciones CCT cargadas
  cctInstitutions.value = [];

  // Limpiar instituciones seleccionadas
  tipoInstitucion.value = [];
  selectedInstitutionsComplete.value = [];

  // Cerrar opciones de búsqueda
  showFilterSelectCheck.value = false;

  // Resetear componentes de búsqueda si están disponibles
  if (filterSelectCheckRef.value && filterSelectCheckRef.value.clearAll) {
    // Resetear CCTOnlySearch si está activo
    console.log("🔄 Reseteando CCTOnlySearch");
    filterSelectCheckRef.value.clearAll();
  }

  if (cctAndNameSearchRef.value && cctAndNameSearchRef.value.clearAll) {
    // Resetear CCTAndNameSearch si está activo
    console.log("🔄 Reseteando CCTAndNameSearch");
    cctAndNameSearchRef.value.clearAll();
  }

  // Recargar códigos postales completos
  fetchPostalCodes();

  console.log("✅ Filtros limpiados completamente");
};

// Cerrar dropdown cuando se hace clic fuera
function handleClickOutside(event: Event) {
  const target = event.target as HTMLElement;
  if (!target.closest(".space-y-0")) {
    showOptions.value = false;
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  console.log("Usuario desde el modal:", user.value);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);

  // Limpiar el timer de debounce para evitar memory leaks
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
});
</script>
