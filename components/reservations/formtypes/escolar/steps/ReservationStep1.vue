<template>
  <div class="overflow-y-auto h-full">

    <form @submit.prevent="onSubmit">

      <div class="space-y-2 mb-4">
        <FormField v-slot="{}" name="institution">
          <FormItem class="pt-4">
            <FormLabel class="text-base text-[#3C3C3B] font-medium">Institución educativa</FormLabel>
            <!-- Selector de instituciones -->
            <ClientOnly>
              <template #fallback>
                <div class="px-3 py-2 text-sm text-[#7D7D7D] font-medium text-center">
                  Cargando instituciones...
                </div>
              </template>
              <div class="relative overflow-hidden mb-0">
                <div
                  class="bg-input-empty h-10 border-b-0 shadow-sm py-1 px-2.5 cursor-pointer transition-all duration-100 ease-in-out"
                  :class="[
                    showInstitutionSelector ? 'rounded-t-[20px] rounded-b-none border-b-0' : 'rounded-full',
                    selectedInstitution ? 'bg-input-filled' : 'bg-input-empty',
                  ]"
                  @click="toggleInstitutionSelector"
                >
                  <div class="flex items-center justify-between py-1 px-2">
                    <span
                      class="max-w-[200px] truncate flex-1 mr-2 text-base"
                      :class="selectedInstitution ? 'font-semibold text-[#3C3C3B]' : 'font-medium text-[#7D7D7D]'"
                      >{{ institutionHeaderText }}</span
                    >
                    <Icon v-if="showInstitutionSelector" icon="material-symbols:unfold-less" width="20" height="20" class="text-[#3C3C3B]" />
                    <Icon v-else icon="material-symbols:unfold-more" width="20" height="20" class="text-[#3C3C3B]" />
                  </div>
                </div>
                <div
                  v-if="showInstitutionSelector"
                  ref="institutionSelector"
                  class="space-y-0 overflow-y-hidden bg-input-empty rounded-b-[20px] rounded-0 px-1 pb-2 pt-0"
                >
                  <!-- Botón para agregar nueva institución -->
                  <div class="p-0 bg-background border-none">
                    <AddInstitutionDialog @add-institutions="addInstitution">
                      <template #trigger>
                        <div
                          class="bg-[#E0D5E2] flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors px-4 py-2"
                        >
                          <span class="text-lg text-[#652F6C] font-semibold">
                            Agregar nueva institución
                          </span>
                          <Icon icon="material-symbols:add-circle" width="38" height="38" class="text-[#652F6C]" />
                        </div>
                      </template>
                    </AddInstitutionDialog>
                  </div>

                  <!-- Indicador de carga -->
                  <div v-if="institutionLoading" class="px-3 py-2 text-sm text-[#7D7D7D] font-medium text-center">
                    Cargando instituciones...
                  </div>

                  <div v-else class="divide-y-2 divide-[#61A4E5]">
                    <div
                      v-for="(inst, index) in institutions"
                      :key="getOptionKey(inst.institutionName || '')"
                      class="cursor-pointer py-1.5 hover:bg-gray-100 transition-colors duration-200"
                      :class="[
                        {
                          'text-sm text-[#3C3C3B] font-medium underline pl-3.5': selectedInstitution === inst.institutionName,
                          'text-sm text-[#7D7D7D] font-medium hover:bg-gray-100 pl-3.5': selectedInstitution !== inst.institutionName,
                        },
                        'even:bg-[#EBF4FC]',
                        'odd:bg-[#D8E8F8]',
                        'last:rounded-b-[20px]'
                      ]"
                      @click="selectInstitution(inst)"
                    >
                      {{ inst.institutionName }}
                    </div>

                    <!-- Mensaje cuando no hay opciones -->
                    <div
                      v-if="institutions.length === 0"
                      class="px-3 py-2 text-sm text-[#7D7D7D] font-medium text-center"
                    >
                      No hay instituciones disponibles
                    </div>
                  </div>
                </div>
              </div>
            </ClientOnly>

            <FormMessage />
          </FormItem>
        </FormField>
      </div>

      <div v-show="!!values.institutionId">

        <Separator class="my-8 bg-[#B3B3B3] max-w-3/4 rounded-full mx-auto" />

        <h1 class="text-2xl text-[#3C3C3B] font-semibold">Número de asistentes</h1>
        <InfoAlert class="mt-3 mb-2" :message-class="'text-[#3C3C3B] font-normal'" message-size="text-sm" title="Información" message="Deja vacíos los campos que no apliquen para tu visita." />

        <!-- Dropdown solo para Profesores -->
        <DropdownContent :show-options="showTotaProfessorsDropdown" :dropdowncounter="values.schoolGroups?.totalProfessors || 0" @toggle-options-from-child="toggleTotalProfessorsDropdown"
          :dropdowntitleclass="['text-sm font-medium mb-2']"
          :dropdownplaceholderclass="['bg-secondary/10 hover:bg-secondary/20']"
          :dropdowncontentclass="['p-3 bg-secondary/10 hover:bg-secondary/20']" class="mb-3">
          <template #dropdownplaceholder>
            <span class="text-lg text-[#3C3C3B] font-semibold">Profesores</span>
          </template>

          <template #dropdowncontent>
            <div class="p-3 bg-white border border-border rounded-xl space-y-0">
              <FormField v-slot="{ componentField }" name="schoolGroups.totalProfessors">
                <FormItem>
                  <FormLabel class="text-base text-[#3C3C3B] font-medium">Número de profesores</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" type="number" placeholder="Ingresa la cantidad con número"
                      class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" />
                  </FormControl>
                  <FormDescription>

                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>
              <p class="text-base text-[#3C3C3B] mt-2 mb-3">
                ¿Cuántos de estos profesores pertenecen a los siguientes grupos?
              </p>
              <FormField v-slot="{ componentField }" name="schoolGroups.totalProfessorsSeniors">
                <FormItem>
                  <FormLabel class="text-base text-[#3C3C3B] font-medium">Adultos mayores (60 años o más)</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" type="number" placeholder="Ingresa la cantidad con número"
                      class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" />
                  </FormControl>
                  <FormDescription>

                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>
              <FormField v-slot="{ componentField }" name="schoolGroups.totalProfessorsWithDisabilities">
                <FormItem class="mt-2">
                  <FormLabel class="text-base text-[#3C3C3B] font-medium">Personas con discapacidad</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" type="number" placeholder="Ingresa la cantidad con número"
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

        <!-- Dropdown solo para Estudiantes -->
        <DropdownContent :show-options="showTotalStudentsDropdown" :dropdowncounter="values.schoolGroups?.totalStudents || 0" @toggle-options-from-child="toggleTotalStudentsDropdown"
          :dropdowntitleclass="['text-sm font-medium mb-2']"
          :dropdownplaceholderclass="['bg-secondary/10 hover:bg-secondary/20']"
          :dropdowncontentclass="['p-3 bg-secondary/10 hover:bg-secondary/20']" class="mb-3">
          <template #dropdownplaceholder>
            <span class="text-lg text-[#3C3C3B] font-semibold">Estudiantes</span>
          </template>

          <template #dropdowncontent>
            <div class="p-3 bg-white border border-border rounded-xl space-y-0">
              <FormField v-slot="{ componentField }" name="schoolGroups.totalStudents">
                <FormItem>
                  <FormLabel class="text-base text-[#3C3C3B] font-medium">Número de estudiantes</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" type="number" placeholder="Ingresa la cantidad con número"
                      class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" />
                  </FormControl>
                  <FormDescription>

                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>
              <p class="text-base text-[#3C3C3B] mt-2 mb-3">
                ¿Cuántos de estos estudiantes pertenecen a los siguientes grupos?
              </p>
              <FormField v-slot="{ componentField }" name="schoolGroups.totalStudentsSeniors">
                <FormItem>
                  <FormLabel class="text-base text-[#3C3C3B] font-medium">Adultos mayores (60 años o más)</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" type="number" placeholder="Ingresa la cantidad con número"
                      class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" />
                  </FormControl>
                  <FormDescription>

                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>
              <FormField v-slot="{ componentField }" name="schoolGroups.totalStudentsWithDisabilities">
                <FormItem class="mt-2">
                  <FormLabel class="text-base text-[#3C3C3B] font-medium">Personas con discapacidad</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" type="number" placeholder="Ingresa la cantidad con número"
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

        <!-- Dropdown solo para Acompañantes -->
        <DropdownContent :show-options="showTotalVisitorsDropdown" :dropdowncounter="values.schoolGroups?.totalVisitors || 0" @toggle-options-from-child="toggleTotalVisitorsDropdown"
          :dropdowntitleclass="['text-sm font-medium mb-2']"
          :dropdownplaceholderclass="['bg-secondary/10 hover:bg-secondary/20']"
          :dropdowncontentclass="['p-3 bg-secondary/10 hover:bg-secondary/20']" class="mb-3">
          <template #dropdownplaceholder>
            <span class="text-lg text-[#3C3C3B] font-semibold">Acompañantes</span>
          </template>

          <template #dropdowncontent>
            <div class="p-3 bg-white border border-border rounded-xl space-y-0">
              <FormField v-slot="{ componentField }" name="schoolGroups.totalVisitors">
                <FormItem>
                  <FormLabel class="text-base text-[#3C3C3B] font-medium">Número de acompañantes</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" type="number" placeholder="Ingresa la cantidad con número"
                      class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" />
                  </FormControl>
                  <FormDescription>

                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>
              <p class="text-base text-[#3C3C3B] mt-2 mb-3">
                ¿Cuántos de estos acompañantes pertenecen a los siguientes grupos?
              </p>
              <FormField v-slot="{ componentField }" name="schoolGroups.totalVisitorsSeniors">
                <FormItem>
                  <FormLabel class="text-base text-[#3C3C3B] font-medium">Adultos mayores (60 años o más)</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" type="number" placeholder="Ingresa la cantidad con número"
                      class="bg-muted border-0 placeholder:text-base placeholder:text-[#7D7D7D] placeholder:font-medium text-base text-[#3C3C3B] font-semibold truncate px-5" />
                  </FormControl>
                  <FormDescription>

                  </FormDescription>
                  <FormMessage />
                </FormItem>
              </FormField>
              <FormField v-slot="{ componentField }" name="schoolGroups.totalVisitorsWithDisabilities">
                <FormItem class="mt-2">
                  <FormLabel class="text-base text-[#3C3C3B] font-medium">Personas con discapacidad</FormLabel>
                  <FormControl>
                    <Input v-bind="componentField" type="number" placeholder="Ingresa la cantidad con número"
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

        <Separator class="my-12 bg-[#B3B3B3] max-w-3/4 rounded-full mx-auto" />

          <h1 class="text-2xl text-[#3C3C3B] font-semibold mb-3">Organiza tu visita</h1>

          <FormField v-slot="{ componentField }" name="reservationDate">
            <FormItem>
              <FormLabel class="text-base text-[#3C3C3B] font-medium">Fecha de visita</FormLabel>
              <FormControl>
                <CalendarField :model-value="componentField.modelValue" show-availability label="" placeholder="Selecciona una fecha en el calendario"
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
        
          <InfoAlert class="mt-2" :message-class="'text-[#3C3C3B] font-normal'" message-size="text-sm" title="Información" message="En promedio, la visita general dura de 2 a 3 horas, aunque puede variar de acuerdo con el ritmo e interés del grupo. Considera un tiempo adicional para la recepción de grupos y salida del museo." />
        
          <FormField v-slot="{ componentField }" name="visitObjectiveId" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
            <FormItem class="pt-4" v-auto-animate>
              <FormLabel class="text-base text-[#3C3C3B] font-medium">Objetivo de visita</FormLabel>
              <FormControl>
                <OptionListField :model-value="componentField.modelValue" :options="visitObjectives"
                  placeholder='Selecciona una de las siguientes opciones o agrega una distinta con la opcion "otro"' label="" @update:model-value="(value) => {
                    console.log('🔄 OptionListField emitió:', value, typeof value)
                    componentField.onChange(value) }" placeholder-font-size="text-base" placeholder-class="placeholder:font-semibold font-medium" options-content-font-size="text-base" />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

        <Separator class="my-12 bg-[#B3B3B3] max-w-3/4 rounded-full mx-auto" />

        <h1 class="text-2xl text-[#3C3C3B] font-semibold">Nivel y grado escolar</h1>
        <InfoAlert class="mt-3 mb-2" :message-class="'text-[#3C3C3B] font-normal'" message-size="text-sm" title="Información" message="Indica el grado escolar al que pertenecen los asistentes (puedes seleccionar más de una opción o dejar vacíos los campos que no aplican para tu visita)" />

        <FormField v-slot="{ value, handleChange }" name="schoolLevels.preescolar" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
          <FormItem class="mt-2" v-auto-animate>
            <FormLabel class="text-base text-[#3C3C3B] font-medium">Preescolar</FormLabel>
            <FormControl>
              <CheckboxListField
                placeholder="Selecciona uno o más grados"
                :options="preescolarCatalog"
                :model-value="value"
                @update:model-value="
                  (newValue) => {
                    handleChange(newValue);
                    // Solo validar este campo específico, no todos
                    nextTick(() => {
                      validateField('schoolGroups');
                    });
                  }
                "
                no-options-message="Opciones no disponibles"
                variante-check="secondary"
                placeholder-font-size="text-base"
                placeholder-class="placeholder:font-semibold font-medium" 
                options-content-font-size="text-base"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ value, handleChange }" name="schoolLevels.primaria" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
          <FormItem class="mt-4" v-auto-animate>
            <FormLabel class="text-base text-[#3C3C3B] font-medium">Primaria</FormLabel>
            <FormControl>
              <CheckboxListField
                placeholder="Selecciona uno o más grados"
                :options="primariaCatalog"
                :model-value="value"
                @update:model-value="
                  (newValue) => {
                    handleChange(newValue);
                    // Solo validar este campo específico, no todos
                    nextTick(() => {
                      validateField('schoolGroups');
                    });
                  }
                "
                no-options-message="Opciones no disponibles"
                variante-check="secondary"
                placeholder-font-size="text-base"
                placeholder-class="placeholder:font-semibold font-medium" 
                options-content-font-size="text-base"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ value, handleChange }" name="schoolLevels.secundaria" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
          <FormItem class="mt-4" v-auto-animate>
            <FormLabel class="text-base text-[#3C3C3B] font-medium">Secundaria</FormLabel>
            <FormControl>
              <CheckboxListField
                placeholder="Selecciona uno o más grados"
                :options="secundariaCatalog"
                :model-value="value"
                @update:model-value="
                  (newValue) => {
                    handleChange(newValue);
                    // Solo validar este campo específico, no todos
                    nextTick(() => {
                      validateField('schoolGroups');
                    });
                  }
                "
                no-options-message="Opciones no disponibles"
                variante-check="secondary"
                placeholder-font-size="text-base"
                placeholder-class="placeholder:font-semibold font-medium" 
                options-content-font-size="text-base"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ value, handleChange }" name="schoolLevels.mediaSuperior" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
          <FormItem class="mt-4" v-auto-animate>
            <FormLabel class="text-base text-[#3C3C3B] font-medium">Medio Superior</FormLabel>
            <FormControl>
              <CheckboxListField
                placeholder="Selecciona uno o más semestres"
                :options="mediaSuperiorCatalog"
                :model-value="value"
                @update:model-value="
                  (newValue) => {
                    handleChange(newValue);
                    // Solo validar este campo específico, no todos
                    nextTick(() => {
                      validateField('schoolGroups');
                    });
                  }
                "
                no-options-message="Opciones no disponibles"
                variante-check="secondary"
                placeholder-font-size="text-base"
                placeholder-class="placeholder:font-semibold font-medium" 
                options-content-font-size="text-base"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ value, handleChange }" name="schoolLevels.superior" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
          <FormItem class="mt-4" v-auto-animate>
            <FormLabel class="text-base text-[#3C3C3B] font-medium">Superior</FormLabel>
            <FormControl>
              <CheckboxListField
                placeholder="Indica el tipo de periodo empleado por tu escuela"
                :options="superiorCatalog"
                :model-value="value"
                @update:model-value="
                  (newValue) => {
                    handleChange(newValue);
                    // Solo validar este campo específico, no todos
                    nextTick(() => {
                      validateField('schoolGroups');
                    });
                  }
                "
                no-options-message="Opciones no disponibles"
                variante-check="secondary"
                placeholder-font-size="text-base"
                placeholder-class="placeholder:font-semibold font-medium" 
                options-content-font-size="text-base"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ value, handleChange }" name="schoolLevels.posgrado" :validate-on-input="false" :validate-on-blur="true" :validate-on-change="false">
          <FormItem class="mt-4" v-auto-animate>
            <FormLabel class="text-base text-[#3C3C3B] font-medium">Posgrado</FormLabel>
            <FormControl>
              <CheckboxListField
                placeholder="Selecciona un nivel"
                :options="posgradoCatalog"
                :model-value="value"
                @update:model-value="
                  (newValue) => {
                    handleChange(newValue);
                    // Solo validar este campo específico, no todos
                    nextTick(() => {
                      validateField('schoolGroups');
                    });
                  }
                "
                no-options-message="Opciones no disponibles"
                variante-check="secondary"
                placeholder-font-size="text-base"
                placeholder-class="placeholder:font-semibold font-medium" 
                options-content-font-size="text-base"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button :disabled="isCreating || isUpdating || !isValidForm || isValidToNavigate" type="submit" variant="secondary" :class="[{ 'cursor-pointer': isValidForm }]" class="w-full text-lg font-medium mt-8 py-5">
          <div v-if="isCreating || isUpdating" class="flex items-center justify-center">
            <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {{ isStepComplete(1) ? 'Guardando cambios...' : 'Guardando...' }}
          </div>
          <span v-else>Continuar</span>
        </Button>

      </div>

    </form>

  </div>
