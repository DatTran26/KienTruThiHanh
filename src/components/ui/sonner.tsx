"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "rgba(255, 255, 255, 0.95)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "16px",
          "--toast-shadow": "0 20px 60px -15px rgba(0,0,0,0.15)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "group toast backdrop-blur-xl border border-white/50 shadow-xl transition-all duration-300",
          title: "text-[14px] font-semibold text-slate-800",
          description: "text-[13px] text-slate-500 font-medium",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
