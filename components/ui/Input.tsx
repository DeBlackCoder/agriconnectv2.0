'use client';

import { InputHTMLAttributes, forwardRef, useState, ChangeEvent } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  validateOnChange?: boolean;
  minLength?: number;
  maxLength?: number;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    icon, 
    className = '', 
    validateOnChange = true,
    required = false,
    type = 'text',
    minLength,
    maxLength,
    min,
    max,
    pattern,
    onChange,
    value,
    ...props 
  }, ref) => {
    const [internalError, setInternalError] = useState<string>('');

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Instant validation
      if (validateOnChange) {
        // Check for null/undefined/empty when required
        if (required && !inputValue.trim()) {
          setInternalError('This field is required');
        }
        // Check minLength
        else if (minLength && inputValue.length > 0 && inputValue.length < minLength) {
          setInternalError(`Minimum ${minLength} characters required`);
        }
        // Check maxLength
        else if (maxLength && inputValue.length > maxLength) {
          setInternalError(`Maximum ${maxLength} characters allowed`);
          return; // Prevent input beyond max
        }
        // Check numeric min/max
        else if (type === 'number') {
          const numValue = Number(inputValue);
          if (min !== undefined && numValue < Number(min)) {
            setInternalError(`Minimum value is ${min}`);
          } else if (max !== undefined && numValue > Number(max)) {
            setInternalError(`Maximum value is ${max}`);
          } else {
            setInternalError('');
          }
        }
        // Check email format
        else if (type === 'email' && inputValue.length > 0) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(inputValue)) {
            setInternalError('Invalid email format');
          } else {
            setInternalError('');
          }
        }
        // Check pattern
        else if (pattern && inputValue.length > 0) {
          const regex = new RegExp(pattern);
          if (!regex.test(inputValue)) {
            setInternalError('Invalid format');
          } else {
            setInternalError('');
          }
        }
        else {
          setInternalError('');
        }
      }

      // Call parent onChange
      if (onChange) {
        onChange(e);
      }
    };

    const displayError = error || internalError;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium mb-2 text-foreground">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            value={value ?? ''} // Prevent null/undefined
            required={required}
            minLength={minLength}
            maxLength={maxLength}
            min={min}
            max={max}
            pattern={pattern}
            onChange={handleChange}
            className={`
              w-full px-4 py-3 rounded-xl
              glass border border-white/10
              bg-transparent text-foreground
              placeholder:text-muted
              focus:outline-none focus:ring-2 focus:ring-primary-neural/50
              focus:border-primary-neural/50
              transition-all duration-300
              ${icon ? 'pl-10' : ''}
              ${displayError ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
          {displayError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        {displayError && (
          <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
            <span className="inline-block w-4 h-4 rounded-full bg-red-500/20 text-red-500 text-xs flex items-center justify-center font-bold">!</span>
            {displayError}
          </p>
        )}
        {helperText && !displayError && (
          <p className="mt-1 text-sm text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
