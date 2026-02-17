import React, { useState } from 'react';
import { TextInput } from '../Questions';

interface OpenFeedbackProps {
  onComplete: () => void;
  onBack: () => void;
  saveResponse: (questionId: string, value: string) => void;
  startAtEnd?: boolean;
}

export function OpenFeedback({ onComplete, onBack, saveResponse, startAtEnd }: OpenFeedbackProps) {
  const [step, setStep] = useState(startAtEnd ? 2 : 0);
  const [q14, setQ14] = useState('');
  const [q15, setQ15] = useState('');
  const [q16, setQ16] = useState('');

  const handleNext = () => {
    if (step === 0) {
      saveResponse('Q14', q14);
      setStep(1);
    } else if (step === 1) {
      saveResponse('Q15', q15);
      setStep(2);
    } else if (step === 2) {
      saveResponse('Q16', q16);
      onComplete();
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return q14.trim() !== '';
      case 1: return q15.trim() !== '';
      case 2: return q16.trim() !== '';
      default: return false;
    }
  };

  const handleSkip = () => {
    const questionIds = ['Q14', 'Q15', 'Q16'];
    saveResponse(questionIds[step], 'SKIPPED');
    if (step === 2) {
      onComplete();
    } else {
      setStep(step + 1);
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
        <TextInput
          question="What did you like most about this menu?"
          value={q14}
          onChange={setQ14}
          placeholder="Share your thoughts..."
          required
        />
      )}

      {step === 1 && (
        <TextInput
          question="What did you find confusing or frustrating?"
          value={q15}
          onChange={setQ15}
          placeholder="Share your suggestions..."
          required
        />
      )}

      {step === 2 && (
        <TextInput
          question="How does this menu compare to other menus you've used in restaurants?"
          value={q16}
          onChange={setQ16}
          placeholder="Share any other thoughts..."
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
          onClick={handleSkip}
          className="flex-1 py-3 px-6 rounded-lg font-medium transition-colors text-byu-gray hover:text-byu-dark hover:bg-gray-100 border border-gray-300"
        >
          Skip
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