</template>

<script setup lang="ts">
import { watch, onMounted, ref, computed, nextTick } from "vue";
import type { ComputedRef } from 'vue';
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { vAutoAnimate } from '@formkit/auto-animate/vue'
import * as z from "zod";
import { Separator } from "@/components/ui/separator";
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
import CalendarField from "@/components/common/CalendarField.vue";
import { useCatalog } from '@/composables/catalog/useCatalog'
import { useTimeSlots } from "@/composables/business/useTimeSlots";
import { useToast } from "@/composables/ui/useToast";
import OptionListField from "@/components/common/OptionListField.vue";
import CheckboxListField from "@/components/common/CheckboxListField.vue"
import InfoAlert from "~/components/common/InfoAlert.vue";
import DropdownContent from '@/components/common/DropdownContent.vue'
import TimeSlotSelector from "@/components/common/TimeSlotSelector.vue";
import AddInstitutionDialog from "@/components/profile/AddInstitutionDialog.vue";
import { useApiVisitor } from "@/lib/api/composables/visitor";
import { useAuth } from '@/lib/api/composables/auth'
import { useReservationSchool } from '@/composables/reservations/useReservationSchool'
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
  getAllReservationSchoolObjectiveVisit,
  getAllReservationSchoolAcademicLevels,
  currentReservationId,
  createReservationSchoolsStep1,
  updateReservationSchoolsStep1,
  isCreating,
  isUpdating,
  error: reservationError
} = useReservationSchool()

