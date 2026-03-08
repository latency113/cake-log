// src/components/common/RadioGroup.tsx
import React from "react";
import type { InputChangeEvent } from "../../types";
import { RadioGroupC, RadioGroupItem } from "../ui/radio-group";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  label: string;
  name: string;
  selectedValue: string;
  options: RadioOption[];
  onChange: (e: InputChangeEvent) => void;
  className?: string;
  labelClassName?: string;
  optionClassName?: string;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  selectedValue,
  options,
  onChange,
  className = "mb-4",
  labelClassName = "block text-sm font-medium text-foreground mb-2",
  optionClassName = "flex items-center",
}) => {
  const handleValueChange = (value: string) => {
    onChange({
      target: { name: name, value: value },
    } as InputChangeEvent);
  };

  return (
    <>
      <RadioGroupC value={selectedValue} onValueChange={handleValueChange}>
        <div className={className}>
          <label className={labelClassName}>{label}</label>
          <div className="flex space-x-4">
            {options.map((option) => (
              <div key={option.value} className={optionClassName}>
                <RadioGroupItem
                  value={option.value}
                  id={`${name}-${option.value}`}
                />
                <label
                  htmlFor={`${name}-${option.value}`}
                  className="ml-2 block text-sm text-foreground cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </RadioGroupC>
    </>
  );
};

export default RadioGroup;
