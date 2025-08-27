import {
  users,
  brandProfiles,
  platformConnections,
  marketingMetrics,
  aiAnalysis,
  tasks,
  rawEvents,
  customerJourneys,
  attributionResults,
  type User,
  type UpsertUser,
  type BrandProfile,
  type InsertBrandProfile,
  type PlatformConnection,
  type InsertPlatformConnection,
  type MarketingMetric,
  type InsertMarketingMetric,
  type AIAnalysis,
  type InsertAIAnalysis,
  type Task,
  type InsertTask,
  type RawEvent,
  type InsertRawEvent,
  type CustomerJourney,
  type InsertCustomerJourney,
  type AttributionResult,
  type InsertAttributionResult,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Brand profile operations
  getBrandProfile(userId: string): Promise<BrandProfile | undefined>;
  createBrandProfile(profile: InsertBrandProfile): Promise<BrandProfile>;
  updateBrandProfile(userId: string, profile: Partial<InsertBrandProfile>): Promise<BrandProfile>;

  // Platform connections
  getPlatformConnections(userId: string): Promise<PlatformConnection[]>;
  upsertPlatformConnection(connection: InsertPlatformConnection): Promise<PlatformConnection>;

  // Marketing metrics
  getMarketingMetrics(userId: string, platform?: string): Promise<MarketingMetric[]>;
  insertMarketingMetric(metric: InsertMarketingMetric): Promise<MarketingMetric>;

  // AI Analysis
  getLatestAnalysis(userId: string, analysisType: string): Promise<AIAnalysis | undefined>;
  insertAIAnalysis(analysis: InsertAIAnalysis): Promise<AIAnalysis>;

  // Tasks
  getTasks(userId: string): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<InsertTask>): Promise<Task>;

  // Attribution analysis
  getRawEvents(userId: string, limit?: number): Promise<RawEvent[]>;
  insertRawEvent(event: InsertRawEvent): Promise<RawEvent>;
  getCustomerJourneys(userId: string, limit?: number): Promise<CustomerJourney[]>;
  insertCustomerJourney(journey: InsertCustomerJourney): Promise<CustomerJourney>;
  getAttributionResults(userId: string, modelType: string, timeRange: string): Promise<AttributionResult | undefined>;
  insertAttributionResult(result: InsertAttributionResult): Promise<AttributionResult>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Brand profile operations
  async getBrandProfile(userId: string): Promise<BrandProfile | undefined> {
    const [profile] = await db
      .select()
      .from(brandProfiles)
      .where(eq(brandProfiles.userId, userId));
    return profile;
  }

  async createBrandProfile(profile: InsertBrandProfile): Promise<BrandProfile> {
    const [newProfile] = await db
      .insert(brandProfiles)
      .values(profile)
      .returning();
    return newProfile;
  }

  async updateBrandProfile(userId: string, profile: Partial<InsertBrandProfile>): Promise<BrandProfile> {
    const [updated] = await db
      .update(brandProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(brandProfiles.userId, userId))
      .returning();
    return updated;
  }

  // Platform connections
  async getPlatformConnections(userId: string): Promise<PlatformConnection[]> {
    return await db
      .select()
      .from(platformConnections)
      .where(eq(platformConnections.userId, userId));
  }

  async upsertPlatformConnection(connection: InsertPlatformConnection): Promise<PlatformConnection> {
    const [result] = await db
      .insert(platformConnections)
      .values(connection)
      .onConflictDoUpdate({
        target: [platformConnections.userId, platformConnections.platform],
        set: {
          ...connection,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result;
  }

  async createPlatformConnection(connection: InsertPlatformConnection): Promise<PlatformConnection> {
    const [result] = await db
      .insert(platformConnections)
      .values(connection)
      .returning();
    return result;
  }

  async updatePlatformConnection(id: string, updates: Partial<InsertPlatformConnection>): Promise<PlatformConnection> {
    const [result] = await db
      .update(platformConnections)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(platformConnections.id, id))
      .returning();
    return result;
  }

  // Marketing metrics
  async getMarketingMetrics(userId: string, platform?: string): Promise<MarketingMetric[]> {
    if (platform) {
      return await db
        .select()
        .from(marketingMetrics)
        .where(and(
          eq(marketingMetrics.userId, userId),
          eq(marketingMetrics.platform, platform)
        ))
        .orderBy(desc(marketingMetrics.metricDate));
    }
    
    return await db
      .select()
      .from(marketingMetrics)
      .where(eq(marketingMetrics.userId, userId))
      .orderBy(desc(marketingMetrics.metricDate));
  }

  async insertMarketingMetric(metric: InsertMarketingMetric): Promise<MarketingMetric> {
    const [newMetric] = await db
      .insert(marketingMetrics)
      .values(metric)
      .returning();
    return newMetric;
  }

  // AI Analysis
  async getLatestAnalysis(userId: string, analysisType: string): Promise<AIAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(aiAnalysis)
      .where(and(
        eq(aiAnalysis.userId, userId),
        eq(aiAnalysis.analysisType, analysisType)
      ))
      .orderBy(desc(aiAnalysis.createdAt))
      .limit(1);
    return analysis;
  }

  async insertAIAnalysis(analysis: InsertAIAnalysis): Promise<AIAnalysis> {
    const [newAnalysis] = await db
      .insert(aiAnalysis)
      .values(analysis)
      .returning();
    return newAnalysis;
  }

  // Tasks
  async getTasks(userId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values(task)
      .returning();
    return newTask;
  }

  async updateTask(id: string, updates: Partial<InsertTask>): Promise<Task> {
    const [updated] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return updated;
  }

  // Attribution analysis methods
  async getRawEvents(userId: string, limit: number = 100): Promise<RawEvent[]> {
    return await db
      .select()
      .from(rawEvents)
      .where(eq(rawEvents.userId, userId))
      .orderBy(desc(rawEvents.eventTimestamp))
      .limit(limit);
  }

  async insertRawEvent(event: InsertRawEvent): Promise<RawEvent> {
    const [newEvent] = await db
      .insert(rawEvents)
      .values(event)
      .returning();
    return newEvent;
  }

  async getCustomerJourneys(userId: string, limit: number = 50): Promise<CustomerJourney[]> {
    return await db
      .select()
      .from(customerJourneys)
      .where(eq(customerJourneys.userId, userId))
      .orderBy(desc(customerJourneys.purchaseTimestamp))
      .limit(limit);
  }

  async insertCustomerJourney(journey: InsertCustomerJourney): Promise<CustomerJourney> {
    const [newJourney] = await db
      .insert(customerJourneys)
      .values(journey)
      .returning();
    return newJourney;
  }

  async getAttributionResults(userId: string, modelType: string, timeRange: string): Promise<AttributionResult | undefined> {
    const [result] = await db
      .select()
      .from(attributionResults)
      .where(and(
        eq(attributionResults.userId, userId),
        eq(attributionResults.modelType, modelType),
        eq(attributionResults.timeRange, timeRange)
      ))
      .orderBy(desc(attributionResults.calculatedAt))
      .limit(1);
    return result;
  }

  async insertAttributionResult(result: InsertAttributionResult): Promise<AttributionResult> {
    const [newResult] = await db
      .insert(attributionResults)
      .values(result)
      .returning();
    return newResult;
  }
}

export const storage = new DatabaseStorage();
