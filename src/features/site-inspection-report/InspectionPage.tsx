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

const STANDARD_CHECKLIST = [
  {
    category: 'Alvenaria',
    description: 'Locação e assentamento dos blocos chaves e da 1ª fiada',
    acceptanceCriteria:
      'Estar com dimensões de acordo com o projeto e igual ao previsto pelo calculista',
    sampling: '100%',
    inspectionMethod: 'Uso de trena e projeto',
  },
  {
    category: 'Alvenaria',
    description: 'Locação das janelas e esquadrias de alumínio',
    acceptanceCriteria: 'De acordo com o projeto +5,00 cm',
    sampling: '100%',
    inspectionMethod: 'Trena metálica',
  },
  {
    category: 'Alvenaria',
    description: 'Abertura dos vãos das portas de madeira',
    acceptanceCriteria: 'De acordo com o projeto +8,00 cm',
    sampling: '100%',
    inspectionMethod: 'Trena metálica',
  },
  {
    category: 'Alvenaria',
    description: 'Medida das "bonecas"',
    acceptanceCriteria: 'Conforme modulação definida em projeto executivo',
    sampling: '100%',
    inspectionMethod: 'Trena e conferência em projeto',
  },
  {
    category: 'Alvenaria',
    description: 'Prumo (Tolerância 10mm)',
    acceptanceCriteria: 'Desvio máximo de 10 mm por pano inspecionado',
    sampling: '100%',
    inspectionMethod: 'Prumo de face',
  },
  {
    category: 'Alvenaria',
    description: 'Esquadro (Checar 3:4:5 ou metálico)',
    acceptanceCriteria: 'Checar esquadro (3:4:5) ou esquadro metálico ±10 mm',
    sampling: '100%',
    inspectionMethod: 'Trena metálica ou esquadro',
  },
  {
    category: 'Alvenaria',
    description: 'Telas metálicas ou barras de aço (tijolo cerâmico)',
    acceptanceCriteria: 'Instalação conforme paginação e posição de projeto',
    sampling: '100%',
    inspectionMethod: 'Inspeção visual e conferência em projeto',
  },
  {
    category: 'Acabamento',
    description: 'Verificação de reboco e regularidade',
    acceptanceCriteria:
      'Superfície regular, sem destacamentos ou fissuras ativas',
    sampling: 'Amostral',
    inspectionMethod: 'Régua de alumínio e inspeção visual',
  },
  {
    category: 'Segurança',
    description: 'Uso correto de EPIs pela equipe',
    acceptanceCriteria:
      'Todos os colaboradores com EPI completo conforme atividade',
    sampling: '100%',
    inspectionMethod: 'Check visual em campo',
  },
]

function getDefaultValues(): InspectionFormType {
  return {
    header: {
      title: 'Inspeção 104-B',
      projectName: 'Flamboyant II',
      location: '102B',
      date: new Date().toISOString().split('T')[0],
      inspectorName: 'Rafael Bruno',
    },
    team: [],

    checklist: STANDARD_CHECKLIST.map((item) => ({
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
