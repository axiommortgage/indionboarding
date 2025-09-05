import React from 'react';
import CurrencyInput from 'react-currency-input-field';
import { cn } from '@/shared/lib/utils';

interface CurrencyInputFieldProps {
  className?: string;
  value?: number;
  onValueChange?: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  // Add other props as needed
}

export function CurrencyInputField({ 
  className, 
  value, 
  onValueChange, 
  placeholder,
  disabled,
  id,
  name,
  ...props 
}: CurrencyInputFieldProps) {
  return (
    <CurrencyInput
      id={id}
      name={name}
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      )}
      value={value}
      onValueChange={onValueChange}
      placeholder={placeholder}
      disabled={disabled}
      intlConfig={{ locale: 'en-CA', currency: 'CAD' }}
      groupSeparator=","
      decimalSeparator="."
      prefix="$"
      allowDecimals
      decimalsLimit={2}
      disableAbbreviations
      {...props}
    />
  );
}
