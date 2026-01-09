# GALO — Sitio estático

Sitio de una página para GALO: Mantenimiento industrial y residencial.

## Cómo usar

- Abre `index.html` directamente en tu navegador para una vista rápida.
- El logo se toma de `GALO.jpg`. La portada ya no se usa para mejorar la nitidez general.
- Edita teléfonos y textos en `index.html`.
- Colores en `styles.css` (variables CSS al inicio).

## Colores (tema oscuro)
- Fondo: `#0C0C0C`
- Oro principal: `#D4AF37`
- Oro claro/acento: `#E6C65B`
- Texto: `#E8E8E8`

## Contacto configurado
- 844 342 3534 — Ing. Diego Galván
- 844 281 1573 — Ing. Enrique López

Los botones crean enlaces `tel:` y WhatsApp `wa.me` para contacto rápido.

## Estructura
- `index.html`: contenido y estructura
- `styles.css`: estilos y responsive
- `data.js`: datos para la galería (lista de imágenes)
- `script.js`: menú móvil, año y render de galería
- `galeria/`: coloca aquí tus imágenes

## Galería: cómo agregar imágenes
1) Copia tus fotos dentro de la carpeta `galeria/` (por ejemplo `galeria/trabajo1.jpg`).
2) Abre `data.js` y agrega objetos al arreglo `window.GALERIA_IMAGENES`, por ejemplo:

```
window.GALERIA_IMAGENES = [
	{ src: 'galeria/trabajo1.jpg', titulo: 'Instalación eléctrica', desc: 'Tablero y canalización' },
	{ src: 'galeria/trabajo2.jpg', titulo: 'Aire acondicionado', desc: 'Mantenimiento preventivo' },
];
```
3) Guarda y recarga `index.html` en el navegador.

## Publicación rápida
Puedes subir estos archivos a cualquier hosting estático (GitHub Pages, Netlify, Vercel, etc.).