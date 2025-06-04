import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { TaskForm } from "./TaskForm";
import { TaskList } from "./TaskList";
import { TaskCalendar } from "./TaskCalendar";
import { TaskKanban } from "./TaskKanban";
import { Id } from "../../convex/_generated/dataModel";

export function TaskManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Id<"tasks"> | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "inbox" | "next_action" | "completed" | "waiting_for" | "scheduled">("all");
  const [viewMode, setViewMode] = useState<"list" | "calendar" | "kanban">("list");

  const tasks = useQuery(api.tasks.list, statusFilter === "all" ? {} : { status: statusFilter });
  const projects = useQuery(api.projects.list);
  const contexts = useQuery(api.contexts.list);
  const locations = useQuery(api.locations.list);

  const handleTaskCreated = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  const handleEditTask = (taskId: Id<"tasks">) => {
    setEditingTask(taskId);
    setShowForm(true);
  };

  const viewModes = [
    { id: "list", label: "List", icon: "📋" },
    { id: "calendar", label: "Calendar", icon: "📅" },
    { id: "kanban", label: "Kanban", icon: "📊" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Task Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Task
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {["all", "inbox", "next_action", "waiting_for", "scheduled", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusFilter === status
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status === "all" ? "All" : status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>

        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          {viewModes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id as any)}
              className={`px-3 py-2 text-sm font-medium flex items-center space-x-1 ${
                viewMode === mode.id
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <span>{mode.icon}</span>
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-lg bg-white">
            <TaskForm
              taskId={editingTask}
              projects={projects || []}
              contexts={contexts || []}
              locations={locations || []}
              onSuccess={handleTaskCreated}
              onCancel={() => {
                setShowForm(false);
                setEditingTask(null);
              }}
            />
          </div>
        </div>
      )}

      {viewMode === "list" && (
        <TaskList
          tasks={tasks || []}
          onEdit={handleEditTask}
        />
      )}

      {viewMode === "calendar" && (
        <TaskCalendar
          onEdit={handleEditTask}
        />
      )}

      {viewMode === "kanban" && (
        <TaskKanban
          tasks={tasks || []}
          onEdit={handleEditTask}
        />
      )}
    </div>
  );
}
