import {
  Button,
  Kbd,
  Menu,
  Text,
  TextInput,
  Skeleton,
  Tooltip,
  Checkbox,
  Group,
  createStyles,
  ScrollArea,
  Divider,
} from "@mantine/core";
import { LayoutGrid } from "tabler-icons-react";
import { useEffect, useState } from "react";

import { Project, TaskById } from "lib/types";
import { useData } from "lib/hooks/useData";
import { useActions } from "lib/hooks/useActions";
import { statusName } from "./status";
import { priorityName } from "./priority";
import { assigneesId } from "./assignees";
import { ErrorNotification, SuccessNotification } from "lib/notifications";
import { noMemberId } from "../constant";

const useStyles = createStyles(theme => ({
  checkbox: {
    width: "100%",
  },
}));

export const ProjectIcon = (project?: Project | null) => {
  //insert project icon
  return <LayoutGrid size={16} />;
};

type Payload = {
  id: any;
  name: string;
};

export const ProjectName = (project: Payload | null | undefined) => {
  return project?.id == noMemberId || project?.name == undefined || project.name == null
    ? "Project"
    : project.name;
};

type ProjectsCheckboxProps = {
  projectFilters: string[];
  setProjectFilters: (projectFilters: string[]) => void;
};

export const ProjectsCheckboxGroup = ({
  projectFilters,
  setProjectFilters,
}: ProjectsCheckboxProps) => {
  const { classes } = useStyles();
  const { projectsData } = useData({});
  const [searchValue, setSearchValue] = useState("");
  const [projectsOptions, setProjectsOptions] = useState<Project[]>([]);

  useEffect(() => {
    if (projectsData?.projects) {
      setProjectsOptions(
        projectsData?.projects.filter((item: Project) =>
          item.name.toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    }
  }, [searchValue]);

  return (
    <>
      <TextInput
        placeholder="Project"
        variant="unstyled"
        value={searchValue}
        onChange={event => setSearchValue(event.currentTarget.value)}
      />
      <Divider />
      <ScrollArea.Autosize mah={250}>
        <Checkbox.Group mt={10} value={projectFilters} onChange={setProjectFilters}>
          {projectsOptions.map(p => {
            return (
              <Checkbox
                key={p.id}
                size="xs"
                pb={15}
                value={p.id}
                label={
                  <Group spacing={5}>
                    {ProjectIcon(p)}
                    {ProjectName(p)}
                  </Group>
                }
                classNames={{
                  body: classes.checkbox,
                  labelWrapper: classes.checkbox,
                }}
              />
            );
          })}
        </Checkbox.Group>
      </ScrollArea.Autosize>
    </>
  );
};

type GenericProjectsMenuProps = {
  children: React.ReactNode;
  onSelect?: (project: Project | null) => void;
  task?: TaskById | undefined;
};

export const GenericProjectsMenu = ({ children, onSelect, task }: GenericProjectsMenuProps) => {
  const { projectsData, isLoadingProjects } = useData({});
  const { fetchUpdateTask } = useActions();

  const [searchValue, setSearchValue] = useState("");
  const [projectsOptions, setProjectsOptions] = useState<Project[]>([]);

  useEffect(() => {
    if (projectsData?.projects) {
      setProjectsOptions(
        projectsData?.projects.filter((item: Project) =>
          item.name.toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    }
  }, [projectsData, searchValue]);

  const onUpdateTaskProject = async (projectId: string) => {
    const res = await fetchUpdateTask({
      taskId: task?.id,
      projectId: projectId,
      priority: priorityName(task?.priority),
      status: statusName(task?.status),
      title: task?.title,
      description: task?.description,
      dueDate: task?.dueDate,
      leadId: task?.leader?.id,
      assignees: assigneesId(task),
    });

    if (res.data) {
      SuccessNotification("Project updated", res.data.updateTask.title);
    }
    if (res.error) {
      ErrorNotification();
    }
  };

  return (
    <Menu shadow="md" width={180} position="bottom-start" withinPortal>
      <Menu.Target>
        <Tooltip label="Add to project" position="bottom">
          {children}
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        <TextInput
          placeholder="Add to project..."
          variant="filled"
          value={searchValue}
          onChange={event => setSearchValue(event.currentTarget.value)}
          rightSection={<Kbd px={8}>P</Kbd>}
        ></TextInput>
        <Menu.Divider />
        <Menu.Item
          icon={<LayoutGrid size={16} />}
          onClick={() => {
            onSelect && onSelect(null);
            task && onUpdateTaskProject(noMemberId);
          }}
        >
          No project
        </Menu.Item>
        {isLoadingProjects ? (
          <Skeleton height={36} radius="sm" />
        ) : (
          projectsOptions.map(p => {
            return (
              <Menu.Item
                key={p.id}
                icon={ProjectIcon(p)}
                onClick={() => {
                  onSelect && onSelect(p);
                  task && onUpdateTaskProject(p.id);
                }}
              >
                {ProjectName(p)}
              </Menu.Item>
            );
          })
        )}
      </Menu.Dropdown>
    </Menu>
  );
};

type ProjectSelectorProps = {
  project: Project | null;
  setProject: (project: Project | null) => void;
};

export const ProjectSelector = ({ project, setProject }: ProjectSelectorProps) => {
  return (
    <GenericProjectsMenu onSelect={project => setProject(project)}>
      <Button compact variant="light" color={"gray"} leftIcon={ProjectIcon(project)}>
        <Text size={"xs"}>{ProjectName(project)}</Text>
      </Button>
    </GenericProjectsMenu>
  );
};
