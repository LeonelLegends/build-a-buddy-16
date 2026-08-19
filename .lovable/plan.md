# Reordenar tarjetas, unificar botones y optimizar imágenes

## 1. Orden de las pólizas
En el carrusel de la página principal / servicios y en la lista del pie de página, mover **Term Life Insurance, Permanent Life Insurance y Annuities** al principio, y HYSA, 401(k) y Roth IRA después. El resto (Living Benefits, IUL, Life Insurance) mantiene su orden relativo detrás. Los modales del footer seguirán abriendo la póliza correcta.

## 2. Color y comportamiento de los botones
Color base único para todos los botones: **teal (secondary)** con texto claro.
Comportamiento al hover/focus: solo elevación ligera (`hover:-translate-y-0.5`, sombra suave), sin cambio de color, igual que Login/idioma hoy. Anillo de foco visible para accesibilidad.

Alcance:
- Header (Login, idioma, CTA) en escritorio y móvil.
- Página principal: CTAs del hero, botón de la sección familia, flechas y puntos del carrusel.
- Section 125 Plans: botón "Free consultation".
- Contact: botón de agendar (deja de ser verde #047857) y botón de envío del formulario.
- Blog/servicios: botones de navegación de páginas.
- **Excepción:** el botón "Chat with Legends" queda exactamente igual.

## 3. Iconos de Phone, Email y Hours (Contact) y de los 3 valores en la principal
Cambiar el fondo dorado sólido por **fondo transparente con borde** en el mismo teal usado en los botones; el icono queda en teal. Se aplica a Phone / Email / Hours de Contact y a Independent advice / Bilingual service / Long-term partnership de la página principal.

## 4. Optimización de imágenes existentes
- Convertir los JPG/PNG de `src/assets` a **WebP** redimensionados a un ancho máximo razonable (logo ~600px, fotos ~1600px), manteniendo calidad visual. El logo actual pesa 1.4 MB y bajará a decenas de KB.
- Añadir `loading="lazy"` y `decoding="async"` donde falte, y `fetchpriority="high"` a la imagen del hero.
- Mantener `width`/`height` para evitar saltos de maquetación.

## 5. Compresión automática de imágenes del blog
Al subir una imagen en el editor de blogs, comprimirla en el navegador antes de guardarla:
- Redimensionar a máximo 1600px de ancho.
- Convertir a WebP con calidad ~0.82 (si el navegador no lo soporta, JPEG).
- Mostrar el tamaño resultante y subir el archivo ya optimizado a Cloud Storage.
Las imágenes ya subidas siguen funcionando sin cambios.

## Detalles técnicos
- Reordenar el array `POLICIES` en `src/components/PolicySlideshow.tsx` y la lista de `svc(...)` en `Footer.tsx`.
- Definir una clase/utilidad compartida de botón (teal + elevación) en `src/styles.css` y aplicarla en Header, index, benefits, contact, blog y el carrusel.
- Iconos: reemplazar `bg-gradient-gold` por `border border-secondary/50 bg-transparent` con `text-secondary`.
- Conversión de imágenes con `sharp` en el sandbox (no en runtime), actualizando los imports a `.webp`.
- Compresión de subida vía `canvas.toBlob` en `src/lib/blog-images.ts`, usada por `ImageUploader`.
