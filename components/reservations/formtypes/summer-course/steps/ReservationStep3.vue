<template>
  <form @submit.prevent="handleComplete" class="space-y-4">
    <h3 class="text-2xl font-semibold">Información complementaria</h3>
    <!-- INICIA SECCION DE TALLERES -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <h3 class="text-base font-medium">Interés por algún taller</h3>
        <!-- Botón temporalmente deshabilitado hasta que se implemente la navegación correcta -->
        <!-- <button
          v-if="selectedWorkshops.length > 0"
          @click="navigateToWorkshops"
          class="text-sm text-primary underline hover:text-primary/80"
        >
          Modificar talleres
        </button> -->
      </div>

      <!-- Card temporalmente deshabilitado - se usa taller por defecto -->
      <!-- <Card
        v-if="selectedWorkshops.length === 0"
        @click="navigateToWorkshops"
        class="bg-secondary/10 cursor-pointer hover:bg-secondary/20 shadow-none border-0 rounded-full transition-colors py-1 px-2"
      >
        <CardContent class="flex items-center justify-between py-1 px-2">
          <p class="text-base text-muted-foreground">
            Selecciona los talleres de tu interés
          </p>
          <Icon
            icon="lucide:chevron-right"
            width="16"
            height="16"
            class="text-muted-foreground"
          />
        </CardContent>
      </Card> -->

      <!-- Grilla de talleres seleccionados -->
      <div class="w-full bg-secondary/10 rounded-lg">
        <div v-if="selectedWorkshops.length > 0" class="grid grid-cols-3 gap-3">
          <div
            v-for="workshop in selectedWorkshopsData"
            :key="workshop.id"
            class="w-full rounded-lg p-3 cursor-pointer hover:bg-secondary/20 transition-colors"
            @click="openWorkshopContent(workshop)"
          >
            <div
              class="w-20 h-15 aspect-square bg-muted-foreground/20 rounded-md flex items-center justify-center mb-2"
            >
              <Icon
                v-if="workshop.type === 'video'"
                icon="ri:play-circle-fill"
                class="w-8 h-8 text-white"
              />
              <Icon
                v-else-if="workshop.type === 'pdf'"
                icon="ri:file-pdf-fill"
                class="w-8 h-8 text-white"
              />
              <Icon v-else icon="ri:image-fill" class="w-8 h-8 text-white" />
            </div>
            <p class="text-xs text-center font-medium">{{ workshop.title }}</p>
          </div>
        </div>
      </div>

      <!-- Modal para visualizar contenido del taller -->
      <WorkshopContentViewer
        v-if="selectedWorkshopContent"
        :workshop="selectedWorkshopContent"
        v-model:open="showContentModal"
      />
    </div>

    <InfoAlert
      :message-class="'text-black font-normal'"
      message-size="text-sm"
      message="Se ha seleccionado un taller por defecto. Esta funcionalidad se encuentra en desarrollo y próximamente podrás seleccionar los talleres de tu preferencia."
    />

    <!-- TERMINA SECCION DE TALLERES -->
    <div class="space-y-2">
      <FormField v-slot="{ componentField }" name="discoveryChannelId">
        <FormItem>
          <FormLabel>Señala el medio por el que te enteraste del MIDE</FormLabel>
          <FormControl>
            <OptionListField
              v-bind="componentField"
              placeholder="Selecciona una opción"
              :options="discoveryChannels"
              :disabled="!discoveryChannels || discoveryChannels.length === 0"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="paymentMethodId">
        <FormItem>
          <FormLabel>Forma de pago</FormLabel>
          <FormControl>
            <OptionListField
              v-bind="componentField"
              placeholder="Selecciona una opción"
              :options="paymentMethods"
              :disabled="!paymentMethods || paymentMethods.length === 0"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <InfoAlert
        message="Si requieres factura, presenta la constancia de situación fiscal el día de la visita."
        class="mt-3"
      />

      <Separator class="my-10 bg-muted max-w-3/4 mx-auto" />
    </div>

    <div class="space-y-4">
      <h3 class="text-xl font-semibold mb-2">Observaciones extra</h3>
      <h4 class="text-base font-semibold">
        En caso de ser necesario, indica si requieres alguno de estos apoyos:
      </h4>

      <FormField
        v-slot="{ value, handleChange }"
        type="checkbox"
        name="requiresDetailedLocationInformation"
      >
        <FormItem>
          <div class="flex items-start space-x-2">
            <FormControl>
              <Checkbox
                :model-value="value"
                @update:model-value="handleChange"
                variant="secondary"
                id="parking-info"
                class="mt-1"
              />
            </FormControl>
            <FormLabel for="parking-info" class="text-sm font-normal">
              Conocer la documentacion de proteccion civil
            </FormLabel>
          </div>
        </FormItem>
      </FormField>

      <FormField
        v-slot="{ value, handleChange }"
        type="checkbox"
        name="requestsPostVisitInvoice"
      >
        <FormItem>
          <div class="flex items-start space-x-2">
            <FormControl>
              <Checkbox
                :model-value="value"
                @update:model-value="handleChange"
                variant="secondary"
                id="invoice"
                class="mt-1"
              />
            </FormControl>
            <FormLabel for="invoice" class="text-sm font-normal">
              Acompañamiento para cruzar la calle durante el ascenso y descenso de
              transporte. (aplica solo en casos especiales, como adultos mayores, personas
              con discapacidad, etc.)
            </FormLabel>
          </div>
        </FormItem>
      </FormField>

      <InfoAlert
        message="Recuerda que el descenso del transporte tiene una tolerancia de 10 minutos."
        class="mt-3 mb-10"
      />

      <FormField
        v-slot="{ value, handleChange }"
        type="checkbox"
        name="confirmsInformationAccuracy"
      >
        <FormItem>
          <div class="flex items-start space-x-2">
            <FormControl>
              <Checkbox
                :model-value="value"
                @update:model-value="handleChange"
                variant="secondary"
                id="confirm-terms"
                class="mt-1"
              />
            </FormControl>
            <FormLabel for="confirm-terms" class="text-sm font-normal">
              Confirmo que la información proporcionada es correcta y acepto los términos
              y condiciones para la visita
            </FormLabel>
          </div>
          <FormMessage />
        </FormItem>
      </FormField>
    </div>

    <Separator class="my-10 bg-muted max-w-3/4 mx-auto" />

    <!-- Sección de Documentos - Solo se muestra si el método de pago es transferencia bancaria -->
    <div v-if="shouldShowDocuments" class="space-y-4">
      <h3 class="text-xl font-semibold">Documentos</h3>

      <!-- Contenedor principal de documentos -->
      <div class="bg-secondary/10 p-2 rounded-xl space-y-4">
        <!-- Botón de subir documentos -->
        <div class="flex items-center space-x-2">
          <input
            ref="fileInput"
            type="file"
            multiple
            :accept="acceptedFileTypes"
            @change="handleFileUpload"
            class="hidden"
          />
          <Button
            type="button"
            @click="$refs.fileInput.click()"
            variant="ghost"
            :disabled="!canUpload"
            class="flex items-center space-x-1 text-primary border-primary hover:bg-primary hover:text-white"
          >
            <span
              class="w-7 h-7 bg-primary border-white border-2 rounded-full flex items-center justify-center"
            >
              <Icon icon="lucide:upload" class="w-4 h-4 text-white" />
            </span>
            <span class="italic">Seleccionar documentos</span>
          </Button>

          <!-- Botón para subir todos los documentos locales (oculto porque ahora es automático) -->
          <!-- <Button
            type="button"
            v-if="hasLocalDocuments"
            @click="handleUploadAllDocuments"
            :disabled="!canUpload || uploadState.isUploading"
            variant="outline"
            size="sm"
          >
            <Icon icon="lucide:cloud-upload" class="w-4 h-4 mr-1" />
            {{ uploadState.isUploading ? "Subiendo..." : "Subir todos" }}
          </Button> -->
        </div>

        <!-- Estado de carga -->
        <div v-if="uploadState.isUploading" class="w-full bg-gray-200 rounded-full h-2">
          <div
            class="bg-primary h-2 rounded-full transition-all duration-300"
            :style="{ width: uploadState.uploadProgress + '%' }"
          ></div>
        </div>

        <!-- Error de carga -->
        <div v-if="uploadState.error" class="text-sm text-red-600 bg-red-50 p-2 rounded">
          {{ uploadState.error }}
        </div>

        <!-- Documentos del servidor -->
        <div v-if="hasDocuments" class="space-y-2">
          <div class="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
            <div
              v-for="(doc, index) in serverDocuments"
              :key="index"
              class="flex-shrink-0 min-w-[130px] max-w-[100px]"
            >
              <div
                class="flex flex-col justify-center bg-secondary/20 min-h-[70px] border rounded-2xl p-3 items-center space-y-2"
              >
                <!-- Ícono PDF -->
                <div class="w-8 h-8 rounded flex items-center justify-center">
                  <Icon icon="lucide:file-text" class="w-5 h-5 text-black" />
                </div>
              </div>
              <div class="flex items-center justify-between pt-2">
                <!-- Nombre del documento -->
                <span
                  class="text-xs text-center text-gray-700 truncate w-3/4"
                  :title="doc.fileName"
                >
                  {{ doc.fileName }}
                </span>

                <!-- Botón de eliminar -->
                <Button
                  type="button"
                  @click="
                    () => {
                      console.log('🔍 Document fields:', Object.keys(doc));
                      console.log('🔍 Document values:', doc);
                      handleDeleteServerDocument(
                        doc.id || doc.documentId || doc.DocumentId
                      );
                    }
                  "
                  variant="ghost"
                  size="sm"
                  class="w-6 h-6 p-0 rounded-full bg-destructive text-white"
                >
                  <Icon icon="lucide:trash-2" class="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensaje cuando no hay documentos -->
        <!-- <div v-if="!hasDocuments" class="text-center text-gray-500 py-4">
          <Icon icon="lucide:file-text" class="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p class="text-sm">No hay documentos subidos</p>
        </div> -->
      </div>

      <InfoAlert
        :message="`Asegúrate de enviar los documentos en los siguientes formatos: ${getFormattedAllowedTypes()}, escaneados y legibles.`"
        class="mt-3"
      />
    </div>

    <div class="space-y-6">
      <h3 class="text-2xl font-semibold">Total</h3>

      <div class="bg-secondary/10 rounded-xl mt-3 px-5 py-3.5">
        <div class="space-y-6">
          <!-- Estado de carga -->
          <div v-if="isCostLoading" class="flex items-center justify-center py-4">
            <div
              class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"
            ></div>
            <span class="ml-2 text-sm">Cargando costos...</span>
          </div>

          <!-- Error al cargar costos -->
          <div v-else-if="hasCostError" class="text-center py-4 my-4">
            <div class="text-red-600 text-sm mb-2">
              <Icon icon="mdi:alert-circle" class="inline mr-1" />
              Error al cargar costos
            </div>
            <p class="text-xs text-gray-600">{{ costError }}</p>
            <button
              @click="loadReservationCosts"
              class="mt-2 text-xs text-primary hover:underline"
            >
              Reintentar
            </button>
          </div>

          <!-- Datos de costos cargados -->
          <div v-else-if="hasCostData" class="space-y-3">
            <!-- Total de niños menores de 3 años (si aplica) -->
            <div v-if="peopleBreakdown?.kidsUnderThree" class="w-full flex items-center">
              <span class="text-base font-medium">Niños menores de 3 años</span>
              <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
              <span class="text-base font-medium">{{
                formatPeople(peopleBreakdown?.kidsUnderThree || 0)
              }}</span>
            </div>
            <!-- Total de niños (si aplica) -->
            <div v-if="peopleBreakdown?.kids" class="w-full flex items-center">
              <span class="text-base font-medium">Niños (De 4 a 12 años)</span>
              <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
              <span class="text-base font-medium">{{
                formatPeople(peopleBreakdown?.kids || 0)
              }}</span>
            </div>
            <!-- Total de niños con discapacidad (si aplica) -->
            <div
              v-if="peopleBreakdown?.kidsWithDisabilities"
              class="w-full flex items-center"
            >
              <span class="text-xs italic font-medium"
                >Niños (De 4 a 12 años) con discapacidad</span
              >
              <div class="flex-grow border-t-1 border-dashed border-black mx-4"></div>
              <span class="text-xs italic font-medium">{{
                formatPeople(peopleBreakdown?.kidsWithDisabilities || 0)
              }}</span>
            </div>
            <!-- Total de adolescentes (si aplica) -->
            <div v-if="peopleBreakdown?.teenagers" class="w-full flex items-center">
              <span class="text-base font-medium">Adolescentes (De 13 a 17 años)</span>
              <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
              <span class="text-base font-medium">{{
                formatPeople(peopleBreakdown?.teenagers || 0)
              }}</span>
            </div>
            <!-- Total de adolescentes con discapacidad (si aplica) -->
            <div
              v-if="peopleBreakdown?.teenagersWithDisabilities"
              class="w-full flex items-center"
            >
              <span class="text-xs italic font-medium"
                >Adolescentes (De 13 a 17 años) con discapacidad</span
              >
              <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
              <span class="text-xs italic font-medium">{{
                formatPeople(peopleBreakdown?.teenagersWithDisabilities || 0)
              }}</span>
            </div>
            <!-- Total de jóvenes (si aplica) -->
            <div v-if="peopleBreakdown?.youngAdults" class="w-full flex items-center">
              <span class="text-base font-medium">Jóvenes (De 18 a 24 años)</span>
              <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
              <span class="text-base font-medium">{{
                formatPeople(peopleBreakdown?.youngAdults || 0)
              }}</span>
            </div>
            <!-- Total de jóvenes con discapacidad (si aplica) -->
            <div
              v-if="peopleBreakdown?.youngAdultsWithDisabilities"
              class="w-full flex items-center"
            >
              <span class="text-xs italic font-medium"
                >Jóvenes (De 18 a 24 años) con discapacidad</span
              >
              <div class="flex-grow border-t-1 border-dashed border-black mx-4"></div>
              <span class="text-xs italic font-medium">{{
                formatPeople(peopleBreakdown?.youngAdultsWithDisabilities || 0)
              }}</span>
            </div>
            <!-- Total de adultos (si aplica) -->
            <div v-if="peopleBreakdown?.adults" class="w-full flex items-center">
              <span class="text-base font-medium">Adultos (De 25 a 59 años)</span>
              <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
              <span class="text-base font-medium">{{
                formatPeople(peopleBreakdown?.adults || 0)
              }}</span>
            </div>
            <!-- Total de adultos con discapacidad (si aplica) -->
            <div
              v-if="peopleBreakdown?.adultsWithDisabilities"
              class="w-full flex items-center"
            >
              <span class="text-xs italic font-medium"
                >Adultos (De 25 a 59 años) con discapacidad</span
              >
              <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
              <span class="text-xs italic font-medium">{{
                formatPeople(peopleBreakdown?.adultsWithDisabilities || 0)
              }}</span>
            </div>
            <!-- Total de adultos mayores (si aplica) -->
            <div v-if="peopleBreakdown?.seniors" class="w-full flex items-center">
              <span class="text-base font-medium">Adultos mayores (60 años o más)</span>
              <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
              <span class="text-base font-medium">{{
                formatPeople(peopleBreakdown?.seniors || 0)
              }}</span>
            </div>
            <!-- Total de adultos mayores con discapacidad (si aplica) -->
            <div
              v-if="peopleBreakdown?.seniorsWithDisabilities"
              class="w-full flex items-center"
            >
              <span class="text-xs italic font-medium"
                >Adultos mayores (60 años o más) con discapacidad</span
              >
              <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
              <span class="text-xs italic font-medium">{{
                formatPeople(peopleBreakdown?.seniorsWithDisabilities || 0)
              }}</span>
            </div>
            <div class="mt-2">
              <!-- Total de personas (si aplica) -->
              <div v-if="costTotalPeople" class="w-full flex items-center">
                <span class="text-base font-medium">Total de personas</span>
                <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
                <span class="text-base font-medium">{{
                  formatPeople(costTotalPeople || 0)
                }}</span>
              </div>
              <!-- Total de personas con discapacidad (si aplica) -->
              <div
                v-if="costTotalPeopleWithDisabilities"
                class="w-full flex items-center"
              >
                <span class="text-xs italic font-medium"
                  >Total de personas con discapacidad</span
                >
                <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
                <span class="text-xs italic font-medium">{{
                  formatPeople(costTotalPeopleWithDisabilities || 0)
                }}</span>
              </div>
            </div>
            <!-- Costo total calculado -->
            <div class="w-full flex items-center mt-2">
              <span class="text-xl font-semibold">Total:</span>
              <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
              <span class="text-xl font-semibold">{{
                formatCurrency(costTotalCost)
              }}</span>
            </div>
          </div>

          <!-- Estado sin datos (fallback) -->
          <div v-else class="text-center py-4">
            <div class="text-gray-500 text-sm">
              <Icon icon="mdi:information-outline" class="inline mr-1" />
              No hay datos de costos disponibles
            </div>
            <button
              @click="loadReservationCosts"
              class="mt-2 text-xs text-primary hover:underline"
            >
              Cargar costos
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje de descuento especial -->
    <div class="flex items-center space-x-2 my-2">
      <Icon icon="mage:megaphone-a" width="185" height="50" class="text-[#003DA6]" />
      <p class="text-sm font-normal">
        <span class="font-semibold">Monto a pagar aproximado.</span> El cálculo es
        aproximado, al momento de la asistencia se confirmará el número de asistentes así
        cómo promociones aplicadas.
      </p>
    </div>

    <!-- Botones de acción -->
    <div class="flex space-x-2 mt-6">
      <!-- Botón Terminar - siempre visible -->
      <Button
        variant="secondary"
        class="flex-1"
        @click="handleComplete"
        :disabled="isUpdating"
      >
        <div v-if="isUpdating" class="flex items-center justify-center">
          <div
            class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
          ></div>
          Completando...
        </div>
        <span v-else>Terminar</span>
      </Button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@iconify/vue";