// Composable para catálogos
const { catalogs, fetchPublicCatalogs } = useCatalog()

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

// Composable para el estado de los pasos
const { isStepComplete } = useReservationStepLoader();

// Store de dialogo
const dialogStore = useDialogStore()

// Instituciones
const selectedInstitution = ref("");
const showInstitutionSelector = ref(false);
const institutionSelector = ref();


// Los objetivos de visitas que se cargarán desde el catálogo
const visitObjectives = ref<Record<string, any>>([])

// Los grados de preescolar que se cargarán desde el catálogo
const preescolarCatalog = ref<Record<string, any>>([])

// Los grados de primaria que se cargarán desde el catálogo
const primariaCatalog = ref<Record<string, any>>([])

// Los grados de secundaria que se cargarán desde el catálogo
const secundariaCatalog = ref<Record<string, any>>([])

// Los grados de media superior que se cargarán desde el catálogo
const mediaSuperiorCatalog = ref<Record<string, any>>([])

// Los grados de superior que se cargarán desde el catálogo
const superiorCatalog = ref<Record<string, any>>([])

// Los grados de posgrado que se cargarán desde el catálogo
const posgradoCatalog = ref<Record<string, any>>([])

// Controla si despues de enviar el formulario devuelve una respuesta exitosa y es candidato a navegar entre pantallas. Bloquea el boton de formulario en caso de exito
const isValidToNavigate = ref<Boolean>(false)

