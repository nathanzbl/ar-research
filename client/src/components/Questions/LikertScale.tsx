import React from 'react';

interface LikertScaleProps {
  question: string;
  scaleLabels: string[];
  value: number | null;
  onChange: (value: number) => void;
  required?: boolean;
}

export function LikertScale({ question, scaleLabels, value, onChange, required }: LikertScaleProps) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-gray-900">
        {question}
        {required && <span className="text-red-500 ml-1">*</span>}
      </p>
      <div className="flex justify-between items-center gap-2">
        {scaleLabels.map((label, index) => (
          <label
            key={index}
            className="flex flex-col items-center cursor-pointer"
          >
            <input
              type="radio"
              name="likert"
              value={index + 1}
              checked={value === index + 1}
              onChange={() => onChange(index + 1)}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500"
            />
            <span className="mt-2 text-xs text-gray-600 text-center max-w-[80px]">
              {label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
