"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({ 
  value, 
  className, 
  showLabel = true, 
  label = "Onboarding Progress" 
}: ProgressBarProps) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (isNaN(value)) {
      setIsLoading(true);
      return;
    }
    
    setIsLoading(false);
    setDisplayValue(Math.min(Math.max(value, 0), 100));
  }, [value]);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-foreground">{label}</h3>
          <span className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${displayValue}%`}
          </span>
        </div>
      )}
      <div className="w-full bg-muted rounded-full h-2">
        {/* <div
          className={cn(
            "h-2 rounded-full transition-all duration-500 ease-out",
            isLoading 
              ? "bg-muted-foreground animate-pulse" 
              : "bg-primary",
            displayValue === 100 && "bg-green-500"
          )}
          style={{ width: isLoading ? "30%" : `${displayValue}%` }}
        /> */}
      </div>
    </div>
  );
}
