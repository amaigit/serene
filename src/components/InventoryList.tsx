import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface InventoryItem {
  _id: Id<"inventoryItems">;
  name: string;
  description?: string;
  category: string;
  quantity: number;
  purchaseDate?: number;
  itemValue?: number;
  keywords: string[];
  imageUrl?: string;
  location?: string;
  _creationTime: number;
}

interface InventoryListProps {
  items: InventoryItem[];
  onEdit: (itemId: Id<"inventoryItems">) => void;
}

export function InventoryList({ items, onEdit }: InventoryListProps) {
  const deleteItem = useMutation(api.inventory.remove);

  const handleDelete = async (itemId: Id<"inventoryItems">) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await deleteItem({ id: itemId });
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No items found. Add your first item to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div key={item._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {item.imageUrl && (
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
            </div>
          )}
          
          <div className="p-6">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {item.category}
              </span>
            </div>
            
            {item.description && (
              <p className="text-gray-600 text-sm mb-3">{item.description}</p>
            )}
            
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex justify-between">
                <span>Quantity:</span>
                <span className="font-medium">{item.quantity}</span>
              </div>
              
              {item.location && (
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="font-medium">{item.location}</span>
                </div>
              )}
              
              {item.itemValue && (
                <div className="flex justify-between">
                  <span>Value:</span>
                  <span className="font-medium">${item.itemValue.toFixed(2)}</span>
                </div>
              )}
              
              {item.purchaseDate && (
                <div className="flex justify-between">
                  <span>Purchased:</span>
                  <span className="font-medium">{new Date(item.purchaseDate).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            
            {item.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {item.keywords.map((keyword, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                    {keyword}
                  </span>
                ))}
              </div>
            )}
            
            <div className="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => onEdit(item._id)}
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
        </div>
      ))}
    </div>
  );
}
