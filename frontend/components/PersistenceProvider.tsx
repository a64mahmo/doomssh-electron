"use client";

import { useEffect } from "react";
import { initPersistence } from "@/lib/store/persistenceManager";

export function PersistenceProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPersistence();
  }, []);

  return <>{children}</>;
}
