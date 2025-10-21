<template>
  <form @submit.prevent="handleComplete" class="space-y-4">

    <h3 class="text-2xl text-[#3C3C3B] font-semibold">Información complementaria</h3>

    <!-- INICIA SECCION DE TALLERES -->
    <div class="space-y-2">

      <!-- <div class="flex items-center justify-between">
        <h3 class="text-base font-medium">Interés por algún taller</h3>
        <button 
          v-if="selectedWorkshops.length > 0"
          @click="navigateToWorkshops" 
          class="text-sm text-primary underline hover:text-primary/80"
        >
          Modificar talleres
        </button>
      </div> -->
      
      <!-- Card para seleccionar talleres si no hay ninguno seleccionado -->
      <!-- <Card 
        v-if="selectedWorkshops.length === 0"
        @click="navigateToWorkshops"
        class="bg-secondary/10 cursor-pointer hover:bg-secondary/20 shadow-none border-0 rounded-full transition-colors py-1 px-2"
      >
        <CardContent class="flex items-center justify-between py-1 px-2">
          <p class="text-base text-muted-foreground">Selecciona los talleres de tu interés</p>
          <Icon icon="lucide:chevron-right" width="16" height="16" class="text-muted-foreground" />
        </CardContent>
      </Card> -->

      <!-- Grilla de talleres seleccionados -->
      <!-- <div v-else class="grid grid-cols-3 gap-3">
        <div 
          v-for="workshop in selectedWorkshopsData" 
          :key="workshop.id"
          class="bg-muted rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
          @click="openWorkshopContent(workshop)"
        >
          <div class="aspect-square bg-muted-foreground/20 rounded-md flex items-center justify-center mb-2">
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
            <Icon 
              v-else
              icon="ri:image-fill" 
              class="w-8 h-8 text-white"
            />
          </div>
          <p class="text-xs text-center font-medium">{{ workshop.title }}</p>
        </div>
      </div> -->

      <!-- Modal para visualizar contenido del taller -->
      <!-- <WorkshopContentViewer 
        v-if="selectedWorkshopContent"
        :workshop="selectedWorkshopContent"
        v-model:open="showContentModal"
      /> -->
    </div>
    
    <!-- <InfoAlert 
      :message-class="'text-black font-normal'" 
      message-size="text-sm" 
      message="Recuerda que puedes modificar los talleres de tu interés una vez creada tu reservación"
    /> -->

    <!-- TERMINA SECCION DE TALLERES -->

    <div>

      <FormField v-slot="{ componentField }" name="discoveryChannelId">
        <FormItem v-auto-animate>
          <FormLabel class="text-base text-[#3C3C3B] font-medium">¿Por qué medio conociste el MIDE?</FormLabel>
          <FormControl>
            <OptionListField v-bind="componentField" :options="discoveryChannels" :disabled="!discoveryChannels || discoveryChannels.length === 0"
              placeholder="Por favor, selecciona una opción" label="" placeholder-font-size="text-base" placeholder-class="placeholder:font-semibold font-medium" options-content-font-size="text-base" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField }" name="paymentMethodId">
        <FormItem class="pt-4" v-auto-animate>
          <FormLabel class="text-base text-[#3C3C3B] font-medium">Forma de pago</FormLabel>
          <FormControl>
            <OptionListField v-bind="componentField" :options="paymentMethods" :disabled="!paymentMethods || paymentMethods.length === 0"
              placeholder="Por favor, selecciona una opción" label="" placeholder-font-size="text-base" placeholder-class="placeholder:font-semibold font-medium" options-content-font-size="text-base" />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <InfoAlert 
        :message-class="'text-[#3C3C3B] font-normal'" 
        message-size="text-sm" 
        message="Presenta tu constancia de situación fiscal en la taquilla del museo para solicitar tu factura"
        class="mt-1"
      />

      <Separator class="my-12 bg-[#B3B3B3] max-w-3/4 rounded-full mx-auto" />

      <h3 class="text-2xl text-[#3C3C3B] font-semibold">Indica si requieres alguno de estos apoyos:</h3>

      <FormField v-slot="{ componentField, handleChange }" name="needCivilProtectionDocument">
        <FormItem class="mt-4">
          <FormControl class="py-0.5">
            <div class="flex space-x-4 py-1">
              <div class="flex items-center space-x-2 cursor-pointer">
                <Checkbox id="confirm-terms" :class="'rounded-full border-2'" class="w-6 h-6 cursor-pointer" variant="secondary" :model-value="componentField.modelValue"
                  @update:model-value="(checked) => handleTermsAccepted(!!checked, handleChange)" />
                <Label for="confirm-terms"
                  class="text-base text-[#3C3C3B] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  Constancia de Registro del Programa Interno de Protección Civil
                </Label>
              </div>
            </div>
          </FormControl>
        </FormItem>
      </FormField>

      <FormField v-slot="{ componentField, handleChange }" name="needHelpCrossingStreet">
        <FormItem class="mt-2">
          <FormControl class="py-0.5">
            <div class="flex space-x-4 py-1">
              <div class="flex items-center space-x-2 cursor-pointer">
                <Checkbox id="confirm-terms" :class="'rounded-full border-2'" class="w-6 h-6 cursor-pointer" variant="secondary" :model-value="componentField.modelValue"
                  @update:model-value="(checked) => handleTermsAccepted(!!checked, handleChange)" />
                <Label for="confirm-terms"
                  class="text-base text-[#3C3C3B] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  Apoyo para cruce seguro de la calle de Tacuba mediante señal de alto 
                </Label>
              </div>
            </div>
          </FormControl>
        </FormItem>
      </FormField>

      <InfoAlert 
        :message-class="'text-[#3C3C3B] font-normal'" 
        message-size="text-sm" 
        message="Los autobuses podrán detenerse un máximo de cinco minutos sobre la calle de Tacuba, frente al museo, exclusivamente para el ascenso y descenso de estudiantes. Es importante considerar que el MIDE no cuenta con estacionamiento"
        class="mt-2"
      />

      <InfoAlert 
        :message-class="'text-[#3C3C3B] font-normal'" 
        message-size="text-sm" 
        message="Les recordamos que el MIDE no cuenta con paquetería o lockers para grupos, por lo que les sugerimos no ingresar con bolsas y/o mochilas. El MIDE no se hace responsable de objetos olvidados o perdidos dentro de sus instalaciones, por lo que nuestros visitantes deberán estar pendientes del cuidando de sus pertenencias. "
        class="mt-2"
      />

      <FormField v-slot="{ componentField, handleChange }" name="isTermsAccepted">
        <FormItem class="mt-2">
          <FormControl class="py-0.5">
            <div class="flex space-x-4 py-1">
              <div class="flex items-center space-x-2 cursor-pointer">
                <Checkbox id="confirm-terms" :class="'rounded-full border-2'" class="w-6 h-6 cursor-pointer" variant="secondary" :model-value="componentField.modelValue"
                  @update:model-value="(checked) => handleTermsAccepted(!!checked, handleChange)" />
                <Label for="confirm-terms"
                  class="text-base text-[#3C3C3B] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  Confirmo que la información proporcionada es correcta y acepto los términos y condiciones para la visita. 
                </Label>
              </div>
            </div>
          </FormControl>
        </FormItem>
      </FormField>
      <!-- MANEJO MANUAL DE ERRORES EN CHECKBOX isTermsAccepted -->
      <div v-if="errors.isTermsAccepted" class="text-sm text-[#DB0000] mt-3">
        {{ errors.isTermsAccepted }}
      </div>

      <Separator v-if="shouldShowDocuments" class="my-12 bg-[#B3B3B3] max-w-3/4 rounded-full mx-auto" />

      <!-- Sección de Documentos - Solo se muestra si el método de pago es transferencia bancaria -->
      <div v-if="shouldShowDocuments">
          <h3 class="text-2xl text-[#3C3C3B] font-semibold">Comprobantes</h3>
          <div class="text-base text-[#3C3C3B] font-medium mt-2">
            Recuerda que los adelantos de pago no deberán superar el 50% del monto total.
          </div>  

          <!-- Contenedor principal de documentos -->
          <div class="bg-[#EBF4FC] rounded-[20px] mt-2 px-5">
            <!-- Botón de subir documentos -->
            <div class="flex items-center py-2.5">
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
                class="flex items-center space-x-1 text-primary cursor-pointer hover:bg-transparent p-0"
              >
                <span
                  class="w-8 h-8 flex items-center justify-center bg-primary border-white border-2 rounded-full shadow-[4px_4px_16px_rgba(0,0,0,0.3)]"
                >
                  <Icon icon="material-symbols:upload" width="30" height="30" class="text-white" />
                </span>
                <span class="text-sm text-[#652F6C] font-normal italic underline">Carga tu comprobante de pago</span>
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
            <div v-if="uploadState.isUploading" class="w-full bg-gray-200 rounded-full h-2 mt-2 mb-5">
              <div
                class="bg-[#652F6C] h-2 rounded-full transition-all duration-300"
                :style="{ width: uploadState.uploadProgress + '%' }"
              ></div>
            </div>

            <!-- Error de carga -->
            <div v-if="uploadState.error" class="text-sm text-[#DA0000] font-normal truncate bg-[#DA0000]/10 rounded-[12px] mt-2 mb-5 p-2">
              {{ uploadState.error }}
            </div>

            <!-- Documentos del servidor -->
            <div v-if="hasDocuments" class="pb-5">
              <div class="flex space-x-3 overflow-x-auto scrollbar-hide pb-4 md:pb-2">
                <div
                  v-for="(doc, index) in serverDocuments"
                  :key="index"
                  class="flex-shrink-0 min-w-[130px] max-w-[100px]"
                >
                  <div
                    class="flex flex-col justify-center bg-[#89BBEB] min-h-[70px] border rounded-[12px] p-3 items-center space-y-2"
                  >
                    <!-- Ícono PDF -->
                    <div class="w-8 h-8 rounded flex items-center justify-center">
                      <Icon icon="material-symbols:picture-as-pdf" width="24" height="24" class="text-[#1D1D1DD9]" />
                    </div>
                  </div>
                  <div class="flex items-center justify-between pt-1 px-1.5">
                    <!-- Nombre del documento -->
                    <span
                      class="text-sm text-[#3C3C3B] font-normal italic truncate w-3/4"
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
                      :disabled="!canUpload"
                      variant="ghost"
                      size="sm"
                      class="w-5 h-5 p-0 rounded-full bg-[#DA0000] text-white cursor-pointer hover:bg-[#DA0000]/60"
                    >
                      <Icon icon="material-symbols:delete-outline" width="12" height="12" />
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
          :message-class="'text-[#3C3C3B] font-normal'" 
          message-size="text-sm" 
          :message="`Carga archivos en formato ${getFormattedAllowedTypes()}. Asegúrate de que la información sea legible`"
          class="mt-2"
        />

      </div>





      <Separator class="my-12 bg-[#B3B3B3] max-w-3/4 rounded-full mx-auto" />

      <h3 class="text-2xl text-[#3C3C3B] font-semibold">Costos de entrada para tu visita</h3>

      <div class="bg-secondary/10 rounded-3xl mt-3 px-7 py-5">
        <!-- Estado de carga -->
        <div v-if="isCostLoading" class="flex flex-col items-center justify-center gap-2 py-4">
          <div class="h-6 w-6 animate-spin rounded-full border-b-2 border-[#3A8DDE]"></div>
          <span class="text-base font-medium text-[#3C3C3B]">Cargando costos</span>
        </div>

        <!-- Error al cargar costos -->
        <div v-else-if="!currentReservationStep3" class="text-center py-4">
          <div class="text-base font-medium text-[#DA0000]">
            <Icon icon="material-symbols:info-outline" class="inline" />
            Error al cargar costos
          </div>
        </div>

        <!-- Datos de costos cargados -->
        <div v-else-if="currentReservationStep3" class="flex flex-col gap-y-1.5">
          <!-- Total de profesores (si aplica) -->
          <div v-if="currentReservationStep3?.costBreakdown?.totalProfessors" class="w-full flex items-center">
            <span class="text-base text-[#3C3C3B] font-medium">Profesores</span>
            <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
            <span class="w-7 h-7 flex items-center justify-end text-base text-[#3C3C3B] font-medium">{{ formatPeople(currentReservationStep3?.costBreakdown?.totalProfessors || 0) }}</span>
          </div>
          <!-- Total de profesores mayores de 60 años (si aplica) -->
          <div v-if="currentReservationStep3?.costBreakdown?.totalProfessorsSeniors" class="w-full flex items-center pl-4">
            <span class="text-base text-[#3C3C3B] font-medium">Profesores mayores de 60 años</span>
            <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
            <span class="w-7 h-7 flex items-center justify-end text-base text-[#3C3C3B] font-medium">{{ formatPeople(currentReservationStep3?.costBreakdown?.totalProfessorsSeniors || 0) }}</span>
          </div>
          <!-- Total de profesores con discapacidad (si aplica) -->
          <div v-if="currentReservationStep3?.costBreakdown?.totalProfessorsWithDisabilities" class="w-full flex items-center pl-4">
            <span class="text-base text-[#3C3C3B] font-medium">Profesores con discapacidad</span>
            <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
            <span class="w-7 h-7 flex items-center justify-end text-base text-[#3C3C3B] font-medium">{{ formatPeople(currentReservationStep3?.costBreakdown?.totalProfessorsWithDisabilities || 0) }}</span>
          </div>
          <!-- Total de estudiantes (si aplica) -->
          <div v-if="currentReservationStep3?.costBreakdown?.totalStudents" class="w-full flex items-center">
            <span class="text-base text-[#3C3C3B] font-medium">Estudiantes</span>
            <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
            <span class="w-7 h-7 flex items-center justify-end text-base text-[#3C3C3B] font-medium">{{ formatPeople(currentReservationStep3?.costBreakdown?.totalStudents || 0) }}</span>
          </div>
          <!-- Total de estudiantes mayores de 60 años (si aplica) -->
          <div v-if="currentReservationStep3?.costBreakdown?.totalStudentsSeniors" class="w-full flex items-center pl-4">
            <span class="text-base text-[#3C3C3B] font-medium">Estudiantes mayores de 60 años</span>
            <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
            <span class="w-7 h-7 flex items-center justify-end text-base text-[#3C3C3B] font-medium">{{ formatPeople(currentReservationStep3?.costBreakdown?.totalStudentsSeniors || 0) }}</span>
          </div>
          <!-- Total de estudiantes con discapacidad (si aplica) -->
          <div v-if="currentReservationStep3?.costBreakdown?.totalStudentsWithDisabilities" class="w-full flex items-center pl-4">
            <span class="text-base text-[#3C3C3B] font-medium">Estudiantes con discapacidad</span>
            <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
            <span class="w-7 h-7 flex items-center justify-end text-base text-[#3C3C3B] font-medium">{{ formatPeople(currentReservationStep3?.costBreakdown?.totalStudentsWithDisabilities || 0) }}</span>
          </div>
          <!-- Total de acompañantes (si aplica) -->
          <div v-if="currentReservationStep3?.costBreakdown?.totalVisitors" class="w-full flex items-center">
            <span class="text-base text-[#3C3C3B] font-medium">Acompañantes</span>
            <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
            <span class="w-7 h-7 flex items-center justify-end text-base text-[#3C3C3B] font-medium">{{ formatPeople(currentReservationStep3?.costBreakdown?.totalVisitors || 0) }}</span>
          </div>
          <!-- Total de acompañantes mayores de 60 años (si aplica) -->
          <div v-if="currentReservationStep3?.costBreakdown?.totalVisitorsSeniors" class="w-full flex items-center pl-4">
            <span class="text-base text-[#3C3C3B] font-medium">Acompañantes mayores de 60 años</span>
            <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
            <span class="w-7 h-7 flex items-center justify-end text-base text-[#3C3C3B] font-medium">{{ formatPeople(currentReservationStep3?.costBreakdown?.totalVisitorsSeniors || 0) }}</span>
          </div>
          <!-- Total de acompañantes con discapacidad (si aplica) -->
          <div v-if="currentReservationStep3?.costBreakdown?.totalVisitorsWithDisabilities" class="w-full flex items-center pl-4">
            <span class="text-base text-[#3C3C3B] font-medium">Acompañantes con discapacidad</span>
            <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
            <span class="w-7 h-7 flex items-center justify-end text-base text-[#3C3C3B] font-medium">{{ formatPeople(currentReservationStep3?.costBreakdown?.totalVisitorsWithDisabilities || 0) }}</span>
          </div>
          <div class="mt-7">
            <!-- Total de personas (si aplica) -->
            <div v-if="currentReservationStep3?.costBreakdown?.totalPeople" class="w-full flex items-center">
              <span class="text-base text-[#3C3C3B] font-medium">Total de personas</span>
              <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
              <span class="w-7 h-7 flex items-center justify-end text-base text-[#3C3C3B] font-medium">{{ formatPeople(currentReservationStep3?.costBreakdown?.totalPeople || 0) }}</span>
            </div>
            <!-- Total de personas con discapacidad (si aplica) -->
            <div v-if="currentReservationStep3?.costBreakdown?.totalDisabilities" class="w-full flex items-center">
              <span class="text-base text-[#3C3C3B] font-medium">Total de personas con discapacidades</span>
              <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
              <span class="text-base text-[#3C3C3B] font-medium">{{ formatPeople(currentReservationStep3?.costBreakdown?.totalDisabilities || 0) }}</span>
            </div>
          </div>
          <!-- Costo total calculado -->
          <div class="w-full flex items-center mt-10">
            <span class="text-xl text-[#3C3C3B] font-semibold">Total:</span>
            <div class="flex-grow border-t-2 border-dashed border-black mx-4"></div>
            <span class="text-xl text-[#3C3C3B] font-semibold">{{ formatCurrency(currentReservationStep3?.costBreakdown?.totalCost) }}</span>
          </div>
        </div>

        <!-- Estado sin datos (fallback) -->
        <div v-else class="text-center py-4">
          <div class="text-base font-medium text-[#3C3C3B]">
            <Icon icon="material-symbols:info-outline" class="inline" />
            No hay datos de costos disponibles
          </div>
        </div>
      </div>

    </div>

    <!-- Mensaje de monto aproximado -->
    <div class="flex items-center space-x-2 my-5">
      <Icon icon="material-symbols:campaign-outline" class="text-[#003DA6] w-64 h-32 md:w-32 md:h-16" />
      <p class="text-base text-[#3C3C3B] font-semibold">
        Monto aproximado, la cantidad a pagar dependerá del número final de asistentes confirmado el día de la visita.
      </p>
    </div>

    <!-- <Button @click="handleComplete" :disabled="selectedWorkshops.length === 0" type="submit" variant="secondary" class="w-full text-lg font-medium mt-8 py-5">
      Terminar
    </Button> -->

    <Button :disabled="isUpdating || !isValidForm" type="submit" variant="secondary" :class="[{ 'cursor-pointer': isValidForm }]" class="w-full text-lg font-medium mt-8 py-5">
      <div v-if="isUpdating" class="flex items-center justify-center">
        <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
          {{ isStepComplete(3) ? 'Guardando cambios...' : 'Guardando...' }}
      </div>
      <span v-else>Terminar</span>
    </Button>

  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { Ref, ComputedRef } from 'vue';
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { Separator } from "@/components/ui/separator";
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { Icon } from '@iconify/vue'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useReservationCost } from "@/composables/reservations/useReservationCost";
import { useAuth } from '@/lib/api/composables/auth'
import { useReservationSchool } from "@/composables/reservations/useReservationSchool";
import { useReservationDocuments } from "@/composables/reservations/useReservationDocuments";
import { useAuthStore } from "@/stores/auth";
import {
  getAcceptedFileTypes,
  getFormattedAllowedTypes,
} from "@/lib/api/config/document-types";
import { useReservationStepLoader } from "@/composables/reservations/useReservationStepLoader";
import OptionListField from "@/components/common/OptionListField.vue";
import { useCatalog } from "@/composables/catalog/useCatalog";
import InfoAlert from "@/components/common/InfoAlert.vue";
import DropdownContent from '@/components/common/DropdownContent.vue'
import WorkshopContentViewer from '@/components/workshops/WorkshopContentViewer.vue'
import { useWorkshopsStore } from '@/stores/workshops'
import { useReservationFormStore } from '@/stores/reservation-form'

