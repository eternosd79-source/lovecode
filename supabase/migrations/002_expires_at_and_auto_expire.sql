-- ============================================================
-- CORAZÓNCÓDIGO — MIGRACIÓN 002: EXPIRACIÓN AUTOMÁTICA DE PLANES
-- Ejecutar en Supabase > SQL Editor (en orden)
-- ============================================================

-- 1. Agregar columna expires_at a la tabla orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- 2. Agregar columna para indicar si fue notificado de expiración
ALTER TABLE orders ADD COLUMN IF NOT EXISTS expired_notified BOOLEAN DEFAULT FALSE;

-- Índice para acelerar el cron job
CREATE INDEX IF NOT EXISTS idx_orders_expires_at ON orders(expires_at);

-- ============================================================
-- 3. FUNCIÓN: Calcular expires_at según el plan al momento de pagar
--    Duraciones oficiales:
--      Demo    ($0)    → 24 horas
--      Básico  ($3)    → 14 días (2 semanas)
--      Hub     ($4.50) → 75 días (2.5 meses)
--      Fotos   ($5)    → 75 días (2.5 meses)
--      Ultra   ($7)    → 180 días (6 meses)
-- ============================================================
CREATE OR REPLACE FUNCTION get_plan_duration_hours(plan_text TEXT)
RETURNS INTEGER AS $$
BEGIN
    IF plan_text ILIKE '%$0%' OR plan_text ILIKE '%Gratis%' OR plan_text ILIKE '%Demo%' THEN
        RETURN 24;           -- 24 horas
    ELSIF plan_text ILIKE '%$3%' OR plan_text ILIKE '%Básico%' OR plan_text ILIKE '%Basico%' THEN
        RETURN 336;          -- 14 días × 24h
    ELSIF plan_text ILIKE '%$4.50%' OR plan_text ILIKE '%Hub%' OR plan_text ILIKE '%Membresía%' THEN
        RETURN 1800;         -- 75 días × 24h
    ELSIF plan_text ILIKE '%$5%' OR plan_text ILIKE '%Personalizado%' OR plan_text ILIKE '%Fotografías%' THEN
        RETURN 1800;         -- 75 días × 24h
    ELSIF plan_text ILIKE '%$7%' OR plan_text ILIKE '%Ultra%' OR plan_text ILIKE '%Premium%' THEN
        RETURN 4320;         -- 180 días × 24h
    ELSE
        RETURN 336;          -- Default: 2 semanas
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================
-- 4. FUNCIÓN: Establecer expires_at automáticamente cuando 
--    el status cambia de 'pending' a 'paid'
-- ============================================================
CREATE OR REPLACE FUNCTION set_expires_at_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo actuar cuando el estado cambia a 'paid' y no tenía expires_at
    IF NEW.status = 'paid' AND (OLD.status IS DISTINCT FROM 'paid') THEN
        NEW.expires_at = NOW() + (get_plan_duration_hours(NEW.plan_name) * INTERVAL '1 hour');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger en la tabla orders
DROP TRIGGER IF EXISTS trg_set_expires_at ON orders;
CREATE TRIGGER trg_set_expires_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_expires_at_on_payment();

-- También al insertar (para el caso del plan $0 que no requiere pago manual)
CREATE OR REPLACE FUNCTION set_expires_at_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se inserta directamente como 'paid' (caso especial demo automático)
    IF NEW.status = 'paid' AND NEW.expires_at IS NULL THEN
        NEW.expires_at = NOW() + (get_plan_duration_hours(NEW.plan_name) * INTERVAL '1 hour');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_expires_at_insert ON orders;
CREATE TRIGGER trg_set_expires_at_insert
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION set_expires_at_on_insert();

-- ============================================================
-- 5. FUNCIÓN: Expirar órdenes vencidas (llamada por pg_cron)
--    Cambia status a 'expired' cuando expires_at < NOW()
-- ============================================================
CREATE OR REPLACE FUNCTION expire_old_orders()
RETURNS void AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE orders
    SET status = 'expired'
    WHERE status = 'paid'
      AND expires_at IS NOT NULL
      AND expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    IF expired_count > 0 THEN
        RAISE NOTICE 'CorazónCódigo: % orden(es) expirada(s) procesada(s)', expired_count;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 6. VISTA MEJORADA: orders_with_time_left (para el admin panel)
