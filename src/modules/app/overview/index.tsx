import {
  Group,
  Text,
  Title,
  useMantineTheme,
  Container,
  SegmentedControl,
  Center,
  Button,
  Menu,
  Skeleton,
  SimpleGrid,
  ScrollArea,
  Stack,
  createStyles,
  Burger,
  MediaQuery,
  Divider,
  Flex,
  Box,
  ActionIcon,
} from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { useEffect, useState } from "react";
import {
  ChartPie2,
  Circle,
  CircleCheck,
  CircleDot,
  CircleDotted,
  CircleX,
  LayoutColumns,
  LayoutRows,
  Plus,
  X,
  Filter as FilterIcon,
  LayoutSidebar,
} from "tabler-icons-react";
import { useQuery } from "urql";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import { TaskPriority, TasksDocument, TaskStatus } from "../../../integration/graphql";
import { TaskListElement } from "components/ui/Task";
import { StatusIcon, statusName } from "components/ui/Task/status";
import { getCookie, setCookie } from "cookies-next";
import { DndTaskListElement } from "components/ui/CardTask";
import { LabelType } from "components/ui/Task/types";
import { Member, Project } from "../datatypes";
import { FilterDropdown } from "components/ui/Filters/filterDropdown";
import { Filter } from "components/ui/Filters/types";
import { FilterListView } from "components/ui/Filters/filterListView";
import { DatabyFilter } from "components/ui/Filters/filtersDataLogic";
import { usePlexoContext } from "context/PlexoContext";

const useStyles = createStyles(theme => ({
  burger: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
    [theme.fn.smallerThan("xs")]: {
      marginRight: -10,
    },
  },
  "text-view-buttons": {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },
  "text-header-buttons": {
    [theme.fn.smallerThan("sm")]: {
      fontSize: "90%",
    },
    [theme.fn.smallerThan("xs")]: {
      fontSize: "70%",
      marginRight: -15,
      marginLeft: -5,
    },
  },
  "icon-header-buttons": {
    [theme.fn.smallerThan("sm")]: {
      width: "90%",
      height: "90%",
    },
    [theme.fn.smallerThan("xs")]: {
      display: "none",
    },
  },
  "icon-view-buttons": {
    [theme.fn.smallerThan("sm")]: {
      width: "90%",
      height: "90%",
    },
    [theme.fn.smallerThan("xs")]: {
      width: "70%",
      height: "70%",
    },
  },
  "segmented-control": {
    [theme.fn.smallerThan("xs")]: {
      marginLeft: -5,
    },
  },
}));

