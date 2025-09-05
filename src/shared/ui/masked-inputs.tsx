"use client";

import * as React from "react";
import { Input } from "@/shared/ui/input";
import { cn } from "@/lib/utils";

interface MaskedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: (RegExp | string)[];
  className?: string;
}

function MaskedInput({ mask, value, onChange, className, ...props }: MaskedInputProps) {
  const [displayValue, setDisplayValue] = React.useState(value?.toString() || "");

  const applyMask = (inputValue: string) => {
    let result = "";
    let valueIndex = 0;
    
    for (let i = 0; i < mask.length && valueIndex < inputValue.length; i++) {
      const maskChar = mask[i];
      const inputChar = inputValue[valueIndex];
      
      if (typeof maskChar === "string") {
        // Fixed character in mask
        result += maskChar;
      } else if (maskChar instanceof RegExp) {
        // Pattern to match
        if (maskChar.test(inputChar)) {
          result += inputChar;
          valueIndex++;
        } else {
          break;
        }
      }
    }
    
    return result;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^\d]/g, ""); // Remove non-digits
    const maskedValue = applyMask(rawValue);
    
    setDisplayValue(maskedValue);
    
    if (onChange) {
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: maskedValue,
        },
      };
      onChange(syntheticEvent);
    }
  };

  React.useEffect(() => {
    if (value !== undefined) {
      const rawValue = value.toString().replace(/[^\d]/g, "");
      setDisplayValue(applyMask(rawValue));
    }
  }, [value]);

  return (
    <Input
      {...props}
      value={displayValue}
      onChange={handleChange}
      className={className}
    />
  );
}

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'mask'> {
  className?: string;
}

export function PhoneInput({ className, ...props }: PhoneInputProps) {
  const phoneMask = [/[1-9]/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
  
  return (
    <MaskedInput
      mask={phoneMask}
      placeholder="123-456-7890"
      className={className}
      {...props}
    />
  );
}

interface SinInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'mask'> {
  className?: string;
}

export function SinInput({ className, ...props }: SinInputProps) {
  const sinMask = [/[1-9]/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/, ' ', /\d/, /\d/, /\d/];
  
  return (
    <MaskedInput
      mask={sinMask}
      placeholder="123 456 789"
      className={className}
      {...props}
    />
  );
}
