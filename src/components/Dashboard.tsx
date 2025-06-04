import { useState } from "react";
import { TaskManager } from "./TaskManager";
import { InventoryManager } from "./InventoryManager";
import { SettingsPage } from "./SettingsPage";
import { OrganizationManager } from "./OrganizationManager";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"tasks" | "inventory" | "organization" | "settings">("tasks");

  const tabs = [
    { id: "tasks", label: "Tasks", icon: "📋" },
    { id: "inventory", label: "Inventory", icon: "📦" },
    { id: "organization", label: "Organization", icon: "🗂️" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "tasks" && <TaskManager />}
      {activeTab === "inventory" && <InventoryManager />}
      {activeTab === "organization" && <OrganizationManager />}
      {activeTab === "settings" && <SettingsPage />}
    </div>
  );
}
