import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { TeamMember } from '../types';

interface TeamListProps {
  team: TeamMember[];
  onChange: (team: TeamMember[]) => void;
}

export function TeamList({ team, onChange }: TeamListProps) {
  const [newMember, setNewMember] = useState({ name: '', role: '' });

  const handleAdd = () => {
    if (newMember.name && newMember.role) {
      onChange([
        ...team,
        {
          id: crypto.randomUUID(),
          name: newMember.name,
          role: newMember.role,
        },
      ]);
      setNewMember({ name: '', role: '' });
    }
  };

  const handleRemove = (id: string) => {
    onChange(team.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Team Members</h2>

      {/* List of team members */}
      <div className="space-y-2">
        {team.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-md"
          >
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
            </div>
            <button
              onClick={() => handleRemove(member.id)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              type="button"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      {/* Add new member */}
      <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-600">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Name"
            value={newMember.name}
            onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          />
          <input
            type="text"
            placeholder="Role"
            value={newMember.role}
            onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
          />
        </div>
        <button
          onClick={handleAdd}
          type="button"
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Team Member
        </button>
      </div>
    </div>
  );
}
