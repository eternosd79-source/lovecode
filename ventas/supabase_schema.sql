-- ============================================================
-- LOVECODE — SUPABASE SCHEMA v3.0
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
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- orders: cualquiera puede insertar (comprar) y leer la suya (trackear), admin controla
CREATE POLICY "orders_insert_public" ON orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "orders_select_public" ON orders FOR SELECT TO anon USING (true);

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
