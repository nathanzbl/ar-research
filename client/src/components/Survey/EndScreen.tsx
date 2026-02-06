import React from 'react';

interface EndScreenProps {
  isScreenedOut: boolean;
  onRestart: () => void;
}

export function EndScreen({ isScreenedOut, onRestart }: EndScreenProps) {
  if (isScreenedOut) {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-byu-navy/10 rounded-full flex items-center justify-center">
          <svg className="w-10 h-10 text-byu-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-byu-dark">Thank You</h1>
        <p className="text-byu-gray">
          Unfortunately, you do not meet the eligibility criteria for this study.
          We appreciate your interest in participating.
        </p>
        <p className="text-sm text-byu-gray">
          If you have any questions, please contact the research team.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 mx-auto bg-byu-success/10 rounded-full flex items-center justify-center">
        <svg className="w-10 h-10 text-byu-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-byu-dark">Survey Complete!</h1>
      <p className="text-byu-gray">
        Thank you for participating in our study on augmented reality menus.
        Your responses have been recorded and will help us understand how
        different menu formats affect consumer decision-making.
      </p>
      <div className="bg-byu-success/10 border border-byu-success/30 rounded-lg p-4">
        <p className="text-byu-success font-medium">
          Your responses have been successfully submitted.
        </p>
      </div>
      <p className="text-sm text-byu-gray">
        If you have any questions about this study, please contact the research team.
      </p>
      <button
        onClick={onRestart}
        className="mt-4 bg-byu-navy text-white py-3 px-6 rounded-lg font-medium hover:bg-byu-royal transition-colors"
      >
        Submit Another Response?
      </button>
    </div>
  );
}
