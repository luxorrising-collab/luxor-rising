"use client";

import { createContext, useContext } from "react";
import {
  type ConsentConfig,
  EMPTY_CONFIG,
  configureConsent,
  isTrackingEnabled,
} from "@/lib/consent";

const ConsentConfigContext = createContext<ConsentConfig>(EMPTY_CONFIG);

/** Read the live tracking config anywhere below the provider. */
export function useConsentConfig(): ConsentConfig {
  return useContext(ConsentConfigContext);
}

/** True when the banner and tags should be active. */
export function useTrackingEnabled(): boolean {
  return isTrackingEnabled(useContext(ConsentConfigContext));
}

/**
 * Wraps the site with the Keystatic-sourced tracking config, and mirrors it
 * into module scope so plain helpers (applyConsent, loadMetaPixel) can reach
 * the Meta Pixel ID without prop-drilling. Set during render so it's in place
 * before any consent action fires.
 */
export default function ConsentProvider({
  config,
  children,
}: {
  config: ConsentConfig;
  children: React.ReactNode;
}) {
  configureConsent(config);
  return (
    <ConsentConfigContext.Provider value={config}>
      {children}
    </ConsentConfigContext.Provider>
  );
}
