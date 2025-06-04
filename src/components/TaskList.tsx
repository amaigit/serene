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

interface TaskListProps {
  tasks: Task[];
  onEdit: (taskId: Id<"tasks">) => void;
}

export function TaskList({ tasks, onEdit }: TaskListProps) {
  const updateTask = useMutation(api.tasks.update);
  const deleteTask = useMutation(api.tasks.remove);

  const handleStatusChange = async (taskId: Id<"tasks">, newStatus: "inbox" | "next_action" | "completed" | "waiting_for" | "scheduled") => {
    try {
      await updateTask({ id: taskId, status: newStatus });
      toast.success("Task status updated");
    } catch (error) {
      toast.error("Failed to update task status");
    }
  };

  const handleDelete = async (taskId: Id<"tasks">) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask({ id: taskId });
        toast.success("Task deleted");
      } catch (error) {
        toast.error("Failed to delete task");
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "next_action": return "bg-blue-100 text-blue-800";
      case "waiting_for": return "bg-purple-100 text-purple-800";
      case "scheduled": return "bg-indigo-100 text-indigo-800";
      case "inbox": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No tasks found. Create your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div key={task._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                  {task.status.replace("_", " ")}
                </span>
              </div>
              
              {task.description && (
                <p className="text-gray-600 mb-3">{task.description}</p>
              )}
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                {task.dueDate && (
                  <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                )}
                {task.scheduledDate && (
                  <span>Scheduled: {new Date(task.scheduledDate).toLocaleDateString()}</span>
                )}
                {task.estimatedTime && (
                  <span>Est: {task.estimatedTime}min</span>
                )}
                {task.project && (
                  <span>Project: {task.project}</span>
                )}
                {task.context && (
                  <span>Context: {task.context}</span>
                )}
                {task.location && (
                  <span>Location: {task.location}</span>
                )}
              </div>
              
              {task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {task.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(task._id, e.target.value as any)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="inbox">Inbox</option>
                <option value="next_action">Next Action</option>
                <option value="waiting_for">Waiting For</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
              </select>
              
              <button
                onClick={() => onEdit(task._id)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Edit
              </button>
              
              <button
                onClick={() => handleDelete(task._id)}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
