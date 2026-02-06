import React from 'react';
import { QuestionOption } from '../../types/survey';

interface MultiChoiceProps {
  question: string;
  options: QuestionOption[];
  values: string[];
  onChange: (values: string[]) => void;
  required?: boolean;
}

export function MultiChoice({ question, options, values, onChange, required }: MultiChoiceProps) {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      onChange([...values, optionValue]);
    } else {
      onChange(values.filter((v) => v !== optionValue));
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-gray-900">
        {question}
        {required && <span className="text-red-500 ml-1">*</span>}
      </p>
      <p className="text-sm text-gray-500">Select all that apply</p>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
              values.includes(option.value)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              value={option.value}
              checked={values.includes(option.value)}
              onChange={(e) => handleChange(option.value, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 rounded"
            />
            <span className="ml-3 text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
