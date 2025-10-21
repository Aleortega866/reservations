/**
 * Composable para manejar eventos de guardado de pasos
 * Permite notificar cuando un paso se guarda exitosamente
 */

import { useSafeEvents } from "@/composables/ui/useSafeEvents";

export function useStepSaveEvents() {
  const { emitStepSavedEvent, emitStepLoadEvent } = useSafeEvents();
  /**
   * Emite un evento cuando un paso se guarda exitosamente
   * 
   * @param step - Número del paso (1, 2, o 3)
   * @param attendeeType - Tipo de asistente
   * @param reservationId - ID de la reservación
   * @param data - Datos del paso guardado
   */
  const emitStepSaved = (step: number, attendeeType: string, reservationId: number, data: any) => {
    const success = emitStepSavedEvent(step, attendeeType, reservationId, data);
    
    if (success) {
      console.log(`🎉 Evento de guardado emitido para paso ${step} (${attendeeType}):`, {
        step,
        attendeeType,
        reservationId,
        data,
        timestamp: new Date().toISOString()
      });
    } else {
      console.warn(`⚠️ No se pudo emitir evento de guardado para paso ${step} (${attendeeType})`);
    }
  };

  /**
   * Emite evento de guardado exitoso para paso 1
   */
  const emitStep1Saved = (attendeeType: string, reservationId: number, data: any) => {
    emitStepSaved(1, attendeeType, reservationId, data);
  };

  /**
   * Emite evento de guardado exitoso para paso 2
   */
  const emitStep2Saved = (attendeeType: string, reservationId: number, data: any) => {
    emitStepSaved(2, attendeeType, reservationId, data);
  };

  /**
   * Emite evento de guardado exitoso para paso 3
   */
  const emitStep3Saved = (attendeeType: string, reservationId: number, data: any) => {
    emitStepSaved(3, attendeeType, reservationId, data);
  };

  /**
   * Emite evento para cargar datos de un paso específico
   * 
   * @param step - Número del paso a cargar
   * @param attendeeType - Tipo de asistente
   * @param reservationId - ID de la reservación
   */
  const emitStepLoad = (step: number, attendeeType: string, reservationId: number) => {
    const success = emitStepLoadEvent(step, attendeeType, reservationId);
    
    if (success) {
      console.log(`🔄 Evento de carga emitido para paso ${step} (${attendeeType}):`, {
        step,
        attendeeType,
        reservationId,
        timestamp: new Date().toISOString()
      });
    } else {
      console.warn(`⚠️ No se pudo emitir evento de carga para paso ${step} (${attendeeType})`);
    }
  };

  /**
   * Emite evento para cargar datos del paso 2
   */
  const emitStep2Load = (attendeeType: string, reservationId: number) => {
    emitStepLoad(2, attendeeType, reservationId);
  };

  /**
   * Emite evento para cargar datos del paso 3
   */
  const emitStep3Load = (attendeeType: string, reservationId: number) => {
    emitStepLoad(3, attendeeType, reservationId);
  };

  return {
    emitStepSaved,
    emitStep1Saved,
    emitStep2Saved,
    emitStep3Saved,
    emitStepLoad,
    emitStep2Load,
    emitStep3Load
  };
}
