import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

async function getLoggedInUser(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("User not authenticated");
  }
  return userId;
}

export const list = query({
  args: {
    category: v.optional(v.string()),
    locationId: v.optional(v.id("locations")),
  },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    
    let query = ctx.db.query("inventoryItems").withIndex("by_user", (q) => q.eq("userId", userId));
    
    if (args.category) {
      query = ctx.db.query("inventoryItems").withIndex("by_user_and_category", (q) => 
        q.eq("userId", userId).eq("category", args.category!)
      );
    }
    
    if (args.locationId) {
      query = ctx.db.query("inventoryItems").withIndex("by_user_and_location", (q) => 
        q.eq("userId", userId).eq("currentLocationId", args.locationId)
      );
    }
    
    const items = await query.order("desc").collect();
    
    // Enrich items with location data
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const location = item.currentLocationId ? await ctx.db.get(item.currentLocationId) : null;
        
        return {
          ...item,
          location: location?.name,
        };
      })
    );
    
    return enrichedItems;
  },
});

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    
    const itemId = await ctx.db.insert("inventoryItems", {
      ...args,
      userId,
    });

    // Auto-create task for disposal categories
    if (["ToDiscard", "ToDonate", "ToSell"].includes(args.category)) {
      await ctx.scheduler.runAfter(0, internal.inventory.createProcessingTask, {
        itemId,
        itemName: args.name,
        category: args.category,
        userId,
      });
    }
    
    return itemId;
  },
});

export const createProcessingTask = internalMutation({
  args: {
    itemId: v.id("inventoryItems"),
    itemName: v.string(),
    category: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const taskId = await ctx.db.insert("tasks", {
      title: `Process item: ${args.itemName}`,
      description: `Item '${args.itemName}' marked as '${args.category}'. Needs processing.`,
      status: "inbox" as const,
      priority: "medium" as const,
      tags: ["auto-generated", "inventory"],
      userId: args.userId,
    });

    // Link the task to the inventory item
    const item = await ctx.db.get(args.itemId);
    if (item) {
      await ctx.db.patch(args.itemId, {
        linkedTaskIds: [...item.linkedTaskIds, taskId],
      });
    }

    return taskId;
  },
});

export const update = mutation({
  args: {
    id: v.id("inventoryItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    currentLocationId: v.optional(v.id("locations")),
    quantity: v.optional(v.number()),
    purchaseDate: v.optional(v.number()),
    itemValue: v.optional(v.number()),
    keywords: v.optional(v.array(v.string())),
    imageUrl: v.optional(v.string()),
    linkedTaskIds: v.optional(v.array(v.id("tasks"))),
  },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    const { id, ...updates } = args;
    
    const item = await ctx.db.get(id);
    if (!item || item.userId !== userId) {
      throw new Error("Item not found or access denied");
    }

    // Check if category changed to a disposal category
    if (updates.category && 
        ["ToDiscard", "ToDonate", "ToSell"].includes(updates.category) &&
        !["ToDiscard", "ToDonate", "ToSell"].includes(item.category)) {
      await ctx.scheduler.runAfter(0, internal.inventory.createProcessingTask, {
        itemId: id,
        itemName: updates.name || item.name,
        category: updates.category,
        userId,
      });
    }
    
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("inventoryItems") },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    
    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) {
      throw new Error("Item not found or access denied");
    }
    
    return await ctx.db.delete(args.id);
  },
});

export const getById = query({
  args: { id: v.id("inventoryItems") },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    
    const item = await ctx.db.get(args.id);
    if (!item || item.userId !== userId) {
      return null;
    }
    
    return item;
  },
});

export const getCategories = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getLoggedInUser(ctx);
    
    const items = await ctx.db
      .query("inventoryItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    
    const categories = [...new Set(items.map(item => item.category))];
    return categories.sort();
  },
});
