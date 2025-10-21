<template>
  <Dialog :open="props.open" @update:open="(v: boolean) => emit('update:open', v)">
    <DialogContent class="sm:max-w-[425px] lg:max-w-[600px] p-0 h-[90vh] flex flex-col">
      <DialogHeader class="p-6 pb-4 flex-shrink-0">
        <DialogTitle class="text-lg text-start font-semibold"
          >Editar Código de Promoción</DialogTitle
        >
      </DialogHeader>

      <form @submit.prevent="onSubmit" class="flex-1 overflow-y-auto px-6 pb-6">
        <div class="space-y-4" v-auto-animate="{ duration: 200, easing: 'ease-out' }">
          <!-- Código de vinculación -->
          <FormField v-slot="{ componentField }" name="code">
            <FormItem>
              <FormLabel class="text-sm font-semibold">Código de Vinculación</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  disabled
                  type="text"
                  placeholder="Código de vinculación"
                  class="w-full"
                />
              </FormControl>
            </FormItem>
          </FormField>

          <!-- Nombre del código -->
          <FormField v-slot="{ componentField }" name="name">
            <FormItem>
              <FormLabel class="text-sm font-semibold">Nombre del código</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="text"
                  placeholder="Ingresa el nombre del código"
                  class="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Costo del boleto -->
          <FormField v-slot="{ componentField }" name="ticketPrice">
            <FormItem>
              <FormLabel class="text-sm font-semibold">Costo del boleto</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="number"
                  placeholder="Ingresa el costo del boleto"
                  class="w-full"
                  min="0"
                  step="0.01"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Número de boletos -->
          <FormField v-slot="{ componentField }" name="maxTickets">
            <FormItem>
              <FormLabel class="text-sm font-semibold">Número de boletos</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="number"
                  placeholder="Ingresa el número de boletos"
                  class="w-full"
                  min="0"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <p class="text-sm font-semibold pt-4 pb-1 mb-2">
            Período para el código de promoción
          </p>

          <!-- Rango de fechas -->
          <FormField name="enableDateRange">
            <FormItem>
              <FormControl>
                <div class="flex items-center space-x-2">
                  <Checkbox
                    :model-value="form.values.enableDateRange"
                    @update:model-value="onToggleDateRange"
                    variant="secondary"
                    class="w-4 h-4 rounded-full"
                  />
                  <label
                    class="text-sm font-medium text-foreground cursor-pointer"
                    @click="onToggleDateRange(!form.values.enableDateRange)"
                  >
                    Rango de fechas
                  </label>
                </div>
              </FormControl>
            </FormItem>
          </FormField>

          <!-- Fecha inicio / única -->
          <FormField v-slot="{ value, handleChange, handleBlur }" name="startDate">
            <FormItem>
              <FormLabel class="text-sm font-semibold">{{
                isDateRange ? "Fecha de inicio" : "Fecha"
              }}</FormLabel>
              <FormControl>
                <CalendarField
                  :model-value="value"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                  :min-date="new Date()"
                  class="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Fecha fin -->
          <FormField
            v-if="isDateRange"
            v-slot="{ value, handleChange, handleBlur }"
            name="endDate"
          >
            <FormItem v-auto-animate="{ duration: 200 }">
              <FormLabel class="text-sm font-semibold">Fecha de fin</FormLabel>
              <FormControl>
                <CalendarField
                  :model-value="value"
                  @update:model-value="handleChange"
                  @blur="handleBlur"
                  :min-date="startDate || new Date()"
                  class="w-full"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Descripción -->
          <FormField v-slot="{ componentField }" name="description">
            <FormItem>
              <FormLabel class="text-sm font-semibold">Descripción</FormLabel>
              <FormControl>
                <Textarea
                  v-bind="componentField"
                  placeholder="Escribe una descripción..."
                  class="w-full min-h-[100px] resize-none"
                  rows="4"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Mensaje usuario -->
          <FormField v-slot="{ componentField }" name="messageUser">
            <FormItem>
              <FormLabel class="text-sm font-semibold">Mensaje para el usuario</FormLabel>
              <FormControl>
                <Textarea
                  v-bind="componentField"
                  placeholder="Mensaje para el usuario..."
                  class="w-full min-h-[100px] resize-none"
                  rows="4"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <!-- Mensaje admin -->
          <FormField v-slot="{ componentField }" name="messageAdmin">
            <FormItem>
              <FormLabel class="text-sm font-semibold"
                >Mensaje para el personal Administrador</FormLabel
              >
              <FormControl>
                <Textarea
                  v-bind="componentField"
                  placeholder="Mensaje para el personal administrativo..."
                  class="w-full min-h-[100px] resize-none"
                  rows="4"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <Button type="submit" class="w-full">
            <Icon
              v-if="isLoading"
              icon="lucide:loader-circle"
              width="16"
              height="16"
              class="mr-2 animate-spin"
            />
            {{ isLoading ? "Actualizando..." : "Actualizar Código de Promoción" }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Button from "@/components/ui/button/Button.vue";
import Input from "@/components/ui/input/Input.vue";
import Textarea from "@/components/ui/textarea/Textarea.vue";
import Checkbox from "@/components/ui/checkbox/Checkbox.vue";
import CalendarField from "~/components/common/CalendarField.vue";
import { Icon } from "@iconify/vue";

import { useToast } from "@/composables/ui/useToast";
import type { UpdateLinkingCodeRequest, LinkingCode } from "@/lib/api/types/promotion";
import { promotionService } from "@/lib/api/services";

const props = defineProps<{ open: boolean; promotion?: LinkingCode }>();
const emit = defineEmits<{
  "update:open": [value: boolean];
  updated: [promotion: LinkingCode];
}>();

const { showSuccess, showError } = useToast();

// Schema con números y fechas tipados correctamente
const formSchema = toTypedSchema(
  z.object({
    code: z.string(),
    name: z
      .string()
      .min(1, "El nombre del código es requerido")
      .max(50, "Máximo 50 caracteres"),
    ticketPrice: z.preprocess(
      (v) => Number(v),
      z
        .number({ invalid_type_error: "Ingresa un número" })
        .min(0.01, "El costo debe ser mayor a 0")
    ),
    maxTickets: z.preprocess(
      (v) => Number(v),
      z
        .number({ invalid_type_error: "Ingresa un número" })
        .min(1, "Debe haber al menos 1")
    ),
    enableDateRange: z.boolean().default(false),
    startDate: z.date({ required_error: "La fecha es requerida" }),
    endDate: z.date().nullable().optional(),
    description: z.string().max(200, "Máximo 200 caracteres").optional(),
    messageUser: z.string().max(200, "Máximo 200 caracteres").optional(),
    messageAdmin: z.string().max(200, "Máximo 200 caracteres").optional(),
  })
);

const form = useForm({
  validationSchema: formSchema,
  initialValues: {
    code: "",
    name: "",
    ticketPrice: 0,
    maxTickets: 0,
    enableDateRange: false,
    startDate: new Date(),
    endDate: undefined,
    description: "",
    messageUser: "",
    messageAdmin: "",
  },
});

const isLoading = ref(false);

const isDateRange = computed(() => form.values.enableDateRange);
const startDate = computed(() => form.values.startDate);

// handleSubmit de vee-validate asegura valores listos
const onSubmit = form.handleSubmit(async (values) => {
  if (!props.promotion) return;

  const request: UpdateLinkingCodeRequest = {
    id: String(props.promotion.id),
    name: values.name.trim(),
    ticketPrice: values.ticketPrice,
    maxTickets: values.maxTickets,
    startDate: values.startDate.toISOString(),
    endDate: isDateRange ? values.endDate?.toISOString() : "",
    description: values.description?.trim() || null,
    messageUser: values.messageUser?.trim() || null,
    messageAdmin: values.messageAdmin?.trim() || null,
    userModifiedId: 1, // TODO: reemplazar por el usuario actual
  };

  try {
    isLoading.value = true;
    const promotion = await promotionService.updateLinkingCode(request);
    emit("update:open", false);
    emit("updated", promotion);
    showSuccess("Éxito", "Código actualizado correctamente");
  } catch (error) {
    console.error("Error al actualizar código de promoción:", error);
    showError("Error", "No se pudo actualizar el código de promoción");
  } finally {
    isLoading.value = false;
  }
});

// Cargar datos cuando se abre el diálogo
watch(
  () => [props.open, props.promotion],
  ([open, promo]) => {
    if (open && promo) {
      // Determinar si es un rango de fechas: si tiene ambas fechas (incluso si son iguales)
      const hasStartDate = !!promo.startDate;
      const hasEndDate = !!promo.endDate;
      const isRange = hasStartDate && hasEndDate;

      form.resetForm({
        values: {
          code: promo.code || "",
          name: promo.name || "",
          ticketPrice: promo.ticketPrice ?? 0,
          maxTickets: promo.maxTickets ?? 0,
          enableDateRange: isRange,
          startDate: promo.startDate ? new Date(promo.startDate) : new Date(),
          endDate: isRange && promo.endDate ? new Date(promo.endDate) : null,
          description: promo.description || "",
          messageUser: promo.messageUser || "",
          messageAdmin: promo.messageAdmin || "",
        },
      });
    } else if (!open) {
      form.resetForm({
        values: {
          code: "",
          name: "",
          ticketPrice: 0,
          maxTickets: 0,
          enableDateRange: false,
          startDate: new Date(),
          endDate: undefined,
          description: "",
          messageUser: "",
          messageAdmin: "",
        },
      });
    }
  },
  { immediate: true }
);

const onToggleDateRange = (val: boolean | "indeterminate") => {
  const boolVal = val === true;
  form.setFieldValue("enableDateRange", boolVal);
  if (!boolVal) {
    // Si se desactiva, endDate -> null
    form.setFieldValue("endDate", null); // 👈 null
  } else {
    // Si se activa, endDate toma startDate (puedes cambiar a +1 día si prefieres)
    const base = form.values.startDate ?? new Date();
    form.setFieldValue("endDate", new Date(base));
  }
};

watch(
  () => form.values.enableDateRange,
  (on) => {
    if (!on) form.setFieldValue("endDate", null);
  }
);
</script>
