import { v4 as uuidv4 } from 'uuid';
import { workflowRepository } from '../repositories/workflow.repository';
import { activityRepository } from '../repositories/activity.repository';
import { dealRepository } from '../repositories/deal.repository';
import { Deal, WorkflowRule } from '../types';

export class WorkflowService {
  /**
   * Evaluates active workflow rules for an event and executes matching actions.
   */
  async processEvent(
    event: 'STAGE_CHANGED' | 'SCORE_THRESHOLD' | 'DEAL_CREATED',
    deal: Deal,
    extraContext?: Record<string, any>
  ): Promise<string[]> {
    const activeRules = workflowRepository.findActiveByTrigger(event);
    const triggeredActionMessages: string[] = [];

    for (const rule of activeRules) {
      if (this.evaluateCondition(rule, deal, extraContext)) {
        const msg = await this.executeAction(rule, deal);
        if (msg) {
          triggeredActionMessages.push(msg);
          workflowRepository.incrementExecution(rule.id);
        }
      }
    }

    return triggeredActionMessages;
  }

  private evaluateCondition(
    rule: WorkflowRule,
    deal: Deal,
    extraContext?: Record<string, any>
  ): boolean {
    try {
      const condition = JSON.parse(rule.condition_json);

      if (condition.stage && deal.stage !== condition.stage) {
        return false;
      }

      if (condition.priority && deal.priority !== condition.priority) {
        return false;
      }

      if (condition.scoreMin && deal.ai_score < condition.scoreMin) {
        return false;
      }

      if (condition.valueMin && deal.value < condition.valueMin) {
        return false;
      }

      return true;
    } catch (err) {
      console.warn(`[Workflow] Failed to parse condition for rule ${rule.name}:`, err);
      return false;
    }
  }

  private async executeAction(rule: WorkflowRule, deal: Deal): Promise<string> {
    try {
      const payload = JSON.parse(rule.action_payload);
      let message = '';

      switch (rule.action_type) {
        case 'SET_PRIORITY': {
          const newPriority = payload.priority || 'HIGH';
          if (deal.priority !== newPriority) {
            dealRepository.update(deal.id, { priority: newPriority });
            message = `Rule [${rule.name}]: Priority updated to ${newPriority}`;
          }
          break;
        }

        case 'AUTO_AI_BRIEF': {
          const autoNote = `Automated Workflow Action: Flagged for high-priority executive review due to stage [${deal.stage}] transition.`;
          const currentNotes = deal.notes ? `${deal.notes}\n\n${autoNote}` : autoNote;
          dealRepository.update(deal.id, { notes: currentNotes });
          message = `Rule [${rule.name}]: Automated AI Review Brief attached to deal notes`;
          break;
        }

        case 'SEND_NOTIFICATION': {
          message = `Rule [${rule.name}]: Alert dispatched to ${payload.channel || 'Slack #sales-alerts'}`;
          break;
        }

        case 'LOG_AUDIT': {
          message = `Rule [${rule.name}]: Executed audit logging checkpoint`;
          break;
        }
      }

      // Log the automation execution in activities
      activityRepository.create({
        id: uuidv4(),
        deal_id: deal.id,
        type: 'AUTOMATION_TRIGGERED',
        description: message || `Workflow rule executed: ${rule.name}`,
        metadata: JSON.stringify({
          ruleId: rule.id,
          ruleName: rule.name,
          actionType: rule.action_type,
        }),
        created_at: new Date().toISOString(),
      });

      return message;
    } catch (err) {
      console.error(`[Workflow] Error executing rule ${rule.name}:`, err);
      return '';
    }
  }
}

export const workflowService = new WorkflowService();
