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
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("completed"), v.literal("on_hold")),
    goal: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    
    return await ctx.db.insert("projects", {
      ...args,
      userId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("completed"), v.literal("on_hold"))),
    goal: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    const { id, ...updates } = args;
    
    const project = await ctx.db.get(id);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }
    
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    
    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== userId) {
      throw new Error("Project not found or access denied");
    }
    
    return await ctx.db.delete(args.id);
  },
});

export const getById = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    
    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== userId) {
      return null;
    }
    
    return project;
  },
});
