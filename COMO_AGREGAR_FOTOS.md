# 📸 Cómo Agregar Fotos a la Galería

## Estructura de Carpetas

Las fotos deben organizarse en las siguientes carpetas dentro de `assets/images/`:

```
assets/images/
├── bodas/           # Fotos de bodas
├── xv-anios/        # Fotos de XV años
├── cumpleanos/      # Fotos de cumpleaños
├── aniversarios/    # Fotos de aniversarios
├── fiestas/         # Fotos de fiestas
└── posadas/         # Fotos de posadas
```

## Pasos para Agregar Fotos

### 1. Agregar la Imagen a la Carpeta Correspondiente

Copia tu foto en la carpeta adecuada. Por ejemplo:
- Para una boda: `assets/images/bodas/nombre-foto.jpeg`
- Para un XV años: `assets/images/xv-anios/nombre-foto.jpeg`

### 2. Registrar la Imagen en el Código

Abre el archivo `js/cotizador.js` y busca la sección `GALERIA_IMAGENES` (aproximadamente línea 825).

Agrega tu foto al array correspondiente:

```javascript
const GALERIA_IMAGENES = {
    'bodas': [
        { archivo: 'Boda.jpeg', titulo: 'Boda Elegante' },
        // ⬇️ Agregar aquí nuevas fotos de bodas
        { archivo: 'nueva-boda.jpeg', titulo: 'Boda Jardín' }
    ],
    'xv-anios': [
        { archivo: 'XVzoe.jpeg', titulo: 'XV Años Zoe' },
        { archivo: 'copasXV.jpeg', titulo: 'Brindis XV Años' },
        // ⬇️ Agregar aquí nuevas fotos de XV años
        { archivo: 'xv-rosa.jpeg', titulo: 'XV Años Temática Rosa' }
    ],
    'cumpleanos': [
        // ⬇️ Agregar aquí fotos de cumpleaños
        { archivo: 'cumple-30.jpeg', titulo: 'Cumpleaños 30 Años' }
    ],
    // ... etc
};
```

### 3. Guardar y Verificar

1. Guarda los cambios en `js/cotizador.js`
2. Recarga la página en tu navegador
3. Haz clic en el botón de la categoría correspondiente
4. Verifica que la foto aparezca correctamente

## Ejemplo Completo

**Escenario:** Quieres agregar 3 fotos de una boda.

**Paso 1 - Copiar archivos:**
```
assets/images/bodas/boda-playa-1.jpeg
assets/images/bodas/boda-playa-2.jpeg
assets/images/bodas/boda-playa-3.jpeg
```

**Paso 2 - Editar js/cotizador.js:**
```javascript
'bodas': [
    { archivo: 'Boda.jpeg', titulo: 'Boda Elegante' },
    { archivo: 'boda-playa-1.jpeg', titulo: 'Boda en la Playa - Ceremonia' },
    { archivo: 'boda-playa-2.jpeg', titulo: 'Boda en la Playa - Recepción' },
    { archivo: 'boda-playa-3.jpeg', titulo: 'Boda en la Playa - Brindis' }
],
```

**Paso 3 - Resultado:**
- Al hacer clic en "💒 Bodas" aparecerán las 4 fotos
- Al hacer clic en "✨ Todas" aparecerán todas las fotos de todas las categorías

## Notas Importantes

- ✅ Usa nombres de archivo sin espacios (usa guiones: `boda-playa.jpeg` ✓)
- ✅ Formatos compatibles: `.jpg`, `.jpeg`, `.png`, `.webp`
- ✅ El título puede ser descriptivo y con espacios
- ❌ No uses tildes ni caracteres especiales en nombres de archivo
- ❌ No uses mayúsculas inconsistentes (prefiere minúsculas)

## Carrusel Principal vs Galería Completa

**Carrusel** (`index.html` líneas ~190-220):
- Solo 3 fotos destacadas que rotan automáticamente
- Editar directamente el HTML para cambiar imágenes

**Galería Completa** (`js/cotizador.js`):
- Todas tus fotos organizadas por categoría
- Editar el objeto `GALERIA_IMAGENES`

---

¿Necesitas ayuda? Contacta al desarrollador.