// Computed para el estado de loading combinado
const loading = computed(() => props.loading || isCreating.value || isUpdating.value || timeSlotsLoading.value)

// Computed para el estado de error combinado
const error = computed(() => props.error || reservationError?.value || timeSlotsError.value || null)

// Instituciones
const institutions = computed(() => visitorInstitutions.value);

const institutionHeaderText = computed(() => {
  if (selectedInstitution.value) {
    return selectedInstitution.value;
  }

  const list = (institutions.value || []).map((i) => i?.institutionName).filter(Boolean);
  const total = list.length;
  if (total === 0) return "Selecciona o agrega una institución";
  if (total === 1) return "Selecciona o agrega una institución";
  if (total === 2) return "Selecciona o agrega una institución";
  return "Selecciona o agrega una institución";
});

// Función para cargar los objetivos de visita desde el catálogo
const loadVisitObjectivesSchool = async () => {
  try {
    const visitObjetivesResponse = await getAllReservationSchoolObjectiveVisit()
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

// Función para cargar grados preescolares
const loadPreescolarCatalog = async () => {
  try {
    const preescolarCatalogResponse = await getAllReservationSchoolAcademicLevels({ AcademicLevel: 'Preescolar' })
    const preescolar = preescolarCatalogResponse.filter(catalog => 
      catalog.level === 'Preescolar' && catalog.status === 'Activo'
    ).sort((a, b) => parseInt(a.grade, 10) - parseInt(b.grade, 10)) // Se ordena por grado, menor a mayor
    
    console.log('🔍 Niveles academicos cargados', preescolar)
    
    // Transformar el formato para que value sea el id numérico
    const transformedPreescolar = preescolar.map(obj => ({
      value: obj.id, // Usar el ID numérico como value
      label: obj.description, // Usar el campo 'description' del catálogo como label
      id: obj.id
    }))
    
    console.log('🔍 Niveles academicos transformados:', transformedPreescolar)
    preescolarCatalog.value = transformedPreescolar
  } catch (error) {
    console.error('❌ Error al cargar niveles academicos:', error)
    // En caso de error, mostrar opciones no disponibles
    preescolarCatalog.value = [
      { value: "no_disponible", label: "Opciones no disponibles" }
    ]
  }
}

// Función para cargar grados primaria
const loadPrimariaCatalog = async () => {
  try {
    const primariaCatalogResponse = await getAllReservationSchoolAcademicLevels({ AcademicLevel: 'Primaria' })
    const primaria = primariaCatalogResponse.filter(catalog => 
      catalog.level === 'Primaria' && catalog.status === 'Activo'
    ).sort((a, b) => parseInt(a.grade, 10) - parseInt(b.grade, 10)) // Se ordena por grado, menor a mayor
    
    console.log('🔍 Niveles academicos cargados', primaria)
    
    // Transformar el formato para que value sea el id numérico
    const transformedPrimaria = primaria.map(obj => ({
      value: obj.id, // Usar el ID numérico como value
      label: obj.description, // Usar el campo 'description' del catálogo como label
      id: obj.id
    }))
    
    console.log('🔍 Niveles academicos transformados:', transformedPrimaria)
    primariaCatalog.value = transformedPrimaria
  } catch (error) {
    console.error('❌ Error al cargar niveles academicos:', error)
    // En caso de error, mostrar opciones no disponibles
    primariaCatalog.value = [
      { value: "no_disponible", label: "Opciones no disponibles" }
    ]
  }
}

// Función para cargar grados secundaria
const loadSecundariaCatalog = async () => {
  try {
    const secundariaCatalogResponse = await getAllReservationSchoolAcademicLevels({ AcademicLevel: 'Secundaria' })
    const secundaria = secundariaCatalogResponse.filter(catalog => 
      catalog.level === 'Secundaria' && catalog.status === 'Activo'
    ).sort((a, b) => parseInt(a.grade, 10) - parseInt(b.grade, 10)) // Se ordena por grado, menor a mayor
    
    console.log('🔍 Niveles academicos cargados', secundaria)
    
    // Transformar el formato para que value sea el id numérico
    const transformedSecundaria = secundaria.map(obj => ({
      value: obj.id, // Usar el ID numérico como value
      label: obj.description, // Usar el campo 'description' del catálogo como label
      id: obj.id
    }))
    
    console.log('🔍 Niveles academicos transformados:', transformedSecundaria)
    secundariaCatalog.value = transformedSecundaria
  } catch (error) {
    console.error('❌ Error al cargar niveles academicos:', error)
    // En caso de error, mostrar opciones no disponibles
    secundariaCatalog.value = [
      { value: "no_disponible", label: "Opciones no disponibles" }
    ]
  }
}

// Función para cargar grados media superior
const loadMediaSuperiorCatalog = async () => {
  try {
    const mediaSuperiorCatalogResponse = await getAllReservationSchoolAcademicLevels({ AcademicLevel: 'MediaSuperior' })
    const mediaSuperior = mediaSuperiorCatalogResponse.filter(catalog => 
      catalog.level === 'MediaSuperior' && catalog.status === 'Activo'
    ).sort((a, b) => parseInt(a.grade, 10) - parseInt(b.grade, 10)) // Se ordena por grado, menor a mayor
    
    console.log('🔍 Niveles academicos cargados', mediaSuperior)
    
    // Transformar el formato para que value sea el id numérico
    const transformedMediaSuperior = mediaSuperior.map(obj => ({
      value: obj.id, // Usar el ID numérico como value
      label: obj.description, // Usar el campo 'description' del catálogo como label
      id: obj.id
    }))
    
    console.log('🔍 Niveles academicos transformados:', transformedMediaSuperior)
    mediaSuperiorCatalog.value = transformedMediaSuperior
  } catch (error) {
    console.error('❌ Error al cargar niveles academicos:', error)
    // En caso de error, mostrar opciones no disponibles
    mediaSuperiorCatalog.value = [
      { value: "no_disponible", label: "Opciones no disponibles" }
    ]
  }
}

// Función para cargar grados superior
const loadSuperiorCatalog = async () => {
  try {
    const superiorCatalogResponse = await getAllReservationSchoolAcademicLevels({ AcademicLevel: 'Superior' })
    const superior = superiorCatalogResponse.filter(catalog => 
      catalog.level === 'Superior' && catalog.status === 'Activo'
    ).sort((a, b) => parseInt(a.grade, 10) - parseInt(b.grade, 10)) // Se ordena por grado, menor a mayor
    
    console.log('🔍 Niveles academicos cargados', superior)
    
    // Transformar el formato para que value sea el id numérico
    const transformedSuperior = superior.map(obj => ({
      value: obj.id, // Usar el ID numérico como value
      label: obj.description, // Usar el campo 'description' del catálogo como label
      id: obj.id
    }))
    
    console.log('🔍 Niveles academicos transformados:', transformedSuperior)
    superiorCatalog.value = transformedSuperior
  } catch (error) {
    console.error('❌ Error al cargar niveles academicos:', error)
    // En caso de error, mostrar opciones no disponibles
    superiorCatalog.value = [
      { value: "no_disponible", label: "Opciones no disponibles" }
    ]
  }
}

// Función para cargar grados posgrado
const loadPosgradoCatalog = async () => {
  try {
    const posgradoCatalogResponse = await getAllReservationSchoolAcademicLevels({ AcademicLevel: 'Posgrado' })
    const posgrado = posgradoCatalogResponse.filter(catalog => 
      catalog.level === 'Posgrado' && catalog.status === 'Activo'
    ).sort((a, b) => parseInt(a.grade, 10) - parseInt(b.grade, 10)) // Se ordena por grado, menor a mayor
    
    console.log('🔍 Niveles academicos cargados', posgrado)
    
    // Transformar el formato para que value sea el id numérico
    const transformedPosgrado = posgrado.map(obj => ({
      value: obj.id, // Usar el ID numérico como value
      label: obj.description, // Usar el campo 'description' del catálogo como label
      id: obj.id
    }))
    
    console.log('🔍 Niveles academicos transformados:', transformedPosgrado)
    posgradoCatalog.value = transformedPosgrado
  } catch (error) {
    console.error('❌ Error al cargar niveles academicos:', error)
    // En caso de error, mostrar opciones no disponibles
    posgradoCatalog.value = [
      { value: "no_disponible", label: "Opciones no disponibles" }
    ]
  }
}

// Schema de validación con Zod - Solo campos actuales del formulario
const formSchemaReservationGeneralStep1 = toTypedSchema(
  z.object({
    visitorId: z.number().int(),

    // Campos de institución - requeridos
    institution: z.string().min(1, "Por favor selecciona una institución"),
    institutionId: z.union([z.string(), z.number()]).transform((val) => String(val)).pipe(z.string().min(1, "Por favor selecciona una institución")),

    visitObjectiveId: z.coerce.number().int().nullable().default(null),
    schoolGroups: z.object({
      totalProfessors: z.union([z.literal('').transform(() => undefined), z.coerce.number().int().min(0, 'Por favor ingresa la cantidad de profesores')]).default(0),
      totalProfessorsSeniors: z.union([z.literal('').transform(() => undefined), z.coerce.number().int().min(1, 'Por favor ingresa la cantidad de adultos mayores (60 años o más). Debe ser un numero mayor a 0')]).optional(),
      totalProfessorsWithDisabilities: z.union([z.literal('').transform(() => undefined), z.coerce.number().int().min(1, 'Por favor ingresa la cantidad de profesores con discapacidad. Debe ser un numero mayor a 0')]).optional(),
      totalStudents: z.union([z.literal('').transform(() => undefined), z.coerce.number().int().min(0, 'Por favor ingresa la cantidad de estdiantes')]).default(0),
      totalStudentsSeniors: z.union([z.literal('').transform(() => undefined), z.coerce.number().int().min(1, 'Por favor ingresa la cantidad de adultos mayores (60 años o más). Debe ser un numero mayor a 0')]).optional(),
      totalStudentsWithDisabilities: z.union([z.literal('').transform(() => undefined), z.coerce.number().int().min(1, 'Por favor ingresa la cantidad de estudiantes con discapacidad. Debe ser un numero mayor a 0')]).optional(),
      totalVisitors: z.union([z.literal('').transform(() => undefined), z.coerce.number().int().min(0, 'Por favor ingresa la cantidad de acompañantes')]).default(0),
      totalVisitorsSeniors: z.union([z.literal('').transform(() => undefined), z.coerce.number().int().min(1, 'Por favor ingresa la cantidad de adultos mayores (60 años o más). Debe ser un numero mayor a 0')]).optional(),
      totalVisitorsWithDisabilities: z.union([z.literal('').transform(() => undefined), z.coerce.number().int().min(1, 'Por favor ingresa la cantidad de acompañantes con discapacidad. Debe ser un numero mayor a 0')]).optional(),
    }),
    schoolLevels: z.object({
      preescolar: z.array(z.any()).min(0, "Por favor selecciona al menos un elemento"),
      primaria: z.array(z.any()).min(0, "Por favor selecciona al menos un elemento"),
      secundaria: z.array(z.any()).min(0, "Por favor selecciona al menos un elemento"),
      mediaSuperior: z.array(z.any()).min(0, "Por favor selecciona al menos un elemento"),
      superior: z.array(z.any()).min(0, "Por favor selecciona al menos un elemento"),
      posgrado: z.array(z.any()).min(0, "Por favor selecciona al menos un elemento")
    }),
    reservationDate: z.date().nullable(),
    checkInDateId: z.array(z.any()).min(1, "Por favor selecciona al menos un horario")
  }).superRefine((data, ctx) => {

    // INICIA VALIDACION DE DATOS 'Debes ingresar al menos un valor mayor o igual a 1 en cualquiera de los campos'
    const totals = [
      data.schoolGroups.totalProfessors,
      data.schoolGroups.totalStudents,
      data.schoolGroups.totalVisitors
    ];
    if(!totals.some(val => val >= 1)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes ingresar al menos un valor mayor o igual a 1 en cualquiera de los campos',
        path: ['totalProfessors'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes ingresar al menos un valor mayor o igual a 1 en cualquiera de los campos',
        path: ['totalStudents'],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes ingresar al menos un valor mayor o igual a 1 en cualquiera de los campos',
        path: ['totalVisitors'],
      });
    }
    // TERMINA VALIDACION DE DATOS UNDEFINED = 'Por favor ingresa un número válido'

    // INICIA VALIDACION PARA EVITAR QUE CUALQUIER CAMPO +60 AÑOS SEA MAYOR QUE EL CAMPO DE SU GRUPO
    if (data.schoolGroups.totalProfessorsSeniors !== undefined && data.schoolGroups.totalProfessorsSeniors > data.schoolGroups.totalProfessors) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El número excede a la cantidad de profesores que asistirán al museo. (Máximo ${data?.schoolGroups.totalProfessors || 0})`,
        path: ['totalProfessorsSeniors'],
      });
    }
    if (data.schoolGroups.totalStudentsSeniors !== undefined && data.schoolGroups.totalStudentsSeniors > data.schoolGroups.totalStudents) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El número excede a la cantidad de estudiantes que asistirán al museo. (Máximo ${data?.schoolGroups.totalStudents || 0})`,
        path: ['totalStudentsSeniors'],
      });
    }
    if (data.schoolGroups.totalVisitorsSeniors !== undefined && data.schoolGroups.totalVisitorsSeniors > data.schoolGroups.totalVisitors) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El número excede a la cantidad de acompañantes que asistirán al museo. (Máximo ${data?.schoolGroups.totalVisitors || 0})`,
        path: ['totalVisitorsSeniors'],
      });
    }
    // TERMINA VALIDACION PARA EVITAR QUE CUALQUIER CAMPO +60 AÑOS SEA MAYOR QUE EL CAMPO DE SU GRUPO

    // INICIA VALIDACION PARA EVITAR QUE CUALQUIER CAMPO DISABILITY SEA MAYOR QUE EL CAMPO DE SU GRUPO
    if (data.schoolGroups.totalProfessorsWithDisabilities !== undefined && data.schoolGroups.totalProfessorsWithDisabilities > data.schoolGroups.totalProfessors) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El número excede a la cantidad de profesores que asistirán al museo. (Máximo ${data?.schoolGroups.totalProfessors || 0})`,
        path: ['totalProfessorsWithDisabilities'],
      });
    }
    if (data.schoolGroups.totalStudentsWithDisabilities !== undefined && data.schoolGroups.totalStudentsWithDisabilities > data.schoolGroups.totalStudents) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El número excede a la cantidad de estudiantes que asistirán al museo. (Máximo ${data?.schoolGroups.totalStudents || 0})`,
        path: ['totalStudentsWithDisabilities'],
      });
    }
    if (data.schoolGroups.totalVisitorsWithDisabilities !== undefined && data.schoolGroups.totalVisitorsWithDisabilities > data.schoolGroups.totalVisitors) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `El número excede a la cantidad de acompañantes que asistirán al museo. (Máximo ${data?.schoolGroups.totalVisitors || 0})`,
        path: ['totalVisitorsWithDisabilities'],
      });
    }
    // TERMINA VALIDACION PARA EVITAR QUE CUALQUIER CAMPO DISABILITY SEA MAYOR QUE EL CAMPO DE SU GRUPO

    if (data.visitObjectiveId === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debes seleccionar el objetivo de la visita.',
        path: ['visitObjectiveId'],
      });
    }

    // INICIA VALIDACION DE DATOS UNDEFINED = 'Por favor ingresa un número válido'
    if(data.schoolGroups.totalProfessors === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Por favor ingresa la cantidad de profesores',
        path: ['totalProfessors'],
      });
    }
    if(data.schoolGroups.totalStudents === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Por favor ingresa la cantidad de estudiantes',
        path: ['totalStudents'],
      });
    }
    if(data.schoolGroups.totalVisitors === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Por favor ingresa la cantidad de acompañantes',
        path: ['totalVisitors'],
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
    // Campos de institución
    institution: "",
    institutionId: "",
    visitObjectiveId: null,
    schoolGroups: {
      totalProfessors: 0,
      totalStudents: 0,
      totalVisitors: 0,
    },
    schoolLevels: {
      preescolar: [],
      primaria: [],
      secundaria: [],
      mediaSuperior: [],
      superior: [],
      posgrado: []
    },
    reservationDate: null,
    checkInDateId: []
  }
})

// Estado para controlar la visibilidad del dropdown de profesores
const showTotaProfessorsDropdown = ref(false)

// Función para alternar la visibilidad del dropdown de profesores
const toggleTotalProfessorsDropdown = () => {
  showTotaProfessorsDropdown.value = !showTotaProfessorsDropdown.value
}

// Estado para controlar la visibilidad del dropdown de estudiantes
const showTotalStudentsDropdown = ref(false)

// Función para alternar la visibilidad del dropdown de estudiantes
const toggleTotalStudentsDropdown = () => {
  showTotalStudentsDropdown.value = !showTotalStudentsDropdown.value
}

// Estado para controlar la visibilidad del dropdown de acompañantes
const showTotalVisitorsDropdown = ref(false)

// Función para alternar la visibilidad del dropdown de acompañantes
const toggleTotalVisitorsDropdown = () => {
  showTotalVisitorsDropdown.value = !showTotalVisitorsDropdown.value
}

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

// Indica si el esquema/form del paso 1 es valido o no
const isValidForm: ComputedRef<boolean> = computed(() => meta.value.valid && !meta.value.pending)

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
    institutionId: parseInt(String(formValues.institutionId)),
    visitObjectiveId: parseInt(String(visitObjectiveId)),
    schoolGroups: formValues.schoolGroups,
    schoolLevels: formValues.schoolLevels,
    reservationDate: formValues.reservationDate?.toISOString() || new Date().toISOString(),
    checkInDateId: parseInt(formValues.checkInDateId?.[0]) || 1,

  }
}

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

// Watcher para monitorear cambios en currentReservationId
watch(
  () => currentReservationId?.value,
  (newId, oldId) => {
    console.log("🔍 currentReservationId cambió:", { oldId, newId });
  },
  { immediate: true }
);

onMounted(async () => {
  // Cargar catálogos
  await Promise.all([
    loadVisitObjectivesSchool(),
    loadPreescolarCatalog(),
    loadPrimariaCatalog(),
    loadSecundariaCatalog(),
    loadMediaSuperiorCatalog(),
    loadSuperiorCatalog(),
    loadPosgradoCatalog(),
    loadTimeSlots(),
    refreshInstitutions()
  ])
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

      // Campos de fechas y horarios
      if (data.reservationDate) {
        setFieldValue('reservationDate', new Date(data.reservationDate))
      }
      if (data.checkInDateId) {
        setFieldValue('checkInDateId', [String(data.checkInDateId)])
      }


      // Campo de instituciones
      if (data.institutionId) {
        setFieldValue("institutionId", String(data.institutionId));

        // Asegurar que las instituciones estén cargadas antes de buscar
        if (institutions.value.length === 0) {
          await refreshInstitutions();
        }

        // Buscar el nombre de la institución por ID
        const institution = institutions.value.find(
          (i) => i.id === data.institutionId
        );

        if (institution) {
          setFieldValue("institution", institution.institutionName);
          selectedInstitution.value = institution.institutionName;
          console.log("✅ Institución seteada:", institution.institutionName);
        } else {
          console.warn(
            "⚠️ No se encontró la institución con ID:",
            data.institutionId
          );
          // Si no se encuentra, al menos setear el ID como fallback
          setFieldValue("institution", String(data.institutionId));
          selectedInstitution.value = String(data.institutionId);
        }
      }

      // Campo de grupos escolares
      if (data.schoolGroups) {
        // Se eliminan los elementos con un valor igual a 0
        // Esto se realiza para no afectar el esquema de validacion de zod cuando se carga el formulario
        // Ya que en un formulario nuevo, los campos opcionales son en realidad campos indefinidos y no con un valor 0 debido
        // A que por regla en los campos no debe ir un valor 
        
        const schoolGroupsFiltrado = Object.fromEntries( // Object.fromEntries genera un nuevo objeto pasandole clave-valor [clave, valor]. Es la operacion inversa de Object.entries
          Object.entries(data.schoolGroups).filter(([_, schoolGroup]) => schoolGroup !== 0) // Object.entries genera un iterable de clave-valor [clave, valor]. En este caso adicional necesitamos filtrar aquellos valores que sean diferente de 0
        )

        setFieldValue('schoolGroups', schoolGroupsFiltrado)
      }

      // Campo de niveles escolares
      if (data.schoolLevels) {
        setFieldValue('schoolLevels', data.schoolLevels)
      }

      
      // Campo de objetivos de visita
      if (data.visitObjectiveId) {
        // Asegurar que los objetivos estén cargados antes de setear
        if (visitObjectives.value.length === 0) {
          console.log('🔄 Cargando objetivos de visita antes de setear...')
          await loadVisitObjectivesSchool()
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
      result = await updateReservationSchoolsStep1(apiRequest)
    }
    else {
      // Crear reservación usando el composable
      result = await createReservationSchoolsStep1(apiRequest)
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