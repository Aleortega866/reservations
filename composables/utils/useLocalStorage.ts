import { ref, watch, type Ref } from 'vue'

/**
 * Composable para manejo seguro de localStorage en Nuxt
 * Maneja la hidratación del servidor y cliente de forma transparente
 */
export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  // Estado reactivo que se inicializa con el valor por defecto
  const storedValue = ref<T>(defaultValue)

  // Función para obtener valor del localStorage de forma segura
  const getStoredValue = (): T => {
    if (process.client) {
      try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : defaultValue
      } catch (error) {
        console.warn(`Error al leer localStorage para la clave "${key}":`, error)
        return defaultValue
      }
    }
    return defaultValue
  }

  // Función para guardar valor en localStorage de forma segura
  const setStoredValue = (value: T): void => {
    if (process.client) {
      try {
        localStorage.setItem(key, JSON.stringify(value))
      } catch (error) {
        console.warn(`Error al guardar en localStorage para la clave "${key}":`, error)
      }
    }
  }

  // Inicializar el valor desde localStorage en el cliente
  if (process.client) {
    storedValue.value = getStoredValue()
  }

  // Watcher para guardar automáticamente cuando cambie el valor
  watch(
    storedValue,
    (newValue) => {
      setStoredValue(newValue)
    },
    { deep: true }
  )

  return storedValue as Ref<T>
}

/**
 * Función para limpiar una clave específica del localStorage
 */
export function clearLocalStorage(key: string): void {
  if (process.client) {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn(`Error al limpiar localStorage para la clave "${key}":`, error)
    }
  }
}

/**
 * Función para verificar si una clave existe en localStorage
 */
export function hasLocalStorageKey(key: string): boolean {
  if (process.client) {
    try {
      return localStorage.getItem(key) !== null
    } catch (error) {
      console.warn(`Error al verificar localStorage para la clave "${key}":`, error)
      return false
    }
  }
  return false
}
