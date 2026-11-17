import { db } from '../database/db';
import { Deal, DealStage, DealPriority } from '../types';

export class DealRepository {
  findAll(filters?: { stage?: string; priority?: string; search?: string }): Deal[] {
    let query = 'SELECT * FROM deals WHERE 1=1';
    const params: any[] = [];

    if (filters?.stage && filters.stage !== 'ALL') {
      query += ' AND stage = ?';
      params.push(filters.stage);
    }

    if (filters?.priority && filters.priority !== 'ALL') {
      query += ' AND priority = ?';
      params.push(filters.priority);
    }

    if (filters?.search && filters.search.trim() !== '') {
      query += ' AND (title LIKE ? OR company LIKE ? OR contact_name LIKE ? OR contact_email LIKE ?)';
      const term = `%${filters.search.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY updated_at DESC';

    const stmt = db.prepare(query);
    return stmt.all(...params) as Deal[];
  }

  findById(id: string): Deal | undefined {
    const stmt = db.prepare('SELECT * FROM deals WHERE id = ?');
    return stmt.get(id) as Deal | undefined;
  }

  create(deal: Deal): Deal {
    const stmt = db.prepare(`
      INSERT INTO deals (
        id, title, company, contact_name, contact_email, value, stage, priority,
        close_date, notes, ai_score, ai_summary, ai_risk_factors, ai_next_step,
        created_at, updated_at
      ) VALUES (
        @id, @title, @company, @contact_name, @contact_email, @value, @stage, @priority,
        @close_date, @notes, @ai_score, @ai_summary, @ai_risk_factors, @ai_next_step,
        @created_at, @updated_at
      )
    `);

    stmt.run(deal);
    return deal;
  }

  update(id: string, updates: Partial<Deal>): Deal | undefined {
    const existing = this.findById(id);
    if (!existing) return undefined;

    const updated: Deal = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const stmt = db.prepare(`
      UPDATE deals SET
        title = @title,
        company = @company,
        contact_name = @contact_name,
        contact_email = @contact_email,
        value = @value,
        stage = @stage,
        priority = @priority,
        close_date = @close_date,
        notes = @notes,
        ai_score = @ai_score,
        ai_summary = @ai_summary,
        ai_risk_factors = @ai_risk_factors,
        ai_next_step = @ai_next_step,
        updated_at = @updated_at
      WHERE id = @id
    `);

    stmt.run(updated);
    return updated;
  }

  updateStage(id: string, stage: DealStage): Deal | undefined {
    return this.update(id, { stage });
  }

  updateAiInsights(
    id: string,
    insights: {
      ai_score: number;
      ai_summary: string;
      ai_risk_factors: string;
      ai_next_step: string;
    }
  ): Deal | undefined {
    return this.update(id, insights);
  }

  delete(id: string): boolean {
    const stmt = db.prepare('DELETE FROM deals WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  getStageAggregates(): { stage: DealStage; count: number; value: number }[] {
    const stmt = db.prepare(`
      SELECT 
        stage, 
        COUNT(*) as count, 
        COALESCE(SUM(value), 0) as value 
      FROM deals 
      GROUP BY stage
    `);
    return stmt.all() as { stage: DealStage; count: number; value: number }[];
  }

  getPriorityAggregates(): { priority: DealPriority; count: number }[] {
    const stmt = db.prepare(`
      SELECT 
        priority, 
        COUNT(*) as count 
      FROM deals 
      GROUP BY priority
    `);
    return stmt.all() as { priority: DealPriority; count: number }[];
  }
}

export const dealRepository = new DealRepository();
