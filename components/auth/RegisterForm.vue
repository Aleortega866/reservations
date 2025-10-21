<template>
  <Card
    :class="isMobile ? 'border-0 rounded-none shadow-none' : 'border-0 rounded-3xl'"
    :style="
      isMobile ? 'box-shadow: none' : 'box-shadow: 4px 0px 12px 0px rgba(0,0,0,0.1);'
    "
  >
    <CardHeader class="text-left px-6 pb-0">
      <CardTitle class="text-3xl font-semibold">Registro de Usuario</CardTitle>
    </CardHeader>
    <CardContent class="p-4 space-y-12">
      <!-- Error message -->
      <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-md">
        <p class="text-sm text-red-600">
          {{ getAuthErrorMessage(error) }}
        </p>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-4">
        <FormField v-slot="{ componentField }" name="username">
          <FormItem v-auto-animate>
            <FormLabel class="text-sm">Nombre de Usuario</FormLabel>
            <FormControl>
              <Input
                placeholder="Ingresa el nombre de usuario que recordarás"
                class="border-0"
                :disabled="loading"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="firstName">
          <FormItem>
            <FormLabel class="text-sm">Nombre(s)</FormLabel>
            <FormControl>
              <Input
                placeholder="Ingresa todos tus nombres"
                class="border-0"
                :disabled="loading"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="lastName">
          <FormItem v-auto-animate>
            <FormLabel class="text-sm">Apellido Paterno</FormLabel>
            <FormControl>
              <Input
                placeholder="Ingresa tu apellido paterno"
                class="border-0"
                :disabled="loading"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="maternalLastName">
          <FormItem>
            <FormLabel class="text-sm">Apellido Materno</FormLabel>
            <FormControl>
              <Input
                placeholder="Ingresa tu apellido materno (opcional)"
                class="border-0"
                :disabled="loading"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="dateBirth">
          <FormItem>
            <FormLabel class="text-sm">Fecha de nacimiento</FormLabel>
            <FormControl>
              <CalendarField
                label="Selecciona tu fecha de nacimiento"
                :month-year-only="true"
                :disabledColors="false"
                placeholder="Selecciona tu fecha de nacimiento"
                :attributes="customAttributes"
                :min-date="getMinBirthDate()"
                :max-date="getMaxBirthDate()"
                v-model="vcalendarDateValue"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- <FormField v-slot="{ componentField }" name="gender">
          <FormItem>
            <FormLabel class="text-sm ">Género</FormLabel>
            <FormControl>
              <Select v-bind="componentField" class="w-full">
                <SelectTrigger class="border-0 w-full">
                  <SelectValue placeholder="Por favor, selecciona una opción" />
                </SelectTrigger>
                <SelectContent>
                  <div v-if="genderLoading" class="p-2 text-center text-sm ">
                    Cargando opciones...
                  </div>
                  <div v-else-if="genderError" class="p-2 text-center text-sm text-red-600">
                    Error al cargar opciones
                  </div>
                  <div v-else-if="genderOptions.length === 0" class="p-2 text-center text-sm ">
                    No hay opciones disponibles
                  </div>
                  <SelectItem 
                    v-else
                    v-for="option in genderOptions" 
                    :key="option.id" 
                    :value="option.value"
                  >
                    {{  option.value }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField> -->

        <FormField v-slot="{ componentField }" name="gender">
          <FormItem v-auto-animate>
            <FormLabel class="text-sm">Género</FormLabel>
            <FormControl>
              <OptionListField
                label=""
                placeholder="Por favor, selecciona una opción"
                v-model="vgenderValue"
                :options="genderOptions"
                :disabled="loading"
                v-bind="componentField"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="phone">
          <FormItem v-auto-animate>
            <FormLabel class="text-sm">Teléfono de contacto</FormLabel>
            <FormControl>
              <Input
                type="tel"
                placeholder="Ingresa tu teléfono"
                class="border-0"
                :disabled="loading"
                v-bind="componentField"
              />
            </FormControl>
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="email">
          <FormItem v-auto-animate>
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
            <InfoAlert
              message="Recuerda que puedes hacer reserbaciones con distintas instituciones desde el mismo correo"
              class="mb-0"
            />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="password">
          <FormItem v-auto-animate>
            <FormLabel class="text-sm">Contraseña</FormLabel>
            <FormControl>
              <div class="relative">
                <Input
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Crea una contraseña segura"
                  class="border-0 pr-10"
                  :disabled="loading"
                  v-bind="componentField"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-foreground transition-colors"
                  @click="showPassword = !showPassword"
                  :disabled="loading"
                >
                  <Icon v-if="!showPassword" icon="lucide:eye" width="16" height="16" />
                  <Icon v-else icon="lucide:eye-off" width="16" height="16" />
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="confirmPassword">
          <FormItem v-auto-animate>
            <FormLabel class="text-sm">Confirmar contraseña</FormLabel>
            <FormControl>
              <div class="relative">
                <Input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Confirma tu contraseña"
                  class="border-0 pr-10"
                  :disabled="loading"
                  v-bind="componentField"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-foreground transition-colors"
                  @click="showConfirmPassword = !showConfirmPassword"
                  :disabled="loading"
                >
                  <Icon
                    v-if="!showConfirmPassword"
                    icon="lucide:eye"
                    width="16"
                    height="16"
                  />
                  <Icon v-else icon="lucide:eye-off" width="16" height="16" />
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        </FormField>

        <!-- Checkboxes de términos y condiciones -->
        <div class="space-y-3" v-auto-animate>
          <FormField v-slot="{ value, handleChange }" name="receiveNewsletters">
            <FormItem
              v-auto-animate
              class="flex flex-row items-start space-x-3 space-y-0"
            >
              <FormControl class="mr-0.5">
                <Checkbox
                  :model-value="value"
                  @update:model-value="handleChange"
                  :disabled="loading"
                />
              </FormControl>
              <div class="space-y-1 leading-none">
                <FormLabel class="text-xs font-medium">
                  Me gustaría recibir únicamente información sobre actividades educativas,
                  talleres, charlas, sesiones digitales y otros eventos relacionados.
                </FormLabel>
              </div>
            </FormItem>
          </FormField>

          <FormField
            v-slot="{ value, handleChange }"
            type="checkbox"
            name="acceptDataUsage"
          >
            <FormItem
              v-auto-animate
              class="col-span-12 sm:col-span-6 md:col-span-3 lg:col-span-4 relative"
            >
              <FormControl>
                <div class="flex items-center space-x-2">
                  <Checkbox
                    id="acceptDataUsage"
                    :model-value="value"
                    :disabled="loading"
                    @update:model-value="handleChange"
                  />
                  <label for="acceptDataUsage" class="text-xs font-medium">
                    Autorizo el uso de mis datos personales con fines comerciales.
                  </label>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
            <div class="flex items-start space-x-1 mb-4">
              <InfoAlert
                message="Recuerda que tus datos personales están protegidos bajo la Ley de Protección de Datos Personales, la cual garantiza su seguridad y confidencialidad. Solo se utilizarán de acuerdo con las finalidades informadas y en cumplimiento con la normativa vigente, asegurando que tus derechos como titular de los datos sean respetados en todo momento."
                class="mb-0"
              />
            </div>
          </FormField>
        </div>

        <!-- Debug info (temporal) -->
        <div v-if="false" class="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p class="text-sm text-blue-600 font-medium">Debug del formulario:</p>
          <div class="text-xs text-blue-600 mt-1">
            <p><strong>¿Formulario válido?</strong> {{ isValid }}</p>
            <p><strong>Errores:</strong> {{ Object.keys(errors).length }}</p>
            <p><strong>Username:</strong> "{{ values.username }}"</p>
            <p><strong>Email:</strong> "{{ values.email }}"</p>
            <p><strong>Password:</strong> "{{ values.password ? "***" : "" }}"</p>
            <button
              @click="console.log('Valores del formulario:', values)"
              class="text-xs bg-blue-200 px-2 py-1 rounded mt-1"
            >
              Ver valores en consola
            </button>
            <button
              @click="() => console.log('Validación manual')"
              class="text-xs bg-green-200 px-2 py-1 rounded mt-1 ml-1"
            >
              Validar formulario
            </button>
          </div>
        </div>

        <div v-if="false" class="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p class="text-sm text-yellow-600 font-medium">Errores de validación:</p>
          <ul class="text-xs text-yellow-600 mt-1">
            <li v-for="(error, field) in errors" :key="field">
              {{ field }}: {{ error }}
            </li>
          </ul>
        </div>

        <!-- Botones de acción -->
        <div class="flex space-x-2 pt-4">
          <Button type="submit" variant="secondary" class="flex-1" :disabled="loading">
            <div v-if="loading" class="flex items-center justify-center">
              <div
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"
              ></div>
              Registrando...
            </div>
            <span v-else>Registrar</span>
          </Button>
        </div>

        <!-- Enlaces adicionales -->
        <div class="text-center pt-4 space-y-1">
          <div class="text-sm text-primary">
            <NuxtLink to="/auth/login" class="text-primary p-0 h-auto italic">
              Iniciar sesión
            </NuxtLink>
          </div>
          <div class="text-sm">
            <NuxtLink to="/auth/forgot-password" class="text-primary p-0 h-auto italic">
              Olvide mi contraseña
            </NuxtLink>
          </div>
        </div>
      </form>
    </CardContent>
  </Card>
</template>

<script setup>
import { watch, onMounted, ref, computed } from "vue";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Icon } from "@iconify/vue";
import CalendarField from "~/components/common/CalendarField.vue";
import { useCatalog } from "@/composables/catalog/useCatalog";
import { useErrorHandler } from "@/composables/ui/useErrorHandler";
import OptionListField from "~/components/common/OptionListField.vue";
import InfoAlert from "@/components/common/InfoAlert.vue";

