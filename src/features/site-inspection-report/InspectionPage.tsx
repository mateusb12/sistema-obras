import { useForm } from 'react-hook-form';
import { InspectionForm } from './InspectionForm';
import { PDFPreview } from './PDFPreview';
import type { InspectionForm as InspectionFormType } from './types';

export function InspectionPage() {
  // Configuração inicial do React Hook Form
  const { register, watch, setValue } = useForm<InspectionFormType>({
    defaultValues: {
      header: {
        projectName: "Flamboyant II", // Valor inicial
        location: "Apto 103B",
        date: new Date().toISOString().split('T')[0],
        inspectorName: "Rafael Bruno",
      },
      team: [],
      checklist: [],
      observations: '',
    },
  });

  // Observa todas as mudanças para atualizar o PDF em tempo real
  const formData = watch();

  // Handlers para os componentes controlados (Team e Checklist já existiam)
  const handleTeamChange = (team: InspectionFormType['team']) => {
    setValue('team', team);
  };

  const handleChecklistChange = (checklist: InspectionFormType['checklist']) => {
    setValue('checklist', checklist);
  };

  // NOVO: Handler para a mudança de projeto via Card
  const handleProjectChange = (projectName: string) => {
    setValue('header.projectName', projectName);
  };

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">

        {/* Formulário (Esquerda) */}
        <div className="overflow-y-auto pr-4">
          <InspectionForm
              register={register}
              // Props de Equipe e Checklist
              team={formData.team}
              onTeamChange={handleTeamChange}
              checklist={formData.checklist}
              onChecklistChange={handleChecklistChange}
              // NOVAS PROPS CONECTADAS AQUI
              selectedProject={formData.header.projectName}
              onProjectChange={handleProjectChange}
          />
        </div>

        {/* Preview do PDF (Direita) */}
        <div className="block mt-6 overflow-x-auto">
          <div className="min-w-[600px] mx-auto">
            <PDFPreview data={formData} />
          </div>
        </div>

      </div>
  );
}