-- ============================================================
CREATE OR REPLACE VIEW orders_with_time_left AS
SELECT
    o.*,
    CASE
        WHEN o.status = 'expired' THEN '❌ Expirado'
        WHEN o.status = 'pending' THEN '⏳ Pendiente de Pago'
        WHEN o.status = 'paid' AND o.expires_at IS NULL THEN '✅ Activo (sin fecha)'
        WHEN o.status = 'paid' AND o.expires_at > NOW() THEN
            CASE
                WHEN o.expires_at - NOW() < INTERVAL '24 hours' THEN
                    '⚠️ Expira en ' || EXTRACT(HOUR FROM (o.expires_at - NOW()))::TEXT || 'h'
                ELSE
                    '✅ Activo — ' || EXTRACT(DAY FROM (o.expires_at - NOW()))::TEXT || ' días restantes'
            END
        WHEN o.status = 'paid' AND o.expires_at <= NOW() THEN '🔴 Vencido (sin procesar)'
        ELSE o.status
    END AS time_status,
    ROUND(EXTRACT(EPOCH FROM (o.expires_at - NOW())) / 3600) AS hours_remaining
FROM orders o;

-- ============================================================
-- 7. FUNCIÓN AUXILIAR: Obtener estado de expiración de una orden
--    (usada desde la web en tracking.js)
-- ============================================================
CREATE OR REPLACE FUNCTION get_order_status_info(order_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'id',             o.id,
        'status',         o.status,
        'plan_name',      o.plan_name,
        'expires_at',     o.expires_at,
        'hours_remaining', GREATEST(0, ROUND(EXTRACT(EPOCH FROM (o.expires_at - NOW())) / 3600)),
        'days_remaining',  GREATEST(0, ROUND(EXTRACT(EPOCH FROM (o.expires_at - NOW())) / 86400)),
        'is_expired',     (o.expires_at IS NOT NULL AND o.expires_at < NOW()),
        'time_label',     CASE
                            WHEN o.status = 'expired' THEN 'EXPIRADO'
                            WHEN o.status = 'pending' THEN 'PENDIENTE'
                            WHEN o.expires_at IS NULL THEN 'ACTIVO'
                            WHEN o.expires_at < NOW() THEN 'VENCIDO'
                            WHEN o.expires_at - NOW() < INTERVAL '24 hours' THEN
                                EXTRACT(HOUR FROM (o.expires_at - NOW()))::TEXT || ' horas restantes'
                            ELSE
                                CEIL(EXTRACT(EPOCH FROM (o.expires_at - NOW())) / 86400)::TEXT || ' días restantes'
                          END,
        'template_name',  o.template_name,
        'final_link',     o.final_link,
        'zip_url',        o.zip_url,
        'customer_name',  o.customer_name,
        'target_name',    o.target_name,
        'created_at',     o.created_at
    ) INTO result
    FROM orders o
    WHERE o.id = order_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 8. HABILITAR pg_cron (si no está habilitado)
--    NOTA: En el Dashboard de Supabase ir a:
--    Database > Extensions > Buscar "pg_cron" > Habilitar
-- ============================================================

-- Ejecutar expire_old_orders cada hora
-- IMPORTANTE: Esto SOLO funciona si pg_cron está habilitado en tu proyecto Supabase
SELECT cron.schedule(
    'expire-lovecode-orders',           -- nombre del job (único)
    '0 * * * *',                        -- cada hora en punto
    'SELECT expire_old_orders();'
);

-- Para verificar que el job fue creado:
-- SELECT * FROM cron.job;

-- ============================================================
-- 9. POLÍTICA RLS: Permitir que el trigger SECURITY DEFINER funcione
-- ============================================================
-- La función expire_old_orders() ya tiene SECURITY DEFINER,
-- lo que le permite saltarse el RLS para actualizaciones del cron.

-- Política adicional: admins autenticados pueden actualizar status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE tablename = 'orders' AND policyname = 'orders_update_authenticated'
    ) THEN
        CREATE POLICY "orders_update_authenticated"
        ON orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
    END IF;
END $$;

-- ============================================================
-- VERIFICACIÓN FINAL
-- ============================================================
-- Comprobar que todo quedó bien:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders' AND column_name IN ('expires_at', 'expired_notified');
-- SELECT * FROM cron.job WHERE jobname = 'expire-lovecode-orders';
-- SELECT get_plan_duration_hours('Básico ($3, 2 semanas)');  -- Debe retornar 336
-- SELECT get_plan_duration_hours('Ultra Premium ($7, 6 mes., Fotos/Música/Código)');  -- Debe retornar 4320
