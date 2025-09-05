"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/shared/ui/separator";

interface FormSectionTitleProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
  className?: string;
}

export function FormSectionTitle({
  title,
  subtitle,
  description,
  icon,
  color,
  className,
}: FormSectionTitleProps) {
  return (
    <header className={cn("mb-6", className)}>
      <h3 
        className="text-xl font-semibold flex items-center gap-2 mb-2"
        style={color ? { color } : {}}
      >
        {icon}
        {title}
      </h3>
      {subtitle && (
        <h4 className="text-lg text-muted-foreground mb-2">{subtitle}</h4>
      )}
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      <Separator className="mb-4" />
    </header>
  );
}
