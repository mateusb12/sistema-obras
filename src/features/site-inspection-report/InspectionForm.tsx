import { useState } from 'react';
import { Plus, Trash2, CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import type { UseFormRegister } from 'react-hook-form';
import type {
  InspectionForm as InspectionFormType,
  TeamMember,
  ChecklistItem
} from './types';

/* ============================================
   🔹 DADOS EXTRAÍDOS DA FICHA (FOTO)
   ============================================ */

const PROJECT_OPTIONS = [
  "Flamboyant II",
  "Residencial Jardim Europa",
  "Residencial Morada das Flores",
  "Condomínio Alto das Palmeiras",
  "Obra Interna — Reformas",
];

const LOCATION_OPTIONS = [
  "Apto 101", "Apto 102", "Apto 103B",
  "Apto 201", "Apto 202", "Apto 203",
  "Área Comum — Hall", "Área Comum — Escada", "Área Externa — Fachada"
];

// Baseado na seção "Equipe" da foto
const PREDEFINED_MEMBERS = [
  { name: "Rafael Bruno", role: "Pedreiro" },
  { name: "Antonio Santos", role: "Pedreiro" },
  { name: "Antonio Gerlyndio", role: "Pedreiro" },
  { name: "Elieldo", role: "Servente" },
  { name: "João Paulo", role: "Servente" },
];

const ROLE_OPTIONS = [
  "Pedreiro",
  "Servente",
  "Mestre de Obras",
  "Engenheiro",
  "Técnico de Segurança",
  "Encarregado",
  "Auxiliar",
];

// Baseado nos "Itens Inspecionados" da foto (1 a 7)
const CHECKLIST_PRESETS = [
  { category: "Alvenaria", description: "Locação e assentamento dos blocos chaves e da 1ª fiada" },
  { category: "Alvenaria", description: "Locação das janelas e esquadrias de alumínio" },
  { category: "Alvenaria", description: "Abertura dos vãos das portas de madeira" },
  { category: "Alvenaria", description: "Medida das \"bonecas\"" },
  { category: "Alvenaria", description: "Prumo (Tolerância 10mm)" },
  { category: "Alvenaria", description: "Esquadro (Checar 3:4:5 ou metálico)" },
  { category: "Alvenaria", description: "Telas metálicas ou barras de aço (tijolo cerâmico)" },
  { category: "Acabamento", description: "Verificação de reboco e regularidade" }, // Exemplo extra
  { category: "Segurança", description: "Uso correto de EPIs pela equipe" }, // Exemplo extra
];

// Estilo base reutilizável
const INPUT_CLASS = "w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors";

/* ============================================
   COMPONENTE PRINCIPAL
   ============================================ */

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

  // --- LÓGICA DE EQUIPE ---

  const handleMemberSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value;
    // Encontra o membro na lista predefinida para auto-preencher a função
    const foundMember = PREDEFINED_MEMBERS.find(m => m.name === selectedName);

    if (foundMember) {
      setNewMember({ name: foundMember.name, role: foundMember.role });
    } else {
      setNewMember({ ...newMember, name: selectedName });
    }
  };

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
      setNewMember({ name: '', role: '' }); // Reset
    }
  };

  const handleRemoveTeamMember = (id: string) => {
    onTeamChange(team.filter((m) => m.id !== id));
  };

  // --- LÓGICA DE CHECKLIST ---

  const handleItemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedDesc = e.target.value;
    const foundItem = CHECKLIST_PRESETS.find(i => i.description === selectedDesc);

    if (foundItem) {
      setNewItem({ category: foundItem.category, description: foundItem.description });
    } else {
      setNewItem({ ...newItem, description: selectedDesc });
    }
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
      setNewItem({ category: '', description: '' }); // Reset
    }
  };

  const handleRemoveChecklistItem = (id: string) => {
    onChecklistChange(checklist.filter((item) => item.id !== id));
  };

  const handleStatusChange = (id: string, status: 'pass' | 'fail' | 'na') => {
    onChecklistChange(
        checklist.map((item) =>
            item.id === id ? { ...item, status } : item
        )
    );
  };

  return (
      <div className="space-y-8 pb-10">

        {/* =======================
          Informações do Projeto
      ======================== */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Informações do Projeto</h2>

          {/* Nome do Projeto (DROPDOWN) */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nome do Projeto</label>
            <select {...register("header.projectName")} className={INPUT_CLASS}>
              {PROJECT_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Localização (DROPDOWN) */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Localização</label>
            <select {...register("header.location")} className={INPUT_CLASS}>
              {LOCATION_OPTIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Data</label>
            <input
                {...register('header.date')}
                type="date"
                className={`${INPUT_CLASS} dark:[color-scheme:dark]`}
            />
          </div>

          {/* Inspetor */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Nome do Inspetor</label>
            <input
                {...register('header.inspectorName')}
                type="text"
                className={INPUT_CLASS}
                placeholder="Nome do inspetor"
            />
          </div>
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        {/* =======================
          Equipe
      ======================== */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Equipe</h2>

          <div className="space-y-2">
            {team.map((member) => (
                <div
                    key={member.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-md"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                  </div>
                  <button
                      onClick={() => handleRemoveTeamMember(member.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-md transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
            ))}
          </div>

          {/* Adicionar Integrante */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

              {/* DROPDOWN DE NOMES (AUTO-PREENCHE A FUNÇÃO) */}
              <select
                  value={newMember.name}
                  onChange={handleMemberSelect}
                  className={INPUT_CLASS}
              >
                <option value="">Selecione o integrante...</option>
                {PREDEFINED_MEMBERS.map((m) => (
                    <option key={m.name} value={m.name}>{m.name}</option>
                ))}
              </select>

              {/* DROPDOWN DE FUNÇÃO (Pode ser alterado manualmente se necessário) */}
              <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                  className={INPUT_CLASS}
              >
                <option value="">Selecione a função...</option>
                {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <button
                onClick={handleAddTeamMember}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              <Plus size={18} />
              Adicionar Integrante ao PDF
            </button>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        {/* =======================
          Checklist
      ======================== */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Checklist de Inspeção</h2>

          <div className="space-y-3">
            {checklist.map((item) => (
                <div key={item.id} className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg space-y-3 shadow-sm">

                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-semibold text-gray-900 dark:text-white">{item.category}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                    </div>

                    <button
                        onClick={() => handleRemoveChecklistItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-md transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  {/* Status Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => handleStatusChange(item.id, 'pass')}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                            item.status === 'pass'
                                ? "bg-green-600 text-white shadow-md ring-2 ring-green-600 ring-offset-1 dark:ring-offset-gray-800"
                                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                        }`}
                    >
                      <CheckCircle size={16} /> <span className="hidden sm:inline">Aprovado</span>
                    </button>

                    <button
                        onClick={() => handleStatusChange(item.id, 'fail')}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                            item.status === 'fail'
                                ? "bg-red-600 text-white shadow-md ring-2 ring-red-600 ring-offset-1 dark:ring-offset-gray-800"
                                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                        }`}
                    >
                      <XCircle size={16} /> <span className="hidden sm:inline">Reprovado</span>
                    </button>

                    <button
                        onClick={() => handleStatusChange(item.id, 'na')}
                        className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                            item.status === 'na'
                                ? "bg-gray-600 text-white shadow-md ring-2 ring-gray-600 ring-offset-1 dark:ring-offset-gray-800"
                                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                        }`}
                    >
                      <MinusCircle size={16} /> <span className="hidden sm:inline">N/A</span>
                    </button>
                  </div>

                </div>
            ))}
          </div>

          {/* Adicionar item (AGORA COM DROPDOWN INTELIGENTE) */}
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-1 gap-3">

              {/* Dropdown de Itens da Ficha */}
              <select
                  value={newItem.description}
                  onChange={handleItemSelect}
                  className={INPUT_CLASS}
              >
                <option value="">Selecione um item da ficha...</option>
                {CHECKLIST_PRESETS.map((item, index) => (
                    <option key={index} value={item.description}>
                      {item.description}
                    </option>
                ))}
              </select>

              {/* Categoria é preenchida automaticamente, mas pode ser editada se quiser */}
              <input
                  type="text"
                  placeholder="Categoria (ex.: Segurança, Estrutura...)"
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  className={INPUT_CLASS}
              />
            </div>

            <button
                onClick={handleAddChecklistItem}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              <Plus size={18} />
              Adicionar Item ao PDF
            </button>
          </div>
        </div>

        <hr className="border-gray-200 dark:border-gray-700" />

        {/* =======================
          Observações
      ======================== */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Observações</h2>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Notas e observações adicionais</label>
            <textarea
                {...register('observations')}
                rows={6}
                className={INPUT_CLASS}
                placeholder="Digite quaisquer observações relevantes sobre a inspeção..."
            />
          </div>
        </div>

      </div>
  );
}