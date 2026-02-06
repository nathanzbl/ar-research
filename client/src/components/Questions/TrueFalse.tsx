import React from 'react';

interface TrueFalseProps {
  question: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  required?: boolean;
}

export function TrueFalse({ question, value, onChange, required }: TrueFalseProps) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-byu-dark">
        {question}
        {required && <span className="text-byu-error ml-1">*</span>}
      </p>
      <div className="flex gap-4">
        <label
          className={`flex-1 flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
            value === true
              ? 'border-byu-success bg-byu-success/10'
              : 'border-gray-200 hover:border-byu-success/50'
          }`}
        >
          <input
            type="radio"
            name="true-false"
            checked={value === true}
            onChange={() => onChange(true)}
            className="sr-only"
          />
          <span className={`font-medium ${value === true ? 'text-byu-success' : 'text-byu-dark'}`}>
            True
          </span>
        </label>
        <label
          className={`flex-1 flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
            value === false
              ? 'border-byu-error bg-byu-error/10'
              : 'border-gray-200 hover:border-byu-error/50'
          }`}
        >
          <input
            type="radio"
            name="true-false"
            checked={value === false}
            onChange={() => onChange(false)}
            className="sr-only"
          />
          <span className={`font-medium ${value === false ? 'text-byu-error' : 'text-byu-dark'}`}>
            False
          </span>
        </label>
      </div>
    </div>
  );
}
