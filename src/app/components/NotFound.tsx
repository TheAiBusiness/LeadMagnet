import { Link } from "react-router";

export function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 bg-white"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <h1 className="text-[#0B0B0B] mb-2" style={{ fontSize: "2rem", fontWeight: 600 }}>
        404
      </h1>
      <p className="text-[#0B0B0B]/50 mb-8" style={{ fontSize: "1rem" }}>
        Página no encontrada
      </p>
      <div className="flex gap-4">
        <Link
          to="/"
          className="px-6 py-3 bg-[#0B0B0B] text-white rounded-full font-medium hover:opacity-90 transition-opacity"
        >
          Inicio
        </Link>
        <Link
          to="/calculadora"
          className="px-6 py-3 border border-[#0B0B0B]/20 text-[#0B0B0B] rounded-full font-medium hover:border-[#0B0B0B]/40 transition-colors"
        >
          Calculadora
        </Link>
      </div>
    </div>
  );
}
