import {
  DeleteProjectDocument,
  DeleteTaskDocument,
  DeleteTeamDocument,
  NewProjectDocument,
  NewTaskDocument,
  NewTeamDocument,
  UpdateProjectDocument,
  UpdateTeamDocument,
  UpdateTaskDocument,
} from "integration/graphql";
import { useMutation } from "urql";

export const useActions = () => {
  // Task
  const [createTask, fetchCreateTask] = useMutation(NewTaskDocument);
  const [deleteTask, fetchDeleteTask] = useMutation(DeleteTaskDocument);
  const [updateTask, fetchUpdateTask] = useMutation(UpdateTaskDocument);
  // Project
  const [createProject, fetchCreateProject] = useMutation(NewProjectDocument);
  const [deleteProject, fetchDeleteProject] = useMutation(DeleteProjectDocument);
  const [updateProject, fetchUpdateProject] = useMutation(UpdateProjectDocument);
  // Team
  const [createTeam, fetchCreateTeam] = useMutation(NewTeamDocument);
  const [deleteTeam, fetchDeleteTeam] = useMutation(DeleteTeamDocument);
  const [updateTeam, fetchUpdateTeam] = useMutation(UpdateTeamDocument);

  return {
    createTask,
    fetchCreateTask,
    deleteTask,
    fetchDeleteTask,
    updateTask,
    fetchUpdateTask,
    createProject,
    fetchCreateProject,
    deleteProject,
    fetchDeleteProject,
    updateProject,
    fetchUpdateProject,
    createTeam,
    fetchCreateTeam,
    deleteTeam,
    fetchDeleteTeam,
    updateTeam,
    fetchUpdateTeam,
  };
};
