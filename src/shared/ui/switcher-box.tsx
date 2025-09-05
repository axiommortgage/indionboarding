"use client";

import * as React from "react";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { cn } from "@/lib/utils";

interface SwitcherBoxProps {
  id: string;
  name: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  labelPos?: "top" | "left" | "right";
  yesno?: boolean;
  description?: string;
  className?: string;
}

export function SwitcherBox({
  id,
  name,
  checked,
  disabled = false,
  onChange,
  label,
  labelPos = "left",
  yesno = false,
  description,
  className,
}: SwitcherBoxProps) {
  const handleChange = (newChecked: boolean) => {
    onChange(newChecked);
  };

  const renderYesNoSwitch = () => (
    <div className="relative inline-flex items-center">
      <div className="flex bg-muted rounded-lg p-1">
        <div
          className={cn(
            "px-3 py-1 text-sm font-medium rounded transition-colors",
            checked
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground"
          )}
        >
          Yes
        </div>
        <div
          className={cn(
            "px-3 py-1 text-sm font-medium rounded transition-colors",
            !checked
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground"
          )}
        >
          No
        </div>
      </div>
      <Switch
        id={id}
        name={name}
        checked={checked}
        onCheckedChange={handleChange}
        disabled={disabled}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
    </div>
  );

  const renderRegularSwitch = () => (
    <Switch
      id={id}
      name={name}
      checked={checked}
      onCheckedChange={handleChange}
      disabled={disabled}
    />
  );

  const switchElement = yesno ? renderYesNoSwitch() : renderRegularSwitch();

  const labelElement = label && (
    <Label 
      htmlFor={id} 
      className={cn(
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {label}
    </Label>
  );

  const descriptionElement = description && (
    <p className="text-sm text-muted-foreground mt-1">{description}</p>
  );

  if (labelPos === "top") {
    return (
      <div className={cn("space-y-2", className)}>
        {labelElement}
        <div className="flex flex-col space-y-2">
          {switchElement}
          {descriptionElement}
        </div>
      </div>
    );
  }

  if (labelPos === "right") {
    return (
      <div className={cn("flex items-center space-x-2", className)}>
        {switchElement}
        <div className="flex flex-col">
          {labelElement}
          {descriptionElement}
        </div>
      </div>
    );
  }

  // Default: left position
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className="flex flex-col">
        {labelElement}
        {descriptionElement}
      </div>
      {switchElement}
    </div>
  );
}
