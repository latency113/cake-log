// src/components/common/SelectField.tsx
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label"; // Assuming shadcn/ui Label component is available

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id?: string;
  label: string;
  name: string;
  value: string;
  options: SelectOption[];
  onChange: (newValue: string) => void; // Changed to explicitly string
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string; // Add error prop
}

const SelectField: React.FC<SelectFieldProps> = ({
  id,
  label,
  name,
  value,
  options,
  onChange,
  placeholder,
  className,
  disabled,
  required,
  error,
}) => {
  return (
    <div className={className}>
      <Label htmlFor={id || name} className="mb-2 block text-sm font-medium text-foreground">
        {label}
      </Label>
      <Select
        value={value}
        onValueChange={(newValue) => onChange(newValue)} // shadcn/ui Select passes string directly
        disabled={disabled}
        required={required}
        name={name}
      >
        <SelectTrigger id={id || name} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default SelectField;