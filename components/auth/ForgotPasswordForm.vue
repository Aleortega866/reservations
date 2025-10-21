<template>
  <Card
    :class="
      isMobile ? 'border-0 rounded-none shadow-none' : 'border-0 rounded-3xl shadow-lg'
    "
    :style="
      isMobile ? 'box-shadow: none' : 'box-shadow: 4px 0px 12px 0px rgba(0,0,0,0.1);'
    "
  >
    <CardHeader class="text-center pb-0">
      <CardTitle class="text-left text-3xl font-semibold"
        >Recuperar tu contraseña</CardTitle
      >
    </CardHeader>
    <CardContent class="space-y-4 p-4">
      <!-- Error message -->
      <AlertMessage v-if="error" type="error" :message="getAuthErrorMessage(error)" />

      <!-- Success message -->
      <AlertMessage
        v-if="success"
        type="success"
        :message="success"
        dismissible
        @dismiss="success = ''"
      />

      <form @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel class="text-sm">Correo electrónico</FormLabel>
            <FormControl>
              <Input
                type="email"
                placeholder="Ingresa tu correo electrónico"
                class="border-0"
                :disabled="loading"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button
          type="submit"
          variant="secondary"
          class="w-full mt-6"
          :disabled="loading || !isValid"
        >
          <div v-if="loading" class="flex items-center justify-center">
            <div
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
            ></div>
            Enviando...
          </div>
          <span v-else>Enviar</span>
        </Button>
      </form>

      <div class="text-center space-y-2">
        <Button
          variant="link"
          @click="$emit('login')"
          class="text-primary p-0 h-auto italic"
        >
          Iniciar Sesión
        </Button>
        <br />
        <Button
          variant="link"
          @click="$emit('register')"
          class="text-primary p-0 h-auto italic"
        >
          Registrarme
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import AlertMessage from "@/components/common/AlertMessage.vue";
import { useErrorHandler } from "@/composables/ui/useErrorHandler";

interface Props {
  loading?: boolean;
  error?: any;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
});

const emit = defineEmits(["submit", "login", "register"]);

// Usar el composable de device de Nuxt
const {
  isMobile,
  isDesktop,
  isTablet,
  isMobileOrTablet,
  isDesktopOrTablet,
} = useDevice();
const success = ref("");
const { getAuthErrorMessage } = useErrorHandler();

// Definir el esquema localmente con zod
const forgotPasswordSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
});

// Formulario con vee-validate y zod
const form = useForm({
  validationSchema: toTypedSchema(forgotPasswordSchema),
});

const { handleSubmit, meta, values } = form;

const isValid = computed(() => meta.value.valid);

// Limpiar mensaje de éxito cuando cambia el formulario
watch(
  () => values.email,
  (newValue) => {
    if (success.value && newValue) {
      success.value = "";
    }
  }
);

// Limpiar errores cuando se resuelve el error del servidor
watch(
  () => props.error,
  (newError) => {
    if (!newError) {
      form.resetForm();
    }
  }
);

const onSubmit = handleSubmit((values: { email: string }) => {
  emit("submit", values);
});
</script>
