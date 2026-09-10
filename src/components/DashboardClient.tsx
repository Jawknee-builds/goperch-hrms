"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "CEO" | "HOD" | "EMPLOYEE";
  title?: string | null;
  departmentId?: string | null;
  department?: { id: string; name: string; code: string } | null;
  isArchived?: boolean;
  deletedAt?: string | Date | null;
}

interface Milestone {
  id: string;
  title: string;
  description?: string;
  targetDate: string;
  status: string;
  department: { name: string };
  completedTasks: number;
  totalTasks: number;
  progress: number;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string;
  department: { name: string };
  createdBy: { id: string; name: string; email: string; role?: string };
  assignedTo?: { id: string; name: string; email: string; role?: string } | null;
  milestone?: { id: string; title: string } | null;
  project?: { id: string; title: string } | null;
  projectId?: string | null;
}

interface ProjectNote {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; email: string; role: string };
}

interface Project {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  progress: number;
  isTopFocus: boolean;
  targetDate?: string | null;
  department?: { id: string; name: string; code: string } | null;
  createdBy: { id: string; name: string; email: string; role?: string };
  tasks: Task[];
  notes: ProjectNote[];
}

interface UserSkill {
  id: string;
  proficiency: "LEARNING" | "INTERMEDIATE" | "ADVANCED" | "MASTERED";
  notes?: string;
  user: { id?: string; name: string; email: string; title?: string; department?: { name: string } };
  skill: { name: string; category: string };
}

interface Hurdle {
  id: string;
  title: string;
  question: string;
  answer?: string;
  status: "OPEN" | "RESOLVED";
  askedBy: { id?: string; name: string; email: string; department?: { name: string } };
  answeredBy?: { name: string; email: string } | null;
  task?: { title: string } | null;
  createdAt: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  users: { id: string; name: string; email: string; role: string; title?: string; departmentId?: string | null; isArchived?: boolean }[];
}

interface Channel {
  id: string;
  name: string;
  description?: string | null;
  department?: { name: string } | null;
}

interface ChatMessage {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; email: string; role: string; title?: string };
  recipient?: { id: string; name: string; email: string; role: string } | null;
}

interface FullEmployeeProfile {
  id: string;
  name: string;
  email: string;
  role: "CEO" | "HOD" | "EMPLOYEE";
  title?: string | null;
  department?: { name: string; code: string } | null;
  isArchived?: boolean;
  metrics: {
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
  };
  tasksAssigned: Task[];
  tasksCreated: Task[];
  skills: UserSkill[];
  hurdlesAsked: Hurdle[];
}

