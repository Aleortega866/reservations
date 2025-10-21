<template>
  <Card
    :class="isMobile ? 'border-0 rounded-none shadow-none' : 'border-0 rounded-3xl'"
    :style="
      isMobile ? 'box-shadow: none' : 'box-shadow: 4px 0px 12px 0px rgba(0,0,0,0.1);'
    "
    class="gap-0 px-1 md:px-4 md:py-6"
  >
    <CardHeader class="text-left px-0 pb-0 gap-0 md:px-4">
      <CardTitle class="text-3xl text-left font-semibold">Inicio de Sesión</CardTitle>
    </CardHeader>
    <CardContent class="space-y-4 pt-4 pb-4 px-0 md:px-4">
      <!-- Error message -->
      <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-md">
        <p class="text-sm text-red-600">
          {{ getAuthErrorMessage(error) }}
        </p>
      </div>

      <form @submit="onSubmit" v-auto-animate class="space-y-4">
        <FormField v-slot="{ componentField }" name="email">
          <FormItem v-auto-animate>
            <FormLabel>Correo electrónico</FormLabel>
            <FormControl>
              <Input
                v-bind="componentField"
                type="email"
                placeholder="Ingresa tu correo electrónico"
                class="border-0 mt-1 pr-10"
                :disabled="loading"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="password">
          <FormItem v-auto-animate>
            <FormLabel>Contraseña</FormLabel>
            <FormControl>
              <div class="relative">
                <Input
                  v-bind="componentField"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Ingresa tu contraseña"
                  :disabled="loading"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                  @click="showPassword = !showPassword"
                  :disabled="loading"
                  tabindex="-1"
                >
                  <Icon v-if="!showPassword" icon="lucide:eye" width="16" height="16" />
                  <Icon v-else icon="lucide:eye-off" width="16" height="16" />
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit" variant="secondary" class="w-full mt-6" :disabled="loading">
          <div v-if="loading" class="flex items-center justify-center">
            <div
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
            ></div>
            Iniciando sesión...
          </div>
          <span v-else>Iniciar sesión</span>
        </Button>
      </form>

      <div class="text-center space-y-2">
        <Button
          variant="link"
          @click="$emit('forgot-password')"
          class="text-primary p-0 h-auto italic"
          :disabled="loading"
        >
          Olvidé mi contraseña
        </Button>
        <br />
        <Button
          variant="link"
          @click="$emit('register')"
          class="text-primary p-0 h-auto italic"
          :disabled="loading"
        >
          Registrarme
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icon } from "@iconify/vue";
import { useErrorHandler } from "@/composables/ui/useErrorHandler";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import { vAutoAnimate } from "@formkit/auto-animate/vue";

interface Props {
  loading?: boolean;
  error?: any;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
});

const emit = defineEmits(["submit", "forgot-password", "register"]);

// Usar el composable de device de Nuxt
const {
  isMobile,
  isDesktop,
  isTablet,
  isMobileOrTablet,
  isDesktopOrTablet,
} = useDevice();

// Estado para mostrar/ocultar contraseña
const showPassword = ref(false);

// Esquema de validación con Zod
const formSchema = toTypedSchema(
  z.object({
    email: z
      .string({
        required_error: "El correo electrónico es obligatorio",
        invalid_type_error: "El correo electrónico es obligatorio",
      })
      .email("El correo electrónico no es válido"),
    password: z
      .string({
        required_error: "La contraseña es obligatoria",
        invalid_type_error: "La contraseña es obligatoria",
      })
      .nonempty("La contraseña es obligatoria")
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/,
        "La contraseña debe incluir mayúscula, minúscula, número y un carácter especial."
      ),
  })
);

// useForm de vee-validate
const { handleSubmit, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: {
    email: "",
    password: "",
  },
});

const onSubmit = handleSubmit((values) => {
  emit("submit", values);
});

// Limpiar formulario cuando se resuelve el error
watch(
  () => props.error,
  (newError) => {
    if (!newError) {
      resetForm();
    }
  }
);

// Obtener función de error handler
const { getAuthErrorMessage } = useErrorHandler();
</script>
