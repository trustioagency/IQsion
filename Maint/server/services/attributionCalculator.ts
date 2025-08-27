
import { db } from "../db";
import { customerJourneys, attributionResults, type InsertAttributionResult } from "@shared/schema";
import { eq, and, sql, gte } from "drizzle-orm";

export interface ChannelAttribution {
  channel: string;
  revenue: number;
  percentage: number;
  orderCount: number;
}

export interface AttributionModelResult {
  modelType: string;
  totalRevenue: number;
  channelResults: ChannelAttribution[];
  calculatedAt: Date;
}

export class AttributionCalculator {
  /**
   * Faz 2.1: Basit modelleri hesaplama
   */
  async calculateFirstClickAttribution(userId: string, timeRange: string): Promise<AttributionModelResult> {
    const dateFilter = this.getDateFilter(timeRange);
    
    const journeys = await db
      .select()
      .from(customerJourneys)
      .where(and(
        eq(customerJourneys.userId, userId),
        gte(customerJourneys.purchaseTimestamp, dateFilter)
      ));

    const channelRevenue: { [key: string]: { revenue: number; count: number } } = {};
    let totalRevenue = 0;

    for (const journey of journeys) {
      const revenue = parseFloat(journey.orderValue.toString());
      const firstChannel = journey.firstTouchChannel || 'unknown';
      
      if (!channelRevenue[firstChannel]) {
        channelRevenue[firstChannel] = { revenue: 0, count: 0 };
      }
      
      channelRevenue[firstChannel].revenue += revenue;
      channelRevenue[firstChannel].count += 1;
      totalRevenue += revenue;
    }

    return this.formatResults('first_click', channelRevenue, totalRevenue);
  }

  async calculateLastClickAttribution(userId: string, timeRange: string): Promise<AttributionModelResult> {
    const dateFilter = this.getDateFilter(timeRange);
    
    const journeys = await db
      .select()
      .from(customerJourneys)
      .where(and(
        eq(customerJourneys.userId, userId),
        gte(customerJourneys.purchaseTimestamp, dateFilter)
      ));

    const channelRevenue: { [key: string]: { revenue: number; count: number } } = {};
    let totalRevenue = 0;

    for (const journey of journeys) {
      const revenue = parseFloat(journey.orderValue.toString());
      const lastChannel = journey.lastTouchChannel || 'unknown';
      
      if (!channelRevenue[lastChannel]) {
        channelRevenue[lastChannel] = { revenue: 0, count: 0 };
      }
      
      channelRevenue[lastChannel].revenue += revenue;
      channelRevenue[lastChannel].count += 1;
      totalRevenue += revenue;
    }

    return this.formatResults('last_click', channelRevenue, totalRevenue);
  }

  async calculateLinearAttribution(userId: string, timeRange: string): Promise<AttributionModelResult> {
    const dateFilter = this.getDateFilter(timeRange);
    
    const journeys = await db
      .select()
      .from(customerJourneys)
      .where(and(
        eq(customerJourneys.userId, userId),
        gte(customerJourneys.purchaseTimestamp, dateFilter)
      ));

    const channelRevenue: { [key: string]: { revenue: number; count: number } } = {};
    let totalRevenue = 0;

    for (const journey of journeys) {
      const revenue = parseFloat(journey.orderValue.toString());
      const journeyData = journey.journeyData as any[];
      
      if (!journeyData || journeyData.length === 0) continue;

      // Her touchpoint'e eşit pay ver
      const revenuePerTouchpoint = revenue / journeyData.length;
      
      for (const touchpoint of journeyData) {
        const channel = touchpoint.platform || 'unknown';
        
        if (!channelRevenue[channel]) {
          channelRevenue[channel] = { revenue: 0, count: 0 };
        }
        
        channelRevenue[channel].revenue += revenuePerTouchpoint;
      }
      
      totalRevenue += revenue;
    }

    // Count calculation for linear model
    for (const journey of journeys) {
      const journeyData = journey.journeyData as any[];
      if (!journeyData) continue;
      
      const uniqueChannels = [...new Set(journeyData.map(tp => tp.platform))];
      for (const channel of uniqueChannels) {
        if (channelRevenue[channel]) {
          channelRevenue[channel].count += 1 / uniqueChannels.length;
        }
      }
    }

    return this.formatResults('linear', channelRevenue, totalRevenue);
  }

