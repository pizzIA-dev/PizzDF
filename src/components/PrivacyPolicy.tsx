import React from 'react';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const PrivacyPolicy: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-12 lg:py-16">
      <button 
        onClick={onBack} 
        className="mb-8 p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-50 shadow-sm transition inline-flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-semibold">Volver al inicio</span>
      </button>

      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 shadow-sm prose prose-slate max-w-none">
        <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 m-0">Política de Privacidad</h1>
            <p className="text-slate-500 mt-2 m-0 font-medium">Transparencia total sobre cómo manejamos tus archivos.</p>
          </div>
        </div>

        <h3>El resumen (TL;DR)</h3>
        <p>
          <strong>Tus archivos nunca salen de tu computadora.</strong> PizzDF está diseñado con una arquitectura "Zero Backend". No tenemos servidores donde se suban, procesen o almacenen tus documentos PDF. Todo el procesamiento (unir, dividir, comprimir, editar) ocurre exclusivamente en la memoria RAM de tu propio navegador web.
        </p>

        <h3>1. Tratamiento de Archivos</h3>
        <p>
          A diferencia de la mayoría de herramientas PDF en línea que requieren que subas tu archivo a sus servidores para procesarlo y luego te devuelven el resultado, <strong>PizzDF ejecuta todo el código dentro de tu dispositivo</strong>. 
        </p>
        <ul>
          <li><strong>Sin almacenamiento:</strong> No almacenamos ni temporalmente ni permanentemente tus archivos.</li>
          <li><strong>Sin transferencias:</strong> El contenido de tus PDFs nunca viaja por internet.</li>
          <li><strong>Sin rastreo de contenido:</strong> No podemos ver, leer, ni extraer ninguna información, texto o imagen de los documentos que procesas.</li>
        </ul>

        <h3>2. Tecnologías utilizadas</h3>
        <p>
          Utilizamos tecnologías modernas de procesamiento del lado del cliente como <code>WebAssembly</code> y <code>Canvas API</code>. Cuando cargas un archivo en PizzDF, simplemente le estás dando permiso a tu navegador (Chrome, Safari, Firefox, Edge) para leerlo y modificarlo localmente.
        </p>

        <h3>3. Datos analíticos y Cookies</h3>
        <p>
          Para mantener y mejorar la herramienta, podríamos utilizar servicios básicos de analítica (como métricas de visitas a las páginas) de forma totalmente anonimizada. Estas métricas <strong>no tienen ninguna vinculación</strong> con los archivos que procesas. No utilizamos cookies invasivas ni vendemos perfiles de usuarios a terceros.
        </p>

        <h3>4. Privacidad corporativa y confidencialidad</h3>
        <p>
          Dado que los archivos nunca abandonan tu red local, PizzDF es seguro para su uso con documentos corporativos, legales, financieros y gubernamentales (cumpliendo con estándares estrictos donde la política de la empresa prohíbe subir documentos a servicios en la nube de terceros).
        </p>

        <div className="mt-12 p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center">
          <p className="text-sm text-slate-600 m-0">
            Si tienes dudas técnicas sobre nuestra arquitectura de procesamiento local, puedes revisar el funcionamiento o auditar la red desde las herramientas de desarrollo de tu navegador (F12).
          </p>
        </div>
      </div>
    </div>
  );
};
