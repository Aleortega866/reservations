<template>
  <div class="overflow-y-auto h-full">
    <form @submit="onSubmit" class="space-y-4 w-full">
      <h3 class="text-sm font-medium mb-1">¿Con quién asistirás a la visita?</h3>
      <FormField v-slot="{ field }" name="attendeeType">
        <FormItem>
          <FormControl>
            <OptionListField
              label=""
              placeholder="Por favor, selecciona una opción"
              :options="attendeeOptions"
              :required="true"
              v-bind="field"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>

      <!-- Campos dinámicos según el tipo de asistente -->
      <div v-if="selectedAttendeeType" class="space-y-4">
        <!-- VISITA GENERAL -->
        <ReservationsStepsTypesGeneralForm 
        v-if="selectedAttendeeType === 'general'" 
        :visit-objectives="visitObjectives"
        :form="form"
        />

        <!-- VISITA ESCOLAR -->
        <ReservationsStepsTypesEscolarForm 
          v-if="selectedAttendeeType === 'escolar'"
          :form="form"
          :educational-institutions="educationalInstitutions"
          :visit-objectives="visitObjectives"
        />

        <!-- VISITA EMPRESARIAL -->
        <ReservationsStepsTypesEmpresarialForm 
          v-if="selectedAttendeeType === 'empresarial'"
          :companies="companies"
          :form="form"
          :visit-objectives="visitObjectives"
        />

        <!-- VISITA CURSO DE VERANO -->
        <ReservationsStepsTypesOrganizadorForm 
          v-if="selectedAttendeeType === 'curso-verano'"
          :educational-institutions="educationalInstitutions"
          :form="form"
          :visit-objectives="visitObjectives"
        />


        <Button
          type="submit"
          variant="secondary"
          class="w-full mt-8"
          v-if="shouldShowButton"
        >
          Continuar
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import OptionListField from '~/components/common/OptionListField.vue'




const attendeeOptions = [
  { value: "general", label: "Asisto solo/a, con mis amigos y/o familia" },
  {
    value: "escolar",
    label: "Soy docente y asisto con un grupo de estudiantes y profesores",
  },
  {
    value: "empresarial",
    label:
      "Soy empleado/a o directivo/a y asisto con mis compañeros de trabajo, empleados o directivos de mi empresa",
  },
  {
    value: "curso-verano",
    label:
      "Soy organizador/a de actividades con grupos de niños y/o jóvenes (talleres, cursos, campamentos, etc.)",
  },
];

const visitObjectives = [
  { value: "turismo", label: "Turismo y recreación" },
  { value: "academico", label: "Académico / Educativo" },
  { value: "investigacion", label: "Investigación" },
  { value: "cultural", label: "Cultural / Artístico" },
  { value: "familiar", label: "Visita familiar" },
  { value: "empresarial", label: "Empresarial / Corporativo" },
  { value: "escolar", label: "Visita escolar" },
  { value: "universitario", label: "Visita universitaria" },
  { value: "fotografia", label: "Fotografía / Audiovisual" },
  { value: "evento", label: "Evento especial" },
  { value: "otro", label: "Otro" },
];

const educationalInstitutions = [
  { value: "inst1", label: "Instituto Nacional" },
  { value: "inst2", label: "Colegio México" },
];

const companies = [
  { value: "comp1", label: "Empresa ABC" },
  { value: "comp2", label: "Corporativo XYZ" },
];

const selectedAttendeeType = computed(() => form.values.attendeeType);

// Lógica para mostrar campos comunes
const shouldShowCommonFields = computed(() => {
  if (!selectedAttendeeType.value) return false;
  
  // Para escolar, solo mostrar si hay institución seleccionada y no es "new"
  if (selectedAttendeeType.value === 'escolar') {
    return form.values.educationalInstitution && 
           form.values.educationalInstitution !== 'new';
  }
  
  // Para otros tipos, mostrar siempre
  return true;
});

// Lógica para mostrar el botón
const shouldShowButton = computed(() => {
  if (!selectedAttendeeType.value) return false;
  
  // Para "general", mostrar siempre
  if (selectedAttendeeType.value === 'general') {
    return true;
  }
  
  // Para "escolar", mostrar si hay institución seleccionada y no es "new"
  if (selectedAttendeeType.value === 'escolar') {
    return form.values.educationalInstitution && 
           form.values.educationalInstitution !== 'new';
  }
  
  // Para "empresarial", mostrar si hay empresa seleccionada y no es "new"
  if (selectedAttendeeType.value === 'empresarial') {
    return form.values.company && 
           form.values.company !== 'new';
  }
  
  // Para "curso-verano", mostrar si hay institución seleccionada y no es "new"
  if (selectedAttendeeType.value === 'curso-verano') {
    return form.values.educationalInstitution && 
           form.values.educationalInstitution !== 'new';
  }
  
  return false;
});

const formSchema = toTypedSchema(
  z.object({
    attendeeType: z.string().min(1, "Selecciona una opción"),
    educationalInstitution: z.string().optional(),
    company: z.string().optional(),
    totalAttendees: z.string().optional(),
    hasUnder3: z.enum(["yes", "no"]),
    minors: z.number().nullable().optional(),
    children: z.number().nullable().optional(),
    adults: z.number().nullable().optional(),
    seniors: z.number().nullable().optional(),
    hasDisability: z.enum(["yes", "no"]),
    disabilityCount: z.number().nullable().optional(),
    visitDate: z.string().optional(),
    visitTime: z.string().optional(),
    visitObjective: z.string().min(1, "Selecciona un objetivo"),
  })
);

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    attendeeType: "",
    educationalInstitution: "",
    company: "",
    totalAttendees: "",
    hasUnder3: "no",
    minors: null,
    children: null,
    adults: null,
    seniors: null,
    hasDisability: "no",
    disabilityCount: null,
    visitDate: "",
    visitTime: "",
    visitObjective: "",
  },
});

const emit = defineEmits<{
  next: [values: any];
}>();

const onSubmit = form.handleSubmit((values: any) => {
  console.log('Formulario Step 1:', JSON.stringify(values, null, 2));
  emit("next", values);
}, (errors: any) => {
  console.log('Errores del formulario Step 1:', JSON.stringify(errors, null, 2));
  console.log('Valores actuales del formulario:', JSON.stringify(form.values, null, 2));
});
</script>
