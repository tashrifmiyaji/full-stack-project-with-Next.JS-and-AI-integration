"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { cn } from "@/lib/utils"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      toastOptions={{
        classNames: {
          toast: cn(
            "border text-foreground shadow-lg",
            "[&_[data-title]]:font-semibold",
            "[&_[data-description]]:text-muted-foreground"
          ),
          success: cn(
            "border-green-200 bg-green-50 text-green-950 dark:border-green-900/60 dark:bg-green-950 dark:text-green-100",
            "[&_[data-description]]:text-green-700 dark:[&_[data-description]]:text-green-300"
          ),
          error: cn(
            "border-red-200 bg-red-50 text-red-950 dark:border-red-900/60 dark:bg-red-950 dark:text-red-100",
            "[&_[data-description]]:text-red-700 dark:[&_[data-description]]:text-red-300"
          ),
          info: cn(
            "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900/60 dark:bg-sky-950 dark:text-sky-100",
            "[&_[data-description]]:text-sky-700 dark:[&_[data-description]]:text-sky-300"
          ),
          warning: cn(
            "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/60 dark:bg-amber-950 dark:text-amber-100",
            "[&_[data-description]]:text-amber-700 dark:[&_[data-description]]:text-amber-300"
          ),
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
