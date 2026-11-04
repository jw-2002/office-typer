// Composes every app-wide provider in one place.
import type { ReactNode } from "react";
import KeyInputProvider from "./KeyInputProvider";

// Every app-wide provider is composed here. They sit outside <Canvas>, which bridges them inside.
export default function AppProviders({ children }: { children: ReactNode }) {
  return <KeyInputProvider>{children}</KeyInputProvider>;
}
