import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../auth/useAuth'
import {
  clearInspectionInEdition,
  getInspectionById,
  getInspectionInEditionId,
  upsertInspection,
} from '../inspection-history'
import { InspectionForm } from './InspectionForm'
import { PDFPreview } from './PDFPreview'
import type { InspectionForm as InspectionFormType } from './types'
import { CHECKLIST_ESTRUTURAL, CHECKLIST_NAO_ESTRUTURAL } from './constants.ts'

function getDefaultValues(): InspectionFormType {
  return {
    inspectionType: 'estrutural',

    header: {
      title: 'Inspeção 104-B',
      projectName: 'Flamboyant II',
      location: '102B',
      date: new Date().toISOString().split('T')[0],
      inspectorName: 'Rafael Bruno',
    },

    team: [],

    checklist: CHECKLIST_ESTRUTURAL.map((item) => ({
      id: crypto.randomUUID(),
      category: item.category,
      description: item.description,
      acceptanceCriteria: item.acceptanceCriteria,
      sampling: item.sampling,
      inspectionMethod: item.inspectionMethod,
      status: 'na',
      failReason: '',
      failResolution: null,
    })),

    observations: '',
  }
}

export function InspectionPage() {
  const { user } = useAuth()
  const [saveMessage, setSaveMessage] = useState('')
  const [editingInspectionId, setEditingInspectionId] = useState<string | null>(
    null,
  )
  const [checklistType, setChecklistType] = useState('estrutural')
  const { register, watch, setValue, reset } = useForm<InspectionFormType>({
    defaultValues: getDefaultValues(),
  })

  const formData = watch()

  useEffect(() => {
    const inspectionId = getInspectionInEditionId()

    if (!inspectionId) {
      return
    }

    const inspection = getInspectionById(inspectionId)

    if (!inspection || inspection.status !== 'DRAFT') {
      clearInspectionInEdition()
      return
    }

    setEditingInspectionId(inspection.id)
    reset(inspection.data)
    clearInspectionInEdition()
  }, [reset])

  const handleTeamChange = (team: InspectionFormType['team']) => {
    setValue('team', team)
  }

  const handleChecklistChange = (
    checklist: InspectionFormType['checklist'],
  ) => {
    setValue('checklist', checklist)
  }

  const handleProjectChange = (projectName: string) => {
    setValue('header.projectName', projectName)
  }

  const persistInspection = (status: 'DRAFT' | 'FINISHED') => {
    const saved = upsertInspection({
      id: editingInspectionId || undefined,
      form: formData,
      status,
      createdBy: user?.name || 'Usuário não identificado',
    })

    setEditingInspectionId(status === 'DRAFT' ? saved.id : null)
    setSaveMessage(
      status === 'DRAFT'
        ? 'Rascunho salvo com sucesso!'
        : 'Inspeção finalizada com sucesso!',
    )

    if (status === 'FINISHED') {
      reset(getDefaultValues())
      clearInspectionInEdition()
    }

    window.setTimeout(() => setSaveMessage(''), 3000)
  }

  const loadChecklist = (type: string) => {
    const base =
      type === 'estrutural' ? CHECKLIST_ESTRUTURAL : CHECKLIST_NAO_ESTRUTURAL

    setValue(
      'checklist',
      base.map((item) => ({
        id: crypto.randomUUID(),
        category: item.category,
        description: item.description,
        acceptanceCriteria: item.acceptanceCriteria,
        sampling: item.sampling,
        inspectionMethod: item.inspectionMethod,
        status: 'na',
        failReason: '',
        failResolution: null,
      })),
    )
  }

  const handleChecklistTypeChange = (type: string) => {
    setChecklistType(type)
    setValue('inspectionType', type as 'estrutural' | 'nao_estrutural')
    loadChecklist(type)
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:h-[calc(100dvh-5.5rem)] lg:overflow-hidden">
      <div className="min-h-0 overflow-y-auto pr-4">
        <InspectionForm
          register={register}
          team={formData.team}
          onTeamChange={handleTeamChange}
          checklist={formData.checklist}
          onChecklistChange={handleChecklistChange}
          selectedProject={formData.header.projectName}
          onProjectChange={handleProjectChange}
          onSaveDraft={() => persistInspection('DRAFT')}
          onFinish={() => persistInspection('FINISHED')}
          isEditing={Boolean(editingInspectionId)}
          selectedChecklistType={checklistType}
          onChecklistTypeChange={handleChecklistTypeChange}
        />
        {saveMessage && (
          <p className="mt-4 rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300">
            {saveMessage}
          </p>
        )}
      </div>

      <div className="mt-6 block min-h-0 overflow-y-auto overflow-x-auto lg:mt-0">
        <div className="mx-auto min-w-[600px]">
          <PDFPreview data={formData} />
        </div>
      </div>
    </div>
  )
}
