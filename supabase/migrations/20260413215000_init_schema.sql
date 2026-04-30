-- ============================================================
-- CORAZÓNCÓDIGO — SUPABASE SCHEMA v3.0
-- NUEVAS TABLAS: templates, orders, affiliates, referrals, newsletter_subscribers
-- Ejecutar en Supabase > SQL Editor
-- ============================================================

-- ============================================================
-- TABLA: templates (catálogo de experiencias base)
-- ============================================================
CREATE TABLE IF NOT EXISTS templates (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug        TEXT UNIQUE NOT NULL,
    name        TEXT NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLA: orders (Ventas y Personalización)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name   TEXT,
    target_name     TEXT,
    plan_name       TEXT,
    price           DECIMAL DEFAULT 0.00,
    template_id     UUID REFERENCES templates(id) ON DELETE SET NULL,
    template_name   TEXT,
    custom_date     TEXT,
    custom_message  TEXT,
    photo_urls      TEXT[],
    music_url       TEXT,
    music_start     INTEGER DEFAULT 0,
    music_duration  INTEGER DEFAULT 30,
    dynamic_texts   JSONB,
    status          TEXT DEFAULT 'pending', -- 'pending', 'paid', 'cancelled'
    final_link      TEXT,    -- Link de la experiencia ya personalizada
    zip_url         TEXT,    -- URL del zip para el plan $7 (código fuente)
    music_slice     JSONB,   -- { start: X, duration: Y } formato alternativo
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Agregar columnas si ya existe la tabla (re-ejecutable sin errores)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS final_link   TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS zip_url      TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS music_slice  JSONB;

-- ============================================================
-- TABLA: affiliates (miembros de la Membresía Hub)
-- ============================================================
CREATE TABLE IF NOT EXISTS affiliates (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
    ref_code        TEXT UNIQUE NOT NULL,
    customer_name   TEXT,
    total_referrals INTEGER DEFAULT 0,
    total_earned    DECIMAL DEFAULT 0.00,
    status          TEXT DEFAULT 'active',  -- 'active', 'suspended'
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLA: referrals (ventas generadas por afiliados)
-- ============================================================
CREATE TABLE IF NOT EXISTS referrals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id    UUID REFERENCES affiliates(id) ON DELETE CASCADE,
    order_id        UUID REFERENCES orders(id) ON DELETE SET NULL,
    ref_code        TEXT NOT NULL,
    commission_usd  DECIMAL DEFAULT 0.00,
    status          TEXT DEFAULT 'pending',  -- 'pending', 'paid', 'cancelled'
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- TABLA: newsletter_subscribers (suscriptores del footer)
-- ============================================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           TEXT UNIQUE NOT NULL,
    subscribed_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active          BOOLEAN DEFAULT true
);

-- ============================================================
-- RLS — ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE templates              ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliates             ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals              ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- templates: cualquiera puede leer (para cargar el catálogo), solo admin edita
CREATE POLICY "templates_select_public" ON templates FOR SELECT TO anon USING (true);

-- orders: cualquiera puede insertar (comprar), lectura directa solo admin.
-- El tracking público debe hacerse por RPC controlada.
CREATE POLICY "orders_insert_public" ON orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "orders_select_admin" ON orders FOR SELECT TO authenticated USING (true);

-- affiliates: solo admin puede leer/modificar
CREATE POLICY "affiliates_select_admin"
ON affiliates FOR SELECT TO authenticated USING (true);

CREATE POLICY "affiliates_insert_public"
ON affiliates FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "affiliates_update_admin"
ON affiliates FOR UPDATE TO authenticated USING (true);

-- referrals: solo admin puede leer/modificar
CREATE POLICY "referrals_select_admin"
ON referrals FOR SELECT TO authenticated USING (true);

CREATE POLICY "referrals_insert_public"
ON referrals FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "referrals_update_admin"
ON referrals FOR UPDATE TO authenticated USING (true);

-- ⚠️ Para que el anon pueda ver su propio dash de afiliado:
-- Se necesita la función renderAffiliateDashboard que hace query
-- desde el cliente. Por eso también habilitamos SELECT anon aquí:
CREATE POLICY "affiliates_select_by_order"
ON affiliates FOR SELECT TO anon
USING (true);  -- En producción avanzada: filtrar por JWT o por token en header

CREATE POLICY "referrals_select_by_affiliate"
ON referrals FOR SELECT TO anon
USING (true);

-- newsletter: cualquiera puede suscribirse, solo admin lee
CREATE POLICY "newsletter_insert_public"
ON newsletter_subscribers FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "newsletter_select_admin"
ON newsletter_subscribers FOR SELECT TO authenticated USING (true);

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_affiliates_ref_code  ON affiliates(ref_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_order_id  ON affiliates(order_id);
CREATE INDEX IF NOT EXISTS idx_referrals_affiliate  ON referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referrals_ref_code   ON referrals(ref_code);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at     ON orders(created_at);

-- ============================================================
-- FUNCIÓN: get_paid_orders_count (para el stats counter)
-- ============================================================
CREATE OR REPLACE FUNCTION get_paid_orders_count()
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER FROM orders WHERE status = 'paid';
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================
-- VISTA: affiliate_summary (para el panel admin)
-- ============================================================
CREATE OR REPLACE VIEW affiliate_summary AS
SELECT
    a.id,
    a.ref_code,
    a.customer_name,
    a.total_referrals,
    a.total_earned,
    a.status,
    a.created_at,
    COUNT(r.id) AS confirmed_referrals,
    COALESCE(SUM(CASE WHEN r.status = 'pending' THEN r.commission_usd ELSE 0 END), 0) AS pending_payout,
    COALESCE(SUM(CASE WHEN r.status = 'paid'    THEN r.commission_usd ELSE 0 END), 0) AS paid_payout
FROM affiliates a
LEFT JOIN referrals r ON r.affiliate_id = a.id
GROUP BY a.id;

-- ============================================================
-- TABLA: order_events (auditoría operativa de órdenes)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_events (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id      UUID REFERENCES orders(id) ON DELETE CASCADE,
    event_type    TEXT NOT NULL,
    event_payload JSONB DEFAULT '{}'::jsonb,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE order_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_events_insert_public" ON order_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "order_events_select_admin"  ON order_events FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON order_events(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_created_at ON order_events(created_at DESC);

-- ============================================================
-- TABLA: frontend_errors (telemetría de errores cliente)
-- ============================================================
CREATE TABLE IF NOT EXISTS frontend_errors (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    error_type TEXT NOT NULL,
    message    TEXT NOT NULL,
    context    JSONB DEFAULT '{}'::jsonb,
    page_url   TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE frontend_errors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "frontend_errors_insert_public" ON frontend_errors FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "frontend_errors_select_admin"  ON frontend_errors FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_frontend_errors_created_at ON frontend_errors(created_at DESC);

-- ============================================================
-- FUNCIÓN SEGURA: canje de código promo (atómica)
-- ============================================================
CREATE OR REPLACE FUNCTION redeem_promo_code(p_code TEXT, p_order_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated INTEGER;
BEGIN
    UPDATE promo_codes
    SET is_used = true, used_by = p_order_id
    WHERE code = upper(trim(p_code)) AND is_used = false;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated = 1;
END;
$$;

GRANT EXECUTE ON FUNCTION redeem_promo_code(TEXT, UUID) TO anon;
GRANT EXECUTE ON FUNCTION redeem_promo_code(TEXT, UUID) TO authenticated;
