import React, { useState } from 'react';
import { SingleChoice } from '../Questions';

interface ScreeningBlockProps {
  onComplete: () => void;
  onScreenOut: () => void;
  saveResponse: (questionId: string, value: string) => void;
}

export function ScreeningBlock({ onComplete, onScreenOut, saveResponse }: ScreeningBlockProps) {
  const [step, setStep] = useState(0);
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');

  const handleQ1Change = (value: string) => {
    setQ1(value);
    saveResponse('Q1', value);
  };

  const handleQ2Change = (value: string) => {
    setQ2(value);
    saveResponse('Q2', value);
  };

  const handleNext = () => {
    if (step === 0) {
      if (q1 === 'no') {
        onScreenOut();
        return;
      }
      setStep(1);
    } else if (step === 1) {
      if (q2 === 'no') {
        onScreenOut();
        return;
      }
      onComplete();
    }
  };

  const canProceed = step === 0 ? q1 !== '' : q2 !== '';

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-byu-dark mb-2">Welcome to the Survey</h1>
        <p className="text-byu-gray">Please answer a few screening questions to begin.</p>
      </div>

      {step === 0 && (
        <SingleChoice
          question="Are you 18 years of age or older?"
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]}
          value={q1}
          onChange={handleQ1Change}
          required
        />
      )}

      {step === 1 && (
        <SingleChoice
          question="Are you currently a BYU student?"
          options={[
            { value: 'yes', label: 'Yes' },
            { value: 'no', label: 'No' },
          ]}
          value={q2}
          onChange={handleQ2Change}
          required
        />
      )}

      <button
        onClick={handleNext}
        disabled={!canProceed}
        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
          canProceed
            ? 'bg-byu-navy text-white hover:bg-byu-royal'
            : 'bg-gray-200 text-byu-gray cursor-not-allowed'
        }`}
      >
        Continue
      </button>
    </div>
  );
}
