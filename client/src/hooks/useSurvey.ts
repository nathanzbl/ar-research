import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { SurveyState, SurveyBlock, Session } from '../types/survey';
import { useDeviceDetect } from './useDeviceDetect';

const BLOCK_ORDER: SurveyBlock[] = [
  'screening',
  'menu_display',
  'menu_choice',
  'experience_ratings',
  'menu_perceptions',
  'open_feedback',
  'demographics',
  'end_screen',
];

// Number of menu images available for desktop users
const NUM_MENU_IMAGES = 2;

// Generate a simple browser fingerprint for idempotency
function generateFingerprint(): string {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
    navigator.maxTouchPoints || 0,
  ];

  // Create a simple hash from the components
  const str = components.join('|');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export function useSurvey() {
  const deviceType = useDeviceDetect();
  const [menuImageIndex] = useState(() => Math.floor(Math.random() * NUM_MENU_IMAGES));
  const fingerprint = useMemo(() => generateFingerprint(), []);
  const [state, setState] = useState<SurveyState>({
    session: null,
    currentBlock: 'screening',
    responses: {},
    isComplete: false,
    isScreenedOut: false,
  });

  const [navigatingBack, setNavigatingBack] = useState(false);

  const [skipIdempotency, setSkipIdempotency] = useState(false);

  // Track whether the survey is actively in progress (past screening, not yet finished)
  const sessionRef = useRef(state.session);
  const isActiveRef = useRef(false);
  sessionRef.current = state.session;
  isActiveRef.current = !!(
    state.session &&
    !state.isComplete &&
    !state.isScreenedOut &&
    state.currentBlock !== 'screening' &&
    state.currentBlock !== 'end_screen'
  );

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isActiveRef.current) {
        e.preventDefault();
        e.returnValue = 'You will lose all your responses and have to restart. Are you sure?';
      }
    };

    const handleUnload = () => {
      if (isActiveRef.current && sessionRef.current) {
        navigator.sendBeacon(
          '/api/survey/abandon',
          new Blob(
            [JSON.stringify({ sessionId: sessionRef.current.id })],
            { type: 'application/json' }
          )
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    };
  }, []);

  const startSurvey = useCallback(async () => {
    // Condition type: mobile = ar_menu, desktop = menu_image_0 or menu_image_1
    const conditionType = deviceType === 'mobile'
      ? 'ar_menu'
      : `menu_image_${menuImageIndex}`;

    try {
      const response = await fetch('/api/survey/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceType, conditionType, fingerprint: skipIdempotency ? undefined : fingerprint }),
      });
      const session: Session & { isExisting?: boolean } = await response.json();

      // If user already has a completed/screened-out session, show appropriate state
      if (session.isExisting) {
        if (session.isScreenedOut) {
          setState(prev => ({
            ...prev,
            session,
            isScreenedOut: true,
            currentBlock: 'end_screen',
          }));
        } else if (session.completedAt) {
          setState(prev => ({
            ...prev,
            session,
            isComplete: true,
            currentBlock: 'end_screen',
          }));
        } else {
          // Existing but incomplete session - let them continue
          setState(prev => ({ ...prev, session }));
        }
      } else {
        setState(prev => ({ ...prev, session }));
      }
      return session;
    } catch (error) {
      console.error('Failed to start survey:', error);
      // Create local session for offline development
      const session: Session = {
        id: crypto.randomUUID(),
        conditionType,
        deviceType,
        startedAt: new Date().toISOString(),
        isScreenedOut: false,
      };
      setState(prev => ({ ...prev, session }));
      return session;
    }
  }, [deviceType, menuImageIndex, fingerprint, skipIdempotency]);

  const saveResponse = useCallback(async (questionId: string, value: string | string[] | number) => {
    setState(prev => ({
      ...prev,
      responses: { ...prev.responses, [questionId]: value },
    }));

    if (state.session) {
      try {
        await fetch('/api/survey/response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: state.session.id,
            questionId,
            responseValue: Array.isArray(value) ? value.join(',') : String(value),
          }),
        });
      } catch (error) {
        console.error('Failed to save response:', error);
      }
    }
  }, [state.session]);

  const nextBlock = useCallback(() => {
    setNavigatingBack(false);
    setState(prev => {
      const currentIndex = BLOCK_ORDER.indexOf(prev.currentBlock);
      if (currentIndex < BLOCK_ORDER.length - 1) {
        return { ...prev, currentBlock: BLOCK_ORDER[currentIndex + 1] };
      }
      return { ...prev, isComplete: true };
    });
  }, []);

  const prevBlock = useCallback(() => {
    setNavigatingBack(true);
    setState(prev => {
      const currentIndex = BLOCK_ORDER.indexOf(prev.currentBlock);
      if (currentIndex > 0) {
        return { ...prev, currentBlock: BLOCK_ORDER[currentIndex - 1] };
      }
      return prev;
    });
  }, []);

  const goToBlock = useCallback((block: SurveyBlock) => {
    setState(prev => ({ ...prev, currentBlock: block }));
  }, []);

  const screenOut = useCallback(async () => {
    setState(prev => ({ ...prev, isScreenedOut: true, currentBlock: 'end_screen' }));

    if (state.session) {
      try {
        await fetch('/api/survey/screen-out', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: state.session.id }),
        });
      } catch (error) {
        console.error('Failed to mark screen-out:', error);
      }
    }
  }, [state.session]);

  const completeSurvey = useCallback(async () => {
    setState(prev => ({ ...prev, isComplete: true, currentBlock: 'end_screen' }));

    if (state.session) {
      try {
        await fetch('/api/survey/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: state.session.id }),
        });
      } catch (error) {
        console.error('Failed to complete survey:', error);
      }
    }
  }, [state.session]);

  const restartSurvey = useCallback(() => {
    setSkipIdempotency(true);
    setState({
      session: null,
      currentBlock: 'screening',
      responses: {},
      isComplete: false,
      isScreenedOut: false,
    });
  }, []);

  const getProgress = useCallback(() => {
    const currentIndex = BLOCK_ORDER.indexOf(state.currentBlock);
    return Math.round((currentIndex / (BLOCK_ORDER.length - 1)) * 100);
  }, [state.currentBlock]);

  return {
    state,
    deviceType,
    menuImageIndex,
    navigatingBack,
    startSurvey,
    saveResponse,
    nextBlock,
    prevBlock,
    goToBlock,
    screenOut,
    completeSurvey,
    restartSurvey,
    getProgress,
  };
}
