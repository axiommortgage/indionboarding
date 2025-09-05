"use client";

import * as React from "react";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

interface Branch {
  id: string;
  city: string;
  address: string;
  province: string;
  postal: string;
  provinceLicenseNumber?: string;
}

interface AddressInfo {
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

interface AddressSelectProps {
  branches: Branch[] | null;
  onAddressSelect: (address: AddressInfo) => void;
  value?: string;
  className?: string;
}

export function AddressSelect({ 
  branches, 
  onAddressSelect, 
  value,
  className 
}: AddressSelectProps) {
  const [selectedValue, setSelectedValue] = React.useState(value || "");

  const handleValueChange = (selectedCity: string) => {
    setSelectedValue(selectedCity);
    
    if (selectedCity && selectedCity !== "select" && branches) {
      const selectedBranch = branches.find(
        branch => branch.city.toLowerCase() === selectedCity.toLowerCase()
      );
      
      if (selectedBranch) {
        onAddressSelect({
          address: selectedBranch.address,
          city: selectedBranch.city,
          province: selectedBranch.province,
          postalCode: selectedBranch.postal,
        });
      }
    }
  };

  const formatCityName = (city: string) => {
    const result = city.replace(/([A-Z])/g, ' $1');
    return result.charAt(0).toUpperCase() + result.slice(1);
  };

  const formatSelectItem = (branch: Branch) => {
    const formattedCity = formatCityName(branch.city);
    const license = branch.provinceLicenseNumber && branch.provinceLicenseNumber.length > 0
      ? `#${branch.provinceLicenseNumber}`
      : 'NA';
    return `${formattedCity} - License: ${license}`;
  };

  if (!branches) {
    return (
      <div className={className}>
        <Label htmlFor="address">Select an Indi Branch</Label>
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Loading..." />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className={className}>
      <Label htmlFor="address">Select an Indi Branch</Label>
      <Select value={selectedValue} onValueChange={handleValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a branch" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="select">Select</SelectItem>
          {branches.map((branch, index) => {
            const formattedCity = formatCityName(branch.city);
            return (
              <SelectItem 
                key={`${branch.id || branch.city}-${index}`} 
                value={formattedCity}
              >
                {formatSelectItem(branch)}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