// Los componentes Select ya no se usan
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import WorkshopContentViewer from "@/components/workshops/WorkshopContentViewer.vue";
import { useWorkshopsStore } from "@/stores/workshops";
// Los talleres no se usan en el formulario empresarial
import { useReservationSummerCourse } from "@/composables/reservations/useReservationSummerCourse";
import { useReservationDocuments } from "@/composables/reservations/useReservationDocuments";
import { useAuthStore } from "@/stores/auth";
import {
  getAcceptedFileTypes,
  getFormattedAllowedTypes,
} from "@/lib/api/config/document-types";
import OptionListField from "@/components/common/OptionListField.vue";
import { useCatalog } from "@/composables/catalog/useCatalog";
import InfoAlert from "@/components/common/InfoAlert.vue";
import { Separator } from "@/components/ui/separator";

// Composable para reservaciones de cursos de verano
const {
  store,
  formData: reservationFormData,
  currentReservationId,
  updateFormData,
  getStepData,
  updateReservationStep3,
  isUpdating,
  error,
  currentReservation,
  loadStep1,
  loadStep3,
  costBreakdown,
} = useReservationSummerCourse();

const { fetchCatalogs, catalogs } = useCatalog();

// Usar el store de talleres
const workshopsStore = useWorkshopsStore();
const selectedWorkshops = computed(() => workshopsStore.selectedWorkshops);
const selectedWorkshopsData = computed(() => workshopsStore.selectedWorkshopsData);

