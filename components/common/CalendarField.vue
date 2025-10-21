<template>
  <div v-auto-animate="{ duration: 200, easing: 'ease-out' }" @click.stop>
    <div>
      <div class="flex items-center justify-between" @click="toggleOptions">
        <label class="text-sm block">{{ label }}</label>
      </div>

      <div
        class="space-y-0 overflow-hidden"
        v-auto-animate="{ duration: 200, easing: 'ease-out' }"
      >
        <!-- Trigger -->
        <div class="relative overflow-hidden mb-0">
          <Card
            class="h-10 cursor-pointer border-b-0 py-1 px-2.5 transition-all duration-100 ease-in-out"
            :class="[
              showCalendar
                ? 'rounded-t-[20px] rounded-b-none border-b-0'
                : 'rounded-full',
              hasValue ? 'bg-input-filled' : 'bg-input-empty',
            ]"
            @click="openCalendar"
          >
            <CardContent class="flex items-center justify-between py-1 px-2">
              <p
                :class="{
                  'text-base text-[#7D7D7D] font-medium': !hasValue,
                  'text-base text-[#3C3C3B] font-semibold': hasValue,
                }"
              >
                {{ hasValue ? selectedLabel : placeholder }}
              </p>
              <Icon
                v-if="showCalendar"
                icon="material-symbols:unfold-less"
                width="20"
                height="20"
                class="text-[#3C3C3B]"
              />
              <Icon
                v-else
                icon="material-symbols:unfold-more"
                width="20"
                height="20"
                class="text-[#3C3C3B]"
              />
            </CardContent>
          </Card>
        </div>

        <!-- Dropdown -->
        <div
          v-if="showOptions"
          class="space-y-0 overflow-y-hidden bg-input-empty rounded-t-0 rounded-b-[20px]"
          v-auto-animate="{ duration: 150, easing: 'ease-in-out' }"
        >
          <client-only v-if="showCalendar">
            <div
              class="bg-input-empty border border-t-0 border-b-0 p-3 w-full rounded-0"
              @click.stop
              @keydown.esc="close"
            >
              <!-- Header navegación -->
              <div class="flex justify-evenly gap-3 mb-0">
                <!-- Mes -->
                <div class="flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    @click.stop="goToPreviousMonth"
                    class="h-8 w-8 cursor-pointer"
                    :class="'hover:bg-[#003DA6] hover:rounded-full'"
                  >
                    <Icon
                      icon="ic:round-chevron-left"
                      width="2"
                      height="3"
                      class="mr-1"
                    />
                  </Button>

                  <div class="text-center">
                    <h3 class="text-xl font-semibold">{{ currentMonth }}</h3>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    @click.stop="goToNextMonth"
                    class="h-8 w-8 cursor-pointer"
                    :class="'hover:bg-[#003DA6] hover:rounded-full'"
                  >
                    <Icon
                      icon="ic:round-chevron-right"
                      width="2"
                      height="3"
                      class="ml-1"
                    />
                  </Button>
                </div>
                <!-- Año -->
                <div class="flex items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    @click.stop="goToPreviousYear"
                    class="h-8 w-8 cursor-pointer"
                    :class="'hover:bg-[#003DA6] hover:rounded-full'"
                  >
                    <Icon
                      icon="ic:round-chevron-left"
                      width="2"
                      height="3"
                      class="mr-1"
                    />
                  </Button>

                  <div class="text-center">
                    <h3 class="text-xl font-semibold">{{ currentYear }}</h3>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    @click.stop="goToNextYear"
                    class="h-8 w-8 cursor-pointer"
                    :class="'hover:bg-[#003DA6] hover:rounded-full'"
                  >
                    <Icon
                      icon="ic:round-chevron-right"
                      width="2"
                      height="3"
                      class="ml-1"
                    />
                  </Button>
                </div>
              </div>

              <div @click.stop>
                <Calendar
                  v-model="internalDate"
                  :weekday-format="'short'"
                  :locale="locale"
                  :class="['rounded-md w-full']"
                  :week-day-color="disableColors ? '#70BF73' : '#E2E2E2FF'"
                  v-bind="calendarBoundaries"
                  @update:model-value="onPick"
                />
                <!-- Descripcion de disponibilidad -->
                <template v-if="disableColors">
                  <hr class="w-11/12 border-t-2 border-[#B3B3B3] mx-auto my-7" />
                  <div
                    class="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-3 items-center justify-center mb-5 px-2"
                  >
                    <div
                      class="flex items-center justify-evenly md:justify-center-safe gap-x-5"
                    >
                      <div
                        class="size-4 bg-[#70BF73] border border-[#1D1D1D] rounded-full"
                      ></div>
                      <div class="text-base font-medium">Disponibilidad Alta</div>
                    </div>
                    <div
                      class="flex items-center justify-evenly md:justify-center-safe gap-x-5"
                    >
                      <div
                        class="size-4 bg-[#F9D133] border border-[#1D1D1D] rounded-full"
                      ></div>
                      <div class="text-base font-medium">Disponibilidad Media</div>
                    </div>
                    <div
                      class="flex items-center justify-evenly md:justify-center-safe gap-x-5"
                    >
                      <div
                        class="size-4 bg-[#EFA35B] border border-[#1D1D1D] rounded-full"
                      ></div>
                      <div class="text-base font-medium">Disponibilidad Baja</div>
                    </div>
                    <div
                      class="flex items-center justify-evenly md:justify-center-safe gap-x-5"
                    >
                      <div
                        class="size-4 bg-[#B3B3B3] border border-[#1D1D1D] rounded-full"
                      ></div>
                      <div class="text-base font-medium">Día No disponible</div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </client-only>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/vue";
import { vAutoAnimate } from "@formkit/auto-animate/vue";
import { CalendarDate } from "@internationalized/date";

