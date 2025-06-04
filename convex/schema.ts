import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("on_hold")),
    goal: v.optional(v.string()),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  contexts: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  locations: defineTable({
    name: v.string(),
    address: v.optional(v.string()),
    type: v.union(v.literal("home"), v.literal("work"), v.literal("storage"), v.literal("other")),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("inbox"), v.literal("next_action"), v.literal("completed"), v.literal("waiting_for"), v.literal("scheduled")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    dueDate: v.optional(v.number()),
    scheduledDate: v.optional(v.number()),
    completionDate: v.optional(v.number()),
    estimatedTime: v.optional(v.number()), // in minutes
    tags: v.array(v.string()),
    projectId: v.optional(v.id("projects")),
    contextId: v.optional(v.id("contexts")),
    locationId: v.optional(v.id("locations")),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_status", ["userId", "status"])
    .index("by_user_and_project", ["userId", "projectId"])
    .index("by_user_and_due_date", ["userId", "dueDate"]),

  inventoryItems: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    currentLocationId: v.optional(v.id("locations")),
    quantity: v.number(),
    purchaseDate: v.optional(v.number()),
    itemValue: v.optional(v.number()),
    keywords: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    linkedTaskIds: v.array(v.id("tasks")),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_category", ["userId", "category"])
    .index("by_user_and_location", ["userId", "currentLocationId"]),

  userSettings: defineTable({
    geminiApiKey: v.string(),
    defaultTaskView: v.union(v.literal("list"), v.literal("calendar"), v.literal("kanban")),
    theme: v.union(v.literal("light"), v.literal("dark")),
    userId: v.id("users"),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
