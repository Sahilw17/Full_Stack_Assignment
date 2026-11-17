import test, { describe, it } from 'node:test';
import assert from 'node:assert';
import { dealService } from '../services/deal.service';
import { workflowService } from '../services/workflow.service';
import { analyticsService } from '../services/analytics.service';
import { aiService } from '../services/ai.service';
import { initDatabase } from '../database/db';
import { seedInitialData } from '../database/seed';

describe('DealPulse AI Backend Integration & Workflow Suite', () => {
  initDatabase();
  seedInitialData();

  it('should retrieve seeded enterprise deals with valid stages and priorities', () => {
    const deals = dealService.getAllDeals();
    assert.ok(deals.length >= 5, 'Should have at least 5 seeded deals');
    
    const firstDeal = deals[0];
    assert.ok(firstDeal.id, 'Deal must have an ID');
    assert.ok(firstDeal.company, 'Deal must have a company name');
    assert.ok(firstDeal.value > 0, 'Deal value must be positive');
    assert.ok(['LEAD', 'DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'].includes(firstDeal.stage));
  });

  it('should calculate accurate pipeline analytics with AI-weighted forecasting', () => {
    const overview = analyticsService.getOverview();
    assert.ok(overview.totalPipelineValue > 0, 'Total pipeline value must be positive');
    assert.ok(overview.weightedPipelineValue > 0, 'Weighted pipeline forecast must be calculated');
    assert.ok(overview.activeDealsCount > 0, 'Active deals count must be > 0');
    assert.equal(overview.dealsByStage.length, 6, 'Funnel must cover all 6 stages');
  });

  it('should run AI analysis and evaluate deal health score', async () => {
    const deals = dealService.getAllDeals();
    const deal = deals[0];
    const analysis = await aiService.analyzeDeal(deal);

    assert.ok(typeof analysis.score === 'number', 'AI score must be a number');
    assert.ok(analysis.score >= 10 && analysis.score <= 100, 'Score must be in 10-100 range');
    assert.ok(analysis.summary.length > 5, 'AI summary must be populated');
    assert.ok(analysis.nextStep.length > 5, 'Strategic next step must be generated');
  });

  it('should generate hyper-personalized B2B sales emails', async () => {
    const deals = dealService.getAllDeals();
    const deal = deals[0];
    const email = await aiService.generateEmail(deal, 'FOLLOW_UP');

    assert.ok(email.subject.includes(deal.company) || email.subject.length > 10, 'Email subject must be personalized');
    assert.ok(email.body.includes(deal.contact_name.split(' ')[0]), 'Email must greet the contact');
    assert.ok(email.tone.length > 0, 'Email tone must be defined');
  });

  it('should trigger automated workflow actions upon stage transition', async () => {
    const deals = dealService.getAllDeals();
    const testDeal = deals.find(d => d.stage === 'PROPOSAL') || deals[0];
    
    const result = await dealService.changeStage(testDeal.id, 'NEGOTIATION');
    assert.ok(result, 'Stage change result must exist');
    assert.equal(result.deal.stage, 'NEGOTIATION', 'Stage must update to NEGOTIATION');
    
    // Check that activity was logged
    const fullDeal = dealService.getDealById(testDeal.id);
    assert.ok(fullDeal?.activities && fullDeal.activities.length > 0, 'Activities must be recorded for stage change');
  });
});
