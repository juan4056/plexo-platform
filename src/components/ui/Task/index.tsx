import {
  ActionIcon,
  Avatar,
  Badge,
  Checkbox,
  createStyles,
  Group,
  Paper,
  Text,
  useMantineTheme,
} from "@mantine/core";
import React, { useState } from "react";
import { DotsVertical } from "tabler-icons-react";

import { Task } from "modules/app/datatypes";
import { GenericPriorityMenu, PriorityIcon } from "./priority";
import { GenericStatusMenu, StatusIcon } from "./status";
import { TaskMenu } from "./menu";
import { GenericLeadTaskMenu } from "./lead";
import { LabelColor } from "./label";
import Link from "next/link";
import router from "next/router";
import { DateLabel } from "lib/utils";

type TaskListElementProps = {
  task: Task;
  active?: boolean;
  checked?: boolean;
};

const useStyles = createStyles(theme => ({
  MIN: {
    [theme.fn.smallerThan("xs")]: {
      display: "none",
    },
  },
  date: {
    [theme.fn.smallerThan("xs")]: {
      display: "none",
    },
  },
  badge: {
    [theme.fn.smallerThan(375)]: {
      width: "65px",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    [theme.fn.smallerThan(330)]: {
      width: "40px",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  },
  task: {
    [theme.fn.smallerThan(375)]: {
      width: "65px",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    [theme.fn.smallerThan(330)]: {
      width: "40px",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
  },
}));

export const TaskListElement = ({
  task,
  active = false,
  checked = false,
}: TaskListElementProps) => {
  const theme = useMantineTheme();
  const [controlledChecked, setChecked] = useState(checked);
  const { classes } = useStyles();

  return (
    <Paper px={6} py={4} mt={1} withBorder={active}>
      <Group spacing={0}>
        <Group position="left" spacing={8} sx={{ flexGrow: 1 }}>
          <Checkbox
            checked={controlledChecked}
            onChange={event => setChecked(event.currentTarget.checked)}
            size="xs"
            sx={{
              opacity: controlledChecked ? 1 : 0,
              ":hover": {
                opacity: 1,
              },
            }}
          />
          <GenericPriorityMenu task={task}>
            <ActionIcon variant="transparent" radius={"sm"}>
              {PriorityIcon(task.priority)}
            </ActionIcon>
          </GenericPriorityMenu>
          <GenericStatusMenu task={task}>
            <ActionIcon variant="transparent" radius={"sm"}>
              {StatusIcon(theme, task.status)}
            </ActionIcon>
          </GenericStatusMenu>
          <Text lineClamp={1} className={classes.MIN} size={"sm"} color={"dimmed"}>
            MIN-169
          </Text>
          <Text
            onClick={() => router.push(`/tasks/${task.id}`)}
            lineClamp={1}
            size={"sm"}
            className={classes.task}
            sx={{ flexGrow: 1 }}
          >
            {task.title}
          </Text>
        </Group>

        <Group position="right" spacing={8}>
          {task.labels.length &&
            task.labels.sort().map((l, index) => {
              return (
                <Badge
                  key={index}
                  variant={"dot"}
                  leftSection={LabelColor(l, theme)}
                  className={classes.badge}
                  styles={{
                    root: {
                      "&:before": {
                        display: "none",
                      },
                    },
                    inner: {
                      fontWeight: 500,
                      color:
                        theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.colors.gray[7],
                    },
                  }}
                >
                  {l}
                </Badge>
              );
            })}
          {task.project && <Badge className={classes.badge}>{task.project?.name}</Badge>}
          <Text lineClamp={1} className={classes.date} size={"sm"} color={"dimmed"}>
            {DateLabel(task.createdAt)}
          </Text>
          <GenericLeadTaskMenu task={task}>
            <ActionIcon variant="transparent">
              <Avatar size="sm" radius="xl">
                {/* {task.leadId} */}
              </Avatar>
            </ActionIcon>
          </GenericLeadTaskMenu>

          <TaskMenu task={task}>
            <ActionIcon radius={"sm"} size={"xs"}>
              <DotsVertical size={18} />
            </ActionIcon>
          </TaskMenu>
        </Group>
      </Group>
    </Paper>
  );
};
