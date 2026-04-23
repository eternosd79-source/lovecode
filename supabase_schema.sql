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

-- orders: cualquiera puede insertar (comprar), pero solo leen mediante RPC para evitar extracción masiva
CREATE POLICY "orders_insert_public" ON orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "orders_select_admin" ON orders FOR SELECT TO authenticated USING (true);

-- Función segura para obtener una orden por ID sin exponer toda la tabla
CREATE OR REPLACE FUNCTION get_order_by_id(p_id UUID)
RETURNS SETOF orders
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT * FROM orders WHERE id = p_id;
$$;

-- Función segura para obtener el contador de órdenes pagadas sin exponer datos
CREATE OR REPLACE FUNCTION get_total_paid_orders()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT count(*)::integer FROM orders WHERE status = 'paid';
$$;

-- Función para buscar órdenes por el ID corto o largo ignorando mayúsculas y el '#' (usado por tracking.js)
CREATE OR REPLACE FUNCTION search_order_by_id(search_term TEXT)
RETURNS SETOF orders AS $$
BEGIN
    -- Limpiar el término de búsqueda quitando '#' y espacios, pasándolo a minúsculas
    search_term := lower(trim(both ' ' from replace(search_term, '#', '')));
    
    RETURN QUERY
    SELECT * FROM orders
    WHERE id::text ILIKE search_term || '%'
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION search_order_by_id(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION search_order_by_id(TEXT) TO authenticated;
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
-- TABLA: free_tier_ips (Control de abusos del plan gratuito)
-- ============================================================
CREATE TABLE IF NOT EXISTS free_tier_ips (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address  TEXT UNIQUE NOT NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE free_tier_ips ENABLE ROW LEVEL SECURITY;
-- Permitir inserción anónima para registrar la IP
CREATE POLICY "free_tier_ips_insert" ON free_tier_ips FOR INSERT TO anon WITH CHECK (true);
-- Permitir lectura anónima para que puedan verificar si su IP ya existe
CREATE POLICY "free_tier_ips_select" ON free_tier_ips FOR SELECT TO anon USING (true);

-- ============================================================
-- TABLA: promo_codes (Códigos Promocionales Físicos/Digitales)
-- ============================================================
CREATE TABLE IF NOT EXISTS promo_codes (
    code        TEXT PRIMARY KEY,
    origin      TEXT NOT NULL DEFAULT 'admin', -- 'dennis', 'delifrozen', etc.
    template_id TEXT, -- ID de la plantilla para la que es válido (opcional o obligatorio según el admin)
    plan_name   TEXT, -- Plan asignado (Básico, Personalizado, Ultra)
    is_used     BOOLEAN DEFAULT false,
    used_by     UUID REFERENCES orders(id),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
-- Cualquiera puede leer códigos para verificar si existen y no han sido usados
CREATE POLICY "promo_codes_select" ON promo_codes FOR SELECT TO anon USING (true);
CREATE POLICY "promo_codes_select_auth" ON promo_codes FOR SELECT TO authenticated USING (true);
-- Cualquiera puede usar un código (marcarlo como usado) al crear una orden
CREATE POLICY "promo_codes_update_anon" ON promo_codes FOR UPDATE TO anon USING (true);
-- Solo admin puede insertar
CREATE POLICY "promo_codes_insert" ON promo_codes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "promo_codes_update" ON promo_codes FOR UPDATE TO authenticated USING (true);