  /**
   * Faz 2.2: Akıllı model - İstatistiksel analiz ile gerçek katkıyı hesapla
   */
  async calculateSmartAttribution(userId: string, timeRange: string): Promise<AttributionModelResult> {
    const dateFilter = this.getDateFilter(timeRange);
    
    const journeys = await db
      .select()
      .from(customerJourneys)
      .where(and(
        eq(customerJourneys.userId, userId),
        gte(customerJourneys.purchaseTimestamp, dateFilter)
      ));

    const channelRevenue: { [key: string]: { revenue: number; count: number } } = {};
    let totalRevenue = 0;

    // Markov Chain yaklaşımı - her kanalın dönüşüm olasılığına katkısını hesapla
    const transitionProbabilities = this.calculateTransitionProbabilities(journeys);
    const removalEffects = this.calculateRemovalEffects(journeys, transitionProbabilities);

    for (const journey of journeys) {
      const revenue = parseFloat(journey.orderValue.toString());
      const journeyData = journey.journeyData as any[];
      
      if (!journeyData || journeyData.length === 0) continue;

      // Her channel için smart attribution score hesapla
      const channelScores: { [channel: string]: number } = {};
      let totalScore = 0;

      for (const touchpoint of journeyData) {
        const channel = touchpoint.platform || 'unknown';
        
        // Position-based weighting + removal effect
        const positionWeight = this.calculatePositionWeight(journeyData, touchpoint);
        const removalEffect = removalEffects[channel] || 0.1;
        const smartScore = positionWeight * (1 + removalEffect);
        
        channelScores[channel] = (channelScores[channel] || 0) + smartScore;
        totalScore += smartScore;
      }

      // Revenue'yi score'lara göre dağıt
      for (const [channel, score] of Object.entries(channelScores)) {
        const attributedRevenue = (score / totalScore) * revenue;
        
        if (!channelRevenue[channel]) {
          channelRevenue[channel] = { revenue: 0, count: 0 };
        }
        
        channelRevenue[channel].revenue += attributedRevenue;
        channelRevenue[channel].count += score / totalScore;
      }
      
      totalRevenue += revenue;
    }

    return this.formatResults('smart', channelRevenue, totalRevenue);
  }

  /**
   * Faz 2.3: Sonuçları önbelleğe alma
   */
  async cacheAttributionResults(userId: string): Promise<void> {
    const timeRanges = ['7d', '30d', '90d'];
    const models = ['first_click', 'last_click', 'linear', 'smart'];

    for (const timeRange of timeRanges) {
      for (const modelType of models) {
        let result: AttributionModelResult;

        switch (modelType) {
          case 'first_click':
            result = await this.calculateFirstClickAttribution(userId, timeRange);
            break;
          case 'last_click':
            result = await this.calculateLastClickAttribution(userId, timeRange);
            break;
          case 'linear':
            result = await this.calculateLinearAttribution(userId, timeRange);
            break;
          case 'smart':
            result = await this.calculateSmartAttribution(userId, timeRange);
            break;
          default:
            continue;
        }

        // Önce mevcut cache'i sil
        await db
          .delete(attributionResults)
          .where(and(
            eq(attributionResults.userId, userId),
            eq(attributionResults.modelType, modelType),
            eq(attributionResults.timeRange, timeRange)
          ));

        // Yeni sonucu kaydet
        await db.insert(attributionResults).values({
          userId,
          modelType,
          timeRange,
          channelResults: result.channelResults,
          totalRevenue: sql`${result.totalRevenue}`,
        });

        console.log(`Cached ${modelType} attribution for ${timeRange} period`);
      }
    }
  }

  // Helper methods
  private getDateFilter(timeRange: string): Date {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const date = new Date(now);
    date.setDate(date.getDate() - days);
    return date;
  }

  private formatResults(
    modelType: string, 
    channelRevenue: { [key: string]: { revenue: number; count: number } }, 
    totalRevenue: number
  ): AttributionModelResult {
    const channelResults: ChannelAttribution[] = Object.entries(channelRevenue)
      .map(([channel, data]) => ({
        channel,
        revenue: data.revenue,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
        orderCount: Math.round(data.count),
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      modelType,
      totalRevenue,
      channelResults,
      calculatedAt: new Date(),
    };
  }

  private calculateTransitionProbabilities(journeys: any[]): { [key: string]: number } {
    // Simplified transition probability calculation
    const transitions: { [key: string]: number } = {};
    
    for (const journey of journeys) {
      const journeyData = journey.journeyData as any[];
      if (!journeyData || journeyData.length < 2) continue;

      for (let i = 0; i < journeyData.length - 1; i++) {
        const from = journeyData[i].platform;
        const to = journeyData[i + 1].platform;
        const transition = `${from}->${to}`;
        transitions[transition] = (transitions[transition] || 0) + 1;
      }
    }

    return transitions;
  }

  private calculateRemovalEffects(journeys: any[], transitions: { [key: string]: number }): { [key: string]: number } {
    // Simplified removal effect calculation
    const channels = [...new Set(journeys.flatMap(j => 
      (j.journeyData as any[] || []).map(tp => tp.platform)
    ))];

    const removalEffects: { [key: string]: number } = {};

    for (const channel of channels) {
      // Calculate how much conversion rate drops when this channel is removed
      // This is a simplified version - in reality, you'd use more sophisticated statistical methods
      const channelAppearances = journeys.filter(j => 
        (j.journeyData as any[] || []).some(tp => tp.platform === channel)
      ).length;
      
      const conversionImpact = channelAppearances / journeys.length;
      removalEffects[channel] = conversionImpact;
    }

    return removalEffects;
  }

  private calculatePositionWeight(journeyData: any[], currentTouchpoint: any): number {
    const index = journeyData.findIndex(tp => tp === currentTouchpoint);
    const length = journeyData.length;
    
    if (length === 1) return 1;
    
    // U-shaped attribution: First and last touches get more weight
    if (index === 0 || index === length - 1) {
      return 0.4;
    } else {
      return 0.2 / Math.max(1, length - 2);
    }
  }
}

export const attributionCalculator = new AttributionCalculator();