const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: [Error, Object, null],
    default: null,
  },
});

const emit = defineEmits(["submit", "cancel"]);

// Estados para mostrar/ocultar contraseñas
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Composable para catálogos
const {
  fetchCatalogs,
  fetchPublicCatalogs,
  catalogs,
  loading: catalogLoading,
  error: catalogError,
} = useCatalog();

// Composable para manejo de errores
const { getAuthErrorMessage } = useErrorHandler();

// Estado para opciones de género
const genderOptions = ref([]);
const genderLoading = ref(false);
const genderError = ref(null);
const vcalendarDateValue = (ref < Date) | (null > null);
const vgenderValue = ref("");

// Atributos personalizados para VCalendar
const customAttributes = computed(() => [
  {
    key: "special",
    highlight: {
      color: "gray",
      fillMode: "light",
    },
    dates: [
      new Date(2024, 11, 25), // Navidad
      new Date(2024, 11, 31), // Año Nuevo
    ],
    customData: {
      status: "holiday",
      description: "Día festivo",
    },
  },
]);

// Cargar opciones de género desde el catálogo
const loadGenderOptions = async () => {
  genderLoading.value = true;
  genderError.value = null;

  try {
    await fetchPublicCatalogs({ tableName: "Gender" });
    const genderCatalogs = catalogs.value.filter(
      (catalog) => catalog.tableName === "Gender" && catalog.enable
    );

    genderOptions.value = genderCatalogs.map((catalog) => ({
      id: catalog.id,
      value: catalog.value,
      description: catalog.description || catalog.value,
    }));
  } catch (err) {
    genderError.value = "Error al cargar opciones de género";
    console.error("Error cargando géneros:", err);
  } finally {
    genderLoading.value = false;
  }
};

