import { useState } from 'react';
import { Plus, Trash2, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import type { ChecklistItem } from '../types';

interface InspectionChecklistProps {
  checklist: ChecklistItem[];
  onChange: (checklist: ChecklistItem[]) => void;
}

export function InspectionChecklist({ checklist, onChange }: InspectionChecklistProps) {
  const [newItem, setNewItem] = useState({ category: '', description: '' });

  const handleAdd = () => {
    if (newItem.category && newItem.description) {
      onChange([
        ...checklist,
        {
          id: crypto.randomUUID(),
          category: newItem.category,
          description: newItem.description,
          status: 'na',
        },
      ]);
      setNewItem({ category: '', description: '' });
    }
  };

  const handleRemove = (id: string) => {
    onChange(checklist.filter((item) => item.id !== id));
  };

  const handleStatusChange = (id: string, status: 'pass' | 'fail' | 'na') => {
    onChange(
      checklist.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Inspection Checklist</h2>

      {/* List of checklist items */}
      <div className="space-y-2">
        {checklist.map((item) => (
          <div
            key={item.id}
            className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md space-y-2"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-2">
                <p className="font-medium text-gray-900 dark:text-white">{item.category}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors flex-shrink-0"
                type="button"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            {/* Status toggles */}
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusChange(item.id, 'pass')}
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  item.status === 'pass'
                    ? 'bg-green-600 text-white'
                    : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500'
                }`}
              >
                <CheckCircle size={16} />
                Pass
              </button>
              <button
                onClick={() => handleStatusChange(item.id, 'fail')}
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  item.status === 'fail'
                    ? 'bg-red-600 text-white'
                    : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500'
                }`}
              >
                <XCircle size={16} />
                Fail
              </button>
              <button
                onClick={() => handleStatusChange(item.id, 'na')}
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  item.status === 'na'
                    ? 'bg-gray-600 text-white'
                    : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500'
                }`}
              >
                <MinusCircle size={16} />
                N/A
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add new item */}
      <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-600">
        <input
          type="text"
          placeholder="Category (e.g., Safety, Structure, Quality)"
          value={newItem.category}
          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
        <input
          type="text"
          placeholder="Description"
          value={newItem.description}
          onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          type="button"
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Checklist Item
        </button>
      </div>
    </div>
  );
}
