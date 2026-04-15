-- Función para buscar órdenes por el ID corto o largo ignorando mayúsculas y el '#'
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

-- Dar permisos públicos para que clienets 'anon' puedan usar el rastreo
GRANT EXECUTE ON FUNCTION search_order_by_id(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION search_order_by_id(TEXT) TO authenticated;
