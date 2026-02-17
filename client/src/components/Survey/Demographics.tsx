import React, { useState } from 'react';
import { SingleChoice, TextInput } from '../Questions';

interface DemographicsProps {
  onComplete: () => void;
  onBack: () => void;
  saveResponse: (questionId: string, value: string) => void;
  startAtEnd?: boolean;
}


const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-binary' },
  { value: 'prefer-not', label: 'Prefer not to say' },
];

const arExperienceOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

const arExtentOptions = [
  { value: 'very_minimally', label: 'Very minimally (tried it once or twice)' },
  { value: 'occasionally', label: 'Occasionally (used it a few times for fun or curiosity)' },
  { value: 'moderately', label: 'Moderately (used it multiple times across different apps or situations)' },
  { value: 'frequently', label: 'Frequently (use AR features often)' },
  { value: 'very_frequently', label: 'Very frequently (AR is a regular part of an app or technology I use)' },
];

export function Demographics({ onComplete, onBack, saveResponse, startAtEnd }: DemographicsProps) {
  const [step, setStep] = useState(startAtEnd ? 5 : 0);
  const [age, setAge] = useState(18);
  const [gender, setGender] = useState('');
  const [major, setMajor] = useState('');
  const [arExperience, setArExperience] = useState('');
  const [arExtent, setArExtent] = useState('');
  const [priceRole, setPriceRole] = useState(3);

  const handleNext = () => {
    if (step === 0) {
      saveResponse('Q17', String(age));
      setStep(1);
    } else if (step === 1) {
      saveResponse('Q18', gender);
      setStep(2);
    } else if (step === 2) {
      saveResponse('Q19', major);
      setStep(3);
    } else if (step === 3) {
      saveResponse('Q25', arExperience);
      if (arExperience === 'yes') {
        setStep(4);
      } else {
        setStep(5); // Skip to price question
      }
    } else if (step === 4) {
      saveResponse('Q26', arExtent);
      setStep(5); // Go to price question
    } else if (step === 5) {
      saveResponse('Q27', String(priceRole));
      onComplete();
    }
  };

  const canProceed = () => {
    switch (step) {
      case 0: return age >= 18;
      case 1: return gender !== '';
      case 2: return major.trim() !== '';
      case 3: return arExperience !== '';
      case 4: return arExtent !== '';
      case 5: return true; // Slider always has a value
      default: return false;
    }
  };

  const handleSkip = () => {
    const questionIds = ['Q17', 'Q18', 'Q19', 'Q25', 'Q26', 'Q27'];
    saveResponse(questionIds[step], 'SKIPPED');
    if (step === 3) {
      // If skipping the AR yes/no, also skip the AR extent follow-up
      setStep(5);
    } else if (step === 5) {
      onComplete();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step === 5 && arExperience === 'no') {
      setStep(3); // Go back to AR experience question if they skipped AR extent
    } else if (step > 0) {
      setStep(step - 1);
    } else {
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-byu-dark">Demographics</h2>
        <p className="text-byu-gray text-sm">Please tell us a bit about yourself.</p>
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <p className="text-lg font-medium text-byu-dark">
            What is your age?
            <span className="text-byu-error ml-1">*</span>
          </p>
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-3xl font-bold text-byu-navy">{age}</span>
              <p className="text-sm text-byu-gray mt-1">years old</p>
            </div>
            <input
              type="range"
              min={18}
              max={65}
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-byu-gray">
              <span>18</span>
              <span>65</span>
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <SingleChoice
          question="What is your gender?"
          options={genderOptions}
          value={gender}
          onChange={setGender}
          required
        />
      )}

      {step === 2 && (
        <TextInput
          question="What is your major/field of study?"
          value={major}
          onChange={setMajor}
          placeholder="e.g., Computer Science, Business, Psychology"
          multiline={false}
          required
        />
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <p className="text-lg font-medium text-byu-dark">
              Have you ever used augmented reality (AR) technology before?
              <span className="text-byu-error ml-1">*</span>
            </p>
            <p className="text-sm text-byu-gray mt-2">
              Augmented reality (AR) is technology that overlays digital content onto the real world through your phone or device. Examples include Snapchat or Instagram face filters, Pokémon Go, virtual try-on features (like seeing furniture in your room or makeup on your face).
            </p>
          </div>
          <div className="space-y-2">
            {arExperienceOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  arExperience === option.value
                    ? 'border-byu-navy bg-byu-navy/5'
                    : 'border-gray-200 hover:border-byu-navy/30'
                }`}
              >
                <input
                  type="radio"
                  name="ar-experience"
                  value={option.value}
                  checked={arExperience === option.value}
                  onChange={(e) => setArExperience(e.target.value)}
                  className="h-4 w-4 text-byu-navy focus:ring-byu-navy border-gray-300"
                />
                <span className="ml-3 text-byu-dark">{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <SingleChoice
          question="To what extent have you used augmented reality (AR)?"
          options={arExtentOptions}
          value={arExtent}
          onChange={setArExtent}
          required
        />
      )}

      {step === 5 && (
        <div className="space-y-4">
          <p className="text-lg font-medium text-byu-dark">
            In general, when I go to a restaurant, price plays a role in what I order.
            <span className="text-byu-error ml-1">*</span>
          </p>
          <div className="space-y-4">
            <div className="text-center">
              <span className="text-3xl font-bold text-byu-navy">{priceRole}</span>
            </div>
            <input
              type="range"
              min={0}
              max={7}
              value={priceRole}
              onChange={(e) => setPriceRole(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-byu-gray">
              <span>0 - Plays no role at all</span>
              <span>7 - Plays a very big role</span>
            </div>
          </div>
        </div>
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
          {step === 5 ? 'Submit Survey' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
