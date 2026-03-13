import { Suspense } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white" style={{ fontFamily: "Inter, sans-serif" }}>
        <div className="w-6 h-6 border-2 border-[#0B0B0B]/20 border-t-[#0B0B0B] rounded-full animate-spin" />
      </div>
    }>
      <RouterProvider router={router} />
    </Suspense>
  );
}
