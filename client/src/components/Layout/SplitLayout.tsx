import React, { ReactNode } from 'react';

interface SplitLayoutProps {
  menuContent: ReactNode;
  questionContent: ReactNode;
  showMenu?: boolean;
}

export function SplitLayout({ menuContent, questionContent, showMenu = true }: SplitLayoutProps) {
  if (!showMenu) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-8">
          {questionContent}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Menu Side */}
      <div className="lg:w-1/2 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 p-4 lg:p-8 overflow-auto">
        <div className="max-w-lg mx-auto lg:sticky lg:top-8">
          {menuContent}
        </div>
      </div>

      {/* Question Side */}
      <div className="lg:w-1/2 p-4 lg:p-8 overflow-auto">
        <div className="max-w-lg mx-auto">
          {questionContent}
        </div>
      </div>
    </div>
  );
}
