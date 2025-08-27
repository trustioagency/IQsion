
import { db } from "../db";
import { rawEvents, customerJourneys, type InsertCustomerJourney } from "@shared/schema";
import { eq, and, sql, desc, asc } from "drizzle-orm";

export interface TouchPoint {
  platform: string;
  campaignName: string;
  eventType: string;
  timestamp: string;
  revenue?: number;
}

export interface ProcessedJourney {
  customerId: string;
  orderId: string;
  orderValue: number;
  touchpoints: TouchPoint[];
  firstTouchChannel: string;
  lastTouchChannel: string;
  journeyDuration: number; // in hours
  purchaseTimestamp: string;
}

export class JourneyProcessor {
  /**
   * Faz 1.1: Ham veri toplama - Bu fonksiyon farklı kaynaklardan gelen verileri rawEvents tablosuna kaydeder
   */
  async insertRawEvent(userId: string, eventData: {
    sessionId?: string;
    customerId?: string;
    eventType: string;
    platform: string;
    campaignId?: string;
    campaignName?: string;
    adGroupId?: string;
    adId?: string;
    pageUrl?: string;
    referrer?: string;
    revenue?: number;
    eventTimestamp: Date;
  }) {
    await db.insert(rawEvents).values({
      userId,
      ...eventData,
    });
  }

  /**
   * Faz 1.2: Yolculukları birleştirme - Ham eventleri müşteri yolculuklarına dönüştürür
   */
  async processCustomerJourneys(userId: string): Promise<void> {
    console.log("Starting customer journey processing for user:", userId);

    // Satın alma eventlerini bul
    const purchaseEvents = await db
      .select()
      .from(rawEvents)
      .where(and(
        eq(rawEvents.userId, userId),
        eq(rawEvents.eventType, "purchase")
      ))
      .orderBy(desc(rawEvents.eventTimestamp));

    console.log(`Found ${purchaseEvents.length} purchase events`);

    for (const purchase of purchaseEvents) {
      if (!purchase.customerId) continue;

      // Bu satın almadan önceki tüm touchpoint'leri bul (30 gün window)
      const thirtyDaysAgo = new Date(purchase.eventTimestamp);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const touchpoints = await db
        .select()
        .from(rawEvents)
        .where(and(
          eq(rawEvents.userId, userId),
          eq(rawEvents.customerId, purchase.customerId),
          sql`${rawEvents.eventTimestamp} >= ${thirtyDaysAgo}`,
          sql`${rawEvents.eventTimestamp} <= ${purchase.eventTimestamp}`
        ))
        .orderBy(asc(rawEvents.eventTimestamp));

      if (touchpoints.length === 0) continue;

      // Journey data hazırla
      const journeyData: TouchPoint[] = touchpoints.map(tp => ({
        platform: tp.platform,
        campaignName: tp.campaignName || 'Unknown',
        eventType: tp.eventType,
        timestamp: tp.eventTimestamp.toISOString(),
        revenue: tp.revenue ? parseFloat(tp.revenue.toString()) : undefined,
      }));

      const firstTouch = touchpoints[0];
      const lastTouch = touchpoints[touchpoints.length - 1];
      
      // Journey duration hesapla (saat olarak)
      const durationMs = purchase.eventTimestamp.getTime() - firstTouch.eventTimestamp.getTime();
      const durationHours = Math.round(durationMs / (1000 * 60 * 60));

      const journeyRecord: InsertCustomerJourney = {
        userId,
        customerId: purchase.customerId,
        orderId: purchase.id, // purchase event ID'sini order ID olarak kullan
        orderValue: purchase.revenue || sql`0`,
        journeyData: journeyData,
        firstTouchChannel: firstTouch.platform,
        lastTouchChannel: lastTouch.platform,
        journeyDuration: durationHours,
        touchpointCount: touchpoints.length,
        purchaseTimestamp: purchase.eventTimestamp,
      };

      // Journey'i kaydet (duplicate check ile)
      const existingJourney = await db
        .select()
        .from(customerJourneys)
        .where(and(
          eq(customerJourneys.userId, userId),
          eq(customerJourneys.orderId, purchase.id)
        ))
        .limit(1);

      if (existingJourney.length === 0) {
        await db.insert(customerJourneys).values(journeyRecord);
        console.log(`Processed journey for customer ${purchase.customerId}, order ${purchase.id}`);
      }
    }

    console.log("Customer journey processing completed");
  }

  /**
   * Test veri oluşturma fonksiyonu - Demo için sample data
   */
  async generateSampleData(userId: string): Promise<void> {
    console.log("Generating sample attribution data for user:", userId);

    const sampleCustomers = ['customer_001', 'customer_002', 'customer_003', 'customer_004', 'customer_005'];
    const platforms = ['google', 'meta', 'instagram', 'tiktok', 'email', 'direct'];
    const campaigns = ['Brand Awareness', 'Product Launch', 'Retargeting', 'Holiday Sale', 'New Customer'];

    for (let i = 0; i < 50; i++) {
      const customerId = sampleCustomers[Math.floor(Math.random() * sampleCustomers.length)];
      const purchaseDate = new Date();
      purchaseDate.setDate(purchaseDate.getDate() - Math.floor(Math.random() * 30));

      // Random journey oluştur (2-5 touchpoint)
      const touchpointCount = 2 + Math.floor(Math.random() * 4);
      const journeyEvents = [];

      for (let j = 0; j < touchpointCount; j++) {
        const eventDate = new Date(purchaseDate);
        eventDate.setHours(eventDate.getHours() - (touchpointCount - j) * 24);

        const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];

        journeyEvents.push({
          sessionId: `session_${customerId}_${j}`,
          customerId,
          eventType: j === touchpointCount - 1 ? 'purchase' : (Math.random() > 0.5 ? 'click' : 'impression'),
          platform,
          campaignName: campaign,
          revenue: j === touchpointCount - 1 ? 100 + Math.random() * 500 : undefined,
          eventTimestamp: eventDate,
        });
      }

      // Events'leri kaydet
      for (const event of journeyEvents) {
        await this.insertRawEvent(userId, event);
      }
    }

    console.log("Sample data generation completed");
  }
}

export const journeyProcessor = new JourneyProcessor();
