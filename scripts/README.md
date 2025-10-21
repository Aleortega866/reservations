# Scripts de Generate con Captura de Errores

Este directorio contiene scripts mejorados para ejecutar el comando `npm run generate` con captura automática de errores.

## Scripts Disponibles

### 1. `generate-safe.js` (Recomendado)
**Comando:** `npm run generate:safe`

- ✅ Ejecuta el generate normal
- ✅ Captura automáticamente todos los errores
- ✅ Crea un archivo de log con los errores en `logs/generate-errors-[timestamp].log`
- ✅ No interrumpe el flujo normal del generate
- ✅ Siempre completa el proceso, incluso si hay errores

### 2. `generate-with-error-log.js`
**Comando:** `npm run generate:with-log`

- ✅ Ejecuta el generate normal
- ✅ Captura automáticamente todos los errores
- ✅ Crea un archivo de log con los errores en `logs/generate-errors-[timestamp].log`
- ⚠️ Falla si detecta errores (interrumpe el proceso)

## Uso

### Opción 1: Usar el script seguro (Recomendado)
```bash
npm run generate:safe
```

### Opción 2: Usar el script con interrupción en errores
```bash
npm run generate:with-log
```

### Opción 3: Usar el generate original
```bash
npm run generate
```

## Archivos de Log

Los archivos de error se guardan en el directorio `logs/` con el formato:
- `generate-errors-YYYY-MM-DDTHH-MM-SS.log`

### Contenido del Log
Cada archivo de log contiene:
- Timestamp del error
- Comando ejecutado
- Directorio de trabajo
- Código de salida
- Versión de Node.js
- Output completo de errores (stdout y stderr)

## Ejemplo de Uso

```bash
# Ejecutar generate con captura de errores
npm run generate:safe

# Si hay errores, verás algo como:
# 📝 Log de errores guardado en: logs/generate-errors-2024-01-15T10-30-45.log
```

## Ventajas

1. **No pierdes errores**: Todos los errores se guardan automáticamente
2. **Fácil debugging**: Los logs incluyen contexto completo
3. **No interrumpe el flujo**: El generate se completa normalmente
4. **Historial**: Mantienes un historial de errores con timestamps
5. **Compatible**: Funciona con tu flujo actual de generate

## Estructura de Archivos

```
scripts/
├── generate-safe.js          # Script seguro (recomendado)
├── generate-with-error-log.js # Script con interrupción en errores
└── README.md                 # Esta documentación

logs/
└── generate-errors-*.log     # Archivos de log de errores
```
