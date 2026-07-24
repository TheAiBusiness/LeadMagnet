import { createBrowserRouter } from "react-router";
import { lazy } from "react";
import { Landing } from "./components/Landing";

const CalculatorPage = lazy(() => import("./components/CalculatorPage").then((m) => ({ default: m.CalculatorPage })));
const NotFound = lazy(() => import("./components/NotFound").then((m) => ({ default: m.NotFound })));
const ThankYou = lazy(() => import("./components/ThankYou").then((m) => ({ default: m.ThankYou })));

export const router = createBrowserRouter([
  { path: "/", Component: Landing },
  { path: "/calculadora", Component: CalculatorPage },
  { path: "/gracias", Component: ThankYou },
  { path: "*", Component: NotFound },
]);
