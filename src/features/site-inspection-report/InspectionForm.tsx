import { useState } from 'react'

import {
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  MinusCircle,
  Building2,
  Home,
  Hammer,
  BrickWall,
  PaintRoller,
  ShieldCheck,
  ClipboardList,
} from 'lucide-react'
import type { UseFormRegister } from 'react-hook-form'
import type {
  InspectionForm as InspectionFormType,
  TeamMember,
  ChecklistItem,
} from './types'

const PROJECT_CARDS = [
  {
    id: 'Flamboyant II',
    title: 'Flamboyant II',
    description: 'Torre Residencial - Fase de Acabamento',
    icon: Building2,
  },
  {
    id: 'Residencial Jardim Europa',
    title: 'Res. Jardim Europa',
    description: 'Condomínio Horizontal - Estrutura',
    icon: Home,
  },
  {
    id: 'Residencial Morada das Flores',
    title: 'Morada das Flores',
    description: 'Blocos 1 e 2 - Alvenaria',
    icon: Home,
  },
  {
    id: 'Condomínio Alto das Palmeiras',
    title: 'Alto das Palmeiras',
    description: 'Área de Lazer e Portaria',
    icon: Building2,
  },
  {
    id: 'Obra Interna — Reformas',
    title: 'Obra Interna',
    description: 'Reformas e Manutenção Geral',
    icon: Hammer,
  },
]

const LOCATION_OPTIONS = [
  'Apto 101',
  'Apto 102',
  'Apto 103B',
  'Apto 201',
  'Apto 202',
  'Apto 203',
  'Área Comum — Hall',
  'Área Comum — Escada',
  'Área Externa — Fachada',
]

const PREDEFINED_MEMBERS = [
  { name: 'Rafael Bruno', role: 'Pedreiro' },
  { name: 'Antonio Santos', role: 'Pedreiro' },
  { name: 'Antonio Gerlyndio', role: 'Pedreiro' },
  { name: 'Elieldo', role: 'Servente' },
  { name: 'João Paulo', role: 'Servente' },
]

const ROLE_OPTIONS = [
  'Pedreiro',
  'Servente',
  'Mestre de Obras',
  'Engenheiro',
  'Técnico de Segurança',
  'Encarregado',
  'Auxiliar',
]

const CHECKLIST_PRESETS = [
  {
    category: 'Alvenaria',
    description: 'Locação e assentamento dos blocos chaves e da 1ª fiada',
  },
  {
    category: 'Alvenaria',
    description: 'Locação das janelas e esquadrias de alumínio',
  },
  {
    category: 'Alvenaria',
    description: 'Abertura dos vãos das portas de madeira',
  },
  { category: 'Alvenaria', description: 'Medida das "bonecas"' },
  { category: 'Alvenaria', description: 'Prumo (Tolerância 10mm)' },
  { category: 'Alvenaria', description: 'Esquadro (Checar 3:4:5 ou metálico)' },
  {
    category: 'Alvenaria',
    description: 'Telas metálicas ou barras de aço (tijolo cerâmico)',
  },
  {
    category: 'Acabamento',
    description: 'Verificação de reboco e regularidade',
  },
  { category: 'Segurança', description: 'Uso correto de EPIs pela equipe' },
]

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Alvenaria':
      return BrickWall
    case 'Acabamento':
      return PaintRoller
    case 'Segurança':
      return ShieldCheck
    default:
      return ClipboardList
  }
}

const INPUT_CLASS =
  'w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors'

interface InspectionFormProps {
  register: UseFormRegister<InspectionFormType>
  team: TeamMember[]
  onTeamChange: (team: TeamMember[]) => void
  checklist: ChecklistItem[]
  onChecklistChange: (checklist: ChecklistItem[]) => void
  selectedProject: string
  onProjectChange: (projectName: string) => void
}

