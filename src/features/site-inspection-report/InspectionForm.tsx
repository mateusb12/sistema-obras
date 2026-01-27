import { useState } from 'react';
import { Plus, Trash2, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import type { UseFormRegister } from 'react-hook-form';
import type { InspectionForm as InspectionFormType, TeamMember, ChecklistItem } from './types';

interface InspectionFormProps {
  register: UseFormRegister<InspectionFormType>;
  team: TeamMember[];
  onTeamChange: (team: TeamMember[]) => void;
  checklist: ChecklistItem[];
  onChecklistChange: (checklist: ChecklistItem[]) => void;
}

export function InspectionForm({
                                 register,
                                 team,
                                 onTeamChange,
                                 checklist,
                                 onChecklistChange,
                               }: InspectionFormProps) {
  const [newMember, setNewMember] = useState({ name: '', role: '' });
  const [newItem, setNewItem] = useState({ category: '', description: '' });

  const handleAddTeamMember = () => {
    if (newMember.name && newMember.role) {
      onTeamChange([
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

  const handleRemoveTeamMember = (id: string) => {
    onTeamChange(team.filter((m) => m.id !== id));
  };

  const handleAddChecklistItem = () => {
    if (newItem.category && newItem.description) {
      onChecklistChange([
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

  const handleRemoveChecklistItem = (id: string) => {
    onChecklistChange(checklist.filter((item) => item.id !== id));
  };

  const handleStatusChange = (id: string, status: 'pass' | 'fail' | 'na') => {
    onChecklistChange(
        checklist.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  return (
      <div className="space-y-8">

        {/* Informações do Projeto */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Informações do Projeto</h2>

          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome do Projeto
            </label>
            <input
                {...register('header.projectName')}
                type="text"
                id="projectName"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Digite o nome do projeto"
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Localização
            </label>
            <input
                {...register('header.location')}
                type="text"
                id="location"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Digite a localização"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Data
            </label>
            <input
                {...register('header.date')}
                type="date"
                id="date"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="inspectorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome do Inspetor
            </label>
            <input
                {...register('header.inspectorName')}
                type="text"
                id="inspectorName"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Digite o nome do inspetor"
            />
          </div>
        </div>

        {/* Equipe */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Equipe</h2>

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
                      onClick={() => handleRemoveTeamMember(member.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      type="button"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                  type="text"
                  placeholder="Nome"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTeamMember()}
              />
              <input
                  type="text"
                  placeholder="Função"
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTeamMember()}
              />
            </div>
            <button
                onClick={handleAddTeamMember}
                type="button"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Adicionar Integrante
            </button>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Checklist de Inspeção</h2>

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
                        onClick={() => handleRemoveChecklistItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors flex-shrink-0"
                        type="button"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

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
                      Aprovado
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
                      Reprovado
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

          <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            <input
                type="text"
                placeholder="Categoria (ex.: Segurança, Estrutura, Qualidade)"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            <input
                type="text"
                placeholder="Descrição"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleAddChecklistItem()}
            />
            <button
                onClick={handleAddChecklistItem}
                type="button"
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Adicionar Item ao Checklist
            </button>
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Observações</h2>

          <div>
            <label htmlFor="observations" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notas e observações adicionais
            </label>
            <textarea
                {...register('observations')}
                id="observations"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                placeholder="Digite quaisquer observações, notas ou comentários..."
            />
          </div>
        </div>
      </div>
  );
}
