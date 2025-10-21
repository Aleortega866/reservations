<template>
  <Field
    class="overflow-hidden"
    v-bind="$attrs"
    v-slot="{ field, errorMessage, handleChange, value }"
  >
    <slot
      :component-field="field"
      :error-message="errorMessage"
      :handle-change="handleChange"
      :value="value"
    />
  </Field>
</template>

<script setup>
import { Field } from "vee-validate";
</script>