export default function DashboardClient({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<"overview" | "projects" | "tasks" | "chat" | "directory" | "skills" | "hurdles">("overview");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");

  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({});
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [hurdles, setHurdles] = useState<Hurdle[]>([]);
  const [loading, setLoading] = useState(true);

  // Employee Management State
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [showArchivedRoster, setShowArchivedRoster] = useState(false);
  const [archivedEmployees, setArchivedEmployees] = useState<User[]>([]);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    title: "",
    role: "EMPLOYEE",
    departmentId: user.departmentId || "",
    password: "password123",
  });

  // Chat State
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [selectedDmUser, setSelectedDmUser] = useState<User | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");

  // Employee Profile Modal State
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [employeeProfile, setEmployeeProfile] = useState<FullEmployeeProfile | null>(null);

  // Project Note Input State
  const [projectNoteInput, setProjectNoteInput] = useState<Record<string, string>>({});

  // Create Project Modal States
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    departmentId: user.departmentId || "",
    isTopFocus: false,
    progress: 0,
    targetDate: "",
  });

  // Create Task Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    assignedToId: "",
    departmentId: user.departmentId || "",
    milestoneId: "",
    projectId: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, msRes, projRes, taskRes, skillRes, hurdleRes, chRes, empRes] = await Promise.all([
        fetch("/api/departments"),
        fetch("/api/milestones"),
        fetch("/api/projects"),
        fetch(`/api/tasks${selectedDeptFilter !== "ALL" ? `?departmentId=${selectedDeptFilter}` : ""}`),
        fetch("/api/skills"),
        fetch("/api/hurdles"),
        fetch("/api/chat/channels"),
        fetch("/api/employees?archived=true"),
      ]);

      if (deptRes.ok) {
        const deptList: Department[] = (await deptRes.json()).departments;
        const sortedDeptList = [...deptList].sort((a, b) => {
          const aMatch = (user.departmentId && a.id === user.departmentId) || (user.department?.name && a.name.toLowerCase() === user.department.name.toLowerCase());
          const bMatch = (user.departmentId && b.id === user.departmentId) || (user.department?.name && b.name.toLowerCase() === user.department.name.toLowerCase());
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          return 0;
        });
        setDepartments(sortedDeptList);
        if (sortedDeptList.length > 0 && Object.keys(expandedDepts).length === 0) {
          const userDeptObj = sortedDeptList.find((d) => (user.departmentId && d.id === user.departmentId) || (user.department?.name && d.name.toLowerCase() === user.department.name.toLowerCase())) || sortedDeptList[0];
          setExpandedDepts({ [userDeptObj.id]: true });
        }
      }
      if (msRes.ok) setMilestones((await msRes.json()).milestones);
      if (projRes.ok) {
        const projList: Project[] = (await projRes.json()).projects;
        const sortedProjList = [...projList].sort((a, b) => {
          const aMatch = (user.departmentId && a.department?.id === user.departmentId) || (user.department?.name && a.department?.name?.toLowerCase() === user.department.name.toLowerCase());
          const bMatch = (user.departmentId && b.department?.id === user.departmentId) || (user.department?.name && b.department?.name?.toLowerCase() === user.department.name.toLowerCase());
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          return 0;
        });
        setProjects(sortedProjList);
        if (sortedProjList.length > 0 && Object.keys(expandedProjects).length === 0) {
          setExpandedProjects({ [sortedProjList[0].id]: true });
        }
      }
      if (taskRes.ok) {
        const rawTasks: Task[] = (await taskRes.json()).tasks;
        const sortedTasks = [...rawTasks].sort((a, b) => {
          const aMatch = user.department?.name && a.department?.name?.toLowerCase() === user.department.name.toLowerCase();
          const bMatch = user.department?.name && b.department?.name?.toLowerCase() === user.department.name.toLowerCase();
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          return 0;
        });
        setTasks(sortedTasks);
      }
      if (skillRes.ok) setUserSkills((await skillRes.json()).userSkills);
      if (hurdleRes.ok) setHurdles((await hurdleRes.json()).hurdles);
      if (chRes.ok) {
        const chList: Channel[] = (await chRes.json()).channels;
        const sortedChList = [...chList].sort((a, b) => {
          const aMatch = user.department?.name && a.department?.name?.toLowerCase() === user.department.name.toLowerCase();
          const bMatch = user.department?.name && b.department?.name?.toLowerCase() === user.department.name.toLowerCase();
          if (aMatch && !bMatch) return -1;
          if (!aMatch && bMatch) return 1;
          return 0;
        });
        setChannels(sortedChList);
        if (sortedChList.length > 0 && !selectedChannelId && !selectedDmUser) {
          setSelectedChannelId(sortedChList[0].id);
        }
      }
      if (empRes.ok) {
        const allEmps: User[] = (await empRes.json()).employees;
        setArchivedEmployees(allEmps.filter((e) => e.isArchived));
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async () => {
    try {
      let url = "";
      if (selectedChannelId) {
        url = `/api/chat/messages?channelId=${selectedChannelId}`;
      } else if (selectedDmUser) {
        url = `/api/chat/messages?recipientId=${selectedDmUser.id}`;
      }
      if (!url) return;

      const res = await fetch(url);
      if (res.ok) {
        setChatMessages((await res.json()).messages);
      }
    } catch (err) {
      console.error("Error fetching chat messages:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDeptFilter]);

  useEffect(() => {
    if (activeTab === "chat") {
      fetchChatMessages();
      const interval = setInterval(fetchChatMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab, selectedChannelId, selectedDmUser]);

  const toggleDeptAccordion = (deptId: string) => {
    setExpandedDepts((prev) => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  const toggleProjectAccordion = (projId: string) => {
    setExpandedProjects((prev) => ({ ...prev, [projId]: !prev[projId] }));
  };

  const openEmployeeProfile = async (empId: string) => {
    setSelectedEmployeeId(empId);
    try {
      const res = await fetch(`/api/employees/${empId}`);
      if (res.ok) {
        const data = await res.json();
        setEmployeeProfile(data.employee);
      }
    } catch (err) {
      console.error("Error fetching employee profile:", err);
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmployee),
      });
      if (res.ok) {
        setIsAddEmployeeModalOpen(false);
        setNewEmployee({
          name: "",
          email: "",
          title: "",
          role: "EMPLOYEE",
          departmentId: user.departmentId || "",
          password: "password123",
        });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add employee");
      }
    } catch (err) {
      console.error("Add employee error:", err);
    }
  };

  const CORE_TEAM_EMAILS = [
    "ceo@goperch.com",
    "hod.sales@goperch.com",
    "hod.electronics@goperch.com",
    "hod.software@goperch.com",
  ];

  const handleDeleteEmployee = async (empId: string) => {
    const targetEmp = allUsersList.find((u) => u.id === empId) || (employeeProfile?.id === empId ? employeeProfile : null);
    if (targetEmp && CORE_TEAM_EMAILS.includes(targetEmp.email.toLowerCase())) {
      alert("Forbidden: Core leadership team members (Ryan Bantu, Jonathan Jaladi, Vikram, Prasanna) are protected and cannot be deleted.");
      return;
    }

    if (!confirm("Are you sure you want to delete/archive this employee? All data will be backed up safely and can be restored.")) {
      return;
    }
    try {
      const res = await fetch(`/api/employees/${empId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (selectedEmployeeId === empId) setSelectedEmployeeId(null);
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to archive employee");
      }
    } catch (err) {
      console.error("Delete employee error:", err);
    }
  };

  const handleRestoreEmployee = async (empId: string) => {
    try {
      const res = await fetch(`/api/employees/${empId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: false }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Restore employee error:", err);
    }
  };

  const handlePullToTopFocus = async (projectId: string, targetState?: boolean) => {
    const targetProj = projects.find((p) => p.id === projectId);
    if (!targetProj) return;

    const nextState = targetState !== undefined ? targetState : !targetProj.isTopFocus;

    if (nextState) {
      const currentTopProjects = projects.filter((p) => p.isTopFocus);
      if (currentTopProjects.length >= 3) {
        const projToDemote = currentTopProjects[currentTopProjects.length - 1];
        if (projToDemote.id !== projectId) {
          await fetch("/api/projects", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: projToDemote.id, isTopFocus: false }),
          });
        }
      }
    }

    try {
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: projectId, isTopFocus: nextState }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Pull to top focus error:", err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newProject.isTopFocus) {
      const currentTopProjects = projects.filter((p) => p.isTopFocus);
      if (currentTopProjects.length >= 3) {
        const projToDemote = currentTopProjects[currentTopProjects.length - 1];
        await fetch("/api/projects", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: projToDemote.id, isTopFocus: false }),
        });
      }
    }
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });
      if (res.ok) {
        setIsProjectModalOpen(false);
        setNewProject({
          title: "",
          description: "",
          departmentId: user.departmentId || "",
          isTopFocus: false,
          progress: 0,
          targetDate: "",
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostProjectNote = async (projectId: string) => {
    const content = projectNoteInput[projectId];
    if (!content || !content.trim()) return;

    try {
      const res = await fetch(`/api/projects/${projectId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });
      if (res.ok) {
        setProjectNoteInput((prev) => ({ ...prev, [projectId]: "" }));
        fetchData();
      }
    } catch (err) {
      console.error("Post project note error:", err);
    }
  };

  const handleUpdateProjectProgress = async (projectId: string, newProgress: number) => {
    try {
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: projectId, progress: newProgress }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Update project progress error:", err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      if (res.ok) {
        setIsTaskModalOpen(false);
        setNewTask({ title: "", description: "", priority: "MEDIUM", assignedToId: "", departmentId: user.departmentId || "", milestoneId: "", projectId: "" });
        fetchData();
        if (selectedEmployeeId) openEmployeeProfile(selectedEmployeeId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      if (res.ok) {
        fetchData();
        if (selectedEmployeeId) openEmployeeProfile(selectedEmployeeId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    try {
      const payload: any = { content: messageInput.trim() };
      if (selectedChannelId) payload.channelId = selectedChannelId;
      if (selectedDmUser) payload.recipientId = selectedDmUser.id;

      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessageInput("");
        fetchChatMessages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter((t) => t.status === "COMPLETED").length;
  const inProgressTasksCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const openHurdlesCount = hurdles.filter((h) => h.status === "OPEN").length;
  const overallCompletionPct = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const topFocusProjects = projects.filter((p) => p.isTopFocus);
  const allUsersList = departments.flatMap((d) => d.users).filter((u) => !u.isArchived);

  const filteredTasks = tasks.filter((t) => {
    if (user.role === "EMPLOYEE") {
      const isDeptMatch = t.department?.name?.toLowerCase() === user.department?.name?.toLowerCase();
      const isAssignedToMe = t.assignedTo?.id === user.id;
      if (!isDeptMatch && !isAssignedToMe) return false;
    } else if (selectedDeptFilter !== "ALL" && t.department?.name !== departments.find((d) => d.id === selectedDeptFilter)?.name) {
      return false;
    }
    if (selectedStatusFilter !== "ALL" && t.status !== selectedStatusFilter) {
      return false;
    }
    return true;
  });

  const renderTaskCard = (task: Task) => {
    return (
      <div
        key={task.id}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("taskId", task.id);
          e.dataTransfer.setData("type", "task");
        }}
        className="bg-white p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1.5 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-md transition"
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1.5 font-semibold text-slate-900">
            <span className="text-slate-400 font-bold" title="Drag Task Card">⠿</span>
            <span>{task.title}</span>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            task.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" :
            task.status === "IN_REVIEW" ? "bg-amber-50 text-amber-700" :
            task.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
          }`}>
            {task.status.replace("_", " ")}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
          <span>Assigned: {task.assignedTo?.name || "Unassigned"}</span>
          {task.project && (
            <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">
              📁 {task.project.title}
            </span>
          )}
        </div>

        {/* Push & Pull 1-Click Status Controls */}
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
          {task.status === "IN_PROGRESS" && (
            <button
              onClick={() => handleUpdateTaskStatus(task.id, "TODO")}
              className="px-2 py-0.5 text-[10px] font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
            >
              ← Pull to TODO
            </button>
          )}
          {task.status === "IN_REVIEW" && (
            <button
              onClick={() => handleUpdateTaskStatus(task.id, "IN_PROGRESS")}
              className="px-2 py-0.5 text-[10px] font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-md transition-colors"
            >
              ← Pull to IN PROGRESS
            </button>
          )}
          {task.status === "COMPLETED" && (
            <button
              onClick={() => handleUpdateTaskStatus(task.id, "IN_REVIEW")}
              className="px-2 py-0.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
            >
              ← Re-open
            </button>
          )}

          {task.status === "TODO" && (
            <button
              onClick={() => handleUpdateTaskStatus(task.id, "IN_PROGRESS")}
              className="px-2 py-0.5 text-[10px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm ml-auto"
            >
              Push to IN PROGRESS →
            </button>
          )}
          {task.status === "IN_PROGRESS" && (
            <button
              onClick={() => handleUpdateTaskStatus(task.id, "IN_REVIEW")}
              className="px-2 py-0.5 text-[10px] font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors shadow-sm ml-auto"
            >
              Push to IN REVIEW →
            </button>
          )}
          {task.status === "IN_REVIEW" && (
            <button
              onClick={() => handleUpdateTaskStatus(task.id, "COMPLETED")}
              className="px-2 py-0.5 text-[10px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm ml-auto"
            >
              Push to COMPLETED ✓
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Clean Minimalist Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-blue-600">GoPerch Workspace</span>
            {user.department && (
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100/80 text-blue-800 text-[10px] font-bold border border-blue-200 shadow-2xs flex items-center gap-1">
                🎯 {user.department.name} Department Hub
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            Hello, {user.name.split(" ")[0]} 👋
            {user.role === "HOD" && (
              <span className="text-xs font-bold px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-300 shadow-2xs">
                👑 Head of {user.department?.name || "Department"}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {user.role === "CEO" && "Executive overview across Electronics, Software, Sales, and Leadership."}
            {user.role === "HOD" && `Welcome to your ${user.department?.name || "Department"} Command Center. Operations & team priorities ranked on top.`}
            {user.role === "EMPLOYEE" && `Your personal ${user.department?.name || "team"} workspace.`}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {(user.role === "CEO" || user.role === "HOD") && (
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="bg-white border border-blue-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-600 shadow-sm"
            >
              <option value="ALL">All Departments View</option>
              {departments.map((d) => {
                const isUserDept = d.id === user.departmentId || d.name.toLowerCase() === user.department?.name?.toLowerCase();
                return (
                  <option key={d.id} value={d.id}>
                    {isUserDept ? `⭐ ${d.name} (My Department)` : d.name}
                  </option>
                );
              })}
            </select>
          )}

          {user.role !== "EMPLOYEE" && (
            <button
              onClick={() => setIsAddEmployeeModalOpen(true)}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
            >
              + Add Employee
            </button>
          )}

          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition shadow-sm"
          >
            + New Project
          </button>

          {user.role !== "EMPLOYEE" && (
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
            >
              + Assign Task
            </button>
          )}
        </div>
      </div>

      {/* CEO TOP 3 STRATEGIC FOCUS INTERACTIVE TRAY (VISIBLE TO ALL ROLES) */}
      <div
        onDragOver={(e) => {
          if (user.role === "CEO") {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
          }
        }}
        onDrop={(e) => {
          if (user.role === "CEO") {
            e.preventDefault();
            const projId = e.dataTransfer.getData("text/plain");
            if (projId) handlePullToTopFocus(projId, true);
          }
        }}
        className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl shadow-2xl border-2 border-dashed border-blue-400/40 hover:border-blue-300 transition-all space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-amber-400 text-slate-950 rounded-full uppercase tracking-wider">
                Official Company Alignment
              </span>
              <h2 className="text-xl font-extrabold text-white tracking-tight">CEO Top 3 Strategic Priorities</h2>
            </div>
            <p className="text-xs text-blue-200/90 mt-1">
              🎯 Company-wide strategic focus set by CEO Ryan Bantu. Visible to all departments.
              {user.role === "CEO" && " Create custom priority cards or drag/pull project cards into slots below."}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {user.role === "CEO" && (
              <button
                onClick={() => {
                  setNewProject({
                    title: "",
                    description: "",
                    departmentId: user.departmentId || "",
                    isTopFocus: true,
                    progress: 0,
                    targetDate: "",
                  });
                  setIsProjectModalOpen(true);
                }}
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-xl text-xs transition shadow-md flex items-center gap-1"
              >
                ✨ + Create CEO Priority Card
              </button>
            )}
            <span className="text-xs font-semibold px-3 py-1.5 bg-white/10 rounded-xl text-blue-200 border border-white/10">
              {topFocusProjects.length} / 3 Focus Slots Active
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((slotIdx) => {
            const proj = topFocusProjects[slotIdx];
            if (proj) {
              return (
                <div
                  key={proj.id}
                  draggable={user.role === "CEO"}
                  onDragStart={(e) => {
                    if (user.role === "CEO") e.dataTransfer.setData("text/plain", proj.id);
                  }}
                  className={`p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-amber-400/50 shadow-lg flex flex-col justify-between space-y-3 relative transition ${
                    user.role === "CEO" ? "cursor-grab active:cursor-grabbing hover:border-amber-300" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-mono">
                        Priority #{slotIdx + 1}
                      </span>
                      {user.role === "CEO" && (
                        <button
                          onClick={() => handlePullToTopFocus(proj.id, false)}
                          className="text-[11px] font-semibold text-rose-300 hover:text-rose-100 hover:underline"
                          title="Remove from CEO Top 3 Focus"
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>
                    <h3 className="font-bold text-white text-sm leading-snug">{proj.title}</h3>
                    <p className="text-xs text-slate-300/90 line-clamp-2 mt-1">{proj.description}</p>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1 font-semibold text-slate-200">
                        <span>Progress</span>
                        <span className="text-amber-300 font-bold">{proj.progress}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-400 via-blue-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>
                    </div>

                    {proj.notes && proj.notes.length > 0 && (
                      <div className="p-2.5 bg-black/25 rounded-xl text-xs text-slate-200 border border-white/5">
                        <span className="text-[10px] uppercase font-bold text-blue-300 block mb-0.5">Latest Update</span>
                        <p className="italic text-slate-300 text-[11px] line-clamp-1">"{proj.notes[0].content}"</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            } else {
              return (
                <div
                  key={`empty-slot-${slotIdx}`}
                  onClick={() => {
                    if (user.role === "CEO") {
                      setNewProject({
                        title: "",
                        description: "",
                        departmentId: user.departmentId || "",
                        isTopFocus: true,
                        progress: 0,
                        targetDate: "",
                      });
                      setIsProjectModalOpen(true);
                    }
                  }}
                  className={`p-6 bg-white/5 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-center text-slate-400 space-y-2 min-h-[160px] transition ${
                    user.role === "CEO" ? "cursor-pointer hover:border-amber-400/80 hover:bg-white/10" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-slate-300 text-sm">
                    +{slotIdx + 1}
                  </div>
                  <div className="text-xs font-semibold text-slate-300">Priority #{slotIdx + 1} Slot Empty</div>
                  <div className="text-[11px] text-slate-400">
                    {user.role === "CEO"
                      ? "Click to +Create a CEO Priority Card or drag/pull a project here"
                      : "Awaiting CEO Strategic Allocation"}
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>

      {/* Clean KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="goperch-card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Total Projects</div>
            <div className="text-xl font-bold text-slate-900">{projects.length} active</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
            🎯
          </div>
        </div>

        <div className="goperch-card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">In Progress Tasks</div>
            <div className="text-xl font-bold text-slate-900">{inProgressTasksCount} tasks</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
            ⚡
          </div>
        </div>

        <div className="goperch-card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Blockers & Hurdles</div>
            <div className="text-xl font-bold text-amber-600">{openHurdlesCount} open</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
            ⚠️
          </div>
        </div>

        <div className="goperch-card p-4 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-400">Completion Rate</div>
            <div className="text-xl font-bold text-slate-900">{overallCompletionPct}%</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
            📊
          </div>
        </div>
      </div>

      {/* Minimalist Tab Navigation */}
      <div className="flex border-b border-slate-200/80 gap-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 transition border-b-2 whitespace-nowrap ${activeTab === "overview" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${activeTab === "projects" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}
        >
          Projects & Notes ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${activeTab === "tasks" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}
        >
          Task Board ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${activeTab === "chat" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}
        >
          Chat & Channels
        </button>
        <button
          onClick={() => setActiveTab("directory")}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${activeTab === "directory" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}
        >
          Team Directory ({allUsersList.length})
        </button>
        <button
          onClick={() => setActiveTab("skills")}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${activeTab === "skills" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}
        >
          Skills ({userSkills.length})
        </button>
        <button
          onClick={() => setActiveTab("hurdles")}
          className={`pb-3 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${activeTab === "hurdles" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}
        >
          Hurdles & Blockers ({openHurdlesCount})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="space-y-3">
            {departments
              .filter((d) => {
                if (user.role === "EMPLOYEE") {
                  return d.id === user.departmentId || d.name.toLowerCase() === user.department?.name?.toLowerCase();
                }
                return selectedDeptFilter === "ALL" || d.id === selectedDeptFilter;
              })
              .map((dept) => {
                const isExpanded = !!expandedDepts[dept.id];
                const deptTasks = tasks.filter((t) => t.department?.name === dept.name);
                const completedCount = deptTasks.filter((t) => t.status === "COMPLETED").length;
                const totalCount = deptTasks.length;
                const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                const deptHurdlesCount = hurdles.filter((h) => h.askedBy.department?.name === dept.name && h.status === "OPEN").length;
                const deptProjects = projects.filter((p) => p.department?.name === dept.name);

                return (
                  <div key={dept.id} className="goperch-card overflow-hidden transition-all">
                    {/* Header */}
                    <div
                      onClick={() => toggleDeptAccordion(dept.id)}
                      className="p-5 cursor-pointer hover:bg-slate-50/50 transition flex items-center justify-between select-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm flex items-center justify-center">
                          {dept.code.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-slate-900">{dept.name} Department</h3>
                            {(dept.id === user.departmentId || dept.name.toLowerCase() === user.department?.name?.toLowerCase()) && (
                              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-blue-600 text-white shadow-2xs flex items-center gap-1">
                                ⭐ Your Department
                              </span>
                            )}
                            {deptHurdlesCount > 0 && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                {deptHurdlesCount} Blocker
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 font-normal">{dept.description}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-right hidden sm:block">
                          <span className="font-bold text-blue-600">{pct}% Completed</span>
                          <span className="text-slate-400 font-normal ml-2">({completedCount}/{totalCount} tasks)</span>
                        </div>
                        <div className="text-slate-400 text-xs font-bold">
                          {isExpanded ? "▲" : "▼"}
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="p-5 bg-slate-50/50 border-t border-slate-100 space-y-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-500 font-medium">
                            <span>Department Task Progress</span>
                            <span className="font-bold text-slate-900">{pct}%</span>
                          </div>
                          <div className="w-full bg-slate-200/60 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
                          </div>
                        </div>

                        {/* Projects in Dept */}
                        {deptProjects.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Active Department Projects</div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {deptProjects.map((p) => (
                                <div
                                  key={p.id}
                                  draggable
                                  onDragStart={(e) => e.dataTransfer.setData("text/plain", p.id)}
                                  className="bg-white p-3 rounded-xl border border-slate-200/70 text-xs space-y-1.5 shadow-sm cursor-grab active:cursor-grabbing hover:border-blue-400 transition"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="font-semibold text-slate-900">{p.title}</span>
                                    <span className="font-bold text-blue-600 text-[11px]">{p.progress}%</span>
                                  </div>
                                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full rounded-full" style={{ width: `${p.progress}%` }} />
                                  </div>
                                  <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                                    <span className="text-[10px] text-slate-400">⠿ Drag to Top 3</span>
                                    <button
                                      onClick={() => handlePullToTopFocus(p.id)}
                                      className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                                        p.isTopFocus ? "bg-amber-100 text-amber-800" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                      }`}
                                    >
                                      {p.isTopFocus ? "⭐ In Top 3" : "📥 Pull into Top 3"}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tasks */}
                        <div className="space-y-1.5">
                          <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Active Tasks (Draggable Cards & Push/Pull)</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {deptTasks.map((t) => renderTaskCard(t))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 2: PROJECTS & NOTES */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">All Company & Department Projects</h2>
              <p className="text-xs text-slate-500">Drag any card up to the CEO Top 3 Strategic Priorities tray or click "📥 Pull into Top 3".</p>
            </div>
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
            >
              + Add Project
            </button>
          </div>

          <div className="space-y-3">
            {projects
              .filter((p) => {
                if (user.role === "EMPLOYEE") {
                  return !p.department || p.department?.id === user.departmentId || p.department?.name?.toLowerCase() === user.department?.name?.toLowerCase();
                }
                return selectedDeptFilter === "ALL" || p.department?.id === selectedDeptFilter;
              })
              .map((proj) => {
                const isExpanded = !!expandedProjects[proj.id];
                const projTasks = proj.tasks || [];
                const projNotes = proj.notes || [];

                return (
                  <div
                    key={proj.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/plain", proj.id)}
                    className={`goperch-card overflow-hidden transition-all border-2 ${
                      proj.isTopFocus ? "border-amber-400/80 bg-amber-50/10" : "border-slate-200/80 hover:border-blue-400"
                    }`}
                  >
                    {/* Project Card Header */}
                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="cursor-grab active:cursor-grabbing text-slate-400 font-bold" title="Drag Project Card">⠿</span>
                          <span className="font-bold text-slate-900 text-base">{proj.title}</span>
                          {proj.isTopFocus && (
                            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-400 text-slate-950 rounded-full uppercase tracking-wider">
                              ⭐ CEO Top Focus Priority
                            </span>
                          )}
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-full">
                            {proj.department?.name || "Company-wide"}
                          </span>
                        </div>
                        {proj.description && <p className="text-xs text-slate-500">{proj.description}</p>}
                      </div>

                      {/* Controls & Progress */}
                      <div className="flex items-center gap-4">
                        <div className="w-36 space-y-1">
                          <div className="flex justify-between text-xs font-semibold text-slate-700">
                            <span>Progress</span>
                            <span className="text-blue-600 font-bold">{proj.progress}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={proj.progress}
                            onChange={(e) => handleUpdateProjectProgress(proj.id, parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>

                        <button
                          onClick={() => handlePullToTopFocus(proj.id)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition shadow-sm ${
                            proj.isTopFocus
                              ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                              : "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                          }`}
                        >
                          {proj.isTopFocus ? "★ In Top 3 (Pull Out)" : "📥 Pull into Top 3"}
                        </button>

                        <button
                          onClick={() => toggleProjectAccordion(proj.id)}
                          className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                        >
                          {isExpanded ? "Collapse ▲" : "View Tasks & Notes ▼"}
                        </button>
                      </div>
                    </div>

                    {/* Accordion Content */}
                    {isExpanded && (
                      <div className="p-5 bg-slate-50/60 border-t border-slate-100 space-y-6">
                        {/* Tasks inside this Project */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                              Tasks in this Project ({projTasks.length}) &bull; Draggable
                            </span>
                            <button
                              onClick={() => {
                                setNewTask((prev) => ({ ...prev, projectId: proj.id, departmentId: proj.department?.id || user.departmentId || "" }));
                                setIsTaskModalOpen(true);
                              }}
                              className="text-xs font-semibold text-blue-600 hover:underline"
                            >
                              + Add Task to Project
                            </button>
                          </div>

                          {projTasks.length === 0 ? (
                            <div className="text-xs text-slate-400 italic bg-white p-3 rounded-xl border border-slate-200/60">
                              No tasks assigned to this project yet.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {projTasks.map((t) => renderTaskCard(t))}
                            </div>
                          )}
                        </div>

                        {/* Project Notes & Updates */}
                        <div className="space-y-3 pt-4 border-t border-slate-200/60">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                            Project Notes & Execution Log ({projNotes.length})
                          </span>

                          <div className="space-y-2">
                            {projNotes.map((n) => (
                              <div key={n.id} className="bg-white p-3 rounded-xl border border-slate-200/70 text-xs space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-slate-900">{n.author.name} ({n.author.role})</span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-slate-700 leading-relaxed">{n.content}</p>
                              </div>
                            ))}
                          </div>

                          {/* Post Note Form */}
                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Write a project note or update..."
                              value={projectNoteInput[proj.id] || ""}
                              onChange={(e) => setProjectNoteInput({ ...projectNoteInput, [proj.id]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handlePostProjectNote(proj.id);
                                }
                              }}
                              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600 shadow-sm"
                            />
                            <button
                              onClick={() => handlePostProjectNote(proj.id)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition"
                            >
                              Post Update
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 3: SLACK CHAT */}
      {activeTab === "chat" && (
        <div className="goperch-card grid grid-cols-1 md:grid-cols-4 min-h-[500px] overflow-hidden">
          <div className="bg-slate-50/60 border-r border-slate-100 p-4 space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Channels</span>
              <button onClick={() => setIsChannelModalOpen(true)} className="text-blue-600 hover:underline">+</button>
            </div>
            <div className="space-y-1">
              {channels
                .filter((ch) => {
                  if (user.role === "EMPLOYEE") {
                    return !ch.department || ch.department?.name?.toLowerCase() === user.department?.name?.toLowerCase() || ch.name.toLowerCase() === "general";
                  }
                  return true;
                })
                .map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => { setSelectedChannelId(ch.id); setSelectedDmUser(null); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selectedChannelId === ch.id ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"}`}
                >
                  # {ch.name}
                </button>
              ))}
            </div>

            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-3 border-t border-slate-200/60">Direct Messages</div>
            <div className="space-y-1">
              {allUsersList.filter(u => u.id !== user.id).map((u) => (
                <button
                  key={u.id}
                  onClick={() => { setSelectedDmUser(u as any); setSelectedChannelId(null); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition ${selectedDmUser?.id === u.id ? "bg-blue-600 text-white font-bold" : "text-slate-700 hover:bg-slate-100"}`}
                >
                  💬 {u.name}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-3 flex flex-col justify-between bg-white p-4">
            <div className="pb-3 border-b border-slate-100 text-xs font-bold text-slate-900">
              {selectedChannelId ? `# ${channels.find(c => c.id === selectedChannelId)?.name}` : selectedDmUser ? `Chat with ${selectedDmUser.name}` : "Select chat"}
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[360px] py-4">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="text-xs space-y-0.5">
                  <span className="font-bold text-slate-900">{msg.sender.name}: </span>
                  <span className="text-slate-700">{msg.content}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              />
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700">Send</button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: DIRECTORY & EMPLOYEE ROSTER MANAGEMENT */}
      {activeTab === "directory" && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Team Directory & Employee Roster</h2>
              <p className="text-xs text-slate-500">
                {showArchivedRoster ? "Viewing Soft-Deleted / Backup Roster. Restore employees anytime to undo mistakes." : "Active team members across all departments."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowArchivedRoster(!showArchivedRoster)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  showArchivedRoster ? "bg-amber-100 text-amber-900 border-amber-300" : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                {showArchivedRoster ? "← Active Directory" : `📦 Backup Roster (${archivedEmployees.length})`}
              </button>

              {user.role !== "EMPLOYEE" && (
                <button
                  onClick={() => setIsAddEmployeeModalOpen(true)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                >
                  + Add Employee
                </button>
              )}
            </div>
          </div>

          {!showArchivedRoster ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {allUsersList
                .filter((emp) => {
                  if (user.role === "EMPLOYEE") {
                    const empDept = departments.find((d) => d.users.some((u) => u.id === emp.id));
                    return empDept?.id === user.departmentId || empDept?.name.toLowerCase() === user.department?.name?.toLowerCase();
                  }
                  return true;
                })
                .map((emp) => (
                <div
                  key={emp.id}
                  className="goperch-card p-4 hover:border-blue-500 transition flex items-center justify-between"
                >
                  <div
                    onClick={() => openEmployeeProfile(emp.id)}
                    className="cursor-pointer flex-1 space-y-0.5"
                  >
                    <div className="font-bold text-slate-900 text-sm">{emp.name}</div>
                    <div className="text-xs text-slate-500">{emp.title || emp.role} &bull; {emp.email}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {user.role !== "EMPLOYEE" && emp.id !== user.id && (
                      CORE_TEAM_EMAILS.includes(emp.email.toLowerCase()) ? (
                        <span className="px-2.5 py-1 text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 rounded-lg flex items-center gap-1" title="Core Leadership Member (Protected)">
                          🛡️ Core Leader
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEmployee(emp.id);
                          }}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          title="Delete / Archive Employee with Backup Protection"
                        >
                          🗑️
                        </button>
                      )
                    )}
                    <button onClick={() => openEmployeeProfile(emp.id)} className="text-xs text-blue-600 font-bold">&rarr;</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {archivedEmployees.length === 0 ? (
                <div className="goperch-card p-6 text-center text-xs text-slate-400 italic">
                  No archived employees in backup roster.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {archivedEmployees.map((emp) => (
                    <div key={emp.id} className="goperch-card p-4 bg-slate-50 border-amber-200/80 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <span>{emp.name}</span>
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-800 rounded-full">Archived in Backup</span>
                        </div>
                        <div className="text-xs text-slate-400">{emp.title || emp.role} &bull; {emp.email}</div>
                      </div>

                      <button
                        onClick={() => handleRestoreEmployee(emp.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                      >
                        ↺ Restore Employee
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: TASK BOARD (INTERACTIVE DRAG & DROP KANBAN COLUMNS) */}
      {activeTab === "tasks" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {(["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"] as const).map((statusCol) => (
            <div
              key={statusCol}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
              }}
              onDrop={(e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData("taskId");
                if (taskId) handleUpdateTaskStatus(taskId, statusCol);
              }}
              className="bg-slate-50/80 p-3.5 rounded-2xl border-2 border-dashed border-slate-200/80 hover:border-blue-400/60 transition-all space-y-3 min-h-[400px]"
            >
              <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  {statusCol.replace("_", " ")}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 shadow-sm">
                  {filteredTasks.filter((t) => t.status === statusCol).length}
                </span>
              </div>

              <div className="space-y-2">
                {filteredTasks.filter((t) => t.status === statusCol).map((t) => renderTaskCard(t))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 6: SKILLS */}
      {activeTab === "skills" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {userSkills.map((us) => (
            <div key={us.id} className="goperch-card p-4 space-y-1 text-xs">
              <div className="font-bold text-slate-900">{us.skill.name}</div>
              <div className="text-blue-600 font-semibold">{us.user.name} &bull; {us.proficiency}</div>
              {us.notes && <div className="text-slate-400 italic">"{us.notes}"</div>}
            </div>
          ))}
        </div>
      )}

      {/* TAB 7: HURDLES */}
      {activeTab === "hurdles" && (
        <div className="space-y-2">
          {hurdles.map((h) => (
            <div key={h.id} className="goperch-card p-4 space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <span className="font-bold text-slate-900">{h.title}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${h.status === "OPEN" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{h.status}</span>
              </div>
              <p className="text-slate-600">{h.question}</p>
              {h.answer && <div className="p-2 bg-slate-50 rounded-lg text-emerald-700 font-medium">Resolution: {h.answer}</div>}
            </div>
          ))}
        </div>
      )}

      {/* EMPLOYEE PROFILE MODAL */}
      {selectedEmployeeId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            {employeeProfile && (
              <>
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{employeeProfile.name}</h3>
                    <div className="text-xs text-slate-400">{employeeProfile.title || employeeProfile.role} &bull; {employeeProfile.email}</div>
                  </div>
                  <button onClick={() => setSelectedEmployeeId(null)} className="text-slate-400 hover:text-slate-900 text-sm font-bold">✕</button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <div className="text-lg font-bold text-blue-600">{employeeProfile.metrics.completionRate}%</div>
                    <div className="text-slate-400">Completion Rate</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <div className="text-lg font-bold text-slate-900">{employeeProfile.skills.length}</div>
                    <div className="text-slate-400">Logged Skills</div>
                  </div>
                </div>

                {user.role !== "EMPLOYEE" && (
                  <div className="pt-2 space-y-2">
                    <button
                      onClick={() => {
                        setNewTask((prev) => ({ ...prev, assignedToId: employeeProfile.id, departmentId: employeeProfile.department?.name ? departments.find(d => d.name === employeeProfile.department?.name)?.id || "" : user.departmentId || "" }));
                        setIsTaskModalOpen(true);
                      }}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-sm transition"
                    >
                      + Assign Direct Task to {employeeProfile.name.split(" ")[0]}
                    </button>

                    {employeeProfile.id !== user.id && (
                      CORE_TEAM_EMAILS.includes(employeeProfile.email.toLowerCase()) ? (
                        <div className="w-full py-2 bg-blue-50 text-blue-800 font-bold rounded-xl text-xs border border-blue-200 text-center flex items-center justify-center gap-1.5">
                          🛡️ Core Leadership Member (Undeletable Account)
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDeleteEmployee(employeeProfile.id)}
                          className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-xl text-xs border border-rose-200 transition"
                        >
                          🗑️ Delete / Archive Employee to Backup Roster
                        </button>
                      )
                    )}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button onClick={() => setSelectedEmployeeId(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold">Close</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ADD EMPLOYEE MODAL */}
      {isAddEmployeeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleAddEmployee} className="bg-white p-6 rounded-3xl border border-slate-200 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Add New Employee</h3>
                <p className="text-xs text-slate-400">Create employee account with backup safety.</p>
              </div>
              <button type="button" onClick={() => setIsAddEmployeeModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-sm font-bold">✕</button>
            </div>

            <input
              type="text"
              required
              placeholder="Full Name *"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />

            <input
              type="email"
              required
              placeholder="Email Address *"
              value={newEmployee.email}
              onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />

            <input
              type="text"
              placeholder="Job Title (e.g. Senior Firmware Specialist)"
              value={newEmployee.title}
              onChange={(e) => setNewEmployee({ ...newEmployee, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Role</label>
                <select
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="EMPLOYEE">EMPLOYEE</option>
                  {user.role === "CEO" && <option value="HOD">HOD (Head of Dept)</option>}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Department</label>
                <select
                  value={newEmployee.departmentId}
                  onChange={(e) => setNewEmployee({ ...newEmployee, departmentId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                >
                  <option value="">Select Department...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Initial Password</label>
              <input
                type="text"
                value={newEmployee.password}
                onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-emerald-700 transition shadow-sm">
                Add Employee Account
              </button>
              <button type="button" onClick={() => setIsAddEmployeeModalOpen(false)} className="bg-slate-100 text-slate-700 py-2.5 px-4 rounded-xl text-xs font-semibold hover:bg-slate-200 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateProject} className="bg-white p-6 rounded-3xl border border-slate-200 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">Create New Project</h3>
            <input
              type="text"
              required
              placeholder="Project Title"
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
            />
            <textarea
              placeholder="Project Description"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 h-20"
            />
            <select
              value={newProject.departmentId}
              onChange={(e) => setNewProject({ ...newProject, departmentId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900"
            >
              <option value="">Company-wide (All Departments)</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name} Department</option>
              ))}
            </select>
            {user.role === "CEO" && (
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={newProject.isTopFocus}
                  onChange={(e) => setNewProject({ ...newProject, isTopFocus: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Mark as CEO Top 3 Strategic Focus Priority
              </label>
            )}
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-xs font-semibold hover:bg-slate-800">Create Project</button>
              <button type="button" onClick={() => setIsProjectModalOpen(false)} className="bg-slate-100 text-slate-700 py-2 px-4 rounded-xl text-xs">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleCreateTask} className="bg-white p-6 rounded-3xl border border-slate-200 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Assign New Task</h3>
                <p className="text-xs text-slate-400">Assign task across any department or project.</p>
              </div>
              <button type="button" onClick={() => setIsTaskModalOpen(false)} className="text-slate-400 hover:text-slate-900 text-sm font-bold">✕</button>
            </div>

            <input
              type="text"
              required
              placeholder="Task Title *"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Department *</label>
              <select
                required
                value={newTask.departmentId}
                onChange={(e) => setNewTask({ ...newTask, departmentId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-blue-600"
              >
                <option value="">Select Department...</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name} Department</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Associated Project (Optional)</label>
              <select
                value={newTask.projectId}
                onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="">None (Standalone Department Task)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.title} ({p.department?.name || "Company-wide"})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Assignee (Optional)</label>
              <select
                value={newTask.assignedToId}
                onChange={(e) => {
                  const selectedUser = allUsersList.find((u) => u.id === e.target.value);
                  setNewTask({
                    ...newTask,
                    assignedToId: e.target.value,
                    departmentId: selectedUser?.departmentId || newTask.departmentId,
                  });
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="">Unassigned (Open Pool)</option>
                {allUsersList.map((u) => {
                  const deptName = departments.find((d) => d.id === u.departmentId)?.name || "Leadership";
                  return (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.title || u.role} ({deptName})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-blue-700 transition shadow-sm">
                Create & Assign Task
              </button>
              <button type="button" onClick={() => setIsTaskModalOpen(false)} className="bg-slate-100 text-slate-700 py-2.5 px-4 rounded-xl text-xs font-semibold hover:bg-slate-200 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
