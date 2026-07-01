"use client";

import { useEffect, useState } from "react";
import { usePluginStore } from "@/lib/stores/plugin-store";
import { useViewLevelStore } from "@/lib/stores/view-level-store";

function storesHydrated() {
  return (
    useViewLevelStore.persist.hasHydrated() &&
    usePluginStore.persist.hasHydrated()
  );
}

/** Avoid SSR/client mismatch from zustand persist (view level, plugins). */
export function useClientStoresHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const markHydrated = () => {
      if (storesHydrated()) setHydrated(true);
    };

    markHydrated();
    const unsubView = useViewLevelStore.persist.onFinishHydration(markHydrated);
    const unsubPlugins = usePluginStore.persist.onFinishHydration(markHydrated);

    return () => {
      unsubView();
      unsubPlugins();
    };
  }, []);

  return hydrated;
}
