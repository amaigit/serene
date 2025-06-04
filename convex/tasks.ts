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
  args: {
    status: v.optional(v.union(v.literal("inbox"), v.literal("next_action"), v.literal("completed"), v.literal("waiting_for"), v.literal("scheduled"))),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    
    let query = ctx.db.query("tasks").withIndex("by_user", (q) => q.eq("userId", userId));
    
    if (args.status) {
      query = ctx.db.query("tasks").withIndex("by_user_and_status", (q) => 
        q.eq("userId", userId).eq("status", args.status!)
      );
    }
    
    if (args.projectId) {
      query = ctx.db.query("tasks").withIndex("by_user_and_project", (q) => 
        q.eq("userId", userId).eq("projectId", args.projectId)
      );
    }
    
    const tasks = await query.order("desc").collect();
    
    // Enrich tasks with related data
    const enrichedTasks = await Promise.all(
      tasks.map(async (task) => {
        const project = task.projectId ? await ctx.db.get(task.projectId) : null;
        const context = task.contextId ? await ctx.db.get(task.contextId) : null;
        const location = task.locationId ? await ctx.db.get(task.locationId) : null;
        
        return {
          ...task,
          project: project?.name,
          context: context?.name,
          location: location?.name,
        };
      })
    );
    
    return enrichedTasks;
  },
});

export const getTasksForCalendar = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => 
        q.or(
          q.and(
            q.gte(q.field("dueDate"), args.startDate),
            q.lte(q.field("dueDate"), args.endDate)
          ),
          q.and(
            q.gte(q.field("scheduledDate"), args.startDate),
            q.lte(q.field("scheduledDate"), args.endDate)
          )
        )
      )
      .collect();
    
    return tasks;
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("inbox"), v.literal("next_action"), v.literal("completed"), v.literal("waiting_for"), v.literal("scheduled")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    dueDate: v.optional(v.number()),
    scheduledDate: v.optional(v.number()),
    estimatedTime: v.optional(v.number()),
    tags: v.array(v.string()),
    projectId: v.optional(v.id("projects")),
    contextId: v.optional(v.id("contexts")),
    locationId: v.optional(v.id("locations")),
  },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    
    return await ctx.db.insert("tasks", {
      ...args,
      userId,
      completionDate: args.status === "completed" ? Date.now() : undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("inbox"), v.literal("next_action"), v.literal("completed"), v.literal("waiting_for"), v.literal("scheduled"))),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent"))),
    dueDate: v.optional(v.number()),
    scheduledDate: v.optional(v.number()),
    estimatedTime: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    projectId: v.optional(v.id("projects")),
    contextId: v.optional(v.id("contexts")),
    locationId: v.optional(v.id("locations")),
  },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    const { id, ...updates } = args;
    
    const task = await ctx.db.get(id);
    if (!task || task.userId !== userId) {
      throw new Error("Task not found or access denied");
    }
    
    const updateData: any = { ...updates };
    
    // Set completion date when marking as completed
    if (updates.status === "completed" && task.status !== "completed") {
      updateData.completionDate = Date.now();
    } else if (updates.status && updates.status !== "completed") {
      updateData.completionDate = undefined;
    }
    
    return await ctx.db.patch(id, updateData);
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) {
      throw new Error("Task not found or access denied");
    }
    
    return await ctx.db.delete(args.id);
  },
});

export const getById = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const userId = await getLoggedInUser(ctx);
    
    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) {
      return null;
    }
    
    return task;
  },
});
