export type ConditionType = string;
export type DeviceType = 'mobile' | 'desktop';

export interface Session {
  id: string;
  conditionType: ConditionType;
  deviceType: DeviceType;
  startedAt: string;
  completedAt?: string;
  isScreenedOut: boolean;
}

export interface SurveyResponse {
  questionId: string;
  responseValue: string | string[] | number;
}

export type QuestionType =
  | 'single_choice'
  | 'multi_choice'
  | 'likert_scale'
  | 'likert_matrix'
  | 'slider'
  | 'text_input'
  | 'true_false';

export interface QuestionOption {
  value: string;
  label: string;
}

export interface LikertItem {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  required?: boolean;
  options?: QuestionOption[];
  items?: LikertItem[];
  scaleLabels?: string[];
  scaleMin?: number;
  scaleMax?: number;
  minLabel?: string;
  maxLabel?: string;
  placeholder?: string;
}

export type SurveyBlock =
  | 'screening'
  | 'menu_display'
  | 'menu_choice'
  | 'experience_ratings'
  | 'menu_perceptions'
  | 'open_feedback'
  | 'demographics'
  | 'end_screen';

export interface SurveyState {
  session: Session | null;
  currentBlock: SurveyBlock;
  responses: Record<string, string | string[] | number>;
  isComplete: boolean;
  isScreenedOut: boolean;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}
