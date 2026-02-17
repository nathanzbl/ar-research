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
  const [netId, setNetId] = useState('');
  const [professorLastName, setProfessorLastName] = useState('');

  const handleQ1Change = (value: string) => {
    setQ1(value);
    saveResponse('Q1', value);
  };

  const handleQ2Change = (value: string) => {
    setQ2(value);
    saveResponse('Q2', value);
  };

  const handleNetIdChange = (value: string) => {
    setNetId(value);
    saveResponse('net_id', value);
  };

  const handleProfessorChange = (value: string) => {
    setProfessorLastName(value);
    saveResponse('professor_last_name', value);
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
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      onComplete();
    }
  };

  const canProceed = step === 0 ? q1 !== '' : step === 1 ? q2 !== '' : step === 2 ? true : netId.trim() !== '' && professorLastName.trim() !== '';

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

      {step === 2 && (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          <h2 className="text-xl font-bold text-byu-dark text-center">Implied Consent</h2>
          <p className="text-byu-dark leading-relaxed font-semibold">
            Title of the Research Study: The Effects of Augmented Reality Menus on Consumer Decision-Making
          </p>
          <p className="text-byu-dark leading-relaxed">
            My name is Emmalee Morrow, I am an undergraduate student at Brigham Young University and I am conducting this research under the supervision of Professor James Gaskin, from the Department of Information Systems. You are being invited to participate in this research study about how different types of restaurant menus affect customer decision-making and satisfaction. I am interested to learn more about how augmented reality influences customer perceptions and choices. Being in this study is optional.
          </p>
          <p className="text-byu-dark leading-relaxed">
            If you choose to be in the study, you will be asked to complete a survey, which should take approximately 10-20 minutes of your time.
          </p>
          <p className="text-byu-dark leading-relaxed">
            You can skip questions that you do not want to answer or stop the survey at any time. The survey is anonymous, and no one will be able to link your answers back to you. Please do not include your name or other information that could be used to identify you in the survey responses. You will not be paid for being in this study, though your professor may offer extra credit. In addition, participants will have the option to enter a drawing to win one of four 3D-printed temple models (or an equivalent non-religious object), generously provided by Professor Gaskin. Assuming a maximum of 230 total participants, the odds of winning are approximately 4 out of 230, or about 1.7%. These odds may vary slightly depending on the final number of participants who opt into the drawing.
          </p>
          <p className="text-byu-dark leading-relaxed">
            <span className="font-semibold">Questions?</span> If you have questions, concerns, or complaints, you can contact the Principal Investigator James Gaskin via email{' '}
            <a href="mailto:james.gaskin@byu.edu" className="text-byu-royal underline">james.gaskin@byu.edu</a> or Emmalee Morrow via email at{' '}
            <a href="mailto:morrow04@byu.edu" className="text-byu-royal underline">morrow04@byu.edu</a>. If you have questions or concerns about your rights as a research participant, you can call the BYU Human Research Protections Program at 801-422-1461 or{' '}
            <a href="mailto:BYU.HRPP@byu.edu" className="text-byu-royal underline">BYU.HRPP@byu.edu</a>.
          </p>
          <p className="text-byu-dark leading-relaxed font-semibold">
            If you want to participate in this study, click the Next button to start the survey.
          </p>
          <p className="text-sm text-byu-gray italic">
            BYU HRP v10/2022
          </p>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <p className="text-sm text-byu-gray text-center italic">
            This information is for extra credit purposes.
          </p>

          <div>
            <label className="block text-base font-medium text-byu-dark mb-2">
              What is your NetID?
            </label>
            <input
              type="text"
              value={netId}
              onChange={(e) => handleNetIdChange(e.target.value)}
              placeholder="Enter your NetID"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-byu-navy"
            />
          </div>

          <div>
            <label className="block text-base font-medium text-byu-dark mb-2">
              What is the last name of the professor who you're doing this survey for?
            </label>
            <select
              value={professorLastName}
              onChange={(e) => handleProfessorChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-byu-navy bg-white"
            >
              <option value="">Select a professor</option>
              <option value="Gaskin">Gaskin</option>
              <option value="Steffen">Steffen</option>
              <option value="Reese">Reese</option>
              <option value="Britsch">Britsch</option>
              <option value="Flake">Flake</option>
              <option value="Skousen">Skousen</option>
            </select>
          </div>
        </div>
      )}

      {step === 3 && (
        <button
          onClick={() => onComplete()}
          className="w-full py-3 px-6 rounded-lg font-medium transition-colors text-byu-gray hover:text-byu-dark hover:bg-gray-100 border border-gray-300"
        >
          Skip
        </button>
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
        {step === 2 ? 'Next' : 'Continue'}
      </button>
    </div>
  );
}
