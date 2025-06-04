import { useState, useEffect } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface TaskFormProps {
  taskId?: Id<"tasks"> | null;
  projects: Array<{ _id: Id<"projects">; name: string }>;
  contexts: Array<{ _id: Id<"contexts">; name: string }>;
  locations: Array<{ _id: Id<"locations">; name: string }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TaskForm({ taskId, projects, contexts, locations, onSuccess, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "inbox" as "inbox" | "next_action" | "completed" | "waiting_for" | "scheduled",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    dueDate: "",
    scheduledDate: "",
    estimatedTime: "",
    tags: "",
    projectId: "",
    contextId: "",
    locationId: "",
  });

  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const existingTask = useQuery(api.tasks.getById, taskId ? { id: taskId } : "skip");
  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);
  const suggestPriority = useAction(api.ai.suggestTaskPriority);

  useEffect(() => {
    if (existingTask) {
      setFormData({
        title: existingTask.title,
        description: existingTask.description || "",
        status: existingTask.status,
        priority: existingTask.priority,
        dueDate: existingTask.dueDate ? new Date(existingTask.dueDate).toISOString().split('T')[0] : "",
        scheduledDate: existingTask.scheduledDate ? new Date(existingTask.scheduledDate).toISOString().split('T')[0] : "",
        estimatedTime: existingTask.estimatedTime?.toString() || "",
        tags: existingTask.tags.join(", "),
        projectId: existingTask.projectId || "",
        contextId: existingTask.contextId || "",
        locationId: existingTask.locationId || "",
      });
    }
  }, [existingTask]);

  const handleAISuggestPriority = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a task title first");
      return;
    }

    setIsLoadingAI(true);
    try {
      const result = await suggestPriority({
        title: formData.title,
        description: formData.description || undefined,
      });
      
      setFormData(prev => ({ ...prev, priority: result.priority }));
      toast.success(`AI suggested priority: ${result.priority}. ${result.explanation}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to get AI suggestion");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      title: formData.title,
      description: formData.description || undefined,
      status: formData.status,
      priority: formData.priority,
      dueDate: formData.dueDate ? new Date(formData.dueDate).getTime() : undefined,
      scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).getTime() : undefined,
      estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined,
      tags: formData.tags.split(",").map(tag => tag.trim()).filter(Boolean),
      projectId: formData.projectId ? formData.projectId as Id<"projects"> : undefined,
      contextId: formData.contextId ? formData.contextId as Id<"contexts"> : undefined,
      locationId: formData.locationId ? formData.locationId as Id<"locations"> : undefined,
    };

    try {
      if (taskId) {
        await updateTask({ id: taskId, ...taskData });
        toast.success("Task updated successfully");
      } else {
        await createTask(taskData);
        toast.success("Task created successfully");
      }
      onSuccess();
    } catch (error) {
      toast.error("Error saving task");
      console.error("Error saving task:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {taskId ? "Edit Task" : "Create New Task"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="inbox">Inbox</option>
            <option value="next_action">Next Action</option>
            <option value="waiting_for">Waiting For</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <button
              type="button"
              onClick={handleAISuggestPriority}
              disabled={isLoadingAI}
              className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
            >
              {isLoadingAI ? "🤖 Thinking..." : "🤖 AI Suggest"}
            </button>
          </div>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
          <input
            type="date"
            value={formData.scheduledDate}
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time (minutes)</label>
        <input
          type="number"
          value={formData.estimatedTime}
          onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="work, urgent, meeting"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
          <select
            value={formData.projectId}
            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">None</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Context</label>
          <select
            value={formData.contextId}
            onChange={(e) => setFormData({ ...formData, contextId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">None</option>
            {contexts.map((context) => (
              <option key={context._id} value={context._id}>
                {context.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select
            value={formData.locationId}
            onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">None</option>
            {locations.map((location) => (
              <option key={location._id} value={location._id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {taskId ? "Update" : "Create"} Task
        </button>
      </div>
    </form>
  );
}
