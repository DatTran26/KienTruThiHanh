"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function AuthTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="opacity-0">{children}</div>;

  return (
    <div
      key={pathname}
      className="w-full animate-fade-in-up"
      style={{ animationDuration: "400ms", animationTimingFunction: "ease-out" }}
    >
      {children}
    </div>
  );
}