// Computed properties para costos desde costBreakdown
const hasCostData = computed(() => !!costBreakdown.value);
const isCostLoading = computed(() => store.isLoadingStep3);
const hasCostError = computed(() => !!store.stepErrors.step3);
const costError = computed(() => store.stepErrors.step3);

const costTotalPeople = computed(() => costBreakdown.value?.totalPeople || 0);
const costTotalCost = computed(() => costBreakdown.value?.totalCost || 0);
const costTotalPeopleWithDisabilities = computed(
  () => costBreakdown.value?.totalDisabilities || 0
);

const peopleBreakdown = computed(() => {
  if (!costBreakdown.value) return null;
  return {
    kidsUnderThree: costBreakdown.value.totalKidsUnderThree,
    kids: costBreakdown.value.totalKids,
    kidsWithDisabilities: costBreakdown.value.totalKidsWithDisabilities,
    teenagers: costBreakdown.value.totalTeenagers,
    teenagersWithDisabilities: costBreakdown.value.totalTeenagersWithDisabilities,
    youngAdults: costBreakdown.value.totalYoungAdults,
    youngAdultsWithDisabilities: costBreakdown.value.totalYoungAdultsWithDisabilities,
    adults: costBreakdown.value.totalAdults,
    adultsWithDisabilities: costBreakdown.value.totalAdultsWithDisabilities,
    seniors: costBreakdown.value.totalSeniors,
    seniorsWithDisabilities: costBreakdown.value.totalSeniorsWithDisabilities,
  };
});

// Funciones de formato
const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(value);
};

const formatPeople = (value) => {
  return value.toString();
};

// Store de autenticación para obtener el usuario actual
const authStore = useAuthStore();

// Usar la configuración centralizada de tipos de documentos
const acceptedFileTypes = computed(() => getAcceptedFileTypes());

// Estado para el modal de contenido de talleres
const showContentModal = ref(false);
const selectedWorkshopContent = ref(null);

// Navegación a la vista de talleres
const navigateToWorkshops = () => {
  navigateTo("/workshops");
};

// Visualización de contenido del taller
const openWorkshopContent = (workshop) => {
  selectedWorkshopContent.value = workshop;
  showContentModal.value = true;
};

// Bandera para controlar si se están cargando datos del header
const isLoadingHeaderData = ref(false);

