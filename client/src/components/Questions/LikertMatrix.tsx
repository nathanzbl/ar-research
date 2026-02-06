import React from 'react';
import { LikertItem } from '../../types/survey';

interface LikertMatrixProps {
  question: string;
  items: LikertItem[];
  scaleLabels: string[];
  values: Record<string, number>;
  onChange: (itemId: string, value: number) => void;
  required?: boolean;
}

export function LikertMatrix({
  question,
  items,
  scaleLabels,
  values,
  onChange,
  required,
}: LikertMatrixProps) {
  return (
    <div className="space-y-4">
      <p className="text-lg font-medium text-byu-dark">
        {question}
        {required && <span className="text-byu-error ml-1">*</span>}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left"></th>
              {scaleLabels.map((label, index) => (
                <th key={index} className="p-2 text-center text-sm font-normal text-byu-gray min-w-[80px]">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, rowIndex) => (
              <tr key={item.id} className={rowIndex % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="p-3 text-sm text-byu-dark">{item.text}</td>
                {scaleLabels.map((_, colIndex) => (
                  <td key={colIndex} className="p-2 text-center">
                    <input
                      type="radio"
                      name={`likert-${item.id}`}
                      value={colIndex + 1}
                      checked={values[item.id] === colIndex + 1}
                      onChange={() => onChange(item.id, colIndex + 1)}
                      className="h-4 w-4 text-byu-navy focus:ring-byu-navy border-gray-300"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
