import { Deal, DealStage, DealPriority, PipelineAnalytics, WorkflowRule, GeneratedEmail } from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  async getDeals(filters?: { stage?: string; priority?: string; search?: string }): Promise<Deal[]> {
    const params = new URLSearchParams();
    if (filters?.stage && filters.stage !== 'ALL') params.append('stage', filters.stage);
    if (filters?.priority && filters.priority !== 'ALL') params.append('priority', filters.priority);
    if (filters?.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/deals?${params.toString()}`);
    const data = await handleResponse<{ status: string; data: Deal[] }>(res);
    return data.data;
  },

  async getDealById(id: string): Promise<Deal> {
    const res = await fetch(`${API_BASE}/deals/${id}`);
    const data = await handleResponse<{ status: string; data: Deal }>(res);
    return data.data;
  },

  async createDeal(dealData: {
    title: string;
    company: string;
    contact_name: string;
    contact_email: string;
    value: number;
    stage?: DealStage;
    priority?: DealPriority;
    close_date?: string | null;
    notes?: string | null;
  }): Promise<{ deal: Deal; triggeredActions: string[] }> {
    const res = await fetch(`${API_BASE}/deals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dealData),
    });
    const data = await handleResponse<{ status: string; data: Deal; triggeredActions: string[] }>(res);
    return { deal: data.data, triggeredActions: data.triggeredActions || [] };
  },

  async updateDeal(id: string, updates: Partial<Deal>): Promise<Deal> {
    const res = await fetch(`${API_BASE}/deals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await handleResponse<{ status: string; data: Deal }>(res);
    return data.data;
  },

  async updateStage(id: string, stage: DealStage): Promise<{ deal: Deal; triggeredActions: string[] }> {
    const res = await fetch(`${API_BASE}/deals/${id}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
    const data = await handleResponse<{ status: string; data: Deal; triggeredActions: string[] }>(res);
    return { deal: data.data, triggeredActions: data.triggeredActions || [] };
  },

  async refreshDealAi(id: string): Promise<Deal> {
    const res = await fetch(`${API_BASE}/deals/${id}/ai-refresh`, {
      method: 'POST',
    });
    const data = await handleResponse<{ status: string; data: Deal }>(res);
    return data.data;
  },

  async deleteDeal(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/deals/${id}`, {
      method: 'DELETE',
    });
    await handleResponse<{ status: string; message: string }>(res);
  },

  async generateEmail(dealId: string, type: 'PITCH' | 'FOLLOW_UP' | 'OBJECTION' | 'CLOSING'): Promise<GeneratedEmail> {
    const res = await fetch(`${API_BASE}/ai/generate-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dealId, type }),
    });
    const data = await handleResponse<{ status: string; data: GeneratedEmail }>(res);
    return data.data;
  },

  async askCopilot(query: string): Promise<string> {
    const res = await fetch(`${API_BASE}/ai/copilot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const data = await handleResponse<{ status: string; reply: string }>(res);
    return data.reply;
  },

  async getAnalytics(): Promise<PipelineAnalytics> {
    const res = await fetch(`${API_BASE}/analytics/overview`);
    const data = await handleResponse<{ status: string; data: PipelineAnalytics }>(res);
    return data.data;
  },

  async getWorkflowRules(): Promise<WorkflowRule[]> {
    const res = await fetch(`${API_BASE}/workflows`);
    const data = await handleResponse<{ status: string; data: WorkflowRule[] }>(res);
    return data.data;
  },

  async toggleWorkflowRule(id: string, isActive: boolean): Promise<void> {
    const res = await fetch(`${API_BASE}/workflows/${id}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    await handleResponse<{ status: string; message: string }>(res);
  },

  async createWorkflowRule(ruleData: {
    name: string;
    trigger_event: string;
    condition_json: string;
    action_type: string;
    action_payload: string;
  }): Promise<WorkflowRule> {
    const res = await fetch(`${API_BASE}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ruleData),
    });
    const data = await handleResponse<{ status: string; data: WorkflowRule }>(res);
    return data.data;
  },
};
