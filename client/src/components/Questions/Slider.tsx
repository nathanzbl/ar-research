import React from 'react';

interface SliderProps {
  question: string;
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
  middleLabel?: string;
  value: number;
  onChange: (value: number) => void;
  required?: boolean;
}

export function Slider({
  question,
  min,
  max,
  minLabel,
  maxLabel,
  middleLabel,
  value,
  onChange,
  required,
}: SliderProps) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-byu-dark">
        {question}
        {required && <span className="text-byu-error ml-1">*</span>}
      </p>
      <div className="space-y-4">
        <div className="text-center">
          <span className="text-3xl font-bold text-byu-navy">{value}%</span>
          <p className="text-sm text-byu-gray mt-1">Confidence Level</p>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-sm text-byu-gray">
          <span>{minLabel || min}</span>
          {middleLabel && <span>{middleLabel}</span>}
          <span>{maxLabel || max}</span>
        </div>
      </div>
    </div>
  );
}
