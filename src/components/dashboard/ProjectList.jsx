import React from 'react';
import { ChevronDown, ChevronUp, Edit, Trash2, Printer } from 'lucide-react';

export default function ProjectList({
  projects,
  selectedProject,
  showProjectDetails,
  filteredTasks,
  onProjectClick,
  onProjectEdit,
  onProjectDelete,
  onPrintProject
}) {
  return (
    <ul className="space-y-2 max-h-[60vh] overflow-y-auto">
      {projects.map((project) => (
        <li 
          key={project.id} 
          className={`border p-3 rounded shadow-sm cursor-pointer transition-all ${
            selectedProject?.id === project.id ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50'
          }`}
          onClick={() => onProjectClick(project)}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold">{project.name}</p>
              <p className="text-sm text-gray-500">المسؤول: {project.owner}</p>
            </div>
            {selectedProject?.id === project.id ? (
              <ChevronUp className="text-gray-500" size={16} />
            ) : (
              <ChevronDown className="text-gray-500" size={16} />
            )}
          </div>
          
          {selectedProject?.id === project.id && showProjectDetails && (
            <div className="mt-2 pt-2 border-t">
              <p className="text-sm text-blue-600">
                عدد المهام: {filteredTasks.length}
              </p>
              <div className="flex gap-2 mt-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onProjectEdit(project);
                  }}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  <Edit size={14} />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onProjectDelete(project);
                  }}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  <Trash2 size={14} />
                </button>
                <button 
                  onClick={() => onPrintProject(project)}
                  className="text-purple-500 hover:text-purple-700 text-sm flex items-center gap-1 mt-2"
                >
                  <Printer size={14} />
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}