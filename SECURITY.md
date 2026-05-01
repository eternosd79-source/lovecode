# 🔒 Seguridad & RLS — CorazónCódigo

## Resumen de Mejoras de Seguridad Implementadas

### ✅ Fase 1: Seguridad Crítica

#### 1. **Credenciales Centralizadas (env-config.js)**
- ✅ Movidas todas las credenciales Supabase a un único archivo
- ✅ Eliminada duplicación en: app.js, config.js, pasarela.js, cc-core.js
- ✅ Sistema de fallback para desarrollo
- ✅ Preparado para variables de entorno en producción

**Archivos modificados:**
- `/js/env-config.js` (NUEVO)
- `/js/config.js`
- `/js/pasarela.js`
- `/js/app.js`
- `/js/cc-core.js`
- `/.env.example` (NUEVO)

#### 2. **Sanitización XSS Global (sanitizer.js)**
- ✅ Sistema centralizado de escape HTML
- ✅ Validación de URLs
- ✅ Sanitización de datos JSON
- ✅ Creación segura de elementos DOM
- ✅ Funciones para email, teléfono, nombres

**Archivo nuevo:** `/js/sanitizer.js`

**Funciones disponibles en `window.Sanitizer`:**
```javascript
Sanitizer.html(text)           // Escape HTML entities
Sanitizer.url(url)              // Validar URL (http/https)
Sanitizer.data(obj)             // Sanitizar objeto JSON
Sanitizer.element(tag, text)    // Crear elemento DOM seguro
Sanitizer.name(name)            // Nombre (alfanumérico)
Sanitizer.email(email)          // Validar email
Sanitizer.phone(phone)          // Validar teléfono
```

#### 3. **RLS Policies Mejoradas (Base de Datos)**
- ✅ Función RPC `insert_order_safe()` con validaciones en servidor
- ✅ Función RPC `search_order_by_id()` para búsquedas seguras
- ✅ Índices de rendimiento en tablas críticas
- ✅ Constraints para validación de datos
- ✅ Tabla de audit para rastrear cambios sensibles
- ✅ Trigger automático para log de transacciones

**Archivo:** `/supabase/migrations/007_rls_improvements_and_security.sql`

---

## Cómo Actualizar en Producción

### Paso 1: Ejecutar Migración en Supabase

```sql
-- Copiar contenido de:
-- supabase/migrations/007_rls_improvements_and_security.sql

-- Ir a Supabase Dashboard > SQL Editor
-- Pegar el contenido y ejecutar
```

### Paso 2: Actualizar Código de Inserción de Órdenes

**Antes (inseguro):**
```javascript
await db.from('orders').insert([orderData]).select();
```

**Después (seguro):**
```javascript
const { data, error } = await db.rpc('insert_order_safe', {
  p_customer_name: Sanitizer.name(orderData.customer_name),
  p_target_name: Sanitizer.name(orderData.target_name),
  p_plan_name: Sanitizer.html(orderData.plan_name),
  p_price: parseFloat(orderData.price),
  p_template_id: orderData.template_id,
  p_template_name: Sanitizer.name(orderData.template_name),
  p_custom_message: Sanitizer.html(orderData.custom_message)
});
```

### Paso 3: Buscar Órdenes de Forma Segura

**Antes (vulnerable):**
```javascript
const { data } = await db.from('orders')
  .select('*')
  .eq('id', orderId);
```

**Después (seguro):**
```javascript
const { data } = await db.rpc('search_order_by_id', {
  p_order_id: orderId
});
```

### Paso 4: Variables de Entorno en Producción

1. **GitHub Secrets** (si usas GitHub Pages):
   ```yaml
   Settings > Secrets and Variables > Actions
   ```

2. **GitHub Actions Workflow**:
   ```yaml
   - name: Inject environment variables
     run: |
       mkdir -p js && cat > js/env-inject.js << 'EOF'
       window.__ENV = {
         SUPABASE_URL: '${{ secrets.SUPABASE_URL }}',
         SUPABASE_KEY: '${{ secrets.SUPABASE_KEY }}',
         PAYPHONE_LINK: '${{ secrets.PAYPHONE_LINK }}',
         WHATSAPP_NUMBER: '${{ secrets.WHATSAPP_NUMBER }}'
       };
       EOF
   ```

3. **Agregar a index.html** (después de env-config.js):
   ```html
   <script src="js/env-inject.js"></script>
   <script src="js/env-config.js"></script>
   ```

---

## Verificación de Seguridad

### ✅ Checklist

- [ ] No hay URLs de Supabase en archivos .js (excepto env-config.js)
- [ ] No hay API keys en el repositorio
- [ ] .env.local está en .gitignore
- [ ] Todos los datos user-generated usan Sanitizer
- [ ] Las inserciones usan funciones RPC validadas
- [ ] Migraciones SQL se ejecutaron correctamente

### 🔍 Escaneo Automatizado

```bash
# Buscar credenciales en código
grep -r "qmnbcmioylgmcbzqrjiv" . --exclude-dir=.git --exclude-dir=node_modules

# Buscar 'password' en archivos
grep -r "password\|apikey\|secret" . --exclude-dir=.git --exclude-dir=node_modules

# Si encuentra algo en js/, hay un problema
```

---

## Próximas Mejoras (Fase 2+)

- [ ] Implementar rate limiting en funciones RPC
- [ ] Agregar CSRF tokens en formularios
- [ ] Setup Sentry para error tracking
- [ ] Implementar CSP (Content Security Policy)
- [ ] Testing de penetración
- [ ] Monitoreo de intentos fallidos de autenticación

---

## Soporte

Si encuentras problemas:
1. Revisa la consola del navegador (DevTools > Console)
2. Verifica que `window.CC_ENV` esté definido
3. Verifica que `window.Sanitizer` esté disponible
4. Revisa logs de Supabase (Dashboard > Logs)
