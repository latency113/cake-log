// src/components/common/InputField.tsx
import React from 'react';
import type { InputChangeEvent } from '../../types';

interface InputFieldProps {
  id?: string; // Added id prop
  label?: string;
  name?: string;
  value: string | number;
  onChange: (e: InputChangeEvent) => void;
  type?: "number" | "tel" | "text" | "date" | "datetime-local" | "password";
  placeholder?: string;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  min?: number;
  maxlength?: number;
  disabled?: boolean;
  required?: boolean;
  errorMessage?:string
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; // Add this line
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type,
  placeholder,
  className = 'mb-4',
  labelClassName = 'block text-sm font-medium text-foreground',
  inputClassName = 'mt-1 block w-full rounded-md border-input shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 bg-background text-foreground',
  maxlength,
  min,
  disabled,
  required,
  errorMessage,
  onBlur, // Destructure the onBlur prop
}) => {
  return (
    <div className={className}>
      <label htmlFor={name} className={labelClassName}>
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${inputClassName} ${disabled ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''}`}
        min={min}
        disabled={disabled}
        required={required}
        maxLength={maxlength} // Use max instead of maxlength for HTML input
        onBlur={onBlur} // Pass the onBlur prop to the input element
      />
      {errorMessage && <div className="text-red-500 text-sm mt-2">{errorMessage}</div>}
    </div>
  );
};

export default InputField;