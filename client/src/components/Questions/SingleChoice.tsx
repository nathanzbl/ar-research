import React from 'react';
import { QuestionOption } from '../../types/survey';

interface SingleChoiceProps {
  question: string;
  options: QuestionOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function SingleChoice({ question, options, value, onChange, required }: SingleChoiceProps) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-byu-dark">
        {question}
        {required && <span className="text-byu-error ml-1">*</span>}
      </p>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              value === option.value
                ? 'border-byu-navy bg-byu-navy/5'
                : 'border-gray-200 hover:border-byu-navy/30'
            }`}
          >
            <input
              type="radio"
              name="single-choice"
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              className="h-4 w-4 text-byu-navy focus:ring-byu-navy border-gray-300"
            />
            <span className="ml-3 text-byu-dark">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
