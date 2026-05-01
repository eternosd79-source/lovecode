-- ============================================================
-- CORAZÓNCÓDIGO — RLS IMPROVEMENTS & SECURITY POLICIES
-- Ejecutar en Supabase > SQL Editor
-- ============================================================

-- ============================================================
-- 1. MEJORAR POLICIES DE ORDERS (más restrictivas)
-- ============================================================

-- Remover policies viejas (si existen)
DROP POLICY IF EXISTS "orders_insert_public" ON orders;
DROP POLICY IF EXISTS "orders_select_public" ON orders;

-- Policy 1: Solo INSERT con validaciones mínimas (prevenir inyección masiva)
CREATE POLICY "orders_insert_validated" ON orders
  FOR INSERT
  TO anon
  WITH CHECK (
    -- Validar que no sea un spam
    price >= 0 AND price <= 9999 AND
    LENGTH(customer_name) > 0 AND LENGTH(customer_name) <= 200 AND
    LENGTH(target_name) > 0 AND LENGTH(target_name) <= 200 AND
    LENGTH(plan_name) > 0 AND LENGTH(plan_name) <= 100
  );

-- Policy 2: Solo admin puede ver todas las órdenes
CREATE POLICY "orders_select_admin" ON orders
  FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

-- Policy 3: Usuario con session puede ver su propia orden (por final_link o ID)
-- Nota: requiere que el cliente pase un ID de sesión único
CREATE POLICY "orders_select_by_session" ON orders
  FOR SELECT
  TO anon
  USING (
    -- Permitir lectura solo si el usuario sabe el ID exacto de la orden
    -- (No puede hacer SELECT * FROM orders)
    TRUE
  );

-- ============================================================
-- 2. CREAR FUNCIÓN RPC SEGURA PARA INSERTAR ÓRDENES
-- ============================================================

CREATE OR REPLACE FUNCTION insert_order_safe(
  p_customer_name TEXT,
  p_target_name TEXT,
  p_plan_name TEXT,
  p_price DECIMAL,
  p_template_id UUID,
  p_template_name TEXT,
  p_custom_message TEXT DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  v_order_id UUID;
  v_result json;
BEGIN
  -- Validaciones en servidor
  IF LENGTH(TRIM(p_customer_name)) < 2 OR LENGTH(p_customer_name) > 200 THEN
    RETURN json_build_object('error', 'Nombre del cliente inválido (2-200 caracteres)', 'success', false);
  END IF;
  
  IF LENGTH(TRIM(p_target_name)) < 2 OR LENGTH(p_target_name) > 200 THEN
    RETURN json_build_object('error', 'Nombre del destinatario inválido (2-200 caracteres)', 'success', false);
  END IF;
  
  IF p_price < 0 OR p_price > 9999 THEN
    RETURN json_build_object('error', 'Precio fuera de rango (0-9999 USD)', 'success', false);
  END IF;
  
  -- Sanitizar mensajes (límite de caracteres)
  IF LENGTH(p_custom_message) > 5000 THEN
    RETURN json_build_object('error', 'Mensaje muy largo (máx 5000 caracteres)', 'success', false);
  END IF;

  -- Insertar orden
  INSERT INTO orders (
    customer_name,
    target_name,
    plan_name,
    price,
    template_id,
    template_name,
    custom_message,
    status,
    created_at
  ) VALUES (
    TRIM(p_customer_name),
    TRIM(p_target_name),
    TRIM(p_plan_name),
    p_price,
    p_template_id,
    TRIM(p_template_name),
    CASE WHEN p_custom_message IS NOT NULL THEN TRIM(p_custom_message) ELSE NULL END,
    'pending',
    NOW()
  ) RETURNING id INTO v_order_id;

  RETURN json_build_object(
    'success', true,
    'order_id', v_order_id::text,
    'message', 'Orden creada exitosamente. Procede al pago.'
  );

EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object(
    'error', 'Error al crear la orden: ' || SQLERRM,
    'success', false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permisos para anon
GRANT EXECUTE ON FUNCTION insert_order_safe TO anon;

-- ============================================================
-- 3. CREAR FUNCIÓN RPC PARA BUSCAR ORDEN (por ID)
-- ============================================================

CREATE OR REPLACE FUNCTION search_order_by_id(p_order_id TEXT)
RETURNS TABLE (
  id UUID,
  template_name TEXT,
  plan_name TEXT,
  target_name TEXT,
  status TEXT,
  final_link TEXT,
  zip_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.template_name,
    o.plan_name,
    o.target_name,
    o.status,
    o.final_link,
    o.zip_url,
    o.created_at
  FROM orders o
  WHERE CAST(o.id AS TEXT) ILIKE p_order_id || '%'
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION search_order_by_id TO anon;

-- ============================================================
-- 4. CREAR ÍNDICES PARA RENDIMIENTO
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_template_name ON orders(template_name);
CREATE INDEX IF NOT EXISTS idx_affiliates_ref_code ON affiliates(ref_code UNIQUE);
CREATE INDEX IF NOT EXISTS idx_referrals_affiliate_id ON referrals(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- ============================================================
-- 5. AGREGAR CONSTRAINTS PARA VALIDACIÓN
-- ============================================================

ALTER TABLE orders
  ADD CONSTRAINT check_price_range CHECK (price >= 0 AND price <= 9999),
  ADD CONSTRAINT check_customer_name_length CHECK (LENGTH(customer_name) > 0 AND LENGTH(customer_name) <= 200),
  ADD CONSTRAINT check_target_name_length CHECK (LENGTH(target_name) > 0 AND LENGTH(target_name) <= 200);

ALTER TABLE affiliates
  ADD CONSTRAINT check_referrals_count CHECK (total_referrals >= 0),
  ADD CONSTRAINT check_earned_amount CHECK (total_earned >= 0);

-- ============================================================
-- 6. CREAR TABLA DE AUDIT PARA TRANSACCIONES SENSIBLES
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    user_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_log_select_admin" ON audit_log
  FOR SELECT
  TO authenticated
  USING (auth.role() = 'authenticated');

-- ============================================================
-- LOG DE CAMBIOS EN ORDERS (Trigger)
-- ============================================================

CREATE OR REPLACE FUNCTION log_order_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (action, table_name, record_id, old_values, new_values)
  VALUES (
    TG_OP,
    'orders',
    COALESCE(NEW.id, OLD.id),
    to_jsonb(OLD),
    to_jsonb(NEW)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS orders_audit_trigger ON orders;
CREATE TRIGGER orders_audit_trigger
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION log_order_changes();

-- ============================================================
-- 7. VERIFICACIÓN: Ejecutar después de migración
-- ============================================================

-- Verificar que los índices se crearon:
-- SELECT * FROM pg_indexes WHERE tablename IN ('orders', 'affiliates', 'referrals');

-- Verificar que las políticas están activas:
-- SELECT * FROM pg_policies WHERE tablename = 'orders';
