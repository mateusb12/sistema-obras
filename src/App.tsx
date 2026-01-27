import { useForm } from 'react-hook-form';
import { FullLayout } from './components';
import {
  type InspectionForm,
  ProjectHeaderForm,
  TeamList,
  InspectionChecklist,
  ObservationsForm,
} from './features/site-inspection-report';

function App() {
  const { register, watch, setValue } = useForm<InspectionForm>({
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

  const handleTeamChange = (team: InspectionForm['team']) => {
    setValue('team', team);
  };

  const handleChecklistChange = (checklist: InspectionForm['checklist']) => {
    setValue('checklist', checklist);
  };

  return (
    <FullLayout>
      <div className="bg-white dark:bg-gray-800 p-6 min-h-[calc(100vh-89px)]">
        <div className="max-w-2xl mx-auto space-y-8">
          <ProjectHeaderForm register={register} />
          <TeamList team={formData.team} onChange={handleTeamChange} />
          <InspectionChecklist
            checklist={formData.checklist}
            onChange={handleChecklistChange}
          />
          <ObservationsForm register={register} />
        </div>
      </div>
    </FullLayout>
  );
}

export default App;
