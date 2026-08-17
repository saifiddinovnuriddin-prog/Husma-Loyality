"use client";

import { useEffect } from "react";

export default function SuppressPlayAbortError() {
  useEffect(() => {
    const handler = (e) => {
      if (
        e.reason?.name === "AbortError" &&
        String(e.reason?.message || "").includes(
          "play() request was interrupted"
        )
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handler);

    return () => {
      window.removeEventListener("unhandledrejection", handler);
    };
  }, []);

  return null;
}