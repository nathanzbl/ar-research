import React from 'react';

interface TextInputProps {
  question: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
}

export function TextInput({
  question,
  value,
  onChange,
  placeholder,
  multiline = true,
  required,
}: TextInputProps) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-byu-dark">
        {question}
        {required && <span className="text-byu-error ml-1">*</span>}
      </p>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-byu-navy/20 focus:border-byu-navy resize-none transition-colors"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-byu-navy/20 focus:border-byu-navy transition-colors"
        />
      )}
    </div>
  );
}
