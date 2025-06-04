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

export const getUserSettings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getLoggedInUser(ctx);
    
    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    
    return settings || {
      geminiApiKey: "",
      defaultTaskView: "list",
      theme: "light",
    };
  },
});

export const updateSettings = mutation({
  args: {
    geminiApiKey: v.optional(v.string()),
    defaultTaskView: v.optional(v.union(v.literal("list"), v.literal("calendar"), v.literal("kanban"))),
    theme: v.optional(v.union(v.literal("light"), v.literal("dark"))),
  },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    
    const existingSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    
    if (existingSettings) {
      return await ctx.db.patch(existingSettings._id, {
        ...args,
        userId,
      });
    } else {
      return await ctx.db.insert("userSettings", {
        geminiApiKey: args.geminiApiKey || "",
        defaultTaskView: args.defaultTaskView || "list",
        theme: args.theme || "light",
        userId,
      });
    }
  },
});
