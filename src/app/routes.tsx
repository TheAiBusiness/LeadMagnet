import { createBrowserRouter } from "react-router";
import { lazy } from "react";
import { Landing } from "./components/Landing";

const CalculatorPage = lazy(() => import("./components/CalculatorPage").then((m) => ({ default: m.CalculatorPage })));
const NotFound = lazy(() => import("./components/NotFound").then((m) => ({ default: m.NotFound })));

export const router = createBrowserRouter([
  { path: "/", Component: Landing },
  { path: "/calculadora", Component: CalculatorPage },
  { path: "*", Component: NotFound },
]);
