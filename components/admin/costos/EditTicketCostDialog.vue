<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle>
          <span class="block text-start font-semibold text-base mt-1">
            {{ props.ticketLabel }}
          </span>
        </DialogTitle>
      </DialogHeader>
      <form @submit.prevent="onSubmit" class="grid gap-4 pt-2 pb-4">
        <FormField v-slot="{ field }" name="ticketCost">
          <FormItem>
            <FormLabel>Costo</FormLabel>
            <FormControl>
              <div style="position: relative">
                <span
                  style="
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #888;
                  "
                  >$</span
                >
                <Input
                  v-model="rawValue"
                  @input="onInput"
                  @blur="onBlur"
                  @focus="onFocus"
                  placeholder="0.00"
                  :maxlength="15"
                  inputmode="decimal"
                  autocomplete="off"
                  style="padding-left: 24px"
                  :disabled="loading"
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Mensaje de error -->
        <div
          v-if="error"
          class="text-sm text-destructive bg-destructive/10 p-2 rounded-md"
        >
          {{ error }}
        </div>

        <div class="flex flex-col gap-4 mt-4">
          <Button type="submit" :disabled="loading" class="w-full">
            <span v-if="loading" class="flex items-center gap-2">
              <div
                class="w-full border-2 border-current border-t-transparent rounded-full animate-spin"
              ></div>
              Guardando...
            </span>
            <span v-else>Guardar</span>
          </Button>
          <Button
            class="w-full"
            type="button"
            variant="outline"
            @click="isOpen = false"
            :disabled="loading"
            >Cancelar</Button
          >
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { useCostService } from "~/composables/business/useCost";
import { useToast } from "~/composables/ui/useToast";

const props = defineProps<{
  initialCost: string;
  ticketLabel: string;
  ticketId: number;
  visitorType?: number;
}>();

const emit = defineEmits(["save", "update:open", "success"]);

const isOpen = defineModel("open", { type: Boolean, default: false });

// Composable de costos
const { updateCost, isUpdating, error: costError } = useCostService();

// Toast para notificaciones
const { showSuccess, showError } = useToast();

const formSchema = toTypedSchema(
  z.object({
    ticketCost: z
      .string()
      .min(1, "El costo es requerido")
      .regex(/^\d+(\.\d{0,2})?$/, "Solo números y hasta dos decimales"),
  })
);

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    ticketCost: props.initialCost || "",
  },
});

const rawValue = ref(props.initialCost ? props.initialCost.replace(/[^\d.]/g, "") : "");

// Inicializar el formulario cuando se monta el componente
watch(
  () => props.initialCost,
  (newValue) => {
    if (newValue) {
      const cleanValue = newValue.replace(/[^\d.]/g, "");
      rawValue.value = cleanValue;
      form.setFieldValue("ticketCost", cleanValue);
    }
  },
  { immediate: true }
);

function onInput(e: Event) {
  let val = (e.target as HTMLInputElement).value.replace(/[^\d.]/g, "");
  // Solo un punto decimal permitido
  const parts = val.split(".");
  if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");
  // Máximo dos decimales
  if (parts[1]) val = parts[0] + "." + parts[1].slice(0, 2);
  rawValue.value = val;
}

function onBlur() {
  if (!rawValue.value) return;
  const num = Number(rawValue.value);
  rawValue.value = isNaN(num) ? "" : num.toFixed(2);
}

function onFocus() {
  nextTick(() => {
    const input = document.activeElement as HTMLInputElement;
    input && input.select();
  });
}

watch(rawValue, (val) => {
  form.setFieldValue("ticketCost", val);
});

watch(
  () => props.initialCost,
  (val) => {
    rawValue.value = val ? val.replace(/[^\d.]/g, "") : "";
    form.setFieldValue("ticketCost", rawValue.value);
  }
);

const onSubmit = form.handleSubmit(async (values) => {
  const amount = Number(values.ticketCost);

  try {
    // Usar el composable para actualizar el costo (userModifiedId se agrega automáticamente)
    const result = await updateCost({
      id: props.ticketId,
      cost: props.ticketLabel,
      amount: amount,
      effectiveDate: new Date().toISOString(),
    });

    if (result) {
      // Mostrar mensaje de éxito
      showSuccess("Éxito", `El costo se actualizó correctamente a $${amount.toFixed(2)}`);

      // Emitir el evento de guardado y éxito
      emit("save", amount);
      emit("success", { id: props.ticketId, newAmount: amount });
      isOpen.value = false;
    }
  } catch (err: any) {
    console.error("Error al actualizar el costo:", err);
    const errorMessage =
      err?.message || "Error al actualizar el costo. Intente nuevamente.";

    // Mostrar mensaje de error
    showError("Error", errorMessage);
  }
});
</script>
