import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

export function SettingsPage() {
  const [formData, setFormData] = useState({
    geminiApiKey: "",
    defaultTaskView: "list" as "list" | "calendar" | "kanban",
    theme: "light" as "light" | "dark",
  });

  const [showApiKey, setShowApiKey] = useState(false);

  const settings = useQuery(api.settings.getUserSettings);
  const updateSettings = useMutation(api.settings.updateSettings);

  useEffect(() => {
    if (settings) {
      setFormData({
        geminiApiKey: settings.geminiApiKey || "",
        defaultTaskView: (settings.defaultTaskView as "list" | "calendar" | "kanban") || "list",
        theme: (settings.theme as "light" | "dark") || "light",
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateSettings(formData);
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
      console.error("Error saving settings:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">Manage your application preferences and AI configuration.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* AI Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">AI Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={formData.geminiApiKey}
                  onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
                  placeholder="Enter your Gemini API key"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? "👁️" : "🙈"}
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Your API key is stored securely and used for AI-powered features like task priority suggestions and inventory descriptions.
                Get your free API key from{" "}
                <a 
                  href="https://makersuite.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Google AI Studio
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Application Preferences */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Application Preferences</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Task View
              </label>
              <select
                value={formData.defaultTaskView}
                onChange={(e) => setFormData({ ...formData, defaultTaskView: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="list">List View</option>
                <option value="calendar">Calendar View</option>
                <option value="kanban">Kanban Board</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Choose your preferred default view for the task management page.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <select
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark (Coming Soon)</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Choose your preferred color theme for the application.
              </p>
            </div>
          </div>
        </div>

        {/* AI Features Info */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">🤖 AI Features</h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Task Priority Suggestions:</strong> AI analyzes your task title and description to suggest appropriate priority levels.</p>
            <p><strong>Inventory Descriptions:</strong> AI generates helpful descriptions for your inventory items based on name and category.</p>
            <p><strong>Automated Task Creation:</strong> When you mark items as "ToDiscard", "ToDonate", or "ToSell", tasks are automatically created to help you process them.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
