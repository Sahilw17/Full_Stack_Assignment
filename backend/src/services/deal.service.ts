import { v4 as uuidv4 } from 'uuid';
import { dealRepository } from '../repositories/deal.repository';
import { activityRepository } from '../repositories/activity.repository';
import { aiService } from './ai.service';
import { workflowService } from './workflow.service';
import { Deal, DealStage, DealPriority } from '../types';

export class DealService {
  getAllDeals(filters?: { stage?: string; priority?: string; search?: string }) {
    return dealRepository.findAll(filters);
  }

  getDealById(id: string) {
    const deal = dealRepository.findById(id);
    if (!deal) return null;
    const activities = activityRepository.findByDealId(id);
    return { ...deal, activities };
  }

  async createDeal(data: {
    title: string;
    company: string;
    contact_name: string;
    contact_email: string;
    value: number;
    stage?: DealStage;
    priority?: DealPriority;
    close_date?: string | null;
    notes?: string | null;
  }) {
    const now = new Date().toISOString();
    const dealId = uuidv4();

    const initialDeal: Deal = {
      id: dealId,
      title: data.title,
      company: data.company,
      contact_name: data.contact_name,
      contact_email: data.contact_email,
      value: data.value,
      stage: data.stage || 'LEAD',
      priority: data.priority || 'MEDIUM',
      close_date: data.close_date || null,
      notes: data.notes || null,
      ai_score: 50,
      ai_summary: null,
      ai_risk_factors: null,
      ai_next_step: null,
      created_at: now,
      updated_at: now,
    };

    // Run initial AI analysis
    try {
      const aiAnalysis = await aiService.analyzeDeal(initialDeal);
      initialDeal.ai_score = aiAnalysis.score;
      initialDeal.ai_summary = aiAnalysis.summary;
      initialDeal.ai_risk_factors = JSON.stringify(aiAnalysis.riskFactors);
      initialDeal.ai_next_step = aiAnalysis.nextStep;
    } catch (err) {
      console.warn('[DealService] Initial AI analysis failed:', err);
    }

    const created = dealRepository.create(initialDeal);

    // Record creation activity
    activityRepository.create({
      id: uuidv4(),
      deal_id: dealId,
      type: 'DEAL_CREATED',
      description: `Opportunity created: ${created.title} with initial value $${created.value.toLocaleString()}`,
      metadata: JSON.stringify({ initialStage: created.stage }),
      created_at: now,
    });

    // Trigger any DEAL_CREATED workflow automations
    const triggeredActions = await workflowService.processEvent('DEAL_CREATED', created);

    return { deal: created, triggeredActions };
  }

  async updateDeal(id: string, updates: Partial<Deal>) {
    const existing = dealRepository.findById(id);
    if (!existing) return null;

    const updated = dealRepository.update(id, updates);
    if (!updated) return null;

    activityRepository.create({
      id: uuidv4(),
      deal_id: id,
      type: 'NOTE_ADDED',
      description: `Deal details updated for ${updated.title}`,
      metadata: JSON.stringify(updates),
      created_at: new Date().toISOString(),
    });

    return updated;
  }

  async changeStage(id: string, newStage: DealStage) {
    const existing = dealRepository.findById(id);
    if (!existing) return null;

    const oldStage = existing.stage;
    if (oldStage === newStage) return { deal: existing, triggeredActions: [] };

    const updated = dealRepository.updateStage(id, newStage);
    if (!updated) return null;

    // Log stage change
    activityRepository.create({
      id: uuidv4(),
      deal_id: id,
      type: 'STAGE_CHANGE',
      description: `Pipeline stage moved from ${oldStage} to ${newStage}`,
      metadata: JSON.stringify({ oldStage, newStage }),
      created_at: new Date().toISOString(),
    });

    // Trigger workflow automations on stage change
    const triggeredActions = await workflowService.processEvent('STAGE_CHANGED', updated, { oldStage });

    // Re-evaluate deal health score based on new stage
    try {
      const reAnalysis = await aiService.analyzeDeal(updated);
      dealRepository.updateAiInsights(id, {
        ai_score: reAnalysis.score,
        ai_summary: reAnalysis.summary,
        ai_risk_factors: JSON.stringify(reAnalysis.riskFactors),
        ai_next_step: reAnalysis.nextStep,
      });
      updated.ai_score = reAnalysis.score;
      updated.ai_summary = reAnalysis.summary;
      updated.ai_risk_factors = JSON.stringify(reAnalysis.riskFactors);
      updated.ai_next_step = reAnalysis.nextStep;
    } catch (err) {
      console.warn('[DealService] Stage change re-analysis error:', err);
    }

    return { deal: updated, triggeredActions };
  }

  async triggerAiRefresh(id: string) {
    const deal = dealRepository.findById(id);
    if (!deal) return null;

    const analysis = await aiService.analyzeDeal(deal);
    const updated = dealRepository.updateAiInsights(id, {
      ai_score: analysis.score,
      ai_summary: analysis.summary,
      ai_risk_factors: JSON.stringify(analysis.riskFactors),
      ai_next_step: analysis.nextStep,
    });

    activityRepository.create({
      id: uuidv4(),
      deal_id: id,
      type: 'AI_ANALYSIS',
      description: `AI Health Score refreshed to ${analysis.score}% with strategic playbook`,
      metadata: JSON.stringify(analysis),
      created_at: new Date().toISOString(),
    });

    // Check score threshold triggers
    await workflowService.processEvent('SCORE_THRESHOLD', updated!);

    return updated;
  }

  deleteDeal(id: string) {
    return dealRepository.delete(id);
  }
}

export const dealService = new DealService();