// Composable para costos de reservaciones
const {
  isLoading: isCostLoading,
  error: costError,
  hasError: hasCostError,
  hasCostData,
  totalPeople: costTotalPeople,
  totalPeopleWithDisabilities: costTotalPeopleWithDisabilities,
  totalCost: costTotalCost,
  peopleBreakdown,
  getReservationCost,
  formatCurrency,
  formatPeople,
  getCostSummary,
} = useReservationCost();

// Composable para manejo de autenticación
const { user } = useAuth()

// Composable para reservaciones empresariales
const { 
  store, 
  formData: reservationFormData,
  currentReservationId,
  updateFormData,
  getStepData, 
  updateReservationSchoolsStep3, 
  isUpdating, 
  error,
  currentReservation,
  loadStep3
} = useReservationSchool();

// Composable para el estado de los pasos
const { isStepComplete } = useReservationStepLoader();

// Usar el store de talleres
const workshopsStore = useWorkshopsStore()
const selectedWorkshops = computed(() => workshopsStore.selectedWorkshops)
const selectedWorkshopsData = computed(() => workshopsStore.selectedWorkshopsData)

const { fetchCatalogs, fetchPublicCatalogs, catalogs } = useCatalog();

// Store de autenticación para obtener el usuario actual
const authStore = useAuthStore();

