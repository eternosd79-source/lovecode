-- ============================================================
-- CORAZÓNCÓDIGO / LOVECODE — CRON JOB (PASO SEPARADO)
-- ============================================================
-- ⚠️  REQUISITO PREVIO — Antes de ejecutar esto debes:
--
--   1. Ir a: Supabase Dashboard → Database → Extensions
--   2. Buscar "pg_cron" → activar el toggle ✅
--   3. Esperar 10 segundos hasta que aparezca "Enabled"
--   4. Recién entonces ejecutar este archivo en el SQL Editor
--
-- ✅ VERIFICAR que pg_cron está activo:
--    SELECT * FROM pg_extension WHERE extname = 'pg_cron';
--    (debe devolver 1 fila)
-- ============================================================

-- Eliminar el job si ya existía (para que sea re-ejecutable sin error)
SELECT cron.unschedule('expire-lovecode-orders')
WHERE EXISTS (
    SELECT 1 FROM cron.job WHERE jobname = 'expire-lovecode-orders'
);

-- Registrar el job: revisar expiración cada hora en punto
SELECT cron.schedule(
    'expire-lovecode-orders',      -- nombre único del job
    '0 * * * *',                   -- cada hora en punto (cron syntax)
    'SELECT expire_old_orders();'  -- llama a la función de la migración 002
);

-- ============================================================
-- ✅ VERIFICACIÓN — confirmar que fue creado correctamente:
-- ============================================================
SELECT
    jobid,
    jobname,
    schedule,
    command,
    active
FROM cron.job
WHERE jobname = 'expire-lovecode-orders';
