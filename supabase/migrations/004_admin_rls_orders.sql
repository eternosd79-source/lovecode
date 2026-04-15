-- Habilitar SELECT y UPDATE en orders para usuarios autenticados (Admin)
CREATE POLICY "orders_select_admin" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "orders_update_admin" ON orders FOR UPDATE TO authenticated USING (true);
