<template>
  <div class="min-h-fit w-full">
    <h1 class="text-2xl text-[#3C3C3B] font-semibold">Datos de la reservación</h1>
    <form class="space-y-4 w-full mt-1.5">
      <h3 class="text-base text-[#3C3C3B] font-medium mb-1">
        Elige el tipo de visita que mejor se adapta a quienes te acompañan
      </h3>
      <FormField v-slot="{ field }" name="attendeeType">
        <FormItem>
          <FormControl>
            <OptionListField
              @update:model-value="changeAttendeeType"
              label=""
              placeholder="Por favor, selecciona una opción"
              placeholder-font-size="text-base"
              placeholder-class="placeholder:font-semibold font-medium"
              options-content-font-size="text-base"
              :options="attendeeOptions"
              :required="true"
              :model-value="savedAttendeeType"
              :disabled="props.disabled"
              v-bind="field"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      </FormField>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import OptionListField from "~/components/common/OptionListField.vue";
import { useReservationFormStore } from "@/stores/reservation-form";
import { computed, watch } from "vue";

// Store del formulario de reservaciones
const reservationFormStore = useReservationFormStore();

// Obtener el tipo de asistente guardado en el store
const savedAttendeeType = computed(() => {
  const value = reservationFormStore.selectedAttendeeType;
  return value;
});

const attendeeOptions = [
  { value: "general", label: "Personal: con amigos, familiares o de forma individual" },
  {
    value: "escolar",
    label: "Educativa: estudiantes y docentes",
  },
  {
    value: "empresarial",
    label: "Empresarial:  grupo de trabajadores o directivos",
  },
  {
    value: "curso-verano",
    label: "Curso: como parte de programas recreativos o de verano",
  },
];

const formSchema = toTypedSchema(
  z.object({
    attendeeType: z.string().min(1, "Selecciona una opción"),
  })
);

// Establecer el valor inicial del formulario basado en el store
const initialValues = computed(() => ({
  attendeeType: savedAttendeeType.value || "",
}));

const { resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: initialValues.value,
});

// Observar cambios en el store y actualizar el formulario
watch(
  savedAttendeeType,
  (newValue: string | null) => {
    if (newValue) {
      // Forzar la actualización del formulario
      resetForm({
        values: {
          attendeeType: newValue,
        },
      });
    } else {
      // Si no hay valor, limpiar el formulario
      resetForm({
        values: {
          attendeeType: "",
        },
      });
    }
  },
  { immediate: true }
);

// Props
const props = defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  settingAttendeeType: [values: any];
}>();

// Emite el string del formulario seleccionado
const changeAttendeeType = (attendeeType: string) => {
  emit("settingAttendeeType", attendeeType);
};
</script>
