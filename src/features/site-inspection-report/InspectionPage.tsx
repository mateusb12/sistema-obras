import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../auth/useAuth'
import {
  clearInspectionInEdition,
  deriveInspectionStatus,
  getInspectionById,
  getInspectionInEditionId,
  isInspectionOpenCorrection,
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
      correctionPlan: undefined,
    })),

    observations: '',
  }
}

export function InspectionPage() {
  const { user } = useAuth()
  const [saveMessage, setSaveMessage] = useState('')
  const [saveMessageType, setSaveMessageType] = useState<'success' | 'error'>(
    'success',
  )
  const [editingInspectionId, setEditingInspectionId] = useState<string | null>(
    null,
  )
  const [isReinspectionMode, setIsReinspectionMode] = useState(false)
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

    if (
      !inspection ||
      (inspection.status !== 'DRAFT' && inspection.status !== 'OPEN_CORRECTION')
    ) {
      clearInspectionInEdition()
      return
    }

    setEditingInspectionId(inspection.id)
    setIsReinspectionMode(inspection.status === 'OPEN_CORRECTION')
    setChecklistType(inspection.data.inspectionType || 'estrutural')
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

  const hasInvalidCorrectionPlan = formData.checklist.some(
    (item) =>
      item.status === 'fail' &&
      item.failResolution === 'needs_correction' &&
      !item.correctionPlan?.trim(),
  )

  const persistInspection = (status: 'DRAFT' | 'FINISHED') => {
    if (status === 'FINISHED' && hasInvalidCorrectionPlan) {
      setSaveMessageType('error')
      setSaveMessage(
        'Preencha o plano de correção em todos os itens com “Solicitar correção”.',
      )
      window.setTimeout(() => setSaveMessage(''), 3500)
      return
    }

    const saved = upsertInspection({
      id: editingInspectionId || undefined,
      form: formData,
      status,
      createdBy: user?.name || 'Usuário não identificado',
    })

    const derivedStatus = deriveInspectionStatus(formData, status)

    setEditingInspectionId(status === 'DRAFT' ? saved.id : null)
    setSaveMessageType('success')
    setSaveMessage(
      status === 'DRAFT'
        ? 'Rascunho salvo com sucesso!'
        : derivedStatus === 'OPEN_CORRECTION'
          ? 'Inspeção salva como pendente de correção.'
          : 'Inspeção finalizada com sucesso!',
    )

    if (status === 'FINISHED' && !isInspectionOpenCorrection(formData)) {
      reset(getDefaultValues())
      setChecklistType('estrutural')
      setIsReinspectionMode(false)
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
        correctionPlan: undefined,
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
          isReinspectionMode={isReinspectionMode}
        />
        {saveMessage && (
          <p
            className={`mt-4 rounded-md px-3 py-2 text-sm ${
              saveMessageType === 'error'
                ? 'border border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-300'
                : 'border border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300'
            }`}
          >
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