// Funciones para fechas de nacimiento
// Fecha mínima: 80 años atrás (persona más vieja permitida)
const getMinBirthDate = () => {
  const today = new Date();
  return new Date(today.getFullYear() - 80, today.getMonth(), today.getDate());
};

// Fecha máxima: 18 años atrás (persona más joven permitida - debe ser mayor de edad)
const getMaxBirthDate = () => {
  const today = new Date();
  return new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
};

// Schema de validación con Zod
const formSchema = toTypedSchema(
  z
    .object({
      username: z
        .string()
        .min(1, "El nombre de usuario es requerido")
        .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
        .max(10, "El nombre de usuario debe tener máximo 10 caracteres")
        .regex(
          /^[a-zA-Z0-9_]+$/,
          "El nombre de usuario solo puede contener letras, números y guiones bajos"
        ),
      firstName: z
        .string()
        .min(1, "El nombre es requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(20, "El nombre es demasiado largo (máximo 20 caracteres)")
        .regex(
          /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
          "El nombre solo puede contener letras y espacios"
        ),
      lastName: z
        .string()
        .min(1, "El apellido paterno es requerido")
        .min(2, "El apellido paterno debe tener al menos 2 caracteres")
        .max(20, "El apellido paterno es demasiado largo (máximo 20 caracteres)")
        .regex(
          /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
          "El apellido paterno solo puede contener letras y espacios"
        ),
      maternalLastName: z
        .string()
        .max(20, "El apellido materno es demasiado largo (máximo 20 caracteres)")
        .regex(
          /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/,
          "El apellido materno solo puede contener letras y espacios"
        )
        .optional()
        .or(z.literal("")),
      dateBirth: z.union([z.string(), z.date()]).refine((date) => {
        if (!date) return false;
        const dateBirth = date instanceof Date ? date : new Date(date);
        const today = new Date();
        let age = today.getFullYear() - dateBirth.getFullYear();
        const m = today.getMonth() - dateBirth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dateBirth.getDate())) {
          age--;
        }
        return age >= 18 && age <= 80;
      }, "Debes tener mas de 18 años"),
      gender: z
        .string()
        .min(1, "Por favor selecciona tu género")
        .refine(
          (value) => {
            // Si no hay opciones cargadas aún, permitir cualquier valor
            if (genderOptions.value.length === 0) return true;
            // Validar contra las opciones disponibles
            return genderOptions.value.some((option) => option.value === value);
          },
          {
            message: "Selecciona una opción válida",
          }
        ),
      phone: z
        .string()
        .min(1, "El teléfono es requerido")
        .regex(/^[\+]?[1-9][\d]{0,14}$/, "Ingresa un número de teléfono válido")
        .max(15, "El número de teléfono es demasiado largo (máximo 15 caracteres)"),
      email: z
        .string()
        .min(1, "El correo electrónico es requerido")
        .email("Ingresa un correo electrónico válido")
        .max(50, "El correo electrónico es demasiado largo (máximo 50 caracteres)"),
      password: z
        .string()
        .min(1, "La contraseña es requerida")
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(128, "La contraseña es demasiado larga")
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])/,
          "La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial"
        ),
      confirmPassword: z.string().min(1, "Por favor confirma tu contraseña"),
      receiveNewsletters: z.boolean().default(false),
      acceptDataUsage: z
        .boolean()
        .refine((val) => val === true, "Debe aceptar los términos y condiciones"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Las contraseñas no coinciden",
      path: ["confirmPassword"],
    })
);

