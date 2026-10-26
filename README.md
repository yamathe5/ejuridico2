# VERA — Estudio jurídico

Sitio estático en HTML, CSS y JavaScript. VERA es una marca provisional de demostración, pendiente de sustituir por los datos reales del estudio. No incluye cifras, credenciales ni testimonios inventados.

## Ver la web

Abre `index.html` directamente o ejecuta desde esta carpeta:

```sh
python -m http.server 4173 --bind 127.0.0.1
```

Visita http://127.0.0.1:4173.

## Paleta aprobada

| Color | Código | Uso |
| --- | --- | --- |
| Borgoña | #541C2D | Botones, títulos de acento, especialidades |
| Marfil | #F5F0E8 | Fondo y texto sobre superficies oscuras |
| Carbón | #242326 | Texto, contacto y pie de página |
| Piedra | #B9ADA3 | Separadores y acentos secundarios |

Las variables están al inicio de `styles.css`. Tipografías: Cormorant Garamond y Manrope, servidas por Google Fonts, con alternativas del sistema.

## Funcionalidad

- Navegación adaptable a móviles con control de foco y Escape.
- Especialidades y preguntas frecuentes desplegables.
- Selección de especialidad desde su enlace de consulta.
- Apariciones al desplazarse con IntersectionObserver y respeto de movimiento reducido.
- Formulario con validación que redirige a WhatsApp (+51 999 999 999) con nombre, correo, especialidad y consulta codificados en el mensaje. La persona revisa y envía el mensaje en WhatsApp. No almacena datos en esta web.
- Diálogo informativo de privacidad.

## Antes de publicar

Sustituir la marca, revisar las áreas y textos con el estudio y añadir sus datos reales. WhatsApp está configurado con el número facilitado: +51 999 999 999. Revisar que corresponda al estudio antes de publicar. El mapa muestra el Palacio de Justicia del Perú por indicación del usuario, identificado como referencia y no como una oficina. Las reseñas son ejemplos explícitamente marcados; sustituirlos por testimonios reales autorizados antes de publicar.

## Fotografías de internet

Fotografías descargadas de Unsplash; no se ha utilizado generación de imágenes.

- Nathan Cima, arquitectura del palacio de justicia de Montpellier: https://unsplash.com/photos/OHE90W2rQF4 — `assets/architecture.jpg`.
- Palacio de Justicia de Lima: https://unsplash.com/photos/Fxop1_ZtFXQ — `assets/lima.jpg`.

Actualización: textos pequeños ampliados, widget flotante de WhatsApp con mensaje ocultable, contacto telefónico, mapa integrado y reseñas ilustrativas.

Todos los paneles tienen apertura y cierre animados: especialidades, preguntas frecuentes, menú móvil, selector de especialidad y privacidad. El mensaje flotante también aparece y se oculta con animación. Las animaciones permiten invertir la acción con clics rápidos y respetan la preferencia de movimiento reducido. El selector admite flechas, Inicio/Fin, Enter/Espacio, Escape, Tab y búsqueda por inicial; sin JavaScript se conserva el selector nativo.
