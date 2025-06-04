import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface Task {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  status: "inbox" | "next_action" | "completed" | "waiting_for" | "scheduled";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: number;
  scheduledDate?: number;
  estimatedTime?: number;
  tags: string[];
  project?: string;
  context?: string;
  location?: string;
  _creationTime: number;
}

interface TaskKanbanProps {
  tasks: Task[];
  onEdit: (taskId: Id<"tasks">) => void;
}

export function TaskKanban({ tasks, onEdit }: TaskKanbanProps) {
  const updateTask = useMutation(api.tasks.update);

  const columns = [
    { id: "inbox", title: "Inbox", color: "bg-gray-100" },
    { id: "next_action", title: "Next Action", color: "bg-blue-100" },
    { id: "waiting_for", title: "Waiting For", color: "bg-purple-100" },
    { id: "scheduled", title: "Scheduled", color: "bg-indigo-100" },
    { id: "completed", title: "Completed", color: "bg-green-100" },
  ];

  const getTasksForColumn = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const handleStatusChange = async (taskId: Id<"tasks">, newStatus: "inbox" | "next_action" | "completed" | "waiting_for" | "scheduled") => {
    try {
      await updateTask({ id: taskId, status: newStatus });
      toast.success("Task moved successfully");
    } catch (error) {
      toast.error("Failed to move task");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "border-l-red-500";
      case "high": return "border-l-orange-500";
      case "medium": return "border-l-yellow-500";
      case "low": return "border-l-green-500";
      default: return "border-l-gray-500";
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: Id<"tasks">) => {
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") as Id<"tasks">;
    await handleStatusChange(taskId, newStatus as any);
  };

  return (
    <div className="flex space-x-6 overflow-x-auto pb-6">
      {columns.map(column => (
        <div
          key={column.id}
          className="flex-shrink-0 w-80"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <div className={`rounded-lg ${column.color} p-4 mb-4`}>
            <h3 className="font-medium text-gray-900 mb-2">{column.title}</h3>
            <span className="text-sm text-gray-600">
              {getTasksForColumn(column.id).length} tasks
            </span>
          </div>

          <div className="space-y-3">
            {getTasksForColumn(column.id).map(task => (
              <div
                key={task._id}
                draggable
                onDragStart={(e) => handleDragStart(e, task._id)}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-move hover:shadow-md transition-shadow border-l-4 ${getPriorityColor(task.priority)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
                  <button
                    onClick={() => onEdit(task._id)}
                    className="text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ✏️
                  </button>
                </div>

                {task.description && (
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2">{task.description}</p>
                )}

                <div className="flex flex-wrap gap-1 mb-2">
                  {task.tags.slice(0, 2).map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      {tag}
                    </span>
                  ))}
                  {task.tags.length > 2 && (
                    <span className="text-xs text-gray-500">+{task.tags.length - 2}</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    {task.dueDate && (
                      <span>📅 {new Date(task.dueDate).toLocaleDateString()}</span>
                    )}
                    {task.estimatedTime && (
                      <span>⏱️ {task.estimatedTime}m</span>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    task.priority === "urgent" ? "bg-red-100 text-red-800" :
                    task.priority === "high" ? "bg-orange-100 text-orange-800" :
                    task.priority === "medium" ? "bg-yellow-100 text-yellow-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