// Formulario con vee-validate
const { handleSubmit, isValid, errors, values, setFieldValue } = useForm({
  validationSchema: formSchema,
});

// Debug: mostrar estado del formulario
watch(
  [() => isValid, () => errors],
  ([newIsValid, newErrors]) => {
    console.log("🔍 DEBUG RegisterForm - Estado del formulario:", {
      isValid: newIsValid,
      errors: newErrors,
      errorCount: Object.keys(newErrors || {}).length,
      dateBirthError: newErrors?.dateBirth || null,
      currentDateBirth: values.dateBirth,
      vcalendarValue: vcalendarDateValue.value,
    });
  },
  { deep: true }
);

// Debug: mostrar valores del formulario cuando cambien
watch(
  values,
  (newValues) => {
    console.log("🔍 DEBUG RegisterForm - Valores del formulario cambiaron:", newValues);
    console.log("🔍 DEBUG RegisterForm - Valores específicos:", {
      username: newValues.username,
      firstName: newValues.firstName,
      email: newValues.email,
      password: newValues.password,
      dateBirth: newValues.dateBirth,
      dateBirthType: typeof newValues.dateBirth,
      dateBirthValid: newValues.dateBirth
        ? !isNaN(new Date(newValues.dateBirth).getTime())
        : false,
    });
  },
  { deep: true }
);

// Sincronizar el valor del calendario con el formulario
watch(vcalendarDateValue, (newDate) => {
  console.log("🔍 DEBUG RegisterForm - vcalendarDateValue changed:", {
    newDate,
    newDateType: typeof newDate,
    isDateInstance: newDate instanceof Date,
    dateString: newDate instanceof Date ? newDate.toISOString() : null,
  });

  if (newDate) {
    // Convertir la fecha a string para el formulario
    const dateString =
      newDate instanceof Date ? newDate.toISOString().split("T")[0] : newDate;
    console.log("🔍 DEBUG RegisterForm - Converting date to string:", {
      originalDate: newDate,
      dateString: dateString,
      isoString: newDate instanceof Date ? newDate.toISOString() : null,
    });

    // Usar setFieldValue para actualizar el campo del formulario correctamente
    setFieldValue("dateBirth", dateString);
    console.log("🔍 DEBUG RegisterForm - dateBirth field updated with:", dateString);
  } else {
    console.log("🔍 DEBUG RegisterForm - vcalendarDateValue is null/undefined");
  }
});

// Debug específico para el campo dateBirth
watch(
  () => values.dateBirth,
  (newDateBirth) => {
    console.log("🔍 DEBUG RegisterForm - dateBirth field changed:", {
      newDateBirth,
      newDateBirthType: typeof newDateBirth,
      isValidDate: newDateBirth ? !isNaN(new Date(newDateBirth).getTime()) : false,
      parsedDate: newDateBirth ? new Date(newDateBirth) : null,
    });

    if (newDateBirth) {
      const parsedDate = new Date(newDateBirth);
      const today = new Date();
      let age = today.getFullYear() - parsedDate.getFullYear();
      const m = today.getMonth() - parsedDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < parsedDate.getDate())) {
        age--;
      }

      console.log("🔍 DEBUG RegisterForm - Age calculation:", {
        birthDate: parsedDate,
        today: today,
        calculatedAge: age,
        isAdult: age >= 18,
        isValidAge: age >= 18 && age <= 80,
      });
    }
  },
  { immediate: true }
);

