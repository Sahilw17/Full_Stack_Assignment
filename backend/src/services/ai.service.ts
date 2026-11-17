import { config } from '../config';
import { Deal } from '../types';

export interface DealAnalysisResult {
  score: number;
  summary: string;
  riskFactors: string[];
  nextStep: string;
}

export interface GeneratedEmailResult {
  subject: string;
  body: string;
  tone: string;
}

export class AiService {
  /**
   * Evaluates deal metrics, company context, and stage to return an AI Health Score & Risk Matrix.
   */
  async analyzeDeal(deal: Deal): Promise<DealAnalysisResult> {
    if (config.geminiApiKey) {
      try {
        const prompt = `
You are an expert Enterprise B2B Sales Strategist and Revenue Intelligence AI.
Analyze the following sales deal and return ONLY a valid JSON object (no markdown, no backticks):

Deal Details:
- Title: ${deal.title}
- Company: ${deal.company}
- Contact: ${deal.contact_name} (${deal.contact_email})
- Value: $${deal.value}
- Current Stage: ${deal.stage}
- Priority: ${deal.priority}
- Notes: ${deal.notes || 'None provided'}

JSON format required:
{
  "score": <number between 10 and 98 representing win probability/deal health>,
  "summary": "<crisp 2-sentence executive summary of the opportunity>",
  "riskFactors": ["<risk factor 1>", "<risk factor 2>", "<risk factor 3>"],
  "nextStep": "<actionable tactical next step to progress the deal>"
}
`;
        const response = await this.callGemini(prompt);
        const parsed = this.parseJsonFromResponse<DealAnalysisResult>(response);
        if (parsed && typeof parsed.score === 'number') {
          return parsed;
        }
      } catch (err) {
        console.warn('[AI Service] Gemini call failed, falling back to intelligent heuristic engine:', err);
      }
    }

    // High-quality Heuristic Fallback Engine
    return this.generateHeuristicAnalysis(deal);
  }

  /**
   * Generates a context-aware personalized sales email based on deal attributes.
   */
  async generateEmail(
    deal: Deal,
    type: 'PITCH' | 'FOLLOW_UP' | 'OBJECTION' | 'CLOSING'
  ): Promise<GeneratedEmailResult> {
    if (config.geminiApiKey) {
      try {
        const prompt = `
You are an elite B2B Sales Executive. Write a hyper-personalized email for:
Deal: ${deal.title} at ${deal.company}
Contact: ${deal.contact_name}
Stage: ${deal.stage}
Deal Value: $${deal.value}
Notes: ${deal.notes || 'No recent notes'}
Email Purpose: ${type}

Return ONLY a valid JSON object:
{
  "subject": "<Compelling, high open-rate subject line>",
  "body": "<Polished professional email body with placeholders filled using contact and company info>",
  "tone": "<Professional & Persuasive>"
}
`;
        const response = await this.callGemini(prompt);
        const parsed = this.parseJsonFromResponse<GeneratedEmailResult>(response);
        if (parsed && parsed.subject && parsed.body) {
          return parsed;
        }
      } catch (err) {
        console.warn('[AI Service] Gemini email generation failed, falling back to heuristic engine:', err);
      }
    }

    return this.generateHeuristicEmail(deal, type);
  }

  /**
   * Natural language AI Copilot querying the active pipeline.
   */
  async askCopilot(query: string, deals: Deal[]): Promise<string> {
    const dealsContext = deals.slice(0, 15).map(d => ({
      title: d.title,
      company: d.company,
      value: d.value,
      stage: d.stage,
      priority: d.priority,
      ai_score: d.ai_score,
      next_step: d.ai_next_step,
    }));

    if (config.geminiApiKey) {
      try {
        const prompt = `
You are "DealPulse Copilot", an AI Chief Revenue Officer assistant.
Here is the current live pipeline of deals:
${JSON.stringify(dealsContext, null, 2)}

User Query: "${query}"

Provide a concise, highly insightful, markdown-formatted answer. Highlight high-value opportunities, risks, and recommended actions.
`;
        const response = await this.callGemini(prompt);
        if (response) return response.trim();
      } catch (err) {
        console.warn('[AI Service] Gemini copilot failed, falling back to heuristic assistant:', err);
      }
    }

    return this.generateHeuristicCopilotResponse(query, deals);
  }

