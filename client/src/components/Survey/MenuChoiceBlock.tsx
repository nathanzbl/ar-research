import React, { useState } from 'react';
import { SingleChoice, TextInput } from '../Questions';

interface MenuChoiceBlockProps {
  onComplete: () => void;
  onBack: () => void;
  saveResponse: (questionId: string, value: string | string[]) => void;
  startAtEnd?: boolean;
}

export function MenuChoiceBlock({ onComplete, onBack, saveResponse, startAtEnd }: MenuChoiceBlockProps) {
  const [step, setStep] = useState(startAtEnd ? 8 : 0);
  const [menuChoice, setMenuChoice] = useState('');
  const [familiarity, setFamiliarity] = useState('');
  const [priceInfluence, setPriceInfluence] = useState('');
  const [flavorInfluence, setFlavorInfluence] = useState('');
  const [pastExperience, setPastExperience] = useState('');
  const [percentageExplored, setPercentageExplored] = useState('50');
  const [decisionTime, setDecisionTime] = useState('');
  const [happinessConfidence, setHappinessConfidence] = useState('');
  const [overallExperience, setOverallExperience] = useState('');

  const influenceOptions = [
    { value: '1', label: 'Not at all' },
    { value: '2', label: 'Slightly' },
    { value: '3', label: 'Moderately' },
    { value: '4', label: 'Very much' },
    { value: '5', label: 'Extremely' },
  ];

  const familiarityOptions = [
    { value: '1', label: 'Very Familiar' },
    { value: '2', label: 'Somewhat Familiar' },
    { value: '3', label: 'Completely new to me' },


  ];

  const timeOptions = [
    { value: 'less_than_30s', label: 'Less than 30 seconds' },
    { value: '30s_to_1min', label: '30 seconds to 1 minute' },
    { value: '1_to_2min', label: '1 to 2 minutes' },
    { value: '2_to_5min', label: '2 to 5 minutes' },
    { value: 'more_than_5min', label: 'More than 5 minutes' },
  ];

  const confidenceOptions = [
    { value: '1', label: 'Not at all confident' },
    { value: '2', label: 'Slightly confident' },
    { value: '3', label: 'Moderately confident' },
    { value: '4', label: 'Very confident' },
    { value: '5', label: 'Extremely confident' },
  ];

  const handleNext = () => {
    switch (step) {
      case 0:
        saveResponse('Q3', menuChoice);
        setStep(1);
        break;
      case 1:
        saveResponse('Q3b', familiarity);
        setStep(2);
        break;
      case 2:
        saveResponse('Q4', priceInfluence);
        setStep(3);
        break;
      case 3:
        saveResponse('Q5', flavorInfluence);
        setStep(4);
        break;
      case 4:
        saveResponse('Q6', pastExperience);
        setStep(5);
        break;
      case 5:
        saveResponse('Q6b', percentageExplored);
        setStep(6);
        break;
      case 6:
        saveResponse('Q6c', decisionTime);
        setStep(7);
        break;
      case 7:
        saveResponse('Q6d', happinessConfidence);
        setStep(8);
        break;
      case 8:
        saveResponse('Q6e', overallExperience);
        onComplete();
        break;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return menuChoice.trim() !== '';
      case 1: return familiarity !== '';
      case 2: return priceInfluence !== '';
      case 3: return flavorInfluence !== '';
      case 4: return pastExperience !== '';
      case 5: return percentageExplored.trim() !== '';
      case 6: return decisionTime !== '';
      case 7: return happinessConfidence !== '';
      case 8: return overallExperience.trim() !== '';
      default: return false;
    }
  };

  const handleSkip = () => {
    const questionIds = ['Q3', 'Q3b', 'Q4', 'Q5', 'Q6', 'Q6b', 'Q6c', 'Q6d', 'Q6e'];
    saveResponse(questionIds[step], 'SKIPPED');
    if (step === 8) {
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
        <div className="space-y-4">
          <p className="text-lg font-medium text-byu-dark">
            Based on the menu you just viewed, which item would you most likely order?
            <span className="text-byu-error ml-1">*</span>
          </p>
          <select
            value={menuChoice}
            onChange={(e) => setMenuChoice(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-byu-navy/20 focus:border-byu-navy transition-colors bg-white text-byu-dark"
          >
            <option value="">Select a menu item...</option>
            {[
              'Agadashi Tofu',
              'Chicken Karage',
              'Curry Croquette',
              'Japanese Style Fries',
              'Seaweed Salad',
              'Kids Ramen',
              'Gyoza Ramen',
              'Black Garlic Pork Ramen',
              'Miso Ramen',
              'Niku Spicy Pork Ramen',
              'Tonkotsu Ramen',
              'Veggie Shoyu Ramen',
              'Edamame',
              'Gyoza',
              'Ikageso',
              'Takoyaki',
            ].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      )}

      {step === 1 && (
        <SingleChoice
          question="Before today, how familiar were you with the item you chose?"
          options={familiarityOptions}
          value={familiarity}
          onChange={setFamiliarity}
          required
        />
      )}

      {step === 2 && (
        <SingleChoice
          question="How much did the price influence your choice?"
          options={influenceOptions}
          value={priceInfluence}
          onChange={setPriceInfluence}
          required
        />
      )}

      {step === 3 && (
        <SingleChoice
          question="How much did the expected flavor/taste influence your choice?"
          options={influenceOptions}
          value={flavorInfluence}
          onChange={setFlavorInfluence}
          required
        />
      )}

      {step === 4 && (
        <SingleChoice
          question="How much did past experience with this type of dish influence your choice?"
          options={influenceOptions}
          value={pastExperience}
          onChange={setPastExperience}
          required
        />
      )}

      {step === 5 && (
        <div className="space-y-4">
          <p className="text-lg font-medium text-byu-dark">
            About what percentage of the menu did you explore before making your decision?
            <span className="text-byu-error ml-1">*</span>
          </p>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={percentageExplored || '50'}
              onChange={(e) => setPercentageExplored(e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-byu-navy"
            />
            <div className="flex justify-between text-sm text-byu-gray">
              <span>0%</span>
              <span className="text-lg font-medium text-byu-dark">{percentageExplored || 50}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      )}

      {step === 6 && (
        <SingleChoice
          question="About how long did it take you to make your decision?"
          options={timeOptions}
          value={decisionTime}
          onChange={setDecisionTime}
          required
        />
      )}

      {step === 7 && (
        <SingleChoice
          question="How confident are you that the item you chose will make you happy?"
          options={confidenceOptions}
          value={happinessConfidence}
          onChange={setHappinessConfidence}
          required
        />
      )}

      {step === 8 && (
        <TextInput
          question="What was your overall experience navigating this menu? Answer with a few sentences."
          value={overallExperience}
          onChange={setOverallExperience}
          placeholder="Describe your experience..."
          multiline={true}
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
