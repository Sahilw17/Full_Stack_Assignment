import { dealRepository } from '../repositories/deal.repository';
import { activityRepository } from '../repositories/activity.repository';
import { PipelineAnalytics, DealStage } from '../types';

export class AnalyticsService {
  getOverview(): PipelineAnalytics {
    const allDeals = dealRepository.findAll();
    const activeDeals = allDeals.filter(d => d.stage !== 'CLOSED_LOST');
    const wonDeals = allDeals.filter(d => d.stage === 'CLOSED_WON');

    const totalPipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);

    // Weighted forecast = sum of (deal value * win probability / 100)
    const weightedPipelineValue = Math.round(
      activeDeals.reduce((sum, d) => sum + d.value * (d.ai_score / 100), 0)
    );

    const averageDealSize = activeDeals.length > 0 
      ? Math.round(totalPipelineValue / activeDeals.length) 
      : 0;

    const closedTotal = allDeals.filter(d => d.stage === 'CLOSED_WON' || d.stage === 'CLOSED_LOST').length;
    const winRatePercentage = closedTotal > 0 
      ? Math.round((wonDeals.length / closedTotal) * 100) 
      : 65;

    // Ordered stages for funnel
    const stageOrder: DealStage[] = ['LEAD', 'DISCOVERY', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];
    const rawStageAggs = dealRepository.getStageAggregates();

    const dealsByStage = stageOrder.map(stage => {
      const match = rawStageAggs.find(a => a.stage === stage);
      return {
        stage,
        count: match ? match.count : 0,
        value: match ? match.value : 0,
      };
    });

    const dealsByPriority = dealRepository.getPriorityAggregates();
    const recentActivities = activityRepository.findRecent(12);

    return {
      totalPipelineValue,
      weightedPipelineValue,
      averageDealSize,
      activeDealsCount: activeDeals.length,
      winRatePercentage,
      dealsByStage,
      dealsByPriority,
      recentActivities,
    };
  }
}

export const analyticsService = new AnalyticsService();
