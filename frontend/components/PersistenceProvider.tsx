"use client";

import { useEffect } from "react";
import { initPersistence } from "@/lib/store/persistenceManager";
import { initJobPersistence } from "@/lib/store/jobPersistenceManager";

export function PersistenceProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPersistence();
    initJobPersistence();
  }, []);

  return <>{children}</>;
}
