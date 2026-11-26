# HUELLAS VR para WordPress

Este plugin integra la experiencia web 3D dentro de una página de WordPress mediante un iframe adaptable. La aplicación y sus modelos GLB quedan dentro del propio plugin; no depende de un CDN ni de otro dominio para cargar los recursos de HUELLAS VR.

## Instalación

1. Descarga el artefacto **huellas-vr-wordpress-plugin** desde GitHub Actions del repositorio HUELLAS VR.
2. En WordPress abre **Plugins → Añadir plugin → Subir plugin**.
3. Selecciona `huellas-vr-wordpress.zip`, instala y activa **HUELLAS VR**.
4. Crea o edita una página en atrapacuentos.cl y agrega un bloque **Shortcode** con:

```text
[huellas_vr]
```

Opcionalmente, ajusta la altura:

```text
[huellas_vr height="900"]
```

5. Publica la página y comprueba la experiencia en PC, celular y casco Cardboard.

## Compatibilidad y seguridad

- El sitio debe funcionar con HTTPS para permitir el acceso a los sensores del celular.
- El iframe concede los permisos de acelerómetro, giroscopio y pantalla completa que solicita el modo Cardboard.
- El contenido se aísla del tema de WordPress para evitar conflictos de CSS y JavaScript.
- Los modelos GLB, JavaScript y CSS se sirven desde el propio plugin.
- El plugin no recoge datos personales ni envía fotografías o información del visitante.

## Actualización

Cuando GitHub Actions genere un nuevo ZIP, súbelo desde **Plugins → Añadir plugin → Subir plugin** y reemplaza la versión instalada. Conserva una copia de seguridad antes de actualizar una instalación en producción.

## Alcance de esta entrega

El ZIP automatizado queda preparado para instalación en WordPress. La activación del plugin y la publicación de la página requieren acceso de administrador al WordPress de atrapacuentos.cl; no se realizan desde este repositorio.
