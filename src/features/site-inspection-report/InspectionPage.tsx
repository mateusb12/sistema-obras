import { useForm } from 'react-hook-form'
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
    acceptanceCriteria: 'Superfície regular, sem destacamentos ou fissuras ativas',
    sampling: 'Amostral',
    inspectionMethod: 'Régua de alumínio e inspeção visual',
  },
  {
    category: 'Segurança',
    description: 'Uso correto de EPIs pela equipe',
    acceptanceCriteria: 'Todos os colaboradores com EPI completo conforme atividade',
    sampling: '100%',
    inspectionMethod: 'Check visual em campo',
  },
]

export function InspectionPage() {
  const { register, watch, setValue } = useForm<InspectionFormType>({
    defaultValues: {
      header: {
        projectName: 'Flamboyant II',
        location: 'Apto 103B',
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
    },
  })

  const formData = watch()

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      <div className="overflow-y-auto pr-4">
        <InspectionForm
          register={register}
          team={formData.team}
          onTeamChange={handleTeamChange}
          checklist={formData.checklist}
          onChecklistChange={handleChecklistChange}
          selectedProject={formData.header.projectName}
          onProjectChange={handleProjectChange}
        />
      </div>

      <div className="block mt-6 overflow-x-auto">
        <div className="min-w-[600px] mx-auto">
          <PDFPreview data={formData} />
        </div>
      </div>
    </div>
  )
}
