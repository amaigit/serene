import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

async function getLoggedInUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return userId;
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getLoggedInUser(ctx);
    
    return await ctx.db
      .query("locations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    address: v.optional(v.string()),
    type: v.union(v.literal("home"), v.literal("work"), v.literal("storage"), v.literal("other")),
  },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    
    return await ctx.db.insert("locations", {
      ...args,
      userId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("locations"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    type: v.optional(v.union(v.literal("home"), v.literal("work"), v.literal("storage"), v.literal("other"))),
  },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    const { id, ...updates } = args;
    
    const location = await ctx.db.get(id);
    if (!location || location.userId !== userId) {
      throw new Error("Location not found or access denied");
    }
    
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    
    const location = await ctx.db.get(args.id);
    if (!location || location.userId !== userId) {
      throw new Error("Location not found or access denied");
    }
    
    return await ctx.db.delete(args.id);
  },
});

export const getById = query({
  args: { id: v.id("locations") },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    
    const location = await ctx.db.get(args.id);
    if (!location || location.userId !== userId) {
      return null;
    }
    
    return location;
  },
});