// Usar la configuración centralizada de tipos de documentos
const acceptedFileTypes = computed(() => getAcceptedFileTypes());

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

// Reservacion actual, paso 3
const currentReservationStep3 = ref(null)

// Bandera para controlar si se están cargando datos del header
const isLoadingHeaderData = ref(false);

// Debounce para evitar múltiples ejecuciones del watcher
let headerDataTimeout = null;

const emit = defineEmits(["complete", "back"]);

// Schema de validación con Zod para el Paso 3
const formSchema = toTypedSchema(
  z.object({
    workShops: z.array(z.any()).nullable(), // Quitar linea
    paymentMethodId: z.coerce.number().int().default(0),
    discoveryChannelId: z.coerce.number().int().default(0),
    // workShops: z.array(z.any()).min(1, 'Por favor selecciona los talleres').nullable(),
    needCivilProtectionDocument: z.boolean().default(false),
    needHelpCrossingStreet: z.boolean().default(false),
    isTermsAccepted: z.boolean().default(false),
  }).refine((data) => {
      if (data.discoveryChannelId === null || data.discoveryChannelId === undefined || data.discoveryChannelId <= 0) return false
      return true
    }, {
      message: 'Por favor selecciona el medio por el cual te enteraste del MIDE',
      path: ['discoveryChannelId']
    }
  ).refine((data) => {
      if (data.paymentMethodId === null || data.paymentMethodId === undefined || data.paymentMethodId <= 0) return false
      return true
    }, {
      message: 'Por favor selecciona una forma de pago',
      path: ['paymentMethodId']
    }
  ).refine((data) => {
      if(data.isTermsAccepted) {
        return true
      }
      return false
    }, {
      message: 'Debes confirmar que la información es correcta y aceptar los términos y condiciones para la visita.',
      path: ['isTermsAccepted']
    } 
  )
)

