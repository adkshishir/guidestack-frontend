'use client';

import React from 'react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';

interface FormFieldWrapperProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  children: (field: ControllerRenderProps<FieldValues, string>) => React.ReactNode;
}

export function FormFieldWrapper({
  name,
  label,
  description,
  required,
  children,
}: FormFieldWrapperProps) {
  return (
    <FormField
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>{children(field)}</FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface TextInputProps {
  name: string;
  label?: string;
  description?: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

export function TextInput({
  name,
  label,
  description,
  type = 'text',
  placeholder,
  required,
}: TextInputProps) {
  return (
    <FormFieldWrapper name={name} label={label} description={description} required={required}>
      {(field) => (
        <Input
          {...field}
          type={type}
          placeholder={placeholder}
          value={field.value || ''}
        />
      )}
    </FormFieldWrapper>
  );
}

interface TextareaInputProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
}

export function TextareaInput({
  name,
  label,
  description,
  placeholder,
  rows = 4,
  required,
}: TextareaInputProps) {
  return (
    <FormFieldWrapper name={name} label={label} description={description} required={required}>
      {(field) => (
        <Textarea
          {...field}
          placeholder={placeholder}
          rows={rows}
          value={field.value || ''}
        />
      )}
    </FormFieldWrapper>
  );
}

interface SelectInputProps {
  name: string;
  label?: string;
  description?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  required?: boolean;
}

export function SelectInput({
  name,
  label,
  description,
  placeholder,
  options,
  required,
}: SelectInputProps) {
  return (
    <FormFieldWrapper name={name} label={label} description={description} required={required}>
      {(field) => (
        <Select onValueChange={field.onChange} value={field.value || ''}>
          <SelectTrigger>
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
      )}
    </FormFieldWrapper>
  );
}