export function InspectionForm({
  register,
  team,
  onTeamChange,
  checklist,
  onChecklistChange,
  selectedProject,
  onProjectChange,
}: InspectionFormProps) {
  const [newMember, setNewMember] = useState({ name: '', role: '' })
  const [newItem, setNewItem] = useState({ category: '', description: '' })

  const handleMemberSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedName = e.target.value
    const foundMember = PREDEFINED_MEMBERS.find((m) => m.name === selectedName)
    if (foundMember) {
      setNewMember({ name: foundMember.name, role: foundMember.role })
    } else {
      setNewMember({ ...newMember, name: selectedName })
    }
  }

  const handleAddTeamMember = () => {
    if (newMember.name && newMember.role) {
      onTeamChange([
        ...team,
        { id: crypto.randomUUID(), name: newMember.name, role: newMember.role },
      ])
      setNewMember({ name: '', role: '' })
    }
  }

  const handleRemoveTeamMember = (id: string) => {
    onTeamChange(team.filter((m) => m.id !== id))
  }

  const handlePresetClick = (preset: {
    category: string
    description: string
  }) => {
    setNewItem({ category: preset.category, description: preset.description })
  }

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
      ])

      setNewItem({ category: '', description: '' })
    }
  }

  const handleRemoveChecklistItem = (id: string) => {
    onChecklistChange(checklist.filter((item) => item.id !== id))
  }

  const handleStatusChange = (id: string, status: 'pass' | 'fail' | 'na') => {
    onChecklistChange(
      checklist.map((item) => (item.id === id ? { ...item, status } : item)),
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Informações do Projeto
        </h2>

        <div>
          <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
            Selecione o Projeto
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {PROJECT_CARDS.map((project) => {
              const isSelected = selectedProject === project.id
              const Icon = project.icon

              return (
                <div
                  key={project.id}
                  onClick={() => onProjectChange(project.id)}
                  className={`
                      relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 bg-white dark:bg-gray-800'
                      }
                    `}
                >
                  <div
                    className={`p-2 rounded-md ${isSelected ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}
                  >
                    <Icon size={24} />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`font-semibold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}
                    >
                      {project.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {project.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-[-10px] right-[-10px] bg-blue-600 text-white rounded-full p-1 shadow-md border-2 border-white dark:border-gray-900">
                      <div className="w-3 h-3 flex items-center justify-center">
                        ✓
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <input type="hidden" {...register('header.projectName')} />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Localização / Unidade
          </label>
          <select {...register('header.location')} className={INPUT_CLASS}>
            {LOCATION_OPTIONS.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Data
            </label>
            <input
              {...register('header.date')}
              type="date"
              className={`${INPUT_CLASS} dark:[color-scheme:dark]`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Nome do Inspetor
            </label>
            <input
              {...register('header.inspectorName')}
              type="text"
              className={INPUT_CLASS}
              placeholder="Nome do inspetor"
            />
          </div>
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Equipe
        </h2>
        <div className="space-y-2">
          {team.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-md"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {member.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {member.role}
                </p>
              </div>
              <button
                onClick={() => handleRemoveTeamMember(member.id)}
                className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 rounded-md"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={newMember.name}
              onChange={handleMemberSelect}
              className={INPUT_CLASS}
            >
              <option value="">Selecione o integrante...</option>
              {PREDEFINED_MEMBERS.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
            <select
              value={newMember.role}
              onChange={(e) =>
                setNewMember({ ...newMember, role: e.target.value })
              }
              className={INPUT_CLASS}
            >
              <option value="">Selecione a função...</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddTeamMember}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            <Plus size={18} /> Adicionar Integrante ao PDF
          </button>
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Checklist de Inspeção
        </h2>

        <div className="space-y-3 mb-6">
          {checklist.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    {item.description}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveChecklistItem(item.id)}
                  className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 rounded-md"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleStatusChange(item.id, 'pass')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${item.status === 'pass' ? 'bg-green-600 text-white shadow-md ring-2 ring-green-600' : 'bg-white dark:bg-gray-700 border border-gray-200'}`}
                >
                  <CheckCircle size={16} />{' '}
                  <span className="hidden sm:inline">Aprovado</span>
                </button>
                <button
                  onClick={() => handleStatusChange(item.id, 'fail')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${item.status === 'fail' ? 'bg-red-600 text-white shadow-md ring-2 ring-red-600' : 'bg-white dark:bg-gray-700 border border-gray-200'}`}
                >
                  <XCircle size={16} />{' '}
                  <span className="hidden sm:inline">Reprovado</span>
                </button>
                <button
                  onClick={() => handleStatusChange(item.id, 'na')}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${item.status === 'na' ? 'bg-gray-600 text-white shadow-md ring-2 ring-gray-600' : 'bg-white dark:bg-gray-700 border border-gray-200'}`}
                >
                  <MinusCircle size={16} />{' '}
                  <span className="hidden sm:inline">N/A</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-2 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Passo 1: Selecione um item da ficha técnica
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {CHECKLIST_PRESETS.map((item, index) => {
              const Icon = getCategoryIcon(item.category)

              const isSelected = newItem.description === item.description

              return (
                <div
                  key={index}
                  onClick={() => handlePresetClick(item)}
                  className={`
                    flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-all hover:shadow-sm
                    ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300'
                    }
                  `}
                >
                  <div
                    className={`p-1.5 rounded-md ${isSelected ? 'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}
                  >
                    <Icon size={18} />
                  </div>
                  <div className="flex-1 text-sm">
                    <p
                      className={`font-medium leading-tight ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'}`}
                    >
                      {item.category}
                    </p>
                    <p
                      className={`text-xs mt-0.5 leading-tight ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                      {item.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="space-y-3 pt-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Passo 2: Confirme ou edite e Adicione
            </label>
            <div className="grid grid-cols-1 gap-3">
              <input
                type="text"
                placeholder="Descrição do item..."
                value={newItem.description}
                onChange={(e) =>
                  setNewItem({ ...newItem, description: e.target.value })
                }
                className={INPUT_CLASS}
              />
              <input
                type="text"
                placeholder="Categoria (ex.: Segurança...)"
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
                className={INPUT_CLASS}
              />
            </div>
            <button
              onClick={handleAddChecklistItem}
              disabled={!newItem.description}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 font-medium rounded-md transition-colors
                ${
                  newItem.description
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              <Plus size={18} /> Adicionar Item ao PDF
            </button>
          </div>
        </div>
      </div>

      <hr className="border-gray-200 dark:border-gray-700" />

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Observações
        </h2>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Notas e observações adicionais
          </label>
          <textarea
            {...register('observations')}
            rows={6}
            className={INPUT_CLASS}
            placeholder="Digite quaisquer observações relevantes sobre a inspeção..."
          />
        </div>
      </div>
    </div>
  )
}
