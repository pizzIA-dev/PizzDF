# PizzDF 📄⚡

> **Suite web de herramientas PDF 100% libre, privada y de alto rendimiento.**  
> Todos los documentos se procesan en la memoria de tu propio navegador (Client-Side con WebAssembly y Canvas API). Tus archivos jamás se suben a servidores externos.

---

## 🚀 Características Principales

* ✍️ **Editor de PDF**: Agrega texto con tipografía ajustada, firmas digitales, sellos personalizados, dibujo a mano alzada y resaltador translúcido. Exportación fiel en alta resolución.
* 📑 **Organizar Páginas**: Reordena páginas visualmente con animación fluida en vivo, selección múltiple inteligente (arrastre con recuadro / Shift / Control), rotación individual o total, y eliminación rápida.
* 🔗 **Unir PDFs**: Combina múltiples archivos PDF en el orden exacto deseado con soporte de reordenamiento drag & drop animado.
* ✂️ **Dividir y Separar**: Extrae páginas seleccionadas con selección lasso/rango continuo o divide el documento completo en archivos individuales dentro de un archivo ZIP.
* 🗜️ **Comprimir PDF**: Optimiza y reduce el tamaño de tus documentos directamente en el navegador.
* 💧 **Marca de Agua**: Añade marcas de agua de texto con control de opacidad, tamaño, ángulo y posición en tiempo real.
* 🔢 **Numerar Páginas**: Agrega numeración secuencial con formatos profesionales personalizables.
* 🖼️ **PDF a Imágenes**: Convierte cada página en imágenes JPG o PNG en alta resolución a escala 2x.
* 📸 **Imágenes a PDF**: Agrupa fotos o capturas de pantalla y conviértelas en un documento PDF ordenado al instante.

---

## 🔒 Privacidad y Rendimiento

* **Cero Servidores de Cómputo (Zero Backend)**: No hay servidores recibiendo tus archivos. Ni siquiera nosotros podemos ver lo que procesas.
* **Escalabilidad Infinita**: Dado que todo el cálculo ocurre en el cliente, la aplicación soporta millones de visitas simultáneas sin caídas ni costos de infraestructura de cómputo.
* **Alojamiento Recomendado**: Diseñado para desplegarse estáticamente en **Cloudflare Pages**, **Vercel** o **AWS S3 + CloudFront**.

---

## 🛠️ Tecnologías

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS
* **Motor PDF**: `pdf-lib`, `pdfjs-dist` (PDF.js WebAssembly / Web Workers)
* **Utilidades**: `jszip`, `lucide-react`, HTML5 Canvas Rendering Engine

---

## 💻 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build
```

---

## ☕ Apoyo y Donaciones

PizzDF es y será siempre 100% gratuito y sin anuncios intrusivos. Si esta herramienta te ahorra tiempo y dinero, puedes apoyar el desarrollo voluntariamente a través del botón integrado de donaciones en la aplicación.

---

Desarrollado con ❤️ por [PizzIA](https://github.com/pizzIA-dev).
