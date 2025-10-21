/**
 * Composable para manejar eventos de manera segura en Nuxt
 * Evita errores de SSR al verificar si window está disponible
 */

export function useSafeEvents() {
  /**
   * Verifica si estamos en el cliente (no en SSR)
   */
  const isClient = () => {
    return process.client && typeof window !== 'undefined';
  };

  /**
   * Emite un evento personalizado de manera segura
   * Solo se ejecuta en el cliente
   * 
   * @param eventName - Nombre del evento
   * @param detail - Datos del evento
   * @param options - Opciones adicionales del evento
   */
  const emitSafeEvent = (
    eventName: string, 
    detail?: any, 
    options?: EventInit
  ) => {
    if (!isClient()) {
      console.warn(`⚠️ Intento de emitir evento '${eventName}' en SSR - ignorado`);
      return false;
    }

    try {
      const event = new CustomEvent(eventName, {
        detail,
        ...options
      });
      
      window.dispatchEvent(event);
      console.log(`📡 Evento '${eventName}' emitido exitosamente:`, detail);
      return true;
    } catch (error) {
      console.error(`❌ Error al emitir evento '${eventName}':`, error);
      return false;
    }
  };

  /**
   * Agrega un listener de evento de manera segura
   * Solo se ejecuta en el cliente
   * 
   * @param eventName - Nombre del evento
   * @param handler - Función manejadora
   * @param options - Opciones del listener
   */
  const addSafeEventListener = (
    eventName: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ) => {
    if (!isClient()) {
      console.warn(`⚠️ Intento de agregar listener '${eventName}' en SSR - ignorado`);
      return false;
    }

    try {
      window.addEventListener(eventName, handler, options);
      console.log(`👂 Listener '${eventName}' agregado exitosamente`);
      return true;
    } catch (error) {
      console.error(`❌ Error al agregar listener '${eventName}':`, error);
      return false;
    }
  };

  /**
   * Remueve un listener de evento de manera segura
   * Solo se ejecuta en el cliente
   * 
   * @param eventName - Nombre del evento
   * @param handler - Función manejadora
   * @param options - Opciones del listener
   */
  const removeSafeEventListener = (
    eventName: string,
    handler: EventListener,
    options?: EventListenerOptions
  ) => {
    if (!isClient()) {
      console.warn(`⚠️ Intento de remover listener '${eventName}' en SSR - ignorado`);
      return false;
    }

    try {
      window.removeEventListener(eventName, handler, options);
      console.log(`🗑️ Listener '${eventName}' removido exitosamente`);
      return true;
    } catch (error) {
      console.error(`❌ Error al remover listener '${eventName}':`, error);
      return false;
    }
  };

  /**
   * Emite un evento de navegación de paso de manera segura
   * 
   * @param step - Número del paso
   * @param attendeeType - Tipo de asistente
   * @param reservationId - ID de la reservación
   */
  const emitStepNavigationEvent = (
    step: number,
    attendeeType: string,
    reservationId?: number
  ) => {
    return emitSafeEvent('reservation-step-navigated', {
      step,
      attendeeType,
      reservationId,
      timestamp: new Date().toISOString()
    });
  };

  /**
   * Emite un evento de ID de reservación establecido de manera segura
   * 
   * @param reservationId - ID de la reservación
   * @param attendeeType - Tipo de asistente
   */
  const emitReservationIdSetEvent = (
    reservationId: number,
    attendeeType: string
  ) => {
    return emitSafeEvent('reservation-id-set', {
      reservationId,
      attendeeType,
      timestamp: new Date().toISOString()
    });
  };

  /**
   * Emite un evento de guardado de paso de manera segura
   * 
   * @param step - Número del paso
   * @param attendeeType - Tipo de asistente
   * @param reservationId - ID de la reservación
   * @param data - Datos del paso
   */
  const emitStepSavedEvent = (
    step: number,
    attendeeType: string,
    reservationId: number,
    data: any
  ) => {
    const eventDetail = {
      step,
      attendeeType,
      reservationId,
      data,
      timestamp: new Date().toISOString()
    };

    // Emitir evento global
    const globalSuccess = emitSafeEvent('reservation-step-saved', eventDetail);
    
    // Emitir evento específico por tipo
    const specificSuccess = emitSafeEvent(`reservation-${attendeeType}-step-saved`, eventDetail);

    return globalSuccess && specificSuccess;
  };

  /**
   * Emite un evento para cargar datos de un paso específico
   * 
   * @param step - Número del paso a cargar
   * @param attendeeType - Tipo de asistente
   * @param reservationId - ID de la reservación
   */
  const emitStepLoadEvent = (
    step: number,
    attendeeType: string,
    reservationId: number
  ) => {
    const eventDetail = {
      step,
      attendeeType,
      reservationId,
      timestamp: new Date().toISOString()
    };

    // Emitir evento global
    const globalSuccess = emitSafeEvent('reservation-step-load', eventDetail);
    
    // Emitir evento específico por tipo
    const specificSuccess = emitSafeEvent(`reservation-${attendeeType}-step-load`, eventDetail);

    return globalSuccess && specificSuccess;
  };

  return {
    isClient,
    emitSafeEvent,
    addSafeEventListener,
    removeSafeEventListener,
    emitStepNavigationEvent,
    emitReservationIdSetEvent,
    emitStepSavedEvent,
    emitStepLoadEvent
  };
}
