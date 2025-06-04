import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { InventoryForm } from "./InventoryForm";
import { InventoryList } from "./InventoryList";
import { Id } from "../../convex/_generated/dataModel";

export function InventoryManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Id<"inventoryItems"> | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const items = useQuery(api.inventory.list, categoryFilter === "all" ? {} : { category: categoryFilter });
  const categories = useQuery(api.inventory.getCategories);
  const locations = useQuery(api.locations.list);

  const handleItemCreated = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const handleEditItem = (itemId: Id<"inventoryItems">) => {
    setEditingItem(itemId);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Item
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setCategoryFilter("all")}
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            categoryFilter === "all"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {categories?.map((category) => (
          <button
            key={category}
            onClick={() => setCategoryFilter(category)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              categoryFilter === category
                ? "bg-blue-100 text-blue-800"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-lg bg-white">
            <InventoryForm
              itemId={editingItem}
              locations={locations || []}
              onSuccess={handleItemCreated}
              onCancel={() => {
                setShowForm(false);
                setEditingItem(null);
              }}
            />
          </div>
        </div>
      )}

      <InventoryList
        items={items || []}
        onEdit={handleEditItem}
      />
    </div>
  );
}
