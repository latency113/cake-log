import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react"; // Import for the dropdown icon
import { cn } from "@/lib/utils"; // Assuming you have a cn utility for class merging

interface AutocompleteOption {
  value: string;
  label: string;
}

interface TeacherAutocompleteProps {
  value: string; // The currently selected value
  onChange: (value: string) => void; // Callback when value changes (input or selection)
  onBlur?: () => void;
  options: AutocompleteOption[]; // Dynamic options for autocomplete
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const TeacherAutocomplete: React.FC<TeacherAutocompleteProps> = ({
  value,
  onChange,
  onBlur,
  options,
  placeholder = "เลือก...",
  className,
  disabled,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredSuggestions = useMemo(() => {
    if (!inputValue) return options; // Show all options if input is empty
    const lowerCaseInput = inputValue.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(lowerCaseInput)
    );
  }, [inputValue, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (option: AutocompleteOption) => {
    setInputValue(option.label);
    onChange(option.label);
    setShowSuggestions(false);
    inputRef.current?.focus(); // Keep focus on input after selection
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow click on suggestion
    setTimeout(() => {
      setShowSuggestions(false);
      // Ensure the input value matches an existing option, otherwise clear it or set to previous valid value
      const matchedOption = options.find(opt => opt.label === inputValue);
      if (!matchedOption && inputValue !== "") {
        // Optionally revert to a valid previous value or clear
        // For now, if no match, keep the input value as is but mark as invalid by parent
        // or clear it if that's desired behavior.
      } else if (matchedOption) {
        setInputValue(matchedOption.label); // Ensure exact match
        onChange(matchedOption.label);
      }

      if (onBlur) {
        onBlur();
      }
    }, 100);
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  return (
    <div className={cn("relative", className)} ref={wrapperRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pr-8"
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50 pointer-events-none" />
      </div>
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md mt-1 max-h-60 overflow-y-auto">
          {filteredSuggestions.map((option) => (
            <li
              key={option.value}
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-accent hover:text-accent-foreground"
              onClick={() => handleSelectSuggestion(option)}
              onMouseDown={(e) => e.preventDefault()} // Prevent blur from closing before click
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TeacherAutocomplete;

