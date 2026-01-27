import { useForm } from 'react-hook-form';
import { InspectionForm } from './InspectionForm';
import { PDFPreview } from './PDFPreview';
import type { InspectionForm as InspectionFormType } from './types';

export function InspectionPage() {
  const { register, watch, setValue } = useForm<InspectionFormType>({
    defaultValues: {
      header: {
        projectName: 'Sample Project',
        location: 'Sample Location',
        date: new Date().toISOString().split('T')[0],
        inspectorName: 'Inspector Name',
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

  // Height offset accounts for header (89px) + padding (31px) = 120px
  const PDF_PREVIEW_HEIGHT_OFFSET = '120px';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Form on the left */}
      <div className="overflow-y-auto pr-4">
        <InspectionForm
          register={register}
          team={formData.team}
          onTeamChange={handleTeamChange}
          checklist={formData.checklist}
          onChecklistChange={handleChecklistChange}
        />
      </div>

      {/* PDF Preview on the right */}
      <div className={`hidden lg:block sticky top-0 h-[calc(100vh-${PDF_PREVIEW_HEIGHT_OFFSET})]`}>
        <PDFPreview data={formData} />
      </div>
    </div>
  );
}