// Formulario con vee-validate
const { handleSubmit, isValid, errors, values, setFieldValue, validateField, meta, setErrors } = useForm({
  // Evitar validación inicial automática para no mostrar errores antes de interactuar
  validateOnMount: false,
  // Configurar valores iniciales
  validationSchema: formSchema,

  initialValues: {
    paymentMethodId: 0,
    discoveryChannelId: 0,
    workShops: null, 
    needCivilProtectionDocument: false,
    needHelpCrossingStreet: false,
    isTermsAccepted: false
  },
})


// Estado para el modal de contenido
const showContentModal = ref(false)
const selectedWorkshopContent = ref(null)

// Navegación a la vista de talleres
const navigateToWorkshops = () => {
  navigateTo('/workshops')
}

// Visualización de contenido
const openWorkshopContent = (workshop) => {
  selectedWorkshopContent.value = workshop
  showContentModal.value = true
}

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

// Los talleres no se usan en el formulario empresarial
const discoveryChannels = ref([]);

const paymentMethods = ref([]);

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

// Función para cargar PaymentMethods
const loadPaymentMethods = async () => {
  try {
    console.log("🔄 Cargando PaymentMethods...");
    await fetchPublicCatalogs({ tableName: "PaymentMethod" });

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

// Función independiente para manejar el checkbox "Terminos y condiciones"
const handleTermsAccepted = (checked: boolean, handleChange: Function) => {
  handleChange(checked);
  nextTick(() => {
    setErrors({ isTermsAccepted: undefined })
    validateField('isTermsAccepted')
  })
}

// Indica si el esquema/form del paso 3 es valido o no
const isValidForm: ComputedRef<boolean> = computed(() => meta.value.valid && !meta.value.pending)

// Inicializar datos cuando se monta el componente
onMounted(async () => {
  // Restaurar datos del store si existen
  const storedStep3Data = getStepData(3);
  if (Object.keys(storedStep3Data).length > 0) {
    // Establecer valores en el formulario usando setFieldValue
    Object.keys(storedStep3Data).forEach(key => {
      if (storedStep3Data[key] !== null && storedStep3Data[key] !== undefined) {
        setFieldValue(key, storedStep3Data[key]);
      }
    });
  }
  
  // Si tenemos ID de reservación pero no el objeto completo, cargarlo
  if (store.currentReservationId && !currentReservation.value) {
    console.log('🔄 Inicializando reservación desde ID persistido en paso 3:', store.currentReservationId)
    try {
      const loaded = await loadStep3(store.currentReservationId)
      if (loaded) {
        console.log('✅ Reservación cargada exitosamente en onMounted del paso 3')
        console.log('✅ currentReservation después de cargar:', currentReservation.value)
      } else if (loaded === false) {
        console.log("ℹ️ Carga omitida (ya está cargándose o se cargó recientemente)");
      } else {
        console.error('❌ No se pudo cargar la reservación en onMounted del paso 3')
      }
    } catch (error) {
      console.error('❌ Error al cargar reservación en onMounted del paso 3:', error)
    }
  } else if (currentReservation.value) {
    console.log('✅ Reservación ya disponible en onMounted del paso 3:', currentReservation.value)
  } else {
    console.log('⚠️ No hay ID de reservación disponible en onMounted del paso 3')
  }

  // Se cargan los datos de la reservacion en el paso 3 para mostrar los costos
  if(store.currentReservationId) {
    const reservationStep3Response = await loadStep3(store.currentReservationId)
    currentReservationStep3.value = reservationStep3Response
  }

  loadDiscoveryChannels();
  loadPaymentMethods();
});

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
const mapFormDataToApiRequest = (formValues: any) => {
  console.log('🔍 Mapeando datos del paso 3:', formValues)
  
  // Mapear método de pago
  const paymentMethodId = formValues.paymentMethodId ? parseInt(formValues.paymentMethodId) : null

  const apiRequest = {
    reservationId: parseInt(String(props?.reservationId)),
    paymentMethodId,
    discoveryChannelId: formValues.discoveryChannelId || null,
    // workShops: formValues.workShops | [],
    workShops: [1,2],
    needCivilProtectionDocument: formValues.needCivilProtectionDocument,
    needHelpCrossingStreet: formValues.needHelpCrossingStreet,
    isTermsAccepted: formValues.isTermsAccepted,
    visitorId: parseInt(String(user.value?.userId))
  }
  
  console.log('🔍 Datos mapeados para API:', apiRequest)
  return apiRequest
}

// Manejar la finalización de la reservación con validación
const handleComplete = handleSubmit(async (formValues) => {
  try {

    // Verificar si se están cargando datos del header
    if (isLoadingHeaderData.value) {
      console.log("⚠️ Formulario bloqueado - cargando datos del header");
      return;
    }

    console.log('=== FINALIZANDO RESERVACIÓN PASO 3 ===')
    console.log('Datos del formulario validados:', formValues)
    console.log('Reservación actual:', store.currentReservation)
    console.log('=====================================')

    // Recargar costos para asegurar datos actualizados antes del envío
    console.log("🔄 Recargando costos antes del envío...");
    
    // Mapear datos del formulario al formato del API
    const apiRequest = mapFormDataToApiRequest(formValues)
    
    // Actualizar los datos en el store antes de enviar
    const storeUpdateData = {
      reservationId: apiRequest.reservationId,
      paymentMethodId: apiRequest.paymentMethodId,
      discoveryChannelId: apiRequest.discoveryChannelId,
      workShops: apiRequest.workShops,
      needCivilProtectionDocument: apiRequest.needCivilProtectionDocument,
      needHelpCrossingStreet: apiRequest.needHelpCrossingStreet,
      isTermsAccepted: apiRequest.isTermsAccepted,
      visitorId: apiRequest.visitorId
    }
    
    console.log('🔍 Datos que se van a actualizar en el store:', storeUpdateData)
    
    store.updateFormData(storeUpdateData)
    
    // Verificar que hay una reservación activa
    if (!currentReservation.value && !store.currentReservationId) {
      console.error('❌ No hay una reservación activa')
      alert('Error: No hay una reservación activa. Por favor regresa al paso 1.')
      return
    }
    
    // Si tenemos ID pero no el objeto completo, intentar cargar los datos
    if (!currentReservation.value && store.currentReservationId) {
      console.log(
        "ℹ️ Tenemos ID de reservación pero no objeto completo - continuando con datos actuales del formulario"
      );
    }
    
    // Llamar al endpoint PUT usando el composable
    const result = await updateReservationSchoolsStep3()
    
    if (result) {
      console.log('✅ Paso 3 completado exitosamente:', result)
      
      // Emitir evento con los datos del formulario
      emit("complete", {
        type: props.type,
        data: formValues,
        generalData: formValues,
        reservation: result
      })
    } else {
      console.error('❌ Error al completar el paso 3')
      alert('Error al completar la reservación. Por favor intenta de nuevo.')
    }
    
  } catch (error) {
    console.error('❌ Error al procesar formulario:', error)
    alert('Error al procesar el formulario. Por favor intenta de nuevo.')
  }
});

// Watcher para detectar data enviada desde el header (igual que en Step 1 y 2)
watch(() => props.headerData, async (newHeaderData) => {
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

        // Si hay data del paso 3, actualizar el formulario
        if (newHeaderData.step === 3 && newHeaderData.data) {
          // Activar bandera para evitar validación automática
          isLoadingHeaderData.value = true;
          console.log("🔄 Actualizando formulario Step 3 con data del header:", newHeaderData.data);

          const data = newHeaderData.data;

          // Mapear los datos del header a los campos del formulario del Step 3
          // Canal de descubrimiento
          if (data.discoveryChannelId && data.discoveryChannelId !== null && data.discoveryChannelId !== undefined) {
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
            const channel = discoveryChannels.value.find((c) => c.value === data.discoveryChannelId);
            console.log("🔍 Buscando canal con ID:", data.discoveryChannelId);
            console.log("🔍 Tipo del ID:", typeof data.discoveryChannelId);
            console.log("🔍 Canales disponibles:", discoveryChannels.value);
            console.log("🔍 Primeros 3 canales:", discoveryChannels.value.slice(0, 3));
            console.log("🔍 Canal encontrado:", channel);

            if (channel) {
              setFieldValue("discoveryChannelId", channel.value);
              console.log("✅ Canal seteado:", channel.label, "con value:", channel.value);
              console.log("🔍 Verificando que el valor se setee correctamente...");
              // Verificar que el valor se setee correctamente
              setTimeout(() => {
                console.log("🔍 Valor actual del campo discoveryChannelId:", values.discoveryChannelId);
                console.log("🔍 Opciones disponibles en el momento del seteo:", discoveryChannels.value);
              }, 100);
            } else {
              console.warn("⚠️ No se encontró el canal con ID:", data.discoveryChannelId);
              console.log("🔍 Intentando buscar por string:", String(data.discoveryChannelId));
              const channelByString = discoveryChannels.value.find((c) => c.value === String(data.discoveryChannelId));
              if (channelByString) {
                setFieldValue("discoveryChannelId", channelByString.value);
                console.log("✅ Canal encontrado por string:", channelByString.label);
              } else {
                // Si no se encuentra, setear el ID como fallback
                setFieldValue("discoveryChannelId", data.discoveryChannelId);
                console.log("🔍 Seteando ID directamente como fallback:", data.discoveryChannelId);
              }
            }
          }

          // Método de pago
          if (data.paymentMethodId && data.paymentMethodId !== null && data.paymentMethodId !== undefined) {
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
            const paymentMethod = paymentMethods.value.find((p) => p.value === data.paymentMethodId);
            console.log("🔍 Buscando método de pago con ID:", data.paymentMethodId);
            console.log("🔍 Tipo del ID:", typeof data.paymentMethodId);
            console.log("🔍 Métodos disponibles:", paymentMethods.value);
            console.log("🔍 Primeros 3 métodos:", paymentMethods.value.slice(0, 3));
            console.log("🔍 Método encontrado:", paymentMethod);

            if (paymentMethod) {
              setFieldValue("paymentMethodId", paymentMethod.value);
              console.log("✅ Método de pago seteado:", paymentMethod.label, "con value:", paymentMethod.value);
              console.log("🔍 Verificando que el valor se setee correctamente...");
              // Verificar que el valor se setee correctamente
              setTimeout(() => {
                console.log("🔍 Valor actual del campo paymentMethodId:", values.paymentMethodId);
                console.log("🔍 Opciones disponibles en el momento del seteo:", paymentMethods.value);
              }, 100);
            } else {
              console.warn("⚠️ No se encontró el método de pago con ID:", data.paymentMethodId);
              console.log("🔍 Intentando buscar por string:",String(data.paymentMethodId));
              const paymentByString = paymentMethods.value.find((p) => p.value === String(data.paymentMethodId));
              if (paymentByString) {
                setFieldValue("paymentMethodId", paymentByString.value);
                console.log("✅ Método encontrado por string:", paymentByString.label);
              } else {
                // Si no se encuentra, setear el ID como fallback
                setFieldValue("paymentMethodId", data.paymentMethodId);
                console.log("🔍 Seteando ID directamente como fallback:", data.paymentMethodId);
              }
            }
          }

          // Terminos y condiciones
          if (data.workShops !== undefined) {
            setFieldValue("workShops", data.workShops);
          }

          // Documentos de proteccion
          if (data.needCivilProtectionDocument !== undefined) {
            setFieldValue("needCivilProtectionDocument", data.needCivilProtectionDocument);
          }

          // Apoyo para cruce de calle
          if (data.needHelpCrossingStreet !== undefined) {
            setFieldValue("needHelpCrossingStreet", data.needHelpCrossingStreet);
          }

          // Terminos y condiciones
          if (data.isTermsAccepted !== undefined) {
            setFieldValue("isTermsAccepted", data.isTermsAccepted);
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