import type { UseFormRegister } from 'react-hook-form';
import type { InspectionForm } from '../types';

interface ObservationsFormProps {
  register: UseFormRegister<InspectionForm>;
}

export function ObservationsForm({ register }: ObservationsFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Observations</h2>
      
      <div>
        <label htmlFor="observations" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Additional Notes and Observations
        </label>
        <textarea
          {...register('observations')}
          id="observations"
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
          placeholder="Enter any additional observations, notes, or comments..."
        />
      </div>
    </div>
  );
}
