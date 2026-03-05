import { createBrowserRouter } from "react-router";
import { Landing } from "./components/Landing";
import { CalculatorPage } from "./components/CalculatorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/calculadora",
    Component: CalculatorPage,
  },
]);
