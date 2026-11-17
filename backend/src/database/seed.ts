import { v4 as uuidv4 } from 'uuid';
import { db } from './db';

export function seedInitialData() {
  const existingCount = db.prepare('SELECT COUNT(*) as count FROM deals').get() as { count: number };
  if (existingCount.count > 0) {
    console.log(`[Seed] Database already contains ${existingCount.count} deals. Skipping seed.`);
    return;
  }

  console.log('[Seed] Seeding initial enterprise deals, workflow rules, and activities...');

  const now = new Date();
  const subDays = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();
  const addDays = (d: number) => new Date(now.getTime() + d * 86400000).toISOString();

  const deals = [
    {
      id: uuidv4(),
      title: 'Enterprise Platform Modernization',
      company: 'Apex Fintech Solutions',
      contact_name: 'Elena Rostova',
      contact_email: 'elena.rostova@apexfintech.io',
      value: 125000,
      stage: 'NEGOTIATION',
      priority: 'URGENT',
      close_date: addDays(14),
      notes: 'Customer requested SOC2 Type II compliance reports and standard MSA with Net-30 payment terms.',
      ai_score: 88,
      ai_summary: 'High-intent strategic opportunity. Security review completed; commercial terms undergoing final legal redline.',
      ai_risk_factors: JSON.stringify(['Legal sign-off bottleneck', 'Quarter-end budget freeze risk']),
      ai_next_step: 'Schedule joint call with VP Legal to finalize indemnity and liability clauses.',
      created_at: subDays(24),
      updated_at: subDays(1),
    },
    {
      id: uuidv4(),
      title: 'Global Workflow Automation Rollout',
      company: 'CloudScale Logistics',
      contact_name: 'Marcus Vance',
      contact_email: 'm.vance@cloudscaleglobal.com',
      value: 85000,
      stage: 'PROPOSAL',
      priority: 'HIGH',
      close_date: addDays(21),
      notes: 'Evaluated pilot across 4 regional warehouses; showed 32% turnaround speedup in initial testing.',
      ai_score: 76,
      ai_summary: 'Strong pilot performance metrics. Decision maker is championing internal procurement expansion.',
      ai_risk_factors: JSON.stringify(['Competing against legacy incumbent system renewal']),
      ai_next_step: 'Send competitive ROI teardown presentation before executive committee review.',
      created_at: subDays(18),
      updated_at: subDays(2),
    },
    {
      id: uuidv4(),
      title: 'AI Revenue Copilot Integration',
      company: 'Synthetix Health',
      contact_name: 'Dr. Sarah Chen',
      contact_email: 'schen@synthetixhealth.org',
      value: 210000,
      stage: 'DISCOVERY',
      priority: 'HIGH',
      close_date: addDays(45),
      notes: 'HIPAA compliance requirements confirmed. Exploring AI-driven triage for clinical operations.',
      ai_score: 62,
      ai_summary: 'Large multi-department deal. Requires thorough architecture review with healthcare infosec team.',
      ai_risk_factors: JSON.stringify(['Extended procurement cycles typical of healthcare sector', 'BAA signing required']),
      ai_next_step: 'Conduct tailored architecture security workshop with Chief Information Security Officer.',
      created_at: subDays(10),
      updated_at: subDays(3),
    },
    {
      id: uuidv4(),
      title: 'Inbound Pilot Expansion',
      company: 'Nexus Creative Studio',
      contact_name: 'Julian Mercer',
      contact_email: 'julian@nexuscreative.co',
      value: 36000,
      stage: 'LEAD',
      priority: 'MEDIUM',
      close_date: addDays(60),
      notes: 'Came via product product hunt launch. Interested in team seats and API integrations.',
      ai_score: 45,
      ai_summary: 'Early inbound lead with strong product enthusiasm but unverified annual budget allocation.',
      ai_risk_factors: JSON.stringify(['Budget authority unclear', 'Single point of contact']),
      ai_next_step: 'Run qualification discovery call to identify economic buyer and timeline expectations.',
      created_at: subDays(4),
      updated_at: subDays(4),
    },
    {
      id: uuidv4(),
      title: 'Annual Enterprise SaaS License',
      company: 'Veloce Mobility Labs',
      contact_name: 'Henrik Larsson',
      contact_email: 'henrik@velocelabs.eu',
      value: 165000,
      stage: 'CLOSED_WON',
      priority: 'URGENT',
      close_date: subDays(3),
      notes: 'Contracts executed! 3-year multi-region enterprise agreement with dedicated customer success manager.',
      ai_score: 98,
      ai_summary: 'Successfully closed Tier-1 mobility enterprise account with multi-year expansion clauses.',
      ai_risk_factors: JSON.stringify([]),
      ai_next_step: 'Initiate kickoff meeting and handover to Customer Success onboarding team.',
      created_at: subDays(45),
      updated_at: subDays(3),
    },
    {
      id: uuidv4(),
      title: 'Customer Data Platform Upgrade',
      company: 'OmniRetail Brands',
      contact_name: 'Priya Sharma',
      contact_email: 'priya.s@omniretail.com',
      value: 72000,
      stage: 'PROPOSAL',
      priority: 'MEDIUM',
      close_date: addDays(30),
      notes: 'Technical POC successfully passed. Proposal delivered with tiered seat pricing.',
      ai_score: 71,
      ai_summary: 'Positive technical evaluation. Procurement waiting on Q4 capital expenditure clearance.',
      ai_risk_factors: JSON.stringify(['Potential postponement to next fiscal year']),
      ai_next_step: 'Offer quarterly billing structure to align with current year cash flow constraints.',
      created_at: subDays(15),
      updated_at: subDays(5),
    },
    {
      id: uuidv4(),
      title: 'Legacy CRM Migration',
      company: 'Kestrel Aerospace',
      contact_name: 'Thomas Wright',
      contact_email: 't.wright@kestrelaero.com',
      value: 190000,
      stage: 'CLOSED_LOST',
      priority: 'LOW',
      close_date: subDays(8),
      notes: 'Internal project postponed due to corporate acquisition freeze.',
      ai_score: 15,
      ai_summary: 'Deal frozen indefinitely due to M&A restructuring. Maintained warm relationship for future revisit.',
      ai_risk_factors: JSON.stringify(['Corporate freeze', 'Budget eliminated']),
      ai_next_step: 'Add to quarterly nurture campaign and revisit in Q3 next year.',
      created_at: subDays(60),
      updated_at: subDays(8),
    }
  ];

  const insertDeal = db.prepare(`
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

  const insertActivity = db.prepare(`
    INSERT INTO activities (id, deal_id, type, description, metadata, created_at)
    VALUES (@id, @deal_id, @type, @description, @metadata, @created_at)
  `);

  const insertRule = db.prepare(`
    INSERT INTO workflow_rules (
      id, name, trigger_event, condition_json, action_type, action_payload,
      is_active, execution_count, created_at
    ) VALUES (
      @id, @name, @trigger_event, @condition_json, @action_type, @action_payload,
      @is_active, @execution_count, @created_at
    )
  `);

  // Seed Deals and Activities
  for (const deal of deals) {
    insertDeal.run(deal);

    insertActivity.run({
      id: uuidv4(),
      deal_id: deal.id,
      type: 'DEAL_CREATED',
      description: `Deal created for ${deal.company} ($${deal.value.toLocaleString()})`,
      metadata: JSON.stringify({ initialStage: deal.stage }),
      created_at: deal.created_at,
    });

    if (deal.stage !== 'LEAD') {
      insertActivity.run({
        id: uuidv4(),
        deal_id: deal.id,
        type: 'STAGE_CHANGE',
        description: `Stage progressed to ${deal.stage}`,
        metadata: JSON.stringify({ stage: deal.stage }),
        created_at: deal.updated_at,
      });
    }

    insertActivity.run({
      id: uuidv4(),
      deal_id: deal.id,
      type: 'AI_ANALYSIS',
      description: `AI Health score evaluated at ${deal.ai_score}% with risk factors identified`,
      metadata: JSON.stringify({ score: deal.ai_score }),
      created_at: deal.updated_at,
    });
  }

  // Seed Automated Workflow Rules
  const workflowRules = [
    {
      id: uuidv4(),
      name: 'Auto-Promote High Value Deals in Negotiation',
      trigger_event: 'STAGE_CHANGED',
      condition_json: JSON.stringify({ stage: 'NEGOTIATION', valueMin: 50000 }),
      action_type: 'SET_PRIORITY',
      action_payload: JSON.stringify({ priority: 'URGENT' }),
      is_active: 1,
      execution_count: 14,
      created_at: subDays(30),
    },
    {
      id: uuidv4(),
      name: 'Trigger Executive AI Brief on Proposal Stage',
      trigger_event: 'STAGE_CHANGED',
      condition_json: JSON.stringify({ stage: 'PROPOSAL' }),
      action_type: 'AUTO_AI_BRIEF',
      action_payload: JSON.stringify({ format: 'EXECUTIVE_BRIEF' }),
      is_active: 1,
      execution_count: 22,
      created_at: subDays(28),
    },
    {
      id: uuidv4(),
      name: 'Disqualify Alert on Stalled Low Score Leads',
      trigger_event: 'SCORE_THRESHOLD',
      condition_json: JSON.stringify({ scoreMin: 85 }),
      action_type: 'SEND_NOTIFICATION',
      action_payload: JSON.stringify({ channel: '#revenue-champions' }),
      is_active: 1,
      execution_count: 9,
      created_at: subDays(20),
    },
    {
      id: uuidv4(),
      name: 'Audit Trail Checkpoint for Inbound Leads',
      trigger_event: 'DEAL_CREATED',
      condition_json: JSON.stringify({}),
      action_type: 'LOG_AUDIT',
      action_payload: JSON.stringify({ category: 'COMPLIANCE' }),
      is_active: 1,
      execution_count: 35,
      created_at: subDays(25),
    }
  ];

  for (const rule of workflowRules) {
    insertRule.run(rule);
  }

  console.log('[Seed] Seeding completed successfully!');
}