// Debug para validación de fechas mínimas y máximas
const debugDateLimits = () => {
  const minDate = getMinBirthDate();
  const maxDate = getMaxBirthDate();
  const today = new Date();

  console.log("🔍 DEBUG RegisterForm - Date limits:", {
    today: today,
    minBirthDate: minDate,
    maxBirthDate: maxDate,
    minAge: today.getFullYear() - maxDate.getFullYear(),
    maxAge: today.getFullYear() - minDate.getFullYear(),
  });
};

// Llamar debug de límites de fecha al montar
onMounted(() => {
  console.log("🔍 DEBUG RegisterForm - Component mounted");
  console.log("🔍 DEBUG RegisterForm - Initial state:", {
    vcalendarDateValue: vcalendarDateValue.value,
    formValues: values,
    formErrors: errors,
    formIsValid: isValid,
  });

  loadGenderOptions();
  debugDateLimits();
});

// Limpiar errores cuando se resuelve el error del servidor
watch(
  () => props.error,
  (newError) => {
    console.log("Error:", newError);
    if (!newError) {
      // Reset form when error is cleared
    }
  }
);

// Sincronizar el valor del género con el formulario
watch(vgenderValue, (newValue) => {
  if (newValue) {
    setFieldValue("gender", newValue);
  }
});

// Validar el campo de género cuando se carguen las opciones
watch(genderOptions, (newOptions) => {
  if (newOptions.length > 0) {
    // Gender options loaded
  }
});

const onSubmit = handleSubmit(
  (values) => {
    console.log("🔍 DEBUG RegisterForm - Formulario válido, enviando datos:", values);
    console.log("🔍 DEBUG RegisterForm - Errores del formulario:", errors);
    console.log("🔍 DEBUG RegisterForm - ¿Formulario es válido?", isValid);

    // Debug específico para la fecha de nacimiento
    console.log("🔍 DEBUG RegisterForm - Date birth debug:", {
      dateBirth: values.dateBirth,
      dateBirthType: typeof values.dateBirth,
      vcalendarDateValue: vcalendarDateValue.value,
      vcalendarDateValueType: typeof vcalendarDateValue.value,
      parsedDate: values.dateBirth ? new Date(values.dateBirth) : null,
      isValidDate: values.dateBirth
        ? !isNaN(new Date(values.dateBirth).getTime())
        : false,
    });

    if (values.dateBirth) {
      const birthDate = new Date(values.dateBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      console.log("🔍 DEBUG RegisterForm - Final age validation:", {
        birthDate: birthDate,
        today: today,
        calculatedAge: age,
        isAdult: age >= 18,
        isValidAge: age >= 18 && age <= 80,
        minAge: 18,
        maxAge: 80,
      });
    }

    // Mapear todos los campos requeridos por la API
    const apiData = {
      username: values.username,
      firstName: values.firstName,
      lastName: values.lastName,
      maternalLastName: values.maternalLastName || "",
      email: values.email,
      password: values.password,
      phone: values.phone,
      dateBirth: values.dateBirth,
      gender: values.gender,
      receiveNewsletters: values.receiveNewsletters,
      acceptDataUsage: values.acceptDataUsage,
    };

    console.log("🔍 DEBUG RegisterForm - Datos mapeados para API:", apiData);
    console.log("🔍 DEBUG RegisterForm - API dateBirth field:", {
      value: apiData.dateBirth,
      type: typeof apiData.dateBirth,
      isValid: apiData.dateBirth ? !isNaN(new Date(apiData.dateBirth).getTime()) : false,
    });

    emit("submit", apiData);
  },
  (validationErrors) => {
    // Callback cuando hay errores de validación
    console.log(
      "🔍 DEBUG RegisterForm - Errores de validación al enviar:",
      validationErrors
    );
    console.log("🔍 DEBUG RegisterForm - Valores actuales del formulario:", values);

    // Debug específico para errores de fecha
    if (validationErrors.dateBirth) {
      console.log("🔍 DEBUG RegisterForm - Error en dateBirth:", {
        error: validationErrors.dateBirth,
        currentValue: values.dateBirth,
        vcalendarValue: vcalendarDateValue.value,
      });
    }
  }
);
</script>
