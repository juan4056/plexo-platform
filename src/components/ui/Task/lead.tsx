import {
  Button,
  Kbd,
  Menu,
  Text,
  TextInput,
  Avatar,
  Skeleton,
  Tooltip,
  ScrollArea,
} from "@mantine/core";
import { useEffect, useState } from "react";

import { Member, Task, TaskById } from "lib/types";
import { useData } from "lib/hooks/useData";
import { useActions } from "lib/hooks/useActions";
import { priorityName } from "./priority";
import { statusName } from "./status";
import { assigneesId } from "components/ui/Task/assignees";
import { ErrorNotification, SuccessNotification } from "lib/notifications";
import { LeadName } from "../Project/lead";
import { noMemberId } from "../constant";
import { MemberPhoto } from "../MemberPhoto";

type GenericLeadMenuProps = {
  children: React.ReactNode;
  onSelect?: (member: Member | null) => void;
  task?: Task | TaskById;
  selectedLead?: Member | null;
};

export const GenericLeadTaskMenu = ({
  children,
  onSelect,
  task,
  selectedLead,
}: GenericLeadMenuProps) => {
  const { membersData, isLoadingMembers } = useData({});
  const { fetchUpdateTask } = useActions();
  const [searchValue, setSearchValue] = useState("");
  const [membersOptions, setMembersOptions] = useState<Member[]>([]);
  const leadName = task?.leader?.name ? task?.leader?.name : selectedLead?.name;

  useEffect(() => {
    if (membersData?.members) {
      setMembersOptions(
        membersData?.members.filter((item: Member) =>
          item.name.toLowerCase().includes(searchValue.toLowerCase())
        )
      );
    }
  }, [membersData, searchValue]);

  const onUpdateTaskLead = async (leadId: string) => {
    const res = await fetchUpdateTask({
      taskId: task?.id,
      leadId: leadId,
      priority: priorityName(task?.priority),
      status: statusName(task?.status),
      title: task?.title,
      description: task?.description,
      dueDate: task?.dueDate,
      projectId: task?.project?.id,
      assignees: assigneesId(task),
    });
    if (res.data) {
      SuccessNotification("Lead updated", res.data.updateTask.title);
    }
    if (res.error) {
      ErrorNotification();
    }
  };

  return (
    <Menu
      shadow="md"
      position="bottom-start"
      withinPortal
      styles={{
        itemIcon: {
          width: 26,
          height: 26,
        },
      }}
    >
      <Menu.Target>
        <Tooltip label={leadName ? `Lead by ${leadName}` : "Lead by"} position="bottom">
          {children}
        </Tooltip>
      </Menu.Target>
      <Menu.Dropdown>
        <TextInput
          placeholder="Lead by..."
          variant="filled"
          value={searchValue}
          onChange={event => setSearchValue(event.currentTarget.value)}
          rightSection={<Kbd px={8}>A</Kbd>}
        ></TextInput>
        <Menu.Divider />
        <ScrollArea.Autosize mah={250}>
          <Menu.Item
            icon={<Avatar size="sm" radius="xl" />}
            onClick={() => {
              onSelect && onSelect(null);
              task && onUpdateTaskLead(noMemberId);
            }}
          >
            Unassigned
          </Menu.Item>
          {isLoadingMembers ? (
            <Skeleton height={36} radius="sm" />
          ) : (
            membersOptions.map(m => {
              return (
                <Menu.Item
                  key={m.id}
                  icon={MemberPhoto(m.photoUrl)}
                  onClick={() => {
                    onSelect && onSelect(m);
                    task && onUpdateTaskLead(m.id);
                  }}
                >
                  {m.name}
                </Menu.Item>
              );
            })
          )}
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
};

type LeadTaskSelectorProps = {
  lead: Member | null;
  setLead: (lead: Member | null) => void;
};

export const LeadTaskSelector = ({ lead, setLead }: LeadTaskSelectorProps) => {
  return (
    <GenericLeadTaskMenu onSelect={member => setLead(member)} selectedLead={lead}>
      {typeof lead === "undefined" ? (
        <Button compact variant="light" color={"gray"}>
          {MemberPhoto(undefined)}
        </Button>
      ) : (
        <Button compact variant="light" color={"gray"} leftIcon={MemberPhoto(lead?.photoUrl)}>
          <Text size={"xs"}>{LeadName(lead)}</Text>
        </Button>
      )}
    </GenericLeadTaskMenu>
  );
};
