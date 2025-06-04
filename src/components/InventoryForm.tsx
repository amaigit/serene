import { useState, useEffect } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface InventoryFormProps {
  itemId?: Id<"inventoryItems"> | null;
  locations: Array<{ _id: Id<"locations">; name: string }>;
  onSuccess: () => void;
  onCancel: () => void;
}

export function InventoryForm({ itemId, locations, onSuccess, onCancel }: InventoryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    currentLocationId: "",
    quantity: "1",
    purchaseDate: "",
    itemValue: "",
    keywords: "",
    imageUrl: "",
  });

  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const existingItem = useQuery(api.inventory.getById, itemId ? { id: itemId } : "skip");
  const createItem = useMutation(api.inventory.create);
  const updateItem = useMutation(api.inventory.update);
  const suggestDescription = useAction(api.ai.suggestItemDescription);

  useEffect(() => {
    if (existingItem) {
      setFormData({
        name: existingItem.name,
        description: existingItem.description || "",
        category: existingItem.category,
        currentLocationId: existingItem.currentLocationId || "",
        quantity: existingItem.quantity.toString(),
        purchaseDate: existingItem.purchaseDate ? new Date(existingItem.purchaseDate).toISOString().split('T')[0] : "",
        itemValue: existingItem.itemValue?.toString() || "",
        keywords: existingItem.keywords.join(", "),
        imageUrl: existingItem.imageUrl || "",
      });
    }
  }, [existingItem]);

  const handleAISuggestDescription = async () => {
    if (!formData.name.trim() || !formData.category.trim()) {
      toast.error("Please enter item name and category first");
      return;
    }

    setIsLoadingAI(true);
    try {
      const suggestion = await suggestDescription({
        name: formData.name,
        category: formData.category,
      });
      
      setFormData(prev => ({ ...prev, description: suggestion }));
      toast.success("AI description generated successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to get AI suggestion");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemData = {
      name: formData.name,
      description: formData.description || undefined,
      category: formData.category,
      currentLocationId: formData.currentLocationId ? formData.currentLocationId as Id<"locations"> : undefined,
      quantity: parseInt(formData.quantity),
      purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).getTime() : undefined,
      itemValue: formData.itemValue ? parseFloat(formData.itemValue) : undefined,
      keywords: formData.keywords.split(",").map(keyword => keyword.trim()).filter(Boolean),
      imageUrl: formData.imageUrl || undefined,
      linkedTaskIds: [], // For now, we'll handle task linking later
    };

    try {
      if (itemId) {
        await updateItem({ id: itemId, ...itemData });
        toast.success("Item updated successfully");
      } else {
        await createItem(itemData);
        toast.success("Item created successfully");
      }
      onSuccess();
    } catch (error) {
      toast.error("Error saving item");
      console.error("Error saving item:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          {itemId ? "Edit Item" : "Add New Item"}
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <button
            type="button"
            onClick={handleAISuggestDescription}
            disabled={isLoadingAI}
            className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {isLoadingAI ? "🤖 Generating..." : "🤖 AI Suggest"}
          </button>
        </div>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            type="text"
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Electronics, Books, ToDiscard, ToDonate, ToSell"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Use ToDiscard, ToDonate, or ToSell to auto-create processing tasks
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input
            type="number"
            required
            min="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <select
            value={formData.currentLocationId}
            onChange={(e) => setFormData({ ...formData, currentLocationId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select location</option>
            {locations.map((location) => (
              <option key={location._id} value={location._id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
          <input
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Value ($)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={formData.itemValue}
          onChange={(e) => setFormData({ ...formData, itemValue: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma-separated)</label>
        <input
          type="text"
          value={formData.keywords}
          onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
          placeholder="portable, wireless, gaming"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
        <input
          type="url"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
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
          {itemId ? "Update" : "Add"} Item
        </button>
      </div>
    </form>
  );
}
