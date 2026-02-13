import React, { useState } from 'react';
import { LikertMatrix, Slider } from '../Questions';

interface ExperienceRatingsProps {
  onComplete: () => void;
  onBack: () => void;
  saveResponse: (questionId: string, value: string | number) => void;
  startAtEnd?: boolean;
}

const usabilityItems = [
  { id: 'Q8a', text: 'This menu was easy to navigate' },
  { id: 'Q8b', text: 'I understood how to use this menu without instructions.' },
  { id: 'Q8c', text: 'I found the design of the menu helpful in making my decision.' },
  { id: 'Q8d', text: 'I felt confident in my menu choice.' },
  { id: 'Q8e', text: 'I was sure about what I wanted to order.' },
  { id: 'Q8f', text: 'The menu helped me feel more certain in my decision.' },
];

const satisfactionItems = [
  { id: 'Q9a', text: 'I enjoyed using this menu format.' },
  { id: 'Q9b', text: 'I felt interested while exploring the menu.' },
  { id: 'Q9c', text: 'I would prefer this type of menu in a real restaurant.' },
  { id: 'Q9d', text: 'I would consider ordering from this menu in real life.' },
  { id: 'Q9e', text: 'I am more likely to try new menu items with this kind of menu.' },
  { id: 'Q9f', text: 'I would return to a restaurant that used a menu like this.' },
];

const scaleLabels = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];

export function ExperienceRatings({ onComplete, onBack, saveResponse, startAtEnd }: ExperienceRatingsProps) {
  const [step, setStep] = useState(startAtEnd ? 2 : 0);
  const [usabilityRatings, setUsabilityRatings] = useState<Record<string, number>>({});
  const [satisfactionRatings, setSatisfactionRatings] = useState<Record<string, number>>({});
  const [confidence, setConfidence] = useState(50);

  const handleUsabilityChange = (itemId: string, value: number) => {
    setUsabilityRatings((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleSatisfactionChange = (itemId: string, value: number) => {
    setSatisfactionRatings((prev) => ({ ...prev, [itemId]: value }));
  };

  const handleNext = () => {
    if (step === 0) {
      Object.entries(usabilityRatings).forEach(([id, value]) => {
        saveResponse(id, String(value));
      });
      setStep(1);
    } else if (step === 1) {
      Object.entries(satisfactionRatings).forEach(([id, value]) => {
        saveResponse(id, String(value));
      });
      setStep(2);
    } else if (step === 2) {
      saveResponse('Q10', confidence);
      onComplete();
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0:
        return usabilityItems.every((item) => usabilityRatings[item.id] !== undefined);
      case 1:
        return satisfactionItems.every((item) => satisfactionRatings[item.id] !== undefined);
      case 2:
        return true;
      default:
        return false;
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
        <LikertMatrix
          question="Please rate your agreement with the following statements about the menu usability:"
          items={usabilityItems}
          scaleLabels={scaleLabels}
          values={usabilityRatings}
          onChange={handleUsabilityChange}
          required
        />
      )}

      {step === 1 && (
        <LikertMatrix
          question="Please rate your agreement with the following statements about your overall satisfaction:"
          items={satisfactionItems}
          scaleLabels={scaleLabels}
          values={satisfactionRatings}
          onChange={handleSatisfactionChange}
          required
        />
      )}

      {step === 2 && (
        <Slider
          question="How confident are you in the menu choice you made?"
          min={0}
          max={100}
          minLabel="Not at all confident"
          middleLabel="Somewhat confident"
          maxLabel="Perfectly confident"
          value={confidence}
          onChange={setConfidence}
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
