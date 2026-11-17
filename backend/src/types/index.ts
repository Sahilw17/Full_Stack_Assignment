export type DealStage = 
  | 'LEAD' 
  | 'DISCOVERY' 
  | 'PROPOSAL' 
  | 'NEGOTIATION' 
  | 'CLOSED_WON' 
  | 'CLOSED_LOST';

export type DealPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Deal {
  id: string;
  title: string;
  company: string;
  contact_name: string;
  contact_email: string;
  value: number;
  stage: DealStage;
  priority: DealPriority;
  close_date: string | null;
  notes: string | null;
  ai_score: number;
  ai_summary: string | null;
  ai_risk_factors: string | null; // JSON string
  ai_next_step: string | null;
  created_at: string;
  updated_at: string;
}

export type ActivityType = 
  | 'DEAL_CREATED'
  | 'STAGE_CHANGE'
  | 'NOTE_ADDED'
  | 'AI_ANALYSIS'
  | 'EMAIL_GENERATED'
  | 'AUTOMATION_TRIGGERED';

export interface Activity {
  id: string;
  deal_id: string;
  type: ActivityType;
  description: string;
  metadata: string | null; // JSON string
  created_at: string;
}

export type WorkflowTriggerEvent = 
  | 'STAGE_CHANGED'
  | 'SCORE_THRESHOLD'
  | 'DEAL_CREATED'
  | 'INACTIVITY';

export type WorkflowActionType = 
  | 'SET_PRIORITY'
  | 'AUTO_AI_BRIEF'
  | 'SEND_NOTIFICATION'
  | 'LOG_AUDIT';

export interface WorkflowRule {
  id: string;
  name: string;
  trigger_event: WorkflowTriggerEvent;
  condition_json: string; // JSON string
  action_type: WorkflowActionType;
  action_payload: string; // JSON string
  is_active: number; // 1 or 0
  execution_count: number;
  created_at: string;
}

export interface CopilotChat {
  id: string;
  deal_id: string | null;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export interface PipelineAnalytics {
  totalPipelineValue: number;
  weightedPipelineValue: number;
  averageDealSize: number;
  activeDealsCount: number;
  winRatePercentage: number;
  dealsByStage: {
    stage: DealStage;
    count: number;
    value: number;
  }[];
  dealsByPriority: {
    priority: DealPriority;
    count: number;
  }[];
  recentActivities: Activity[];
}
