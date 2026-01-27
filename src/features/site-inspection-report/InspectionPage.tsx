import { useForm } from 'react-hook-form';
import { InspectionForm } from './InspectionForm';
import { PDFPreview } from './PDFPreview';
import type { InspectionForm as InspectionFormType } from './types';

export function InspectionPage() {
  const { register, watch, setValue } = useForm<InspectionFormType>({
    defaultValues: {
      header: {
        projectName: "Flamboyant II",
        location: "Apto 103B",
        date: new Date().toISOString().split('T')[0],
        inspectorName: "Inspector Name",
      },
      team: [],
      checklist: [],
      observations: '',
    },
  });

  const formData = watch();

  const handleTeamChange = (team: InspectionFormType['team']) => {
    setValue('team', team);
  };

  const handleChecklistChange = (checklist: InspectionFormType['checklist']) => {
    setValue('checklist', checklist);
  };

  return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">

        {/* Left Form */}
        <div className="overflow-y-auto pr-4">
          <InspectionForm
              register={register}
              team={formData.team}
              onTeamChange={handleTeamChange}
              checklist={formData.checklist}
              onChecklistChange={handleChecklistChange}
          />
        </div>

        {/* Right PDF Preview */}
        <div className="block mt-6 overflow-x-auto">
          <div className="min-w-[600px] mx-auto">
            <PDFPreview data={formData} />
          </div>
        </div>

      </div>
  );
}
