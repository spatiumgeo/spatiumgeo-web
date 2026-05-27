# Cambios aplicados

- Compatibilidad mejorada para Microsoft Edge.
- Se desactivan efectos problemáticos en Edge: canvas decorativo, blur/backdrop-filter y mezclas visuales avanzadas.
- Modal de casos unificado: imagen rellena la ventana del modal y el texto mantiene tamaño similar al resto.
- “PIC catastro...” sustituido por “PIC CATASTRO Y PROPIEDAD”.
- El modal de PIC mantiene su descripción y puntos resumidos.
- SEO añadido por debajo del contenido original para “Cartografía Valencia”, sin sustituir los textos principales.
- Sitemap y manifest actualizados.

## Compatibilidad ampliada por navegador

Se han añadido clases automáticas en el elemento `<html>` para aplicar CSS específico por navegador y por capacidades del dispositivo:

- `browser-chrome`, `browser-edge`, `browser-firefox`, `browser-safari`, `browser-opera`
- `engine-blink`, `engine-webkit`, `engine-gecko`
- `platform-ios`, `platform-android`, `platform-windows`, `platform-macos`, `platform-linux`
- `supports-backdrop-filter` / `no-backdrop-filter`
- `supports-aspect-ratio` / `no-aspect-ratio`
- `supports-object-fit` / `no-object-fit`
- `supports-css-grid` / `no-css-grid`
- `is-mobile`, `is-touch`, `no-hover`, `reduced-motion`

También se han añadido fallbacks CSS para Firefox, Safari/iOS, Edge, Chrome, Opera y navegadores antiguos que no soporten `backdrop-filter`, `aspect-ratio`, `object-fit` o CSS Grid.
