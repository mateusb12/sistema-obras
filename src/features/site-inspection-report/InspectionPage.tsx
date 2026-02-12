import { useForm } from 'react-hook-form'
import { InspectionForm } from './InspectionForm'
import { PDFPreview } from './PDFPreview'
import type { InspectionForm as InspectionFormType } from './types'

const STANDARD_CHECKLIST = [
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
        status: 'na',
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
