-- Habilitar permisos de eliminación y creación de órdenes para el Administrador
CREATE POLICY "orders_insert_admin" ON orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "orders_delete_admin" ON orders FOR DELETE TO authenticated USING (true);
