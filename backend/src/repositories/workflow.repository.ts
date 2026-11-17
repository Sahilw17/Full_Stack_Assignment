import { db } from '../database/db';
import { WorkflowRule } from '../types';

export class WorkflowRepository {
  findAll(): WorkflowRule[] {
    const stmt = db.prepare('SELECT * FROM workflow_rules ORDER BY created_at DESC');
    return stmt.all() as WorkflowRule[];
  }

  findActiveByTrigger(triggerEvent: string): WorkflowRule[] {
    const stmt = db.prepare('SELECT * FROM workflow_rules WHERE is_active = 1 AND trigger_event = ?');
    return stmt.all(triggerEvent) as WorkflowRule[];
  }

  findById(id: string): WorkflowRule | undefined {
    const stmt = db.prepare('SELECT * FROM workflow_rules WHERE id = ?');
    return stmt.get(id) as WorkflowRule | undefined;
  }

  create(rule: WorkflowRule): WorkflowRule {
    const stmt = db.prepare(`
      INSERT INTO workflow_rules (
        id, name, trigger_event, condition_json, action_type, action_payload,
        is_active, execution_count, created_at
      ) VALUES (
        @id, @name, @trigger_event, @condition_json, @action_type, @action_payload,
        @is_active, @execution_count, @created_at
      )
    `);
    stmt.run(rule);
    return rule;
  }

  toggleActive(id: string, isActive: boolean): boolean {
    const stmt = db.prepare('UPDATE workflow_rules SET is_active = ? WHERE id = ?');
    const result = stmt.run(isActive ? 1 : 0, id);
    return result.changes > 0;
  }

  incrementExecution(id: string): void {
    const stmt = db.prepare('UPDATE workflow_rules SET execution_count = execution_count + 1 WHERE id = ?');
    stmt.run(id);
  }

  delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM workflow_rules WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
}

export const workflowRepository = new WorkflowRepository();