// Debounce para evitar múltiples ejecuciones del watcher
let headerDataTimeout = null;

// Composable para documentos de reservación
const reservationIdRef = computed(() => {
  console.log("🔍 reservationIdRef:", store.currentReservationId);
  return store.currentReservationId;
});
const userModifiedIdRef = computed(() => {
  console.log("🔍 userModifiedIdRef:", authStore.currentUser?.userId);
  return authStore.currentUser?.userId || null;
});
const {
  documents: serverDocuments,
  uploadState,
  hasDocuments,
  canUpload,
  uploadFileDirectly,
  deleteDocument,
  resetUploadState,
  cleanup: cleanupDocuments,
} = useReservationDocuments(reservationIdRef, userModifiedIdRef);

// Debug: Log del estado de canUpload
watch(
  canUpload,
  (newValue) => {
    console.log("🔍 canUpload changed:", newValue);
  },
  { immediate: true }
);

const props = defineProps({
  type: {
    type: String,
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

const emit = defineEmits(["complete", "back", "navigate-to-step"]);

// Schema de validación con Zod para el Paso 3
// Solo requiere confirmsInformationAccuracy según los datos del API
const formSchema = toTypedSchema(
  z.object({
    // Campos opcionales (nullable)
    discoveryChannelId: z.union([z.string(), z.number()]).nullable().optional(),
    paymentMethodId: z.union([z.string(), z.number()]).nullable().optional(),

    // Checkboxes opcionales
    requiresDetailedLocationInformation: z.boolean().optional(),
    requestsPostVisitInvoice: z.boolean().optional(),

    // Campo requerido: confirmsInformationAccuracy debe ser true
    confirmsInformationAccuracy: z
      .boolean()
      .optional()
      .refine((val) => {
        return val === true;
      }, "Debes confirmar que la información es correcta y aceptar los términos"),
  })
);

// Formulario con vee-validate
const { handleSubmit, errors, values, setFieldValue } = useForm({
  validationSchema: formSchema,
  validateOnMount: false,
  validateOnInput: false,
  validateOnChange: false,
  initialValues: {},
});

// Los datos ahora se manejan a través de vee-validate

// Los talleres no se usan en el formulario empresarial
const discoveryChannels = ref([]);

const paymentMethods = ref([]);

// Computed property para determinar si se debe mostrar la sección de documentos
const shouldShowDocuments = computed(() => {
  // Si hay documentos cargados, siempre mostrar la sección
  if (hasDocuments.value) {
    return true;
  }

  // Si no hay método de pago seleccionado, no mostrar
  if (!values.paymentMethodId) return false;

  // Buscar el método de pago seleccionado en la lista
  const selectedPaymentMethod = paymentMethods.value.find(
    (method) =>
      method.value === values.paymentMethodId || method.id === values.paymentMethodId
  );

  if (!selectedPaymentMethod) return false;

  // Verificar si el label contiene palabras relacionadas con transferencia bancaria
  const label = selectedPaymentMethod.label?.toLowerCase() || "";
  return (
    label.includes("transferencia") ||
    label.includes("transfer") ||
    label.includes("bancaria")
  );
});

// Función para cargar conceptos económicos secundarios
const loadDiscoveryChannels = async () => {
  try {
    console.log("🔄 Cargando DiscoveryChannels...");
    await fetchCatalogs({ tableName: "DiscoveryChannels" });

    // Filtrar y transformar los conceptos secundarios
    const concepts = catalogs.value.filter(
      (catalog) => catalog.tableName === "DiscoveryChannels" && catalog.enable
    );

    const transformedConcepts = concepts.map((concept) => ({
      value: concept.id,
      label: concept.value,
      id: concept.id,
    }));

    discoveryChannels.value = transformedConcepts;
    console.log("✅ DiscoveryChannels cargados:", transformedConcepts);
  } catch (error) {
    console.error("❌ Error al cargar DiscoveryChannels:", error);
    discoveryChannels.value = [
      { value: "no_disponible", label: "Opciones no disponibles" },
    ];
  }
};

// Función para cargar DiscoveryChannels
const loadPaymentMethods = async () => {
  try {
    console.log("🔄 Cargando PaymentMethods...");
    await fetchCatalogs({ tableName: "PaymentMethod" });

    // Filtrar y transformar los PaymentMethods
    const concepts = catalogs.value.filter(
      (catalog) => catalog.tableName === "PaymentMethod" && catalog.enable
    );

    const transformedPaymentMethods = concepts.map((concept) => ({
      value: concept.id,
      label: concept.value,
      id: concept.id,
    }));

    paymentMethods.value = transformedPaymentMethods;
    console.log("✅ PaymentMethods cargados:", transformedPaymentMethods);
  } catch (error) {
    console.error("❌ Error al cargar PaymentMethods:", error);
    paymentMethods.value = [{ value: "no_disponible", label: "Opciones no disponibles" }];
  }
};

// Función para cargar los costos de la reservación
// Los costos ahora vienen del mismo endpoint getStep3, no es necesario un endpoint separado
const loadReservationCosts = async () => {
  // Intentar obtener el ID de reservación de múltiples fuentes
  const reservationId =
    store.currentReservationId || props.reservationId || reservationIdRef.value;

  if (!reservationId || reservationId === 0) {
    console.warn("⚠️ No hay ID de reservación válido para cargar costos:", {
      storeId: store.currentReservationId,
      propsId: props.reservationId,
      refId: reservationIdRef.value,
    });
    return;
  }

  try {
    console.log("🔄 Cargando datos del paso 3 (incluye costos):", reservationId);
    // Cargar datos del paso 3, que incluyen costBreakdown
    const step3Data = await loadStep3(reservationId);

    // loadStep3 puede devolver false si ya está cargando, o los datos si fue exitoso
    if (step3Data === false) {
      console.log(
        "ℹ️ Los datos del paso 3 ya se están cargando o fueron cargados recientemente"
      );
      return;
    }

    // Verificar que los datos se cargaron correctamente
    // El costBreakdown ya está guardado en el store por loadStep3
    if (costBreakdown.value) {
      console.log("✅ Costos cargados desde getStep3:", costBreakdown.value);
    } else {
      console.warn("⚠️ No se encontró costBreakdown en el store después de loadStep3");
    }
  } catch (error) {
    console.error("❌ Error al cargar datos del paso 3 (costos):", error);
  }
};

// Funciones para manejo de documentos - subida directa al servidor
const handleFileUpload = async (event) => {
  const files = Array.from(event.target.files);

  for (const file of files) {
    console.log(`🔄 Subiendo archivo directamente: ${file.name}`);
    try {
      const uploadResult = await uploadFileDirectly(file);
      if (!uploadResult.success) {
        console.warn(`Error al subir archivo ${file.name}:`, uploadResult.error);
        alert(
          `Error al subir ${file.name}: ${uploadResult.error || "Error desconocido"}`
        );
      } else {
        console.log(`✅ Archivo ${file.name} subido exitosamente`);
      }
    } catch (error) {
      console.error(`❌ Error al subir archivo ${file.name}:`, error);
      alert(`Error al subir ${file.name}: ${error.message || "Error desconocido"}`);
    }
  }

  // Limpiar el input para permitir subir el mismo archivo nuevamente
  event.target.value = "";
};

const handleDeleteServerDocument = async (documentId) => {
  console.log("🔍 handleDeleteServerDocument called with:", documentId);
  console.log("🔍 serverDocuments:", serverDocuments.value);
  console.log("🔍 First document structure:", serverDocuments.value[0]);

  if (!documentId) {
    console.error("❌ documentId is undefined or null");
    return;
  }

  const result = await deleteDocument(documentId);
  if (!result.success) {
    console.error("Error al eliminar documento:", result.error);
    // Aquí podrías mostrar un toast de error
  }
};

// Inicializar datos cuando se monta el componente
onMounted(async () => {
  // ⚠️ VALIDACIÓN CRÍTICA: Verificar que hay un ID de reservación
  console.log("🔍 Paso 3 - Verificación de estado:");
  console.log("  - currentReservationId:", store.currentReservationId);
  console.log("  - currentReservation:", currentReservation.value);
  console.log("  - formData completo:", store.formData);

  if (!store.currentReservationId) {
    console.error("❌ ERROR CRÍTICO: No hay ID de reservación en el paso 3");
    console.log("📊 Estado del store completo:", store);

    alert(
      "Error: No hay una reservación activa. Debes completar los pasos 1 y 2 primero.\n\n" +
        "Serás redirigido al paso 1."
    );

    // Redirigir al paso 1
    emit("navigate-to-step", 1);
    return;
  }

  // Si tenemos ID de reservación pero no el objeto completo, cargarlo
  if (store.currentReservationId && !currentReservation.value) {
    console.log(
      "🔄 Inicializando reservación desde ID persistido en paso 3:",
      store.currentReservationId
    );
    try {
      const loaded = await loadStep3(store.currentReservationId);
      if (loaded) {
        console.log("✅ Reservación cargada exitosamente en onMounted del paso 3");
        console.log("✅ currentReservation después de cargar:", currentReservation.value);

        // Después de cargar, verificar si ahora hay datos en el store
        const storedStep3DataAfterLoad = getStepData(3);
        console.log(
          "🔍 onMounted - storedStep3Data después de loadStep3:",
          storedStep3DataAfterLoad
        );
        console.log(
          "🔍 onMounted - Object.keys(storedStep3DataAfterLoad).length:",
          Object.keys(storedStep3DataAfterLoad).length
        );

        // Si ahora hay datos, setearlos en el formulario
        if (Object.keys(storedStep3DataAfterLoad).length > 0) {
          console.log("🔄 Seteando datos del paso 3 después de cargar desde la API...");

          // Mapear requiresDetailedLocationInformation
          if (
            storedStep3DataAfterLoad.requiresDetailedLocationInformation !== null &&
            storedStep3DataAfterLoad.requiresDetailedLocationInformation !== undefined
          ) {
            setFieldValue(
              "requiresDetailedLocationInformation",
              storedStep3DataAfterLoad.requiresDetailedLocationInformation
            );
            console.log(
              "✅ requiresDetailedLocationInformation seteado después de cargar:",
              storedStep3DataAfterLoad.requiresDetailedLocationInformation
            );
          }

          // Mapear requestsPostVisitInvoice
          if (
            storedStep3DataAfterLoad.requestsPostVisitInvoice !== null &&
            storedStep3DataAfterLoad.requestsPostVisitInvoice !== undefined
          ) {
            setFieldValue(
              "requestsPostVisitInvoice",
              storedStep3DataAfterLoad.requestsPostVisitInvoice
            );
            console.log(
              "✅ requestsPostVisitInvoice seteado después de cargar:",
              storedStep3DataAfterLoad.requestsPostVisitInvoice
            );
          }

          // Mapear confirmsInformationAccuracy
          if (
            storedStep3DataAfterLoad.confirmsInformationAccuracy !== null &&
            storedStep3DataAfterLoad.confirmsInformationAccuracy !== undefined
          ) {
            setFieldValue(
              "confirmsInformationAccuracy",
              storedStep3DataAfterLoad.confirmsInformationAccuracy
            );
            console.log(
              "✅ confirmsInformationAccuracy seteado después de cargar:",
              storedStep3DataAfterLoad.confirmsInformationAccuracy
            );
          }
        }
      } else if (loaded === false) {
        console.log("ℹ️ Carga omitida (ya está cargándose o se cargó recientemente)");
      } else {
        console.error("❌ No se pudo cargar la reservación en onMounted del paso 3");
      }
    } catch (error) {
      console.error("❌ Error al cargar reservación en onMounted del paso 3:", error);
    }
  } else if (currentReservation.value) {
    console.log(
      "✅ Reservación ya disponible en onMounted del paso 3:",
      currentReservation.value
    );
  } else {
    console.log("⚠️ No hay ID de reservación disponible en onMounted del paso 3");
  }

  // Verificar documentos existentes al cargar el Step 3
  console.log("🔍 Verificando documentos existentes al cargar Step 3...");
  console.log("🔍 reservationIdRef:", reservationIdRef.value);
  console.log("🔍 userModifiedIdRef:", userModifiedIdRef.value);
  console.log("🔍 canUpload:", canUpload.value);

  loadDiscoveryChannels();
  loadPaymentMethods();
  loadReservationCosts();

  // Inicializar el taller por defecto (dummy) automáticamente
  workshopsStore.initializeDefaultWorkshop();

  // Restaurar datos del store si existen (igual que empresarial)
  const storedStep3Data = getStepData(3);
  console.log("🔍 onMounted - storedStep3Data:", storedStep3Data);
  console.log(
    "🔍 onMounted - Object.keys(storedStep3Data).length:",
    Object.keys(storedStep3Data).length
  );

  if (Object.keys(storedStep3Data).length > 0) {
    // Mapear acknowledgedCivilProtectionDocs (booleano) a los checkboxes del formulario
    if (
      storedStep3Data.acknowledgedCivilProtectionDocs !== null &&
      storedStep3Data.acknowledgedCivilProtectionDocs !== undefined
    ) {
      setFieldValue(
        "requiresDetailedLocationInformation",
        storedStep3Data.acknowledgedCivilProtectionDocs
      );
      console.log(
        "✅ acknowledgedCivilProtectionDocs mapeado a requiresDetailedLocationInformation:",
        storedStep3Data.acknowledgedCivilProtectionDocs
      );
    }

    // Mapear requiresStreetCrossingAssistance (booleano) a los checkboxes del formulario
    if (
      storedStep3Data.requiresStreetCrossingAssistance !== null &&
      storedStep3Data.requiresStreetCrossingAssistance !== undefined
    ) {
      setFieldValue(
        "requestsPostVisitInvoice",
        storedStep3Data.requiresStreetCrossingAssistance
      );
      console.log(
        "✅ requiresStreetCrossingAssistance mapeado a requestsPostVisitInvoice:",
        storedStep3Data.requiresStreetCrossingAssistance
      );
    }

    // Mapear confirmsInformationAccuracy (booleano) a los checkboxes del formulario
    if (
      storedStep3Data.confirmsInformationAccuracy !== null &&
      storedStep3Data.confirmsInformationAccuracy !== undefined
    ) {
      setFieldValue(
        "confirmsInformationAccuracy",
        storedStep3Data.confirmsInformationAccuracy
      );
    }

    // Establecer valores en el formulario usando setFieldValue
    Object.keys(storedStep3Data).forEach((key) => {
      // Saltar los campos que mapeamos manualmente arriba
      if (
        key === "acknowledgedCivilProtectionDocs" ||
        key === "requiresStreetCrossingAssistance" ||
        key === "confirmsInformationAccuracy"
      ) {
        return;
      }

      if (storedStep3Data[key] !== null && storedStep3Data[key] !== undefined) {
        setFieldValue(key, storedStep3Data[key]);
      }
    });
  }
});

// Watch para validar documentos cuando cambie el método de pago
watch(
  () => values.paymentMethodId,
  (newPaymentMethodId) => {
    // Resetear estado de carga cuando cambie el método de pago
    resetUploadState();
  }
);

// Watch para recargar costos cuando cambie el ID de reservación
watch(
  () => store.currentReservationId,
  (newReservationId) => {
    if (newReservationId && newReservationId > 0) {
      console.log("🔄 ID de reservación cambió, recargando costos:", newReservationId);
      loadReservationCosts();
    }
  },
  { immediate: false }
);

// Watch para cargar la reservación cuando se reciba el ID
watch(
  () => props.reservationId,
  async (newReservationId) => {
    console.log(
      "🔄 ReservationStep3 - Watch de reservationId activado:",
      newReservationId
    );

    if (newReservationId && newReservationId > 0) {
      console.log(
        "🔄 ReservationStep3 - Cargando datos del paso 3 con ID:",
        newReservationId
      );
      try {
        // Aquí podrías cargar datos específicos del paso 3 si es necesario
        // Por ahora solo logueamos que se recibió el ID
        console.log(
          "✅ ReservationStep3 - ID de reservación recibido:",
          newReservationId
        );
      } catch (error) {
        console.error(
          "❌ ReservationStep3 - Error al procesar ID de reservación:",
          error
        );
      }
    }
  },
  { immediate: true }
);

// Función para mapear los datos del formulario al formato del API
const mapFormDataToApiRequest = (formValues) => {
  console.log("🔍 Mapeando datos del paso 3:", formValues);

  // Los nombres ya coinciden con la API, solo necesitamos asegurar que sean enteros
  const discoveryChannelId = formValues.discoveryChannelId
    ? parseInt(formValues.discoveryChannelId)
    : null; // Usar null si no hay selección

  // Mapear método de pago
  const paymentMethodId = formValues.paymentMethodId
    ? parseInt(formValues.paymentMethodId)
    : null; // Usar null si no hay selección

  // Mapear servicio de mediación - solo si hay una selección válida
  const requiresMediationService =
    formValues.requiresMediationServiceYes === true
      ? true
      : formValues.requiresMediationServiceNo === true
      ? false
      : null; // Mantener null si no hay selección

  // Usar los valores reales del servicio de costos de reservaciones
  // Si no hay datos de costos cargados, usar valores del store como fallback
  const totalPeople = hasCostData.value
    ? costTotalPeople.value
    : (store.formData.totalYoungAdults || 0) +
      (store.formData.totalYoungAdultsWithDisabilities || 0) +
      (store.formData.totalAdults || 0) +
      (store.formData.totalAdultsWithDisabilities || 0) +
      (store.formData.totalSeniors || 0) +
      (store.formData.totalSeniorsWithDisabilities || 0);

  const totalCost = hasCostData.value ? costTotalCost.value : 0; // Fallback a 0 si no hay datos de costos

  // Obtener los IDs de talleres seleccionados y convertirlos a números
  const workShopsIds = selectedWorkshops.value.map((id) => {
    const numId = parseInt(id);
    return isNaN(numId) ? 1 : numId; // Fallback a 1 si no es un número válido
  });

  console.log("🔍 Valores de costos para envío:");
  console.log("  - hasCostData:", hasCostData.value);
  console.log("  - costTotalPeople:", costTotalPeople.value);
  console.log("  - costTotalCost:", costTotalCost.value);
  console.log("  - totalPeople final:", totalPeople);
  console.log("  - totalCost final:", totalCost);
  console.log("🔍 Talleres seleccionados:");
  console.log("  - selectedWorkshops:", selectedWorkshops.value);
  console.log("  - workShopsIds:", workShopsIds);

  const apiRequest = {
    reservationId: store.currentReservationId,
    discoveryChannelId,
    paymentMethodId,
    acknowledgedCivilProtectionDocs:
      formValues.requiresDetailedLocationInformation || null,
    requiresStreetCrossingAssistance: formValues.requestsPostVisitInvoice || null,
    confirmsInformationAccuracy:
      formValues.confirmsInformationAccuracy === true ? true : null,
    workShopsIds,
    userModifiedId: authStore.currentUser?.userId,
  };

  console.log("🔍 Datos mapeados para API:", apiRequest);
  console.log("🔍 Verificación de campos requeridos:");
  console.log("  - reservationId:", apiRequest.reservationId);
  console.log("  - discoveryChannelId:", apiRequest.discoveryChannelId);
  console.log("  - paymentMethodId:", apiRequest.paymentMethodId);
  console.log(
    "  - acknowledgedCivilProtectionDocs:",
    apiRequest.acknowledgedCivilProtectionDocs
  );
  console.log(
    "  - requiresStreetCrossingAssistance:",
    apiRequest.requiresStreetCrossingAssistance
  );
  console.log("  - confirmsInformationAccuracy:", apiRequest.confirmsInformationAccuracy);
  console.log("  - workShopsIds:", apiRequest.workShopsIds);
  console.log("  - userModifiedId:", apiRequest.userModifiedId);
  return apiRequest;
};

// Manejar la finalización de la reservación con validación
const handleComplete = handleSubmit(async (formValues) => {
  try {
    // Verificar si se están cargando datos del header
    if (isLoadingHeaderData.value) {
      console.log("⚠️ Formulario bloqueado - cargando datos del header");
      return;
    }

    console.log("=== FINALIZANDO RESERVACIÓN PASO 3 ===");
    console.log("Datos del formulario validados:", formValues);
    console.log("Datos del store (store.formData):", store.formData);
    console.log("Reservación actual:", store.currentReservation);
    console.log("=====================================");

    // Los costos ya están cargados en costBreakdown desde loadStep3
    // No es necesario recargarlos aquí ya que vienen del mismo endpoint getStep3
    console.log("🔍 Usando costos del costBreakdown:", costBreakdown.value);

    // Mapear datos del formulario al formato del API
    const apiRequest = mapFormDataToApiRequest(formValues);

    // Actualizar los datos en el store antes de enviar
    const storeUpdateData = {
      discoveryChannelId: apiRequest.discoveryChannelId,
      paymentMethodId: apiRequest.paymentMethodId,
      requiresDetailedLocationInformation: apiRequest.acknowledgedCivilProtectionDocs,
      requestsPostVisitInvoice: apiRequest.requiresStreetCrossingAssistance,
      confirmsInformationAccuracy: apiRequest.confirmsInformationAccuracy,
      workShopsIds: apiRequest.workShopsIds,
      // Los costos se actualizan desde el costBreakdown, no desde el formulario
      totalPeople: costTotalPeople.value,
      totalCost: costTotalCost.value,
    };

    console.log("🔍 Datos que se van a actualizar en el store:", storeUpdateData);
    console.log("🔍 totalPeople calculado:", costTotalPeople.value);
    console.log("🔍 totalCost calculado:", costTotalCost.value);
    console.log(
      "🔍 confirmsInformationAccuracy:",
      apiRequest.confirmsInformationAccuracy
    );

    store.updateFormData(storeUpdateData);

    // Verificar que hay una reservación activa
    if (!currentReservation.value && !store.currentReservationId) {
      console.error("❌ No hay una reservación activa");
      alert("Error: No hay una reservación activa. Por favor regresa al paso 1.");
      return;
    }

    // Si tenemos ID pero no el objeto completo, cargar los datos del paso 1
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

    // Llamar al endpoint PUT usando el composable
    const result = await updateReservationStep3();

    if (result) {
      console.log("✅ Paso 3 completado exitosamente:", result);

      // Emitir evento con los datos del formulario
      emit("complete", {
        type: props.type,
        data: formValues,
        generalData: formValues,
        reservation: result,
      });
    } else {
      console.error("❌ Error al completar el paso 3");
      alert("Error al completar la reservación. Por favor intenta de nuevo.");
    }
  } catch (error) {
    console.error("❌ Error al procesar formulario:", error);
    alert("Error al procesar el formulario. Por favor intenta de nuevo.");
  }
});

// Watcher para detectar data enviada desde el header (igual que en Step 1 y 2)
watch(
  () => props.headerData,
  async (newHeaderData) => {
    console.log("🔍 Step 3 - Watcher headerData ejecutado:", newHeaderData);
    console.log("🔍 Step 3 - props.headerData:", props.headerData);

    // Evitar procesamiento múltiple si ya se están cargando datos
    if (isLoadingHeaderData.value) {
      console.log("⚠️ Step 3 - Ya se están cargando datos del header, saltando...");
      return;
    }

    // Debounce para evitar múltiples ejecuciones
    if (headerDataTimeout) {
      clearTimeout(headerDataTimeout);
    }

    headerDataTimeout = setTimeout(async () => {
      if (newHeaderData && Object.keys(newHeaderData).length > 0) {
        console.log("📥 Data enviada desde el header en Step 3:", newHeaderData);

        // Verificar si los datos del headerData están incompletos (null)
        const hasIncompleteData =
          newHeaderData.data &&
          (newHeaderData.data.discoveryChannelId === null ||
            newHeaderData.data.paymentMethodId === null ||
            newHeaderData.data.acknowledgedCivilProtectionDocs === null);

        // Si hay un reservationId pero los datos están incompletos, cargar desde la API
        if (
          (newHeaderData.step === 2 || newHeaderData.step === 3) &&
          newHeaderData.data &&
          newHeaderData.data.id &&
          hasIncompleteData
        ) {
          console.log("🔄 Datos incompletos detectados, cargando desde la API...");
          isLoadingHeaderData.value = true;

          try {
            const loaded = await loadStep3(newHeaderData.data.id);
            if (loaded && currentReservation.value) {
              console.log(
                "✅ Datos del paso 3 cargados desde la API:",
                currentReservation.value
              );
              // Los datos ahora deberían estar en currentReservation.value
              // Mapear los datos cargados al formulario
              const apiData = currentReservation.value;

              // Cargar catálogos si no están cargados
              if (discoveryChannels.value.length === 0) {
                await loadDiscoveryChannels();
              }
              if (paymentMethods.value.length === 0) {
                await loadPaymentMethods();
              }

              await nextTick();

              // Mapear datos de la API al formulario
              if (apiData.discoveryChannelId) {
                setFieldValue("discoveryChannelId", apiData.discoveryChannelId);
                console.log("✅ discoveryChannelId cargado:", apiData.discoveryChannelId);
              }

              if (apiData.paymentMethodId) {
                setFieldValue("paymentMethodId", apiData.paymentMethodId);
                console.log("✅ paymentMethodId cargado:", apiData.paymentMethodId);
              }

              // Esperar a que los campos anteriores se actualicen antes de setear los checkboxes
              await nextTick();

              if (
                apiData.acknowledgedCivilProtectionDocs !== null &&
                apiData.acknowledgedCivilProtectionDocs !== undefined
              ) {
                setFieldValue(
                  "requiresDetailedLocationInformation",
                  apiData.acknowledgedCivilProtectionDocs
                );
                console.log(
                  "✅ acknowledgedCivilProtectionDocs:",
                  apiData.acknowledgedCivilProtectionDocs,
                  "→ requiresDetailedLocationInformation"
                );
              }

              if (
                apiData.requiresStreetCrossingAssistance !== null &&
                apiData.requiresStreetCrossingAssistance !== undefined
              ) {
                setFieldValue(
                  "requestsPostVisitInvoice",
                  apiData.requiresStreetCrossingAssistance
                );
                console.log(
                  "✅ requiresStreetCrossingAssistance:",
                  apiData.requiresStreetCrossingAssistance,
                  "→ requestsPostVisitInvoice"
                );
              }

              if (
                apiData.confirmsInformationAccuracy !== null &&
                apiData.confirmsInformationAccuracy !== undefined
              ) {
                setFieldValue(
                  "confirmsInformationAccuracy",
                  apiData.confirmsInformationAccuracy
                );
                console.log(
                  "✅ confirmsInformationAccuracy cargado:",
                  apiData.confirmsInformationAccuracy
                );
              }

              // Cargar costos si están disponibles
              if (apiData.costBreakdown) {
                costBreakdown.value = apiData.costBreakdown;
                console.log("✅ costBreakdown cargado desde API:", apiData.costBreakdown);
              }

              console.log("✅ Formulario actualizado con datos de la API");
            }
          } catch (error) {
            console.error("❌ Error al cargar datos desde la API:", error);
          } finally {
            isLoadingHeaderData.value = false;
          }
        }
        // Si hay data del paso 3, actualizar el formulario
        else if (newHeaderData.step === 3 && newHeaderData.data) {
          // Activar bandera para evitar validación automática
          isLoadingHeaderData.value = true;
          console.log(
            "🔄 Actualizando formulario Step 3 con data del header:",
            newHeaderData.data
          );

          const data = newHeaderData.data;

          // Mapear los datos del header a los campos del formulario del Step 3
          // Canal de descubrimiento
          if (
            data.discoveryChannelId &&
            data.discoveryChannelId !== null &&
            data.discoveryChannelId !== undefined
          ) {
            // Asegurar que los canales estén cargados antes de setear
            if (discoveryChannels.value.length === 0) {
              console.log("🔄 Cargando canales de descubrimiento antes de setear...");
              await loadDiscoveryChannels();
            }

            // Esperar a que las opciones estén realmente disponibles
            let attempts = 0;
            while (discoveryChannels.value.length === 0 && attempts < 10) {
              await new Promise((resolve) => setTimeout(resolve, 50));
              attempts++;
            }

            // Esperar un tick adicional para asegurar que las opciones estén disponibles
            await nextTick();

            // Buscar el canal por ID (igual que en Step 1)
            const channel = discoveryChannels.value.find(
              (c) => c.value === data.discoveryChannelId
            );
            console.log("🔍 Buscando canal con ID:", data.discoveryChannelId);
            console.log("🔍 Tipo del ID:", typeof data.discoveryChannelId);
            console.log("🔍 Canales disponibles:", discoveryChannels.value);
            console.log("🔍 Primeros 3 canales:", discoveryChannels.value.slice(0, 3));
            console.log("🔍 Canal encontrado:", channel);

            if (channel) {
              setFieldValue("discoveryChannelId", channel.value);
              console.log(
                "✅ Canal seteado:",
                channel.label,
                "con value:",
                channel.value
              );
              console.log("🔍 Verificando que el valor se setee correctamente...");
              // Verificar que el valor se setee correctamente
              setTimeout(() => {
                console.log(
                  "🔍 Valor actual del campo discoveryChannelId:",
                  values.discoveryChannelId
                );
                console.log(
                  "🔍 Opciones disponibles en el momento del seteo:",
                  discoveryChannels.value
                );
              }, 100);
            } else {
              console.warn("⚠️ No se encontró el canal con ID:", data.discoveryChannelId);
              console.log(
                "🔍 Intentando buscar por string:",
                String(data.discoveryChannelId)
              );
              const channelByString = discoveryChannels.value.find(
                (c) => c.value === String(data.discoveryChannelId)
              );
              if (channelByString) {
                setFieldValue("discoveryChannelId", channelByString.value);
                console.log("✅ Canal encontrado por string:", channelByString.label);
              } else {
                // Si no se encuentra, setear el ID como fallback
                setFieldValue("discoveryChannelId", data.discoveryChannelId);
                console.log(
                  "🔍 Seteando ID directamente como fallback:",
                  data.discoveryChannelId
                );
              }
            }
          }

          // Método de pago
          if (
            data.paymentMethodId &&
            data.paymentMethodId !== null &&
            data.paymentMethodId !== undefined
          ) {
            // Asegurar que los métodos de pago estén cargados antes de setear
            if (paymentMethods.value.length === 0) {
              console.log("🔄 Cargando métodos de pago antes de setear...");
              await loadPaymentMethods();
            }

            // Esperar a que las opciones estén realmente disponibles
            let attempts = 0;
            while (paymentMethods.value.length === 0 && attempts < 10) {
              await new Promise((resolve) => setTimeout(resolve, 50));
              attempts++;
            }

            // Esperar un tick adicional para asegurar que las opciones estén disponibles
            await nextTick();

            // Buscar el método de pago por ID (igual que en Step 1)
            const paymentMethod = paymentMethods.value.find(
              (p) => p.value === data.paymentMethodId
            );
            console.log("🔍 Buscando método de pago con ID:", data.paymentMethodId);
            console.log("🔍 Tipo del ID:", typeof data.paymentMethodId);
            console.log("🔍 Métodos disponibles:", paymentMethods.value);
            console.log("🔍 Primeros 3 métodos:", paymentMethods.value.slice(0, 3));
            console.log("🔍 Método encontrado:", paymentMethod);

            if (paymentMethod) {
              setFieldValue("paymentMethodId", paymentMethod.value);
              console.log(
                "✅ Método de pago seteado:",
                paymentMethod.label,
                "con value:",
                paymentMethod.value
              );
              console.log("🔍 Verificando que el valor se setee correctamente...");
              // Verificar que el valor se setee correctamente
              setTimeout(() => {
                console.log(
                  "🔍 Valor actual del campo paymentMethodId:",
                  values.paymentMethodId
                );
                console.log(
                  "🔍 Opciones disponibles en el momento del seteo:",
                  paymentMethods.value
                );
              }, 100);
            } else {
              console.warn(
                "⚠️ No se encontró el método de pago con ID:",
                data.paymentMethodId
              );
              console.log(
                "🔍 Intentando buscar por string:",
                String(data.paymentMethodId)
              );
              const paymentByString = paymentMethods.value.find(
                (p) => p.value === String(data.paymentMethodId)
              );
              if (paymentByString) {
                setFieldValue("paymentMethodId", paymentByString.value);
                console.log("✅ Método encontrado por string:", paymentByString.label);
              } else {
                // Si no se encuentra, setear el ID como fallback
                setFieldValue("paymentMethodId", data.paymentMethodId);
                console.log(
                  "🔍 Seteando ID directamente como fallback:",
                  data.paymentMethodId
                );
              }
            }
          }

          // Documentación de protección civil
          console.log(
            "🔍 Verificando acknowledgedCivilProtectionDocs:",
            data.acknowledgedCivilProtectionDocs
          );
          if (
            data.acknowledgedCivilProtectionDocs !== undefined &&
            data.acknowledgedCivilProtectionDocs !== null
          ) {
            await nextTick(); // Esperar un tick para asegurar que el DOM esté listo
            setFieldValue(
              "requiresDetailedLocationInformation",
              data.acknowledgedCivilProtectionDocs
            );
            console.log(
              "✅ Mapeando acknowledgedCivilProtectionDocs:",
              data.acknowledgedCivilProtectionDocs,
              "→ requiresDetailedLocationInformation"
            );
            // Verificar que el valor se setee correctamente
            setTimeout(() => {
              console.log(
                "🔍 Valor actual requiresDetailedLocationInformation:",
                values.requiresDetailedLocationInformation
              );
            }, 100);
          } else {
            console.log("⚠️ acknowledgedCivilProtectionDocs no está definido o es null");
          }

          // Acompañamiento para cruzar la calle
          console.log(
            "🔍 Verificando requiresStreetCrossingAssistance:",
            data.requiresStreetCrossingAssistance
          );
          if (
            data.requiresStreetCrossingAssistance !== undefined &&
            data.requiresStreetCrossingAssistance !== null
          ) {
            await nextTick(); // Esperar un tick para asegurar que el DOM esté listo
            setFieldValue(
              "requestsPostVisitInvoice",
              data.requiresStreetCrossingAssistance
            );
            console.log(
              "✅ Mapeando requiresStreetCrossingAssistance:",
              data.requiresStreetCrossingAssistance,
              "→ requestsPostVisitInvoice"
            );
            // Verificar que el valor se setee correctamente
            setTimeout(() => {
              console.log(
                "🔍 Valor actual requestsPostVisitInvoice:",
                values.requestsPostVisitInvoice
              );
            }, 100);
          } else {
            console.log("⚠️ requiresStreetCrossingAssistance no está definido o es null");
          }

          // Confirmación de información
          console.log(
            "🔍 Verificando confirmsInformationAccuracy:",
            data.confirmsInformationAccuracy
          );
          if (
            data.confirmsInformationAccuracy !== undefined &&
            data.confirmsInformationAccuracy !== null
          ) {
            await nextTick(); // Esperar un tick para asegurar que el DOM esté listo
            setFieldValue(
              "confirmsInformationAccuracy",
              data.confirmsInformationAccuracy
            );
            console.log(
              "✅ Mapeando confirmsInformationAccuracy:",
              data.confirmsInformationAccuracy,
              "→ confirmsInformationAccuracy"
            );
            // Verificar que el valor se setee correctamente
            setTimeout(() => {
              console.log(
                "🔍 Valor actual confirmsInformationAccuracy:",
                values.confirmsInformationAccuracy
              );
            }, 100);
          } else {
            console.log("⚠️ confirmsInformationAccuracy no está definido o es null");
          }

          // Costo de la reservación
          if (data.reservationCostId) {
            setFieldValue("reservationCostId", data.reservationCostId);
          }

          console.log("✅ Formulario Step 3 actualizado con datos del header");

          // Desactivar bandera después de cargar datos
          isLoadingHeaderData.value = false;
        }
      }
    }, 100); // Debounce de 100ms
  },
  { immediate: true, deep: true }
);

// Limpiar recursos cuando el componente se desmonte
onUnmounted(() => {
  cleanupDocuments();
  if (headerDataTimeout) {
    clearTimeout(headerDataTimeout);
  }
});
</script>
