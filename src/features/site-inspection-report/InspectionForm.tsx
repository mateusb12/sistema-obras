import { useEffect, useState } from 'react'
import {
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Briefcase,
} from 'lucide-react'
import type { UseFormRegister } from 'react-hook-form'
import type {
  InspectionForm as InspectionFormType,
  TeamMember,
  ChecklistItem,
} from './types'
import { LOCATION_OPTIONS, PROJECT_CARDS } from './constants'

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
  onSaveDraft: () => void
  onFinish: () => void
  isEditing: boolean

  selectedChecklistType: string
  onChecklistTypeChange: (type: string) => void
  isReinspectionMode: boolean
  editableItemIds: Set<string>
}

export function InspectionForm({
  register,
  team,
  onTeamChange,
  checklist,
  onChecklistChange,
  selectedProject,
  onProjectChange,
  onSaveDraft,
  onFinish,
  isEditing,
  selectedChecklistType,
  onChecklistTypeChange,
  isReinspectionMode,
  editableItemIds,
}: InspectionFormProps) {
  const [newMember, setNewMember] = useState({ name: '', role: '' })

  const [newItem, setNewItem] = useState({
    category: '',
    description: '',
    acceptanceCriteria: '',
    sampling: '100%',
    inspectionMethod: '',
  })

  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    if (!toastMessage) {
      return
    }

    const timer = window.setTimeout(() => setToastMessage(''), 2500)
    return () => window.clearTimeout(timer)
  }, [toastMessage])

  const isItemPendingCorrection = (item: ChecklistItem) =>
    item.status === 'fail' && item.failResolution === 'needs_correction'

  const isItemEditable = (item: ChecklistItem) => {
    if (!isReinspectionMode) {
      return true
    }

    if (item.status === 'na') {
      return true
    }

    return editableItemIds.has(item.id) || isItemPendingCorrection(item)
  }

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

  const handleAddManualItem = () => {
    if (newItem.category && newItem.description) {
      onChecklistChange([
        ...checklist,
        {
          id: crypto.randomUUID(),
          category: newItem.category,
          description: newItem.description,
          acceptanceCriteria: newItem.acceptanceCriteria || 'Não informado',
          sampling: newItem.sampling || 'Não informado',
          inspectionMethod: newItem.inspectionMethod || 'Não informado',
          status: 'na',
          failReason: '',
          failResolution: null,
          correctionPlan: undefined,
          reinspectionDate: undefined,
        },
      ])
      setNewItem({
        category: '',
        description: '',
        acceptanceCriteria: '',
        sampling: '100%',
        inspectionMethod: '',
      })
    }
  }

  const handleStatusChange = (id: string, status: 'pass' | 'fail' | 'na') => {
    onChecklistChange(
      checklist.map((item) => {
        if (item.id !== id) {
          return item
        }

        if (status === 'fail') {
          return {
            ...item,
            status,
            failReason: item.failReason,
            failResolution: item.failResolution,
          }
        }

        return {
          ...item,
          status,
          failReason: '',
          failResolution: null,
          correctionPlan: undefined,
          reinspectionDate: undefined,
        }
      }),
    )
  }

  const handleFailReasonChange = (id: string, failReason: string) => {
    onChecklistChange(
      checklist.map((item) =>
        item.id === id ? { ...item, failReason } : item,
      ),
    )
  }

  const handleFailResolutionChange = (
    id: string,
    failResolution: 'non_conform' | 'needs_correction',
  ) => {
    onChecklistChange(
      checklist.map((item) => {
        if (item.id !== id) {
          return item
        }

        const nextItem = {
          ...item,
          failResolution,
          correctionPlan:
            failResolution === 'needs_correction'
              ? item.correctionPlan || ''
              : undefined,
          reinspectionDate:
            failResolution === 'needs_correction'
              ? item.reinspectionDate || ''
              : undefined,
        }

        if (failResolution === 'needs_correction') {
          setToastMessage('Correção solicitada para este item.')
        }

        return nextItem
      }),
    )
  }

  const handleCorrectionPlanChange = (id: string, correctionPlan: string) => {
    onChecklistChange(
      checklist.map((item) =>
        item.id === id ? { ...item, correctionPlan } : item,
      ),
    )
  }

  const handleReinspectionDateChange = (
    id: string,
    reinspectionDate: string,
  ) => {
    onChecklistChange(
      checklist.map((item) =>
        item.id === id ? { ...item, reinspectionDate } : item,
      ),
    )
  }

  const checkedCount = checklist.filter((i) => i.status !== 'na').length

  return (
    <div className="space-y-8 pb-10">
      {toastMessage && (
        <div className="rounded-md border border-blue-300 bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          {toastMessage}
        </div>
      )}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Informações do Projeto
        </h2>

        <div>
          <div className="mb-6">
            <div
              className="rounded-lg border-2 border-blue-300 bg-blue-50/70 p-4
               dark:border-blue-700 dark:bg-blue-900/20 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck
                  size={18}
                  className="text-blue-600 dark:text-blue-300"
                />
                <label className="text-sm font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide">
                  Tipo de Inspeção
                </label>
              </div>

              <div className="flex rounded-lg overflow-hidden border-2 border-blue-400 dark:border-blue-600">
                <button
                  type="button"
                  onClick={() => onChecklistTypeChange('estrutural')}
                  className={`
          flex-1 py-3 px-4 text-sm font-semibold transition-all
          flex items-center justify-center gap-2
          ${
            selectedChecklistType === 'estrutural'
              ? 'bg-blue-600 text-white shadow-inner'
              : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30'
          }
        `}
                >
                  <span>Alvenaria Estrutural</span>

                  {selectedChecklistType === 'estrutural' && (
                    <span
                      className={`
              text-xs px-2 py-0.5 rounded-full font-semibold
              ${
                checkedCount === checklist.length && checklist.length > 0
                  ? 'bg-green-500 text-white'
                  : 'bg-white/20 text-white'
              }
            `}
                    >
                      {checkedCount}/{checklist.length}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onChecklistTypeChange('nao_estrutural')}
                  className={`
          flex-1 py-3 px-4 text-sm font-semibold transition-all
          border-l border-blue-300 dark:border-blue-700
          flex items-center justify-center gap-2
          ${
            selectedChecklistType === 'nao_estrutural'
              ? 'bg-blue-600 text-white shadow-inner'
              : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900/30'
          }
        `}
                >
                  <span>Alvenaria Não Estrutural</span>

                  {selectedChecklistType === 'nao_estrutural' && (
                    <span
                      className={`
              text-xs px-2 py-0.5 rounded-full font-semibold
              ${
                checkedCount === checklist.length && checklist.length > 0
                  ? 'bg-green-500 text-white'
                  : 'bg-white/20 text-white'
              }
            `}
                    >
                      {checkedCount}/{checklist.length}
                    </span>
                  )}
                </button>
              </div>

              <input
                type="hidden"
                {...register('inspectionType')}
                value={selectedChecklistType}
              />
            </div>
          </div>
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
            <option value="">Selecione a unidade...</option>

            <optgroup label="Lado A">
              {LOCATION_OPTIONS.ladoA.map((unit) => (
                <option key={unit} value={unit}>
                  Apto {unit}
                </option>
              ))}
            </optgroup>

            <optgroup label="Lado B">
              {LOCATION_OPTIONS.ladoB.map((unit) => (
                <option key={unit} value={unit}>
                  Apto {unit}
                </option>
              ))}
            </optgroup>

            <optgroup label="Áreas Comuns">
              {LOCATION_OPTIONS.areasComuns.map((area) => (
                <option key={area} value={area}>
                  Área Comum — {area}
                </option>
              ))}
            </optgroup>
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

      <hr className="border-gray-200 dark:border-gray-700" />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Checklist de Validação
          </h2>
          <span className="text-sm font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-gray-600 dark:text-gray-300">
            {checkedCount} / {checklist.length} itens verificados
          </span>
        </div>

        {isReinspectionMode && (
          <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
            Reinspeção ativa: apenas itens pendentes de correção podem ser
            alterados.
          </p>
        )}

        <div className="space-y-3">
          {checklist.map((item) => (
            <div
              key={item.id}
              className={`
                p-4 border rounded-lg transition-all shadow-sm
                ${
                  item.status === 'pass'
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800'
                    : ''
                }
                ${
                  item.status === 'fail'
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800'
                    : ''
                }
                ${
                  item.status === 'na'
                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    : ''
                }
              `}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {item.description}
                  </p>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-300">
                    <p>
                      <span className="font-semibold">Critério:</span>{' '}
                      {item.acceptanceCriteria}
                    </p>
                    <p>
                      <span className="font-semibold">Amostragem:</span>{' '}
                      {item.sampling}
                    </p>
                    <p>
                      <span className="font-semibold">Meio:</span>{' '}
                      {item.inspectionMethod}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleStatusChange(item.id, 'pass')}
                    disabled={!isItemEditable(item)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-all text-sm
                      ${
                        item.status === 'pass'
                          ? 'bg-green-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-green-900/30'
                      }
                      disabled:opacity-40 disabled:cursor-not-allowed
                    `}
                  >
                    <CheckCircle size={18} />
                    <span className="hidden sm:inline">Aprovado</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange(item.id, 'fail')}
                    disabled={!isItemEditable(item)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-all text-sm
                      ${
                        item.status === 'fail'
                          ? 'bg-red-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-red-900/30'
                      }
                      disabled:opacity-40 disabled:cursor-not-allowed
                    `}
                  >
                    <XCircle size={18} />
                    <span className="hidden sm:inline">Reprovado</span>
                  </button>
                </div>
              </div>

              {item.status === 'fail' && (
                <div className="mt-4 space-y-3 border-t border-red-200/60 dark:border-red-800/60 pt-3">
                  <label className="block text-sm font-medium text-red-800 dark:text-red-300">
                    Motivo da não conformidade
                  </label>
                  <textarea
                    value={item.failReason}
                    onChange={(e) =>
                      handleFailReasonChange(item.id, e.target.value)
                    }
                    disabled={!isItemEditable(item)}
                    rows={3}
                    className={INPUT_CLASS}
                    placeholder="Descreva o motivo da reprovação..."
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() =>
                        handleFailResolutionChange(item.id, 'non_conform')
                      }
                      disabled={
                        !item.failReason.trim() || !isItemEditable(item)
                      }
                      className={`
                        px-3 py-2 rounded-md font-medium transition-all text-sm
                        ${
                          item.failResolution === 'non_conform'
                            ? 'bg-amber-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-amber-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-amber-900/30'
                        }
                        disabled:opacity-40 disabled:cursor-not-allowed
                      `}
                    >
                      Aceitar como está
                    </button>

                    <button
                      onClick={() =>
                        handleFailResolutionChange(item.id, 'needs_correction')
                      }
                      disabled={
                        !item.failReason.trim() || !isItemEditable(item)
                      }
                      className={`
                        px-3 py-2 rounded-md font-medium transition-all text-sm
                        ${
                          item.failResolution === 'needs_correction'
                            ? 'bg-red-600 text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-red-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-red-900/30'
                        }
                        disabled:opacity-40 disabled:cursor-not-allowed
                      `}
                    >
                      Solicitar Correção
                    </button>
                  </div>
                  {isItemPendingCorrection(item) && (
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-red-800 dark:text-red-300">
                          Como será corrigido?
                        </label>
                        <textarea
                          value={item.correctionPlan || ''}
                          onChange={(e) =>
                            handleCorrectionPlanChange(item.id, e.target.value)
                          }
                          rows={3}
                          disabled={!isItemEditable(item)}
                          className={INPUT_CLASS}
                          placeholder="Descreva o plano de correção..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-red-800 dark:text-red-300">
                          Data da reinspeção
                        </label>
                        <input
                          type="date"
                          value={item.reinspectionDate || ''}
                          onChange={(e) =>
                            handleReinspectionDateChange(
                              item.id,
                              e.target.value,
                            )
                          }
                          disabled={!isItemEditable(item)}
                          className={`${INPUT_CLASS} dark:[color-scheme:dark]`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <details className="group">
            <summary className="flex items-center cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 select-none">
              <Plus size={16} className="mr-1" /> Adicionar item extra (não
              listado)
            </summary>
            <div className="mt-3 space-y-3 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md border border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={newItem.category}
                    onChange={(e) =>
                      setNewItem({ ...newItem, category: e.target.value })
                    }
                    className={INPUT_CLASS}
                    placeholder="Ex: Elétrica"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                    Descrição
                  </label>
                  <input
                    type="text"
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                    className={INPUT_CLASS}
                    placeholder="Descrição do item extra..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                    Critério de aceitação
                  </label>
                  <input
                    type="text"
                    value={newItem.acceptanceCriteria}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        acceptanceCriteria: e.target.value,
                      })
                    }
                    className={INPUT_CLASS}
                    placeholder="Critério esperado"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                    Amostragem
                  </label>
                  <input
                    type="text"
                    value={newItem.sampling}
                    onChange={(e) =>
                      setNewItem({ ...newItem, sampling: e.target.value })
                    }
                    className={INPUT_CLASS}
                    placeholder="Ex: 100%"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">
                    Meio de inspeção
                  </label>
                  <input
                    type="text"
                    value={newItem.inspectionMethod}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        inspectionMethod: e.target.value,
                      })
                    }
                    className={INPUT_CLASS}
                    placeholder="Ex: Trena metálica"
                  />
                </div>
              </div>
              <button
                onClick={handleAddManualItem}
                className="h-[42px] px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm"
              >
                Adicionar
              </button>
            </div>
          </details>
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

      <section className="rounded-lg border-2 border-blue-300 bg-blue-50/70 p-4 dark:border-blue-700 dark:bg-blue-900/20">
        <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300">
          Título da Inspeção (obrigatório para identificação no histórico)
        </h3>
        <p className="mb-3 text-sm text-blue-700 dark:text-blue-300">
          Esse título será exibido no histórico e usado para busca/renomeação.
        </p>
        <input
          {...register('header.title')}
          type="text"
          className="w-full rounded-md border-2 border-blue-400 bg-white px-3 py-3 text-lg font-semibold text-gray-900 outline-none transition focus:border-blue-600 dark:border-blue-600 dark:bg-gray-900 dark:text-white"
          placeholder="Ex: Inspeção 104-B"
        />
      </section>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={onSaveDraft}
          className="w-full rounded-md border border-blue-500 bg-white px-4 py-3 text-base font-semibold text-blue-700 transition-colors hover:bg-blue-50 dark:bg-gray-900 dark:text-blue-300"
        >
          {isEditing ? 'Atualizar Rascunho' : 'Salvar como Rascunho'}
        </button>

        <button
          type="button"
          onClick={onFinish}
          className="w-full rounded-md bg-blue-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700"
        >
          {isReinspectionMode ? 'Finalizar Reinspeção' : 'Finalizar Inspeção'}
        </button>
      </div>
    </div>
  )
}
