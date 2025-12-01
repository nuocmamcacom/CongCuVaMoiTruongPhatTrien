import React, { useState } from 'react';
import './Input.scss';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);
  
  const handleChange = (e) => {
    setHasValue(!!e.target.value);
    onChange?.(e);
  };

  const inputClass = [
    'input',
    isFocused && 'input--focused',
    error && 'input--error',
    disabled && 'input--disabled',
    hasValue && 'input--has-value',
    fullWidth && 'input--full-width',
    className
  ].filter(Boolean).join(' ');

  const containerClass = [
    'input-container',
    fullWidth && 'input-container--full-width'
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      {label && (
        <label className="input__label">
          {label}
          {required && <span className="input__required">*</span>}
        </label>
      )}
      
      <div className="input__wrapper">
        <input
          type={type}
          className={inputClass}
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          {...props}
        />
      </div>
      
      {error && (
        <span className="input__error">{error}</span>
      )}
    </div>
  );
};

export default Input;