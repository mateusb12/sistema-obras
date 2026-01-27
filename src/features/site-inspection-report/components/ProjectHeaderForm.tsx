import type { UseFormRegister } from 'react-hook-form';
import type { InspectionForm } from '../types';

interface ProjectHeaderFormProps {
  register: UseFormRegister<InspectionForm>;
}

export function ProjectHeaderForm({ register }: ProjectHeaderFormProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Project Information</h2>
      
      <div>
        <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Project Name
        </label>
        <input
          {...register('header.projectName')}
          type="text"
          id="projectName"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter project name"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Location
        </label>
        <input
          {...register('header.location')}
          type="text"
          id="location"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter location"
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date
        </label>
        <input
          {...register('header.date')}
          type="date"
          id="date"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="inspectorName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Inspector Name
        </label>
        <input
          {...register('header.inspectorName')}
          type="text"
          id="inspectorName"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          placeholder="Enter inspector name"
        />
      </div>
    </div>
  );
}
