<template>
  <!-- INICIA DROPDOWNCONTENT -->
  <div
    :id="idComponent"
    class="space-y-0 mt-1 overflow-hidden"
    :class="showOptions ? 'rounded-t-[20px]' : 'rounded-[20px]'"
  >
    <!-- TITULO (OPCIONAL) -->
    <div
      class="flex items-center justify-between cursor-pointer"
      @click="toggleOptionsToParent"
    >
      <p :class="[...(dropdowntitleclass ?? [])]">
        <slot name="dropdowntitle" />
      </p>
    </div>

    <!-- PLACEHOLDER -->
    <div class="relative overflow-hidden">
      <Card
        class="bg-transparent cursor-pointer hover:bg-white/20 transition-colors px-2 py-2 border-0"
        @click="toggleOptionsToParent"
        :class="[
          showOptions ? 'rounded-t-[20px] rounded-b-none' : 'rounded-[20px]',
          ...(dropdownplaceholderclass ?? []),
        ]"
      >
        <CardContent class="grid grid-cols-1 items-center justify-between py-1 px-2">
          <div class="flex items-center justify-between">
            <!-- TITULO DROPDOWN -->
            <slot name="dropdownplaceholder" />
            
            <!-- OPCIONES LADO DERECHO -->
            <div class="flex items-center space-x-2.5">
              <!-- ICONOS CHEVRON ABRIR/CERRAR -->
              <div>
                <Icon
                  v-if="showOptions"
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
              </div>
            
              <!-- DROPDOWN COUNTER -->
              <div
                v-if="typeof dropdowncounter === 'number'"
                :class="dropdowncounterstyle"
                class="w-10 h-10 flex items-center justify-center rounded-full text-lg text-[#3C3C3B] font-semibold"
              >
                <span class="truncate px-1.5">{{ dropdowncounter }}</span>
              </div>
            </div>
          </div>
          
          <!-- CONTENIDO BAJO TITULO (OPCIONAL DROPDOWN PLACEHOLDER CONTENT) -->
          <div v-if="typeof dropdownplaceholdercontentcounter === 'number'" class="w-full flex items-center justify-between space-x-2.5 mt-2">
            <span class="text-base text-[#3C3C3B] font-medium">Exhibiciones vinculadas</span>
            <div class="flex-grow border-t-2 border-dashed border-[#7D7D7D] mx-4"></div>
            <div
              :class="dropdownplaceholdercontentcounterstyle"
              class="w-10 h-10 flex items-center justify-center rounded-full text-lg text-[#3C3C3B] font-semibold"
            >
              <span class="truncate px-1.5">{{ dropdownplaceholdercontentcounter }}</span>
            </div>
          </div>
          
        </CardContent>
      </Card>
    </div>

    <!-- CONTENIDO -->
    <!--  AQUÍ es donde cambian los hijos (content/errors). Ponemos v-auto-animate en este wrapper -->
    <div v-auto-animate="{ duration: 200, easing: 'ease-out' }" class="overflow-hidden rounded-b-[20px]">
      <div
        v-show="showOptions"
        :key="idComponent + '-content'"
        :class="[...(dropdowncontentclass ?? [])]"
      >
        <slot name="dropdowncontent" />
      </div>

      <!-- ERRORES -->
      <p
        v-show="showOptions && showErrors"
        :key="idComponent + '-errors'"
        :class="[...(dropdownerrorsclass ?? [])]"
      >
        <slot name="dropdownerrors" />
      </p>
    </div>
  </div>
  <!-- TERMINA DROPDOWNCONTENT -->
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import { Card, CardContent } from "@/components/ui/card";
import { useVueCompositionAPIHelpers } from "@/composables/utils/useVueCompositionAPIHelpers";

const { generateComponentId } = useVueCompositionAPIHelpers();

withDefaults(
  defineProps<{
    showOptions: boolean;
    dropdowntitleclass?: string[];
    dropdownplaceholderclass?: string[];
    showErrors?: boolean; // ← opcional para evitar warning
    dropdownerrorsclass?: string[];
    dropdowncontentclass?: string[];
    dropdowncounter?: Number | null;
    dropdownplaceholdercontentcounter?: Number | null;
    dropdowncounterstyle?: string;
    dropdownplaceholdercontentcounterstyle?: string;
  }>(),
  {
    dropdowncounterstyle: "bg-white border-2 border-[#003DA6]",
    dropdownplaceholdercontentcounterstyle: "bg-white border-2 border-[#FFD040]",
    showErrors: false,
  }
);

const idComponent = ref<string>("");

const emit = defineEmits<{
  (e: "toggleOptionsFromChild"): void;
}>();

const toggleOptionsToParent = () => emit("toggleOptionsFromChild");

onMounted(() => {
  idComponent.value = generateComponentId();
});
</script>
