import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

export function OrganizationManager() {
  const [activeSection, setActiveSection] = useState<"projects" | "contexts" | "locations">("projects");
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active" as "active" | "completed" | "on_hold",
    goal: "",
    address: "",
    type: "home" as "home" | "work" | "storage" | "other",
  });

  const projects = useQuery(api.projects.list);
  const contexts = useQuery(api.contexts.list);
  const locations = useQuery(api.locations.list);

  const createProject = useMutation(api.projects.create);
  const updateProject = useMutation(api.projects.update);
  const deleteProject = useMutation(api.projects.remove);

  const createContext = useMutation(api.contexts.create);
  const updateContext = useMutation(api.contexts.update);
  const deleteContext = useMutation(api.contexts.remove);

  const createLocation = useMutation(api.locations.create);
  const updateLocation = useMutation(api.locations.update);
  const deleteLocation = useMutation(api.locations.remove);

  const sections = [
    { id: "projects", label: "Projects", icon: "📁", description: "Organize tasks into meaningful projects" },
    { id: "contexts", label: "Contexts", icon: "🏷️", description: "Define contexts for when/where tasks are done" },
    { id: "locations", label: "Locations", icon: "📍", description: "Manage physical locations for tasks and inventory" },
  ];

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      status: "active",
      goal: "",
      address: "",
      type: "home",
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleEdit = (item: any) => {
    setFormData({
      name: item.name,
      description: item.description || "",
      status: item.status || "active",
      goal: item.goal || "",
      address: item.address || "",
      type: item.type || "home",
    });
    setEditingItem(item._id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (activeSection === "projects") {
        const projectData = {
          name: formData.name,
          description: formData.description || undefined,
          status: formData.status,
          goal: formData.goal || undefined,
        };
        
        if (editingItem) {
          await updateProject({ id: editingItem as Id<"projects">, ...projectData });
          toast.success("Project updated successfully");
        } else {
          await createProject(projectData);
          toast.success("Project created successfully");
        }
      } else if (activeSection === "contexts") {
        const contextData = {
          name: formData.name,
          description: formData.description || undefined,
        };
        
        if (editingItem) {
          await updateContext({ id: editingItem as Id<"contexts">, ...contextData });
          toast.success("Context updated successfully");
        } else {
          await createContext(contextData);
          toast.success("Context created successfully");
        }
      } else if (activeSection === "locations") {
        const locationData = {
          name: formData.name,
          address: formData.address || undefined,
          type: formData.type,
        };
        
        if (editingItem) {
          await updateLocation({ id: editingItem as Id<"locations">, ...locationData });
          toast.success("Location updated successfully");
        } else {
          await createLocation(locationData);
          toast.success("Location created successfully");
        }
      }
      
      resetForm();
    } catch (error) {
      toast.error("Failed to save item");
      console.error("Error saving item:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    
    try {
      if (activeSection === "projects") {
        await deleteProject({ id: id as Id<"projects"> });
        toast.success("Project deleted");
      } else if (activeSection === "contexts") {
        await deleteContext({ id: id as Id<"contexts"> });
        toast.success("Context deleted");
      } else if (activeSection === "locations") {
        await deleteLocation({ id: id as Id<"locations"> });
        toast.success("Location deleted");
      }
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const getCurrentData = () => {
    switch (activeSection) {
      case "projects": return projects || [];
      case "contexts": return contexts || [];
      case "locations": return locations || [];
      default: return [];
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Organization</h2>
        <p className="text-gray-600">Manage your projects, contexts, and locations to better organize your tasks and inventory.</p>
      </div>

      {/* Section Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeSection === section.id
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>{section.icon}</span>
            <span>{section.label}</span>
          </button>
        ))}
      </div>

      {/* Section Description */}
      <div className="bg-blue-50 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          {sections.find(s => s.id === activeSection)?.description}
        </p>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Add {sections.find(s => s.id === activeSection)?.label.slice(0, -1)}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-lg bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingItem ? "Edit" : "Add"} {sections.find(s => s.id === activeSection)?.label.slice(0, -1)}
                </h3>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {(activeSection === "projects" || activeSection === "contexts") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {activeSection === "projects" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
                    <input
                      type="text"
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {activeSection === "locations" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="storage">Storage</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingItem ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {sections.find(s => s.id === activeSection)?.label}
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {getCurrentData().length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No {activeSection} found. Create your first one to get started!
            </div>
          ) : (
            getCurrentData().map((item: any) => (
              <div key={item._id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                  {item.status && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2 ${
                      item.status === "active" ? "bg-green-100 text-green-800" :
                      item.status === "completed" ? "bg-blue-100 text-blue-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {item.status.replace("_", " ")}
                    </span>
                  )}
                  {item.type && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                      {item.type}
                    </span>
                  )}
                  {item.address && (
                    <p className="text-sm text-gray-500 mt-1">📍 {item.address}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
