import { useId } from 'vue';

export function useVueCompositionAPIHelpers() {
   
    /**
     * Genera un identificador único para un componente utilizando el composable de Vue 3.5+ useId, opcionalmente con un prefix.
     *
     * @function generateComponentId
     * @param {Object} [options={}] - Opciones para generar el ID.
     * @param {string} [options.prefix=''] - Prefijo opcional que se antepone al ID generado.
     * @returns {string} ID único generado para el componente.
     *
     * @example
     * const id = generateComponentId({ prefix: 'componentName-' });
     * console.log(id); // componentName-v-2
     */
    const generateComponentId = ({ prefix = '' }: Record<any, string> = {}): string => `${prefix}${useId()}`

    return {
        generateComponentId
    }

}