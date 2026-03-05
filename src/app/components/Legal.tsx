import { useRef } from "react";
import { motion, useInView } from "motion/react";

export function Legal() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: false, margin: "-60px" });

  return (
    <section
      ref={ref}
      className="py-16 md:py-24 px-6 border-t border-[#EAEAEA]/50"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="max-w-[720px] mx-auto space-y-16">
        <motion.div
          id="privacidad"
          initial={{ opacity: 0, filter: "blur(8px)", y: 12 }}
          animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-[#0B0B0B] mb-4" style={{ fontSize: "1.25rem", fontWeight: 600 }}>
            Privacidad
          </h2>
          <div className="text-[#0B0B0B]/60 space-y-3" style={{ fontSize: "0.9rem", lineHeight: 1.75 }}>
            <p>
              En The AI Business tratamos los datos que nos facilitas (nombre, email, respuestas de la calculadora y mensajes de contacto) para enviarte el informe personalizado, responder a tu consulta y, si lo autorizas, mantener comunicación comercial.
            </p>
            <p>
              No vendemos ni cedemos tus datos a terceros. Utilizamos proveedores con garantías adecuadas (envío de emails, alojamiento). Tus datos se conservan mientras sea necesario para las finalidades indicadas o para cumplir obligaciones legales.
            </p>
            <p>
              Puedes ejercer derechos de acceso, rectificación, supresión, limitación y portabilidad escribiendo a{" "}
              <a href="mailto:info@theaibusiness.com" className="text-[#0B0B0B] underline hover:no-underline">
                info@theaibusiness.com
              </a>
              . Tienes derecho a reclamar ante la autoridad de control (AEPD).
            </p>
          </div>
        </motion.div>

        <motion.div
          id="terminos"
          initial={{ opacity: 0, filter: "blur(8px)", y: 12 }}
          animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-[#0B0B0B] mb-4" style={{ fontSize: "1.25rem", fontWeight: 600 }}>
            Términos de uso
          </h2>
          <div className="text-[#0B0B0B]/60 space-y-3" style={{ fontSize: "0.9rem", lineHeight: 1.75 }}>
            <p>
              El uso de esta web y de la calculadora de impacto es gratuito e informativo. Las cifras de ahorro e impacto son estimaciones basadas en benchmarks del sector y no constituyen una garantía de resultados.
            </p>
            <p>
              No está permitido el uso de la web con fines ilícitos ni la extracción masiva de datos. Nos reservamos el derecho a modificar estos términos y el contenido del sitio. El uso continuado tras cambios implica aceptación.
            </p>
            <p>
              Para cualquier cuestión legal o comercial:{" "}
              <a href="mailto:info@theaibusiness.com" className="text-[#0B0B0B] underline hover:no-underline">
                info@theaibusiness.com
              </a>
              .
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