  /**
   * Helper to invoke the Gemini REST API.
   */
  private async callGemini(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.geminiApiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status} ${res.statusText}`);
    }

    const data: any = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  private parseJsonFromResponse<T>(text: string): T | null {
    try {
      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      return JSON.parse(cleaned) as T;
    } catch {
      return null;
    }
  }

  /**
   * Heuristic analysis generator
   */
  private generateHeuristicAnalysis(deal: Deal): DealAnalysisResult {
    let score = 55;
    const riskFactors: string[] = [];

    // Stage influence
    switch (deal.stage) {
      case 'LEAD':
        score = 40;
        riskFactors.push('Unverified economic buyer', 'Initial discovery qualification pending');
        break;
      case 'DISCOVERY':
        score = 55;
        riskFactors.push('Technical requirements validation in progress');
        break;
      case 'PROPOSAL':
        score = 70;
        riskFactors.push('Budget approval timeline', 'Competitive alternatives review');
        break;
      case 'NEGOTIATION':
        score = 85;
        riskFactors.push('Legal/Procurement MSA review delay risk');
        break;
      case 'CLOSED_WON':
        score = 98;
        break;
      case 'CLOSED_LOST':
        score = 15;
        riskFactors.push('Deal lost to competitor or frozen budget');
        break;
    }

    // Value influence
    if (deal.value > 100000) {
      score -= 5;
      riskFactors.push('High deal threshold requiring C-level executive sign-off');
    }

    // Priority influence
    if (deal.priority === 'URGENT') score += 8;
    if (deal.priority === 'HIGH') score += 5;
    if (deal.priority === 'LOW') score -= 10;

    score = Math.max(15, Math.min(96, score));

    const summaries = [
      `${deal.company} presents a solid strategic fit for our platform with an estimated annual value of $${deal.value.toLocaleString()}.`,
      `Key stakeholders at ${deal.company} are actively seeking automation and workflow consolidation to optimize operational efficiency.`,
      `High-intent engagement observed with ${deal.contact_name}; potential champion for cross-department expansion.`
    ];

    const nextSteps = [
      `Schedule a technical architecture validation session with ${deal.contact_name}.`,
      `Deliver customized ROI breakdown and executive summary to address budget scrutiny.`,
      `Follow up on MSA redlines and coordinate procurement security onboarding.`,
      `Send product demo recording with benchmark metrics comparing current vs future workflow.`
    ];

    return {
      score,
      summary: summaries[Math.floor(Math.random() * summaries.length)],
      riskFactors: riskFactors.slice(0, 3),
      nextStep: nextSteps[Math.floor(Math.random() * nextSteps.length)],
    };
  }

  private generateHeuristicEmail(
    deal: Deal,
    type: 'PITCH' | 'FOLLOW_UP' | 'OBJECTION' | 'CLOSING'
  ): GeneratedEmailResult {
    const firstName = deal.contact_name.split(' ')[0] || deal.contact_name;

    switch (type) {
      case 'PITCH':
        return {
          subject: `Accelerating ${deal.company}'s workflow efficiency in Q4`,
          body: `Hi ${firstName},\n\nI’ve been following ${deal.company}’s recent milestones and noticed your team is scaling rapid operations.\n\nOur platform helps teams like yours automate end-to-end deal and productivity workflows while cutting cycle times by 40%.\n\nDo you have 10 minutes this Thursday for a brief walkthrough of how we can unlock immediate ROI for your pipeline?\n\nBest regards,\nAccount Executive`,
          tone: 'Persuasive & Value-Driven',
        };
      case 'FOLLOW_UP':
        return {
          subject: `Quick recap & next steps for ${deal.company}`,
          body: `Hi ${firstName},\n\nThank you for the productive discussion regarding ${deal.title}.\n\nAs promised, I’ve put together our solution overview and implementation timeline tailored to your budget targets.\n\nLet me know if 2:00 PM on Tuesday works to review feedback and outline the rollout schedule.\n\nBest,\nAccount Executive`,
          tone: 'Professional & Action-Oriented',
        };
      case 'OBJECTION':
        return {
          subject: `Addressing your questions on ROI & security compliance`,
          body: `Hi ${firstName},\n\nI understand your team's considerations regarding integration overhead and security validation.\n\nWe provide out-of-the-box SOC2-compliant connectors with zero-downtime deployment, ensuring positive ROI within the first 30 days.\n\nWould it help if I connected you with our VP of Engineering to answer specific architecture requirements?\n\nWarm regards,\nAccount Executive`,
          tone: 'Empathetic & Reassuring',
        };
      case 'CLOSING':
        return {
          subject: `Final agreement & onboarding kick-off for ${deal.company}`,
          body: `Hi ${firstName},\n\nAll requested provisions and commercial terms for the $${deal.value.toLocaleString()} agreement have been finalized.\n\nWe’re eager to welcome ${deal.company} aboard and have reserved dedicated onboarding engineering support for your kick-off next week.\n\nPlease review and execute the attached doc at your convenience.\n\nCheers,\nAccount Executive`,
          tone: 'Closing & Confident',
        };
    }
  }

  private generateHeuristicCopilotResponse(query: string, deals: Deal[]): string {
    const lower = query.toLowerCase();
    const totalValue = deals.reduce((sum, d) => sum + d.value, 0);
    const inNegotiation = deals.filter(d => d.stage === 'NEGOTIATION');
    const highPriority = deals.filter(d => d.priority === 'HIGH' || d.priority === 'URGENT');

    if (lower.includes('negotiation') || lower.includes('close') || lower.includes('closing')) {
      if (inNegotiation.length === 0) {
        return `There are currently no deals in the **Negotiation** stage. Consider advancing top proposals such as **${deals[0]?.title || 'active proposals'}** to maintain pipeline velocity.`;
      }
      return `### 🎯 Deals in Negotiation (${inNegotiation.length})\n\n` +
        inNegotiation.map(d => `- **${d.title}** (${d.company}) — **$${d.value.toLocaleString()}** | AI Score: **${d.ai_score}%** | Next Step: ${d.ai_next_step || 'Finalize contract'}`).join('\n') +
        `\n\n**Strategic Recommendation:** Ensure legal terms and procurement sign-offs are locked before month-end to safeguard this revenue.`;
    }

    if (lower.includes('risk') || lower.includes('at risk') || lower.includes('danger')) {
      const atRisk = deals.filter(d => d.ai_score < 50 && d.stage !== 'CLOSED_LOST');
      return `### ⚠️ Pipeline Risk Assessment\n\n` +
        `Detected **${atRisk.length} deals** with low AI Health Scores (<50%):\n` +
        (atRisk.length > 0
          ? atRisk.map(d => `- **${d.company}** ($${d.value.toLocaleString()}) — AI Score: **${d.ai_score}%** | Factor: Stalled engagement or budget friction.`).join('\n')
          : `All active deals currently demonstrate healthy AI engagement scores above 50%!`) +
        `\n\n**Action Item:** Trigger 1-click re-engagement emails to unblock economic buyers.`;
    }

    if (lower.includes('summary') || lower.includes('executive') || lower.includes('overview') || lower.includes('pipeline')) {
      return `### 📊 Executive Pipeline Briefing\n\n` +
        `- **Total Pipeline Value:** $${totalValue.toLocaleString()}\n` +
        `- **Active Deal Count:** ${deals.length} opportunities\n` +
        `- **High-Priority Deals:** ${highPriority.length}\n` +
        `- **Deals in Closing Stages:** ${inNegotiation.length}\n\n` +
        `**Key Growth Driver:** Enterprise deals in the Proposal & Negotiation stages represent over 60% of forecast revenue. Priority focus should remain on accelerating contract approvals.`;
    }

    return `### 💡 DealPulse Intelligence Recap\n\n` +
      `Regarding *"**${query}**"*, here is the immediate operational context:\n\n` +
      `- Active Pipeline: **${deals.length} deals** valued at **$${totalValue.toLocaleString()}**.\n` +
      `- Top opportunity: **${deals[0]?.title || 'Enterprise Deal'}** with ${deals[0]?.company || 'Key Client'} ($${(deals[0]?.value || 0).toLocaleString()}).\n` +
      `- Recommended focus: Address next actions for deals in Proposal and Negotiation to maximize month-end close probability.`;
  }
}

export const aiService = new AiService();
