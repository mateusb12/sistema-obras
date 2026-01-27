import { useForm } from 'react-hook-form';
import { InspectionForm } from './InspectionForm';
import type { InspectionForm as InspectionFormType } from './types';

export function InspectionPage() {
  const { register, watch, setValue } = useForm<InspectionFormType>({
    defaultValues: {
      header: {
        projectName: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        inspectorName: '',
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
    <div className="max-w-2xl mx-auto space-y-8">
      <InspectionForm
        register={register}
        team={formData.team}
        onTeamChange={handleTeamChange}
        checklist={formData.checklist}
        onChecklistChange={handleChecklistChange}
      />
    </div>
  );
}
