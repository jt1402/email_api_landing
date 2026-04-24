"use client";

import { useEffect } from "react";
import { refreshDashboardAction } from "@/app/actions";

export function RefreshAfterCheckout() {
  useEffect(() => {
    refreshDashboardAction();
  }, []);
  return null;
}