const DndTaskBoard = ({ statusData }: { statusData: any }) => {
  const [state, handlers] = useListState([...statusData]);
  const [task, setTasks] = useState<{ id: string }[]>([]);

  useEffect(() => {
    setTasks(state);
  }, [state]);

  return (
    <DragDropContext
      onDragEnd={({ destination, source }) => {
        handlers.reorder({ from: source.index, to: destination?.index || 0 });
        setTasks(state);
      }}
    >
      <Droppable droppableId="task-list" direction="vertical">
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {state.map((t: any, index: number) => (
              <Draggable key={t.id} draggableId={t.id} index={index}>
                {provided => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <DndTaskListElement key={t.id} task={{ ...t, status: t.status }} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

const DndTaskList = ({ statusData }: { statusData: any }) => {
  const [state, handlers] = useListState([...statusData]);
  const [task, setTasks] = useState<{ id: string }[]>([]);

  useEffect(() => {
    setTasks(state);
  }, [state]);

  return (
    <DragDropContext
      onDragEnd={({ destination, source }) => {
        handlers.reorder({ from: source.index, to: destination?.index || 0 });
        setTasks(state);
      }}
    >
      <Droppable droppableId="task-list" direction="vertical">
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {state.map((t: any, index: number) => (
              <Draggable key={t.id} draggableId={t.id} index={index}>
                {provided => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <TaskListElement key={t.id} task={{ ...t, status: t.status }} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export const OverviewContent = () => {
  /*  const task: Task = {
    code: "MIN-169",
    title: "Definir e implementar Splash Screen e Icono del app Vax Canina",
    priority: "low",
    status: "in-progress",
    // assigned: {
    //   name: "BM",
    // },
    createdAt: new Date(),
    project: {
      name: "Minsky",
    },
  }; */
  const { classes, theme } = useStyles();
  const [viewMode, setViewMode] = useState<"list" | "columns">("list");
  const { setNavBarOpened } = usePlexoContext();

  useEffect(() => {
    setViewMode(getCookie("viewMode") === "columns" ? "columns" : "list");
  }, []);

  useEffect(() => {
    setCookie("viewMode", viewMode, {
      maxAge: 30 * 24 * 60 * 60,
    });
  }, [viewMode]);

  const [{ data: tasksData, fetching: isFetchingTasksData }] = useQuery({
    query: TasksDocument,
  });

  //lista de los filtros aplicados
  const [filterList, setFilterList] = useState<Filter[]>([]);

  //se usa para gestionar el menu del filtro
  const [openedMenu, setOpenedMenu] = useState(false);

  //gestion de la lista de filtros seleccionados de cada tipo
  const [statusFilters, setStatusFilters] = useState<TaskStatus[]>([]);
  const [assigneeFilters, setAssigneeFilters] = useState<Member["id"][]>([]);
  const [leaderFilters, setLeaderFilters] = useState<Member["id"][]>([]);
  const [creatorFilters, setCreatorFilters] = useState<Member["id"][]>([]);
  const [priorityFilters, setPriorityFilters] = useState<TaskPriority[]>([]);
  const [labelsFilters, setLabelsFilters] = useState<LabelType[]>([]);
  const [projectFilters, setProjectFilters] = useState<Project["id"]>([]);

  //gestion del filtro seleccionado para añadir los submenus de cada uno
  const [filter, setFilter] = useState<String>("");

  const NoneDndTaskList = ({ data }: { data: any }) => {
    const noneData = data?.tasks.filter((t: { status: string }) => t.status == "NONE");

    return <DndTaskList statusData={noneData} />;
  };

  const InProgressDndTaskList = ({ data }: { data: any }) => {
    const inProgressData = data?.tasks.filter((t: { status: string }) => t.status == "IN_PROGRESS");

    return <DndTaskList statusData={inProgressData} />;
  };

  const ToDoDndTaskList = ({ data }: { data: any }) => {
    const toDoData = data?.tasks.filter((t: { status: string }) => t.status == "TO_DO");

    return <DndTaskList statusData={toDoData} />;
  };

  const BacklogDndTaskList = ({ data }: { data: any }) => {
    const backlogData = data?.tasks.filter((t: { status: string }) => t.status == "BACKLOG");

    return <DndTaskList statusData={backlogData} />;
  };

  const DoneDndTaskList = ({ data }: { data: any }) => {
    const doneData = data?.tasks.filter((t: { status: string }) => t.status == "DONE");

    return <DndTaskList statusData={doneData} />;
  };

  const CancelDndTaskList = ({ data }: { data: any }) => {
    const cancelData = data?.tasks.filter((t: { status: string }) => t.status == "CANCELED");

    return <DndTaskList statusData={cancelData} />;
  };

  const InProgressDndTaskBoard = ({ data }: { data: any }) => {
    const inProgressData = data?.tasks.filter((t: { status: string }) => t.status == "IN_PROGRESS");

    return <DndTaskBoard statusData={inProgressData} />;
  };

  const ToDoDndTaskBoard = ({ data }: { data: any }) => {
    const toDoData = data?.tasks.filter((t: { status: string }) => t.status == "TO_DO");

    return <DndTaskBoard statusData={toDoData} />;
  };

  const BacklogDndTaskBoard = ({ data }: { data: any }) => {
    const backlogData = data?.tasks.filter((t: { status: string }) => t.status == "BACKLOG");

    return <DndTaskBoard statusData={backlogData} />;
  };

  const DoneDndTaskBoard = ({ data }: { data: any }) => {
    const doneData = data?.tasks.filter((t: { status: string }) => t.status == "DONE");

    return <DndTaskBoard statusData={doneData} />;
  };

  const NoneDndTaskBoard = ({ data }: { data: any }) => {
    const noneData = data?.tasks.filter((t: { status: string }) => t.status == "NONE");

    return <DndTaskBoard statusData={noneData} />;
  };

  const CancelDndTaskBoard = ({ data }: { data: any }) => {
    const cancelData = data?.tasks.filter((t: { status: string }) => t.status == "CANCELED");

    return <DndTaskBoard statusData={cancelData} />;
  };

  const OverviewContentBoard = (props: { data: any; fetching: any }) => {
    const theme = useMantineTheme();
    const [scrollPosition, onScrollPositionChange] = useState({ x: 0, y: 0 });
    const { data, fetching } = props;

    // console.log(data.tasks);
    // console.log(typeof data.tasks);

    return (
      <ScrollArea
        type="auto"
        offsetScrollbars
        style={{ height: innerHeight - 90 }}
        onScrollPositionChange={onScrollPositionChange}
      >
        <SimpleGrid cols={6} spacing={325}>
          <Stack sx={{ minWidth: 312, marginLeft: 20 }}>
            <Group>
              <CircleDot size={18} color={theme.colors.gray[6]} />
              <Title order={6}>None</Title>
              <Text color="dimmed" size="xs">
                {data?.tasks.filter((task: { status: string }) => task.status == "NONE").length}
              </Text>
            </Group>
            <ScrollArea style={{ height: 812 }} offsetScrollbars>
              {fetching ? <Skeleton height={36} radius="sm" /> : <NoneDndTaskBoard data={data} />}
            </ScrollArea>
          </Stack>
          <Stack sx={{ minWidth: 312, marginLeft: 20 }}>
            <Group>
              <ChartPie2 size={18} color={theme.colors.yellow[6]} />
              <Title order={6}>In Progress</Title>
              <Text color="dimmed" size="xs">
                {
                  data?.tasks.filter((task: { status: string }) => task.status == "IN_PROGRESS")
                    .length
                }
              </Text>
            </Group>
            <ScrollArea style={{ height: 812 }} offsetScrollbars>
              {fetching ? (
                <Skeleton height={36} radius="sm" />
              ) : (
                <InProgressDndTaskBoard data={data} />
              )}
            </ScrollArea>
          </Stack>
          <Stack sx={{ minWidth: 312, marginLeft: 20 }}>
            <Group>
              <Circle size={18} />
              <Title order={6}>Todo</Title>
              <Text color="dimmed" size="xs">
                {data?.tasks.filter((task: { status: string }) => task.status == "TO_DO").length}
              </Text>
            </Group>
            <ScrollArea style={{ height: 812 }} offsetScrollbars>
              {fetching ? <Skeleton height={36} radius="sm" /> : <ToDoDndTaskBoard data={data} />}
            </ScrollArea>
          </Stack>
          <Stack sx={{ minWidth: 312, marginLeft: 20 }}>
            <Group>
              <CircleDotted size={18} />
              <Title order={6}>Backlog</Title>
              <Text color="dimmed" size="xs">
                {data?.tasks.filter((task: { status: string }) => task.status == "BACKLOG").length}
              </Text>
            </Group>
            <ScrollArea style={{ height: 812 }} offsetScrollbars>
              {fetching ? (
                <Skeleton height={36} radius="sm" />
              ) : (
                <BacklogDndTaskBoard data={data} />
              )}
            </ScrollArea>
          </Stack>
          <Stack sx={{ minWidth: 312, marginLeft: 20 }}>
            <Group>
              <CircleCheck size={18} color={theme.colors.indigo[6]} />
              <Title order={6}>Done</Title>
              <Text color="dimmed" size="xs">
                {data?.tasks.filter((task: { status: string }) => task.status == "DONE").length}
              </Text>
            </Group>
            <ScrollArea style={{ height: 812 }} offsetScrollbars>
              {fetching ? <Skeleton height={36} radius="sm" /> : <DoneDndTaskBoard data={data} />}
            </ScrollArea>
          </Stack>
          <Stack sx={{ minWidth: 312, marginLeft: 20 }}>
            <Group>
              <CircleX size={18} color={theme.colors.red[6]} />
              <Title order={6}>Canceled</Title>
              <Text color="dimmed" size="xs">
                {data?.tasks.filter((task: { status: string }) => task.status == "CANCELED").length}
              </Text>
            </Group>
            <ScrollArea style={{ height: 812 }} offsetScrollbars>
              {fetching ? <Skeleton height={36} radius="sm" /> : <CancelDndTaskBoard data={data} />}
            </ScrollArea>
          </Stack>
        </SimpleGrid>
      </ScrollArea>
    );
  };

  const StatusCounter = ({ status }: { status: TaskStatus }) => {
    if (!isFetchingTasksData) {
      if (
        DatabyFilter(filterList, tasksData!).tasks.filter(task => task.status == status).length != 0
      ) {
        return (
          <Group spacing={6} mt={16} mb={8}>
            {StatusIcon(theme, status)}
            <Title order={6}>{statusName(status)}</Title>
            <Text color="dimmed" size="xs">
              {
                DatabyFilter(filterList, tasksData!).tasks.filter(task => task.status == status)
                  .length
              }
            </Text>
          </Group>
        );
      }
    } else {
      return (
        <Group spacing={6} mt={16} mb={8}>
          {StatusIcon(theme, status)}
          <Title order={6}>{statusName(status)}</Title>
          <Text color="dimmed" size="xs">
            {tasksData?.tasks.filter(task => task.status == status).length}
          </Text>
        </Group>
      );
    }
    return null;
  };
  // console.log(tasksData);
  // const [scrollPosition, onScrollPositionChange] = useState({ x: 0, y: 0 });
  return (
    <Stack>
      <Group
        h={73}
        position="apart"
        sx={{
          padding: theme.spacing.md,
          backgroundColor:
            theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.colors.gray[0],
          "&:not(:last-of-type)": {
            borderBottom: `1px solid ${
              theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[3]
            }`,
          },
        }}
      >
        <Group spacing="md">
          <MediaQuery largerThan="sm" styles={{ display: "none" }}>
            <ActionIcon onClick={() => setNavBarOpened(true)}>
              <LayoutSidebar size={16} />
            </ActionIcon>
          </MediaQuery>
          {filterList.length == 0 ? (
            <Menu shadow="md" position="bottom-start" width={250} opened={openedMenu}>
              <Menu.Target>
                <Button
                  className={classes["text-header-buttons"]}
                  compact
                  variant="light"
                  /* p={5} */
                  color={"gray"}
                  leftIcon={
                    <FilterIcon
                      className={classes["icon-header-buttons"]}
                      size={16}
                      color={theme.colors.red[4]}
                    />
                  }
                  onClick={() => {
                    setFilter("");
                    setOpenedMenu(true);
                  }}
                >
                  Filters
                </Button>
              </Menu.Target>
              <FilterDropdown
                setOpenedMenu={setOpenedMenu}
                filter={filter}
                onFilterSelect={f => setFilter(f)}
                filterList={filterList}
                setFilterList={setFilterList}
                statusFilters={statusFilters}
                setStatusFilters={setStatusFilters}
                assigneeFilters={assigneeFilters}
                setAssigneeFilters={setAssigneeFilters}
                leaderFilters={leaderFilters}
                setLeaderFilters={setLeaderFilters}
                creatorFilters={creatorFilters}
                setCreatorFilters={setCreatorFilters}
                priorityFilters={priorityFilters}
                setPriorityFilters={setPriorityFilters}
                labelsFilters={labelsFilters}
                setLabelsFilters={setLabelsFilters}
                projectFilters={projectFilters}
                setProjectFilters={setProjectFilters}
                theme={theme}
              />
            </Menu>
          ) : (
            <Button
              className={classes["text-header-buttons"]}
              compact
              variant="light"
              color={"gray"}
              leftIcon={<X size={16} color={theme.colors.red[4]} />}
              onClick={() => {
                setFilter("");
                setFilterList([]);
              }}
            >
              Clear filters
            </Button>
          )}

          {/* <Title order={5}>Active Tasks</Title> */}
        </Group>
        <Group>
          <SegmentedControl
            className={classes["segmented-control"]}
            size={"xs"}
            value={viewMode}
            onChange={value => setViewMode(value as "list" | "columns")}
            transitionTimingFunction="ease"
            data={[
              {
                label: (
                  <Center>
                    <LayoutRows className={classes["icon-view-buttons"]} size={16} />
                    <Text className={classes["text-view-buttons"]} ml={6} size={"xs"}>
                      List
                    </Text>
                  </Center>
                ),
                value: "list",
              },
              {
                label: (
                  <Center>
                    <LayoutColumns className={classes["icon-view-buttons"]} size={16} />
                    <Text className={classes["text-view-buttons"]} size={"xs"} ml={6}>
                      Board
                    </Text>
                  </Center>
                ),
                value: "columns",
              },
              // { label: 'Vue', value: 'vue' },
              // { label: 'Svelte', value: 'svelte' },
            ]}
          />
        </Group>
      </Group>
      <Box>
        <Container>
          {filterList.length > 0 ? (
            <>
              <Flex
                mt={{ base: 50, sm: 0 }}
                mih={50}
                gap={{ base: "xl", sm: "sm" }}
                justify="flex-start"
                align="center"
                direction="row"
                wrap="wrap"
              >
                {filterList.map(function (filter, index) {
                  return (
                    <FilterListView
                      key={index}
                      filter={filter}
                      index={index}
                      theme={theme}
                      classes={classes}
                      filterList={filterList}
                      setFilterList={setFilterList}
                    />
                  );
                })}
                <Menu shadow="md" width={250} opened={openedMenu}>
                  <Menu.Target>
                    <Button
                      className={classes["text-header-buttons"]}
                      compact
                      variant="subtle"
                      color={"gray"}
                      leftIcon={<Plus size={16} color={theme.colors.red[4]} />}
                      onClick={() => {
                        setFilter("");
                        setOpenedMenu(true);
                      }}
                    ></Button>
                  </Menu.Target>
                  <FilterDropdown
                    setOpenedMenu={setOpenedMenu}
                    filter={filter}
                    onFilterSelect={f => setFilter(f)}
                    filterList={filterList}
                    setFilterList={setFilterList}
                    statusFilters={statusFilters}
                    setStatusFilters={setStatusFilters}
                    assigneeFilters={assigneeFilters}
                    setAssigneeFilters={setAssigneeFilters}
                    leaderFilters={leaderFilters}
                    setLeaderFilters={setLeaderFilters}
                    creatorFilters={creatorFilters}
                    setCreatorFilters={setCreatorFilters}
                    priorityFilters={priorityFilters}
                    setPriorityFilters={setPriorityFilters}
                    labelsFilters={labelsFilters}
                    setLabelsFilters={setLabelsFilters}
                    projectFilters={projectFilters}
                    setProjectFilters={setProjectFilters}
                    theme={theme}
                  />
                </Menu>
              </Flex>
              <Divider my="sm" />
            </>
          ) : null}
        </Container>
        {viewMode === "list" ? (
          <Container>
            {!isFetchingTasksData && DatabyFilter(filterList, tasksData!).tasks.length == 0 ? (
              <Center>
                <Flex
                  mih={50}
                  mt={{ base: 150, sm: 300 }}
                  gap="md"
                  justify="center"
                  align="center"
                  direction="column"
                  wrap="wrap"
                >
                  <Text>No issues matching {filterList.length} filters</Text>
                  <Button
                    className={classes["text-header-buttons"]}
                    compact
                    variant="subtle"
                    color={"gray"}
                    onClick={() => {
                      setFilter("");
                      setFilterList([]);
                    }}
                  >
                    Clear filters
                  </Button>
                </Flex>
              </Center>
            ) : null}
            <StatusCounter status={TaskStatus.None} />
            {isFetchingTasksData ? (
              <Skeleton height={36} radius="sm" />
            ) : (
              <>
                <NoneDndTaskList data={DatabyFilter(filterList, tasksData!)} />
              </>
            )}
            <StatusCounter status={TaskStatus.InProgress} />
            {isFetchingTasksData ? (
              <Skeleton height={36} radius="sm" />
            ) : (
              <InProgressDndTaskList data={DatabyFilter(filterList, tasksData!)} />
            )}
            <StatusCounter status={TaskStatus.ToDo} />
            {/* <TaskListElement task={{ ...task, status: "todo" }} /> */}
            {isFetchingTasksData ? (
              <Skeleton height={36} radius="sm" />
            ) : (
              <ToDoDndTaskList data={DatabyFilter(filterList, tasksData!)} />
            )}
            <StatusCounter status={TaskStatus.Backlog} />
            {isFetchingTasksData ? (
              <Skeleton height={36} radius="sm" />
            ) : (
              <BacklogDndTaskList data={DatabyFilter(filterList, tasksData!)} />
            )}
            <StatusCounter status={TaskStatus.Done} />
            {isFetchingTasksData ? (
              <Skeleton height={36} radius="sm" />
            ) : (
              <DoneDndTaskList data={DatabyFilter(filterList, tasksData!)} />
            )}
            <StatusCounter status={TaskStatus.Canceled} />
            {isFetchingTasksData ? (
              <Skeleton height={36} radius="sm" />
            ) : (
              <CancelDndTaskList data={DatabyFilter(filterList, tasksData!)} />
            )}
          </Container>
        ) : (
          <OverviewContentBoard
            data={DatabyFilter(filterList, tasksData!)}
            fetching={isFetchingTasksData}
          />
        )}
      </Box>
    </Stack>
  );
};
