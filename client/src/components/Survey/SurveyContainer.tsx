import React, { useEffect, useRef, useState } from 'react';
import { useSurvey } from '../../hooks/useSurvey';
import { SplitLayout } from '../Layout/SplitLayout';
import { ProgressBar } from '../Layout/ProgressBar';
import { ScreeningBlock } from './ScreeningBlock';
import { MenuDisplay } from './MenuDisplay';
import { MenuChoiceBlock } from './MenuChoiceBlock';
import { ExperienceRatings } from './ExperienceRatings';
import { MenuPerceptions } from './MenuPerceptions';
import { OpenFeedback } from './OpenFeedback';
import { Demographics } from './Demographics';
import { EndScreen } from './EndScreen';

export function SurveyContainer() {
  const {
    state,
    deviceType,
    menuImageIndex,
    startSurvey,
    saveResponse,
    nextBlock,
    prevBlock,
    screenOut,
    completeSurvey,
    restartSurvey,
    getProgress,
  } = useSurvey();

  const [initialized, setInitialized] = useState(false);
  const [showMenuInstructions, setShowMenuInstructions] = useState(false);
  const menuViewStartTime = useRef<number | null>(null);

  useEffect(() => {
    if (!initialized) {
      startSurvey();
      setInitialized(true);
    }
  }, [initialized, startSurvey]);

  const handleBackFromMenuDisplay = () => {
    if (showMenuInstructions) {
      setShowMenuInstructions(false);
    } else {
      prevBlock();
    }
  };

  const renderCurrentBlock = () => {
    switch (state.currentBlock) {
      case 'screening':
        return (
          <ScreeningBlock
            onComplete={nextBlock}
            onScreenOut={screenOut}
            saveResponse={saveResponse}
          />
        );

      case 'menu_display':
        if (!showMenuInstructions) {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-byu-dark mb-4">Menu Viewing Instructions</h2>
                <p className="text-byu-gray mb-6">
                  You will now view a restaurant menu. Please take your time to browse through all the items
                  before making your selection. After viewing, you'll be asked questions about your experience.
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={prevBlock}
                    className="bg-gray-100 text-byu-dark py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors border border-gray-300"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      setShowMenuInstructions(true);
                      menuViewStartTime.current = Date.now();
                    }}
                    className="bg-byu-navy text-white py-3 px-6 rounded-lg font-medium hover:bg-byu-royal transition-colors"
                  >
                    View Menu
                  </button>
                </div>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <p className="text-byu-gray text-center">
              Please review the menu items. When you're ready, click Continue to proceed.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleBackFromMenuDisplay}
                className="flex-1 bg-gray-100 text-byu-dark py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors border border-gray-300"
              >
                Back
              </button>
              <button
                onClick={() => {
                  if (menuViewStartTime.current) {
                    const seconds = Math.round((Date.now() - menuViewStartTime.current) / 1000);
                    saveResponse('menu_view_duration', seconds);
                    menuViewStartTime.current = null;
                  }
                  nextBlock();
                }}
                className="flex-1 bg-byu-navy text-white py-3 px-6 rounded-lg font-medium hover:bg-byu-royal transition-colors"
              >
                Continue to Questions
              </button>
            </div>
          </div>
        );

      case 'menu_choice':
        return (
          <MenuChoiceBlock
            onComplete={nextBlock}
            onBack={prevBlock}
            saveResponse={saveResponse}
          />
        );

      case 'experience_ratings':
        return (
          <ExperienceRatings
            onComplete={nextBlock}
            onBack={prevBlock}
            saveResponse={saveResponse}
          />
        );

      case 'menu_perceptions':
        return (
          <MenuPerceptions
            onComplete={nextBlock}
            onBack={prevBlock}
            saveResponse={saveResponse}
          />
        );

      case 'open_feedback':
        return (
          <OpenFeedback
            onComplete={nextBlock}
            onBack={prevBlock}
            saveResponse={saveResponse}
          />
        );

      case 'demographics':
        return (
          <Demographics
            onComplete={completeSurvey}
            onBack={prevBlock}
            saveResponse={saveResponse}
          />
        );

      case 'end_screen':
        return (
          <EndScreen
            isScreenedOut={state.isScreenedOut}
            onRestart={() => {
              restartSurvey();
              setInitialized(false);
              setShowMenuInstructions(false);
            }}
          />
        );

      default:
        return <div>Unknown block</div>;
    }
  };

  const shouldShowMenu = ['menu_display', 'menu_choice', 'choice_influences'].includes(state.currentBlock) && showMenuInstructions;
  const shouldShowProgress = state.currentBlock !== 'end_screen';

  if (!state.session) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-byu-navy mx-auto"></div>
          <p className="mt-4 text-byu-gray">Loading survey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {shouldShowProgress && (
        <div className="fixed top-0 left-0 right-0 bg-byu-navy shadow-sm z-10">
          <div className="max-w-4xl mx-auto p-4">
            <ProgressBar progress={getProgress()} />
          </div>
        </div>
      )}

      <div className={shouldShowProgress ? 'pt-16' : ''}>
        <SplitLayout
          showMenu={shouldShowMenu}
          menuContent={
            <MenuDisplay deviceType={deviceType} menuImageIndex={menuImageIndex} />
          }
          questionContent={renderCurrentBlock()}
        />
      </div>
    </div>
  );
}
