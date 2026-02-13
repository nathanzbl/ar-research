import React, { useState } from 'react';
import { TrueFalse } from '../Questions';

interface MenuPerceptionsProps {
  onComplete: () => void;
  onBack: () => void;
  saveResponse: (questionId: string, value: string) => void;
  startAtEnd?: boolean;
}

export function MenuPerceptions({ onComplete, onBack, saveResponse, startAtEnd }: MenuPerceptionsProps) {
  const [step, setStep] = useState(startAtEnd ? 2 : 0);
  const [q11, setQ11] = useState<boolean | null>(null);
  const [q12, setQ12] = useState<boolean | null>(null);
  const [q13, setQ13] = useState<boolean | null>(null);

  const handleNext = () => {
    if (step === 0) {
      saveResponse('Q11', q11 ? 'true' : 'false');
      setStep(1);
    } else if (step === 1) {
      saveResponse('Q12', q12 ? 'true' : 'false');
      setStep(2);
    } else if (step === 2) {
      saveResponse('Q13', q13 ? 'true' : 'false');
      onComplete();
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return q11 !== null;
      case 1: return q12 !== null;
      case 2: return q13 !== null;
      default: return false;
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      {step === 0 && (
        <TrueFalse
          question="This menu felt realistic for a real restaurant."
          value={q11}
          onChange={setQ11}
          required
        />
      )}

      {step === 1 && (
        <TrueFalse
          question="This menu felt innovative."
          value={q12}
          onChange={setQ12}
          required
        />
      )}

      {step === 2 && (
        <TrueFalse
          question="I felt engaged while using this menu."
          value={q13}
          onChange={setQ13}
          required
        />
      )}

      <div className="flex gap-4">
        <button
          onClick={handleBack}
          className="flex-1 bg-gray-100 text-byu-dark py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors border border-gray-300"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
            canProceed()
              ? 'bg-byu-navy text-white hover:bg-byu-royal'
              : 'bg-gray-200 text-byu-gray cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
