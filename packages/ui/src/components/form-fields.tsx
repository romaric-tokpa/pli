// TextField, SearchField, Select, Checkbox, Switch — parité stricte avec le wireframe.

import { useId, type ChangeEvent, type ReactNode } from 'react';
import { Icon, type IconName } from './icon.js';
import { cn } from '../lib/cn.js';

// -----------------------------------------------------------------------------
// TextField
// -----------------------------------------------------------------------------
export interface TextFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  icon?: IconName;
  type?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  required?: boolean;
  autoFocus?: boolean;
  name?: string;
  suffix?: string;
}

export function TextField({
  label,
  hint,
  error,
  icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  id,
  className = '',
  required,
  autoFocus,
  name,
  suffix,
}: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? `f-${autoId}`;
  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-[13px] font-medium text-encre mb-1.5">
          {label}
          {required && <span className="text-erreur ml-0.5">*</span>}
        </label>
      )}
      <div
        className={cn(
          'flex items-center gap-2 h-10 px-3 bg-white rounded-md border transition',
          error ? 'border-erreur' : 'border-bordure focus-within:border-encre',
        )}
      >
        {icon && <Icon name={icon} size={16} className="text-texte-secondaire shrink-0" />}
        <input
          id={inputId}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          name={name}
          autoFocus={autoFocus}
          required={required}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-[14px] text-encre placeholder:text-[#9AA3B2]"
        />
        {suffix && <span className="text-[13px] text-texte-secondaire shrink-0">{suffix}</span>}
      </div>
      {hint && !error && <p className="mt-1 text-[12px] text-texte-secondaire">{hint}</p>}
      {error && (
        <p className="mt-1 text-[12px] text-erreur flex items-center gap-1">
          <Icon name="CircleAlert" size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// SearchField
// -----------------------------------------------------------------------------
export type SearchFieldSize = 'sm' | 'md';

export interface SearchFieldProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement> | { target: { value: string } }) => void;
  placeholder?: string;
  className?: string;
  size?: SearchFieldSize;
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Rechercher…',
  className = '',
  size = 'md',
}: SearchFieldProps) {
  const h = size === 'sm' ? 'h-9' : 'h-10';
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 bg-white rounded-md border border-bordure focus-within:border-encre transition',
        h,
        className,
      )}
    >
      <Icon name="Search" size={16} className="text-texte-secondaire" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-[#9AA3B2]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange({ target: { value: '' } })}
          className="text-texte-secondaire hover:text-encre"
          aria-label="Effacer"
        >
          <Icon name="X" size={14} />
        </button>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Select
// -----------------------------------------------------------------------------
export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  className?: string;
  placeholder?: string;
  size?: SearchFieldSize;
  icon?: IconName;
}

export function Select({
  label,
  value,
  onChange,
  options,
  className = '',
  placeholder,
  size = 'md',
  icon,
}: SelectProps) {
  const h = size === 'sm' ? 'h-9 text-[13px]' : 'h-10 text-[14px]';
  return (
    <div className={className}>
      {label && <label className="block text-[13px] font-medium text-encre mb-1.5">{label}</label>}
      <div
        className={cn(
          'relative flex items-center bg-white border border-bordure rounded-md px-3 hover:border-[#B8C0CE] focus-within:border-encre transition',
          h,
        )}
      >
        {icon && <Icon name={icon} size={14} className="text-texte-secondaire mr-2" />}
        <select
          value={value}
          onChange={onChange}
          className="appearance-none bg-transparent outline-none w-full pr-6 text-encre"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <Icon
          name="ChevronDown"
          size={14}
          className="text-texte-secondaire absolute right-3 pointer-events-none"
        />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Checkbox
// -----------------------------------------------------------------------------
export interface CheckboxProps {
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  label?: ReactNode;
  id?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, id, disabled }: CheckboxProps) {
  const autoId = useId();
  const cid = id ?? `c-${autoId}`;
  return (
    <label
      htmlFor={cid}
      className={cn('inline-flex items-center gap-2 cursor-pointer', disabled && 'opacity-50')}
    >
      <span
        className={cn(
          'inline-flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border transition',
          checked ? 'bg-encre border-encre' : 'bg-white border-[#B8C0CE]',
        )}
      >
        {checked && <Icon name="Check" size={12} className="text-white" strokeWidth={3} />}
      </span>
      <input
        id={cid}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="sr-only"
      />
      {label && <span className="text-[14px] text-encre">{label}</span>}
    </label>
  );
}

// -----------------------------------------------------------------------------
// Switch
// -----------------------------------------------------------------------------
export interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: ReactNode;
  hint?: ReactNode;
}

export function Switch({ checked, onChange, label, hint }: SwitchProps) {
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer py-1">
      <div className="flex-1">
        {label && <div className="text-[14px] text-encre font-medium">{label}</div>}
        {hint && <div className="text-[12px] text-texte-secondaire">{hint}</div>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 rounded-full transition focus-ring',
          checked ? 'bg-encre' : 'bg-[#CBD2DC]',
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 mt-0.5 bg-white rounded-full shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          )}
        />
      </button>
    </label>
  );
}