interface Props {
  modelValue?: Date | string | null;
  label: string;
  placeholder?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  /** Locale para el formateo del label mostrado */
  locale?: string;
  /** Opciones de Intl.DateTimeFormat para el label */
  formatOptions?: Intl.DateTimeFormatOptions;
  /** Días de la semana a deshabilitar (0=Domingo, 1=Lunes, ..., 6=Sábado) */
  disabledWeekdays?: number[];
  /** Fechas específicas a deshabilitar */
  disabledDates?: Date[];
  /** Función personalizada para determinar si una fecha debe estar deshabilitada */
  isDateDisabled?: (date: Date) => boolean;
  /** Desactivar colores de días y textos de disponibilidad */
  disableColors?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Selecciona una fecha",
  required: false,
  locale: "es-MX",
  formatOptions: () => ({
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }),
  disabledWeekdays: () => [],
  disabledDates: () => [],
  disableColors: true,
});

const emit = defineEmits<{ "update:modelValue": [value: Date | null] }>();

const showCalendar = ref(false);
const showOptions = ref(false);

// Helpers de conversión
const toCalendarDate = (d: Date): CalendarDate =>
  new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate());
const toDate = (cd: CalendarDate): Date => new Date(cd.year, cd.month - 1, cd.day);

// Función para verificar si una fecha debe estar deshabilitada
const isDateDisabled = (date: CalendarDate): boolean => {
  const jsDate = toDate(date);

  // Verificar función personalizada
  if (props.isDateDisabled) {
    return props.isDateDisabled(jsDate);
  }

  // Verificar días de la semana deshabilitados
  if (props.disabledWeekdays && props.disabledWeekdays.length > 0) {
    const dayOfWeek = jsDate.getDay();
    if (props.disabledWeekdays.includes(dayOfWeek)) {
      return true;
    }
  }

  // Verificar fechas específicas deshabilitadas
  if (props.disabledDates && props.disabledDates.length > 0) {
    const dateString = jsDate.toDateString();
    const isDisabled = props.disabledDates.some(
      (disabledDate: Date) => disabledDate.toDateString() === dateString
    );
    if (isDisabled) {
      return true;
    }
  }

  return false;
};

// Estado interno del calendario (CalendarDate)
const internalDate = ref<CalendarDate | null>(toCalendarDate(new Date()));

// Sincronizar modelValue -> internalDate
watch(
  () => props.modelValue,
  (val: Date | string | null | undefined) => {
    if (!val) {
      // Si no hay valor, mantener la fecha actual para navegación interna
      // pero solo si internalDate no está ya establecido
      if (!internalDate.value) {
        const today = new Date();
        internalDate.value = toCalendarDate(today);
      }
      // NO emitir la fecha de hoy para que el componente padre no reciba un valor por defecto
      return;
    }
    const d = typeof val === "string" ? new Date(val) : new Date(val);
    if (!isNaN(d.getTime())) internalDate.value = toCalendarDate(d);
  },
  { immediate: true }
);

// Label mostrado
const hasValue = computed(() => !!props.modelValue);
const selectedLabel = computed(() => {
  const value = props.modelValue;
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : new Date(value);
  return new Intl.DateTimeFormat(props.locale, props.formatOptions).format(d);
});

// Boundaries
const minValue = computed(() =>
  props.minDate ? toCalendarDate(props.minDate) : undefined
);
const maxValue = computed(() =>
  props.maxDate ? toCalendarDate(props.maxDate) : undefined
);

const calendarBoundaries = computed(() => ({
  ...(minValue.value && { "min-value": minValue.value }),
  ...(maxValue.value && { "max-value": maxValue.value }),
  "is-date-unavailable": isDateDisabled,
}));

// Mes/año actuales (desde internalDate)
const currentYear = computed(() => {
  if (!internalDate.value) return String(new Date().getFullYear());
  return String(internalDate.value.year);
});

const currentMonth = computed(() => {
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  if (!internalDate.value) return months[new Date().getMonth()];
  return months[internalDate.value.month - 1];
});

// Navegación
const daysIn = (y: number, m: number) => new Date(y, m, 0).getDate();
const setCalendar = (y: number, m: number, d: number) =>
  (internalDate.value = new CalendarDate(y, m, Math.min(d, daysIn(y, m))));

const goToPreviousMonth = () => {
  if (!internalDate.value) return;
  let m = internalDate.value.month - 1;
  let y = internalDate.value.year;
  if (m < 1) {
    m = 12;
    y--;
  }
  setCalendar(y, m, internalDate.value.day);
};

const goToNextMonth = () => {
  if (!internalDate.value) return;
  let m = internalDate.value.month + 1;
  let y = internalDate.value.year;
  if (m > 12) {
    m = 1;
    y++;
  }
  setCalendar(y, m, internalDate.value.day);
};

const goToPreviousYear = () => {
  if (!internalDate.value) return;
  const y = internalDate.value.year - 1;
  setCalendar(y, internalDate.value.month, internalDate.value.day);
};

const goToNextYear = () => {
  if (!internalDate.value) return;
  const y = internalDate.value.year + 1;
  setCalendar(y, internalDate.value.month, internalDate.value.day);
};

// Pick handler
const onPick = (cd: any) => {
  if (!cd) return;
  internalDate.value = cd;
  emit("update:modelValue", toDate(cd));
  close();
};

// UI open/close
const toggleOptions = () => {
  showOptions.value = !showOptions.value;
  if (!showOptions.value) showCalendar.value = false;
};
const openCalendar = () => {
  showCalendar.value = !showCalendar.value;
  if (showCalendar.value) showOptions.value = true;
};
const close = () => {
  showCalendar.value = false;
  showOptions.value = false;
};
</script>

<style scoped></style>
