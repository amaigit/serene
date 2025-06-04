import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const suggestItemDescription = action({
  args: {
    name: v.string(),
    category: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const settings: any = await ctx.runQuery(api.settings.getUserSettings, {});
    
    if (!settings.geminiApiKey) {
      throw new Error("Gemini API key not configured. Please set it in Settings.");
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${settings.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a concise, helpful description for an inventory item with the following details:
Name: ${args.name}
Category: ${args.category}

Please provide a 1-2 sentence description that would help someone identify and understand this item. Focus on key characteristics, typical uses, or distinguishing features.`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const suggestion = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!suggestion) {
        throw new Error("No suggestion received from AI");
      }

      return suggestion.trim();
    } catch (error) {
      console.error("AI suggestion error:", error);
      throw new Error("Failed to generate AI suggestion. Please check your API key and try again.");
    }
  },
});

export const suggestTaskPriority = action({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<{ priority: "urgent" | "high" | "medium" | "low"; explanation: string }> => {
    const settings: any = await ctx.runQuery(api.settings.getUserSettings, {});
    
    if (!settings.geminiApiKey) {
      throw new Error("Gemini API key not configured. Please set it in Settings.");
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${settings.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze the following task and suggest an appropriate priority level:

Title: ${args.title}
Description: ${args.description || "No description provided"}

Based on the content, suggest ONE of these priority levels:
- urgent: Time-sensitive, critical tasks that need immediate attention
- high: Important tasks that should be completed soon
- medium: Regular tasks with moderate importance
- low: Tasks that can be done when time permits

Respond with only the priority level (urgent, high, medium, or low) and a brief 1-sentence explanation.`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: any = await response.json();
      const suggestion: string = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!suggestion) {
        throw new Error("No suggestion received from AI");
      }

      // Extract priority from response
      const priorityMatch: RegExpMatchArray | null = suggestion.toLowerCase().match(/\b(urgent|high|medium|low)\b/);
      const priority: string = priorityMatch ? priorityMatch[1] : "medium";
      
      return {
        priority: priority as "urgent" | "high" | "medium" | "low",
        explanation: suggestion.trim()
      };
    } catch (error) {
      console.error("AI suggestion error:", error);
      throw new Error("Failed to generate AI suggestion. Please check your API key and try again.");
    }
  },
});
