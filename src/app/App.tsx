import { Suspense } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-[#0B0B0B]/30">Cargando…</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}
