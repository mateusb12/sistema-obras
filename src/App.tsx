import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Moon, Sun, FileText } from 'lucide-react';
import { useDarkMode } from './hooks/useDarkMode';
import {
  type InspectionForm,
  ProjectHeaderForm,
  TeamList,
  InspectionChecklist,
  ObservationsForm,
  PDFPreview,
} from './features/site-inspection-report';

function App() {
  const { isDark, toggleDarkMode } = useDarkMode();
  const [showPDF, setShowPDF] = useState(false);

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-[2000px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600 dark:text-blue-400" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Digital Inspection
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Replace paper forms with digital precision
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPDF(!showPDF)}
              className="lg:hidden px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              {showPDF ? 'Show Form' : 'Show PDF'}
            </button>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="text-yellow-500" size={24} />
              ) : (
                <Moon className="text-gray-700" size={24} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <main className="max-w-[2000px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-89px)]">
          {/* Left Panel - Input Form */}
          <div
            className={`${
              showPDF ? 'hidden lg:block' : 'block'
            } bg-white dark:bg-gray-800 p-6 overflow-y-auto`}
          >
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

          {/* Right Panel - PDF Preview */}
          <div
            className={`${
              showPDF ? 'block' : 'hidden lg:block'
            } bg-gray-100 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700`}
          >
            <div className="sticky top-0 h-screen">
              <PDFPreview data={formData} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
