import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Brand profiles for onboarding
export const brandProfiles = pgTable("brand_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessModel: varchar("business_model"),
  industry: varchar("industry"),
  customerType: varchar("customer_type"),
  brandMaturity: varchar("brand_maturity"),
  companySize: varchar("company_size"),
  marketingGoal: varchar("marketing_goal"),
  websiteUrl: text("website_url"),
  monthlyRevenue: varchar("monthly_revenue"),
  monthlyAdBudget: varchar("monthly_ad_budget"),
  mainCompetitors: text("main_competitors"),
  targetAudienceDescription: text("target_audience_description"),
  brandVoice: varchar("brand_voice"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Platform connections (Shopify, Meta, Google, TikTok)
export const platformConnections = pgTable("platform_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  platform: varchar("platform").notNull(), // 'shopify', 'meta', 'google', 'tiktok'
  isConnected: boolean("is_connected").default(false),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  accountId: varchar("account_id"),
  accountName: varchar("account_name"),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Marketing metrics and KPIs
export const marketingMetrics = pgTable("marketing_metrics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  platform: varchar("platform").notNull(),
  metricDate: timestamp("metric_date").notNull(),
  revenue: decimal("revenue", { precision: 12, scale: 2 }),
  adSpend: decimal("ad_spend", { precision: 12, scale: 2 }),
  roas: decimal("roas", { precision: 5, scale: 2 }),
  conversions: integer("conversions"),
  clicks: integer("clicks"),
  impressions: integer("impressions"),
  ctr: decimal("ctr", { precision: 5, scale: 4 }),
  cpc: decimal("cpc", { precision: 8, scale: 2 }),
  cpa: decimal("cpa", { precision: 8, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// AI Analysis results
export const aiAnalysis = pgTable("ai_analysis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  analysisType: varchar("analysis_type").notNull(), // 'market', 'competitor', 'performance'
  data: jsonb("data").notNull(),
  insights: text("insights"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Raw events table for tracking all touchpoints
export const rawEvents = pgTable("raw_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionId: varchar("session_id"),
  customerId: varchar("customer_id"),
  eventType: varchar("event_type").notNull(), // 'click', 'impression', 'visit', 'purchase'
  platform: varchar("platform").notNull(), // 'google', 'meta', 'instagram', 'tiktok', 'email', 'direct'
  campaignId: varchar("campaign_id"),
  campaignName: varchar("campaign_name"),
  adGroupId: varchar("ad_group_id"),
  adId: varchar("ad_id"),
  pageUrl: text("page_url"),
  referrer: text("referrer"),
  revenue: decimal("revenue", { precision: 12, scale: 2 }),
  eventTimestamp: timestamp("event_timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Customer journeys table - processed and clean journey data
export const customerJourneys = pgTable("customer_journeys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  customerId: varchar("customer_id").notNull(),
  orderId: varchar("order_id").notNull(),
  orderValue: decimal("order_value", { precision: 12, scale: 2 }).notNull(),
  journeyData: jsonb("journey_data").notNull(), // Array of touchpoints with timestamps
  firstTouchChannel: varchar("first_touch_channel"),
  lastTouchChannel: varchar("last_touch_channel"),
  journeyDuration: integer("journey_duration"), // in hours
  touchpointCount: integer("touchpoint_count"),
  purchaseTimestamp: timestamp("purchase_timestamp").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Attribution results cache table
export const attributionResults = pgTable("attribution_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  modelType: varchar("model_type").notNull(), // 'first_click', 'last_click', 'linear', 'smart'
  timeRange: varchar("time_range").notNull(), // '7d', '30d', '90d'
  channelResults: jsonb("channel_results").notNull(), // Revenue distribution by channel
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }),
  calculatedAt: timestamp("calculated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tasks and actions
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  status: varchar("status").notNull().default("Yapılacak"), // 'Yapılacak', 'Yapılıyor', 'Tamamlandı'
  priority: varchar("priority").notNull().default("Orta"), // 'Yüksek', 'Orta', 'Düşük'
  dueDate: timestamp("due_date"),
  assignee: varchar("assignee"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type BrandProfile = typeof brandProfiles.$inferSelect;
export type InsertBrandProfile = typeof brandProfiles.$inferInsert;
export type PlatformConnection = typeof platformConnections.$inferSelect;
export type InsertPlatformConnection = typeof platformConnections.$inferInsert;
export type MarketingMetric = typeof marketingMetrics.$inferSelect;
export type InsertMarketingMetric = typeof marketingMetrics.$inferInsert;
export type AIAnalysis = typeof aiAnalysis.$inferSelect;
export type InsertAIAnalysis = typeof aiAnalysis.$inferInsert;
export type RawEvent = typeof rawEvents.$inferSelect;
export type InsertRawEvent = typeof rawEvents.$inferInsert;
export type CustomerJourney = typeof customerJourneys.$inferSelect;
export type InsertCustomerJourney = typeof customerJourneys.$inferInsert;
export type AttributionResult = typeof attributionResults.$inferSelect;
export type InsertAttributionResult = typeof attributionResults.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

// Zod schemas for validation
export const insertBrandProfileSchema = createInsertSchema(brandProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPlatformConnectionSchema = createInsertSchema(platformConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
