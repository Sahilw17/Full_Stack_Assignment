import { db } from '../database/db';
import { Activity } from '../types';

export class ActivityRepository {
  findByDealId(dealId: string): Activity[] {
    const stmt = db.prepare('SELECT * FROM activities WHERE deal_id = ? ORDER BY created_at DESC');
    return stmt.all(dealId) as Activity[];
  }

  findRecent(limit = 10): Activity[] {
    const stmt = db.prepare('SELECT * FROM activities ORDER BY created_at DESC LIMIT ?');
    return stmt.all(limit) as Activity[];
  }

  create(activity: Activity): Activity {
    const stmt = db.prepare(`
      INSERT INTO activities (id, deal_id, type, description, metadata, created_at)
      VALUES (@id, @deal_id, @type, @description, @metadata, @created_at)
    `);
    stmt.run(activity);
    return activity;
  }
}

export const activityRepository = new ActivityRepository();
