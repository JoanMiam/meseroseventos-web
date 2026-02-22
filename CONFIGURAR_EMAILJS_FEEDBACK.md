# 📧 Configurar EmailJS para Comentarios y Sugerencias

## Paso 1: Crear Cuenta en EmailJS

1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Crea una cuenta gratuita (permite 200 emails/mes)
3. Verifica tu email

## Paso 2: Conectar tu Email

1. En el dashboard, ve a **Email Services**
2. Click en **Add New Service**
3. Selecciona tu proveedor (Gmail, Outlook, etc.)
4. Sigue las instrucciones para conectar tu email
5. **Copia el Service ID** (ej: `service_abc123`)

## Paso 3: Crear Template para Comentarios

1. Ve a **Email Templates**
2. Click en **Create New Template**
3. Usa este contenido:

### Asunto del Email:
```
💬 Nuevo Comentario - Meseros Yucatán
```

### Cuerpo del Email:
```
Has recibido un nuevo comentario en Meseros Yucatán:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 NOMBRE: {{nombre}}
📱 TELÉFONO: {{telefono}}
📅 FECHA: {{fecha}}

💬 COMENTARIO:
{{comentario}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Este mensaje fue enviado desde el formulario de opiniones y sugerencias.
```

4. **Copia el Template ID** (ej: `template_xyz789`)
5. Guarda el template

## Paso 4: Obtener Public Key

1. Ve a **Account** → **General**
2. En la sección **API Keys**, encontrarás tu **Public Key**
3. **Copia el Public Key** (ej: `abc123XYZ`)

## Paso 5: Configurar en el Código

Abre `js/cotizador.js` y busca la línea aproximadamente **900**:

```javascript
const EMAILJS_CONFIG_FEEDBACK = {
  serviceID: 'service_abc123',     // ⬅️ Tu Service ID
  templateID: 'template_xyz789',   // ⬅️ Tu Template ID
  publicKey: 'abc123XYZ'           // ⬅️ Tu Public Key
};
```

Reemplaza con tus valores reales.

## Paso 6: Activar EmailJS en el HTML

Agrega el SDK de EmailJS en `index.html` antes del cierre de `</body>`:

```html
    <!-- EmailJS SDK -->
    <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
    <script>
        emailjs.init('TU_PUBLIC_KEY_AQUI'); // ⬅️ Reemplazar con tu Public Key
    </script>

    <!-- Scripts -->
    <script src="js/cotizador.js"></script>
</body>
```

## Paso 7: Descomentar el Código

En `js/cotizador.js`, busca la función `handleFeedbackSubmit` (línea ~960):

**Descomentar esto:**
```javascript
await emailjs.send(
  EMAILJS_CONFIG_FEEDBACK.serviceID,
  EMAILJS_CONFIG_FEEDBACK.templateID,
  feedbackData,
  EMAILJS_CONFIG_FEEDBACK.publicKey
);
```

**Comentar o eliminar esto:**
```javascript
// Simular envío exitoso (comentar cuando uses EmailJS real)
await new Promise(resolve => setTimeout(resolve, 1000));
```

## Paso 8: Probar

1. Recarga tu página
2. Click en "✨ Opiniones y sugerencias"
3. Llena el formulario
4. Envía
5. Verifica que el email llegue a tu bandeja

## 🎯 Resultado Final

Cuando alguien envíe un comentario, recibirás un email como este:

```
De: noreply@emailjs.com
Para: tu-email@gmail.com
Asunto: 💬 Nuevo Comentario - Meseros Yucatán

Has recibido un nuevo comentario en Meseros Yucatán:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 NOMBRE: Juan Pérez
📱 TELÉFONO: 999 123 4567
📅 FECHA: 21 de febrero de 2026, 15:30

💬 COMENTARIO:
Excelente servicio en mi boda. Los meseros fueron muy profesionales
y atentos. 100% recomendado.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🔧 Troubleshooting

### "EmailJS is not defined"
- Verifica que agregaste el script de EmailJS en `index.html`
- Verifica que inicializaste EmailJS con `emailjs.init()`

### Los emails no llegan
- Verifica el Service ID, Template ID y Public Key
- Revisa la bandeja de spam
- Verifica que el servicio de email esté conectado en EmailJS

### Error 400 o 401
- Public Key incorrecto
- Service ID o Template ID incorrecto
- Verifica en la consola del navegador

## 📝 Límites del Plan Gratuito

- **200 emails/mes**
- Si necesitas más, considera actualizar a plan pago ($7-15/mes)

---

¿Problemas? Revisa la [documentación oficial de EmailJS](https://www.emailjs.com/docs/)
