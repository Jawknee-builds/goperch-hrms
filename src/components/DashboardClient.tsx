"use client";

import { useState, useEffect } from "react";
import {
  Kanban,
  Briefcase,
  Target,
  Users,
  GraduationCap,
  HelpCircle,
  MessageSquare,
  Plus,
  Crown,
  Clock,
  CheckCircle2,
  CircleDashed,
  Send,
  UserCheck,
  ArrowRight,
  X,
  ShieldCheck,
  Filter,
  Calendar,
  AlertTriangle
} from "lucide-react";

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

interface TaskComment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
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
  comments?: TaskComment[];
}

interface ProjectNote {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string };
}

interface Project {
  id: string;
  title: string;
  description?: string;
  status: string;
  progress: number;
  isTopFocus: boolean;
  targetDate?: string;
  department?: { id: string; name: string; code: string } | null;
  createdBy: { id: string; name: string };
  tasks?: Task[];
  notes?: ProjectNote[];
}

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency?: string;
  notes?: string;
}

interface Hurdle {
  id: string;
  title: string;
  question: string;
  answer?: string;
  status: "OPEN" | "RESOLVED";
  askedBy: { name: string };
  answeredBy?: { name: string };
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  departmentId?: string | null;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string; email: string; role?: string };
}

interface DashboardClientProps {
  user: User;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"kanban" | "projects" | "milestones" | "team" | "skills" | "hurdles" | "chat">("kanban");
  const [departmentIdFilter, setDepartmentIdFilter] = useState<string>("ALL");

  // Data states
  const [departments, setDepartments] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [hurdles, setHurdles] = useState<Hurdle[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newMessageContent, setNewMessageContent] = useState("");

  // Modals & Drawers
  const [selectedTaskTicket, setSelectedTaskTicket] = useState<Task | null>(null);
  const [newCommentInput, setNewCommentInput] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [showCreatePriorityModal, setShowCreatePriorityModal] = useState(false);
  const [prioritySlotIndex, setPrioritySlotIndex] = useState<number | null>(null);
  const [newPriorityTitle, setNewPriorityTitle] = useState("");
  const [newPriorityDesc, setNewPriorityDesc] = useState("");
  const [newPriorityDept, setNewPriorityDept] = useState("");

  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState("");
  const [newTaskProjectId, setNewTaskProjectId] = useState("");

  // Initial fetch
  const fetchData = async () => {
    try {
      const [deptRes, projRes, taskRes, msRes, teamRes, skillRes, hurdleRes, chanRes] = await Promise.all([
        fetch("/api/departments"),
        fetch("/api/projects"),
        fetch(`/api/tasks${departmentIdFilter !== "ALL" ? `?departmentId=${departmentIdFilter}` : ""}`),
        fetch("/api/milestones"),
        fetch("/api/employees"),
        fetch("/api/skills"),
        fetch("/api/hurdles"),
        fetch("/api/chat/channels"),
      ]);

      if (deptRes.ok) {
        const d = await deptRes.json();
        setDepartments(d.departments || []);
      }
      if (projRes.ok) {
        const p = await projRes.json();
        setProjects(p.projects || []);
      }
      if (taskRes.ok) {
        const t = await taskRes.json();
        setTasks(t.tasks || []);
      }
      if (msRes.ok) {
        const m = await msRes.json();
        setMilestones(m.milestones || []);
      }
      if (teamRes.ok) {
        const tm = await teamRes.json();
        setTeamMembers(tm.employees || []);
      }
      if (skillRes.ok) {
        const sk = await skillRes.json();
        setSkills(sk.skills || []);
      }
      if (hurdleRes.ok) {
        const h = await hurdleRes.json();
        setHurdles(h.hurdles || []);
      }
      if (chanRes.ok) {
        const ch = await chanRes.json();
        const chanList = ch.channels || [];
        setChannels(chanList);
        if (chanList.length > 0 && !activeChannelId) {
          setActiveChannelId(chanList[0].id);
        }
      }
    } catch (err) {
      console.error("Fetch data error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [departmentIdFilter]);

  // Fetch chat messages when active channel changes
  useEffect(() => {
    if (!activeChannelId) return;
    const fetchChat = async () => {
      try {
        const res = await fetch(`/api/chat/messages?channelId=${activeChannelId}`);
        if (res.ok) {
          const data = await res.json();
          setChatMessages(data.messages || []);
        }
      } catch (err) {
        console.error("Fetch chat error:", err);
      }
    };
    fetchChat();
  }, [activeChannelId]);

  // Priority sorting for HODs
  const getSortedDepartments = () => {
    if (user.role === "HOD" && user.departmentId) {
      return [...departments].sort((a, b) => {
        if (a.id === user.departmentId) return -1;
        if (b.id === user.departmentId) return 1;
        return 0;
      });
    }
    return departments;
  };

  // Filter tasks for Employee role scoping
  const filteredTasks = tasks.filter((t) => {
    if (user.role === "EMPLOYEE") {
      return t.assignedTo?.id === user.id || t.department?.name === user.department?.name;
    }
    return true;
  });

  // Kanban Columns
  const todoTasks = filteredTasks.filter((t) => t.status === "TODO");
  const inProgressTasks = filteredTasks.filter((t) => t.status === "IN_PROGRESS");
  const inReviewTasks = filteredTasks.filter((t) => t.status === "IN_REVIEW");
  const completedTasks = filteredTasks.filter((t) => t.status === "COMPLETED");

  // CEO Top 3 Priorities
  const topFocusProjects = projects.filter((p) => p.isTopFocus);

  // Status Change Handler
  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task["status"]) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
        if (selectedTaskTicket && selectedTaskTicket.id === taskId) {
          setSelectedTaskTicket(data.task);
        }
      }
    } catch (err) {
      console.error("Update task status error:", err);
    }
  };

  // Submit Comment Handler
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskTicket || !newCommentInput.trim()) return;
    setIsSubmittingComment(true);

    try {
      const res = await fetch(`/api/tasks/${selectedTaskTicket.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newCommentInput }),
      });

      if (res.ok) {
        const data = await res.json();
        const newComments = [...(selectedTaskTicket.comments || []), data.comment];
        const updatedTicket = { ...selectedTaskTicket, comments: newComments };

        setSelectedTaskTicket(updatedTicket);
        setTasks((prev) => prev.map((t) => (t.id === selectedTaskTicket.id ? updatedTicket : t)));
        setNewCommentInput("");
      }
    } catch (err) {
      console.error("Add comment error:", err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Create Task Handler
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDesc,
          priority: newTaskPriority,
          dueDate: newTaskDueDate || null,
          assignedToId: newTaskAssigneeId || null,
          projectId: newTaskProjectId || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTasks((prev) => [data.task, ...prev]);
        setShowCreateTaskModal(false);
        setNewTaskTitle("");
        setNewTaskDesc("");
        setNewTaskDueDate("");
      }
    } catch (err) {
      console.error("Create task error:", err);
    }
  };

  // Create Priority Card Handler (CEO)
  const handleCreatePriorityCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPriorityTitle.trim()) return;

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newPriorityTitle,
          description: newPriorityDesc,
          isTopFocus: true,
          departmentId: newPriorityDept || user.departmentId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setProjects((prev) => [data.project, ...prev]);
        setShowCreatePriorityModal(false);
        setNewPriorityTitle("");
        setNewPriorityDesc("");
      }
    } catch (err) {
      console.error("Create priority project error:", err);
    }
  };

  // Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeChannelId || !newMessageContent.trim()) return;

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newMessageContent,
          channelId: activeChannelId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, data.message]);
        setNewMessageContent("");
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  return (
    <div className="space-y-8">
      {/* 👑 CEO TOP 3 STRATEGIC PRIORITIES TRAY */}
      <section className="bg-black border border-neutral-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-black">
              <Crown className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                CEO Top 3 Strategic Priorities
                <span className="text-xs bg-neutral-900 text-neutral-300 font-bold px-2.5 py-0.5 rounded-full border border-neutral-800">
                  Company-Wide
                </span>
              </h2>
              <p className="text-xs text-neutral-400 font-medium">
                Executive focus areas directed by Ryan Bantu (CEO) across all departments.
              </p>
            </div>
          </div>

          {user.role === "CEO" && (
            <button
              onClick={() => {
                setPrioritySlotIndex(topFocusProjects.length);
                setShowCreatePriorityModal(true);
              }}
              className="px-4 py-2 bg-white hover:bg-neutral-200 text-black font-black text-xs rounded-xl transition flex items-center gap-2"
            >
              + Create CEO Priority Card
            </button>
          )}
        </div>

        {/* 3 Grid Slots */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((slotIdx) => {
            const proj = topFocusProjects[slotIdx];
            return (
              <div
                key={slotIdx}
                className={`p-5 rounded-2xl border transition relative flex flex-col justify-between min-h-[160px] ${
                  proj
                    ? "bg-[#121212] border-neutral-800 hover:border-neutral-500 shadow-xl"
                    : "bg-neutral-900/40 border-dashed border-neutral-800 flex items-center justify-center text-center cursor-pointer hover:border-neutral-700"
                }`}
                onClick={() => {
                  if (!proj && user.role === "CEO") {
                    setPrioritySlotIndex(slotIdx);
                    setShowCreatePriorityModal(true);
                  }
                }}
              >
                {proj ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-neutral-300 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                          Priority #{slotIdx + 1}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {proj.progress}% Done
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base text-white leading-snug">{proj.title}</h3>
                      <p className="text-xs text-neutral-400 line-clamp-2">{proj.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                      <span className="font-bold text-neutral-300">
                        {proj.department?.name || "Cross-Departmental"}
                      </span>
                      <span className="text-neutral-400 font-semibold">
                        Owner: {proj.createdBy?.name || "Ryan Bantu"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5 p-4 text-center">
                    <Crown className="w-5 h-5 text-neutral-600 mx-auto" />
                    <div className="text-xs font-bold text-neutral-400">Priority Slot #{slotIdx + 1}</div>
                    <div className="text-[11px] text-neutral-500">
                      {user.role === "CEO" ? "Click to set strategic priority" : "Slot reserved by CEO"}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 📌 NAVIGATION TABS & FILTERS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => setActiveTab("kanban")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-2 ${
              activeTab === "kanban"
                ? "bg-white text-black shadow-md"
                : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            <Kanban className="w-4 h-4" />
            Kanban Tickets ({filteredTasks.length})
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-2 ${
              activeTab === "projects"
                ? "bg-white text-black shadow-md"
                : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Projects ({projects.length})
          </button>

          <button
            onClick={() => setActiveTab("milestones")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-2 ${
              activeTab === "milestones"
                ? "bg-white text-black shadow-md"
                : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            <Target className="w-4 h-4" />
            Milestones ({milestones.length})
          </button>

          <button
            onClick={() => setActiveTab("team")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-2 ${
              activeTab === "team"
                ? "bg-white text-black shadow-md"
                : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            <Users className="w-4 h-4" />
            Directory ({teamMembers.length})
          </button>

          <button
            onClick={() => setActiveTab("skills")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-2 ${
              activeTab === "skills"
                ? "bg-white text-black shadow-md"
                : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Skills ({skills.length})
          </button>

          <button
            onClick={() => setActiveTab("hurdles")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-2 ${
              activeTab === "hurdles"
                ? "bg-white text-black shadow-md"
                : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Hurdles ({hurdles.length})
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-2 ${
              activeTab === "chat"
                ? "bg-white text-black shadow-md"
                : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Team Chat
          </button>
        </div>

        {/* HOD / CEO Department Filter dropdown */}
        <div className="flex items-center gap-2">
          {user.role !== "EMPLOYEE" && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-neutral-400" />
              <select
                value={departmentIdFilter}
                onChange={(e) => setDepartmentIdFilter(e.target.value)}
                className="bg-neutral-900 text-xs font-extrabold text-white border border-neutral-800 rounded-xl px-3 py-2 focus:outline-none focus:border-white"
              >
                <option value="ALL">All Departments</option>
                {getSortedDepartments().map((d) => (
                  <option key={d.id} value={d.id}>
                    {user.departmentId === d.id ? `⭐ ${d.name} (Your Dept)` : d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={() => setShowCreateTaskModal(true)}
            className="px-4 py-2 bg-white hover:bg-neutral-200 text-black font-black text-xs rounded-xl transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 text-black" />
            Assign Ticket
          </button>
        </div>
      </div>

      {/* 🎯 TAB 1: KANBAN BOARD WITH INTERACTIVE TICKET CARDS */}
      {activeTab === "kanban" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <Kanban className="w-5 h-5 text-white" />
                Department Task Ticket Board
              </h3>
              <p className="text-xs text-neutral-400">
                Click any ticket to view details, update status (Picked Up, In Review, Completed), or discuss comments with managers.
              </p>
            </div>
          </div>

          {/* 4 Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            {/* COLUMN 1: TODO */}
            <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-black text-white">
                  <CircleDashed className="w-4 h-4 text-neutral-400" />
                  TO DO / BACKLOG
                </div>
                <span className="text-xs font-extrabold bg-neutral-900 text-neutral-300 px-2 py-0.5 rounded-full border border-neutral-800">
                  {todoTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {todoTasks.length === 0 ? (
                  <div className="text-neutral-500 text-xs text-center py-6 border border-dashed border-neutral-800 rounded-xl">
                    No tickets in To Do
                  </div>
                ) : (
                  todoTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskTicket(task)}
                      className="bg-black hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-500 p-4 rounded-xl space-y-3 cursor-pointer transition shadow-lg group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-neutral-300 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                          {task.department.name}
                        </span>
                        <span className="text-[10px] font-extrabold bg-neutral-900 text-neutral-300 px-2 py-0.5 rounded border border-neutral-800">
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-white group-hover:text-neutral-300 transition leading-snug">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-neutral-400 line-clamp-2">{task.description}</p>
                      )}

                      <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                        <div className="flex items-center gap-1 font-medium text-neutral-300">
                          <UserCheck className="w-3.5 h-3.5 text-white" />
                          {task.assignedTo?.name || "Unassigned"}
                        </div>
                        <div className="flex items-center gap-1 text-neutral-400">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {task.comments?.length || 0}
                        </div>
                      </div>

                      {/* Quick Move Action */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateTaskStatus(task.id, "IN_PROGRESS");
                        }}
                        className="w-full py-1.5 bg-white hover:bg-neutral-200 text-black font-extrabold text-[11px] rounded-lg transition flex items-center justify-center gap-1"
                      >
                        Pick Up Ticket (In Progress)
                        <ArrowRight className="w-3 h-3 text-black" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 2: IN_PROGRESS */}
            <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-black text-white">
                  <Clock className="w-4 h-4 text-white" />
                  IN PROGRESS (PICKED UP)
                </div>
                <span className="text-xs font-extrabold bg-neutral-900 text-neutral-300 px-2 py-0.5 rounded-full border border-neutral-800">
                  {inProgressTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {inProgressTasks.length === 0 ? (
                  <div className="text-neutral-500 text-xs text-center py-6 border border-dashed border-neutral-800 rounded-xl">
                    No active tickets in progress
                  </div>
                ) : (
                  inProgressTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskTicket(task)}
                      className="bg-black hover:bg-neutral-900 border border-neutral-700 hover:border-neutral-500 p-4 rounded-xl space-y-3 cursor-pointer transition shadow-lg group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-neutral-300 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                          {task.department.name}
                        </span>
                        <span className="text-[10px] font-extrabold bg-neutral-800 text-white px-2 py-0.5 rounded">
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-white group-hover:text-neutral-300 transition leading-snug">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-neutral-400 line-clamp-2">{task.description}</p>
                      )}

                      <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                        <div className="flex items-center gap-1 font-medium text-neutral-300">
                          <UserCheck className="w-3.5 h-3.5 text-white" />
                          {task.assignedTo?.name || "Unassigned"}
                        </div>
                        <div className="flex items-center gap-1 text-neutral-400">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {task.comments?.length || 0}
                        </div>
                      </div>

                      {/* Quick Shift Controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateTaskStatus(task.id, "IN_REVIEW");
                          }}
                          className="flex-1 py-1.5 bg-white hover:bg-neutral-200 text-black font-extrabold text-[11px] rounded-lg transition flex items-center justify-center gap-1"
                        >
                          Submit Review
                          <ArrowRight className="w-3 h-3 text-black" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateTaskStatus(task.id, "COMPLETED");
                          }}
                          className="py-1.5 px-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-[11px] rounded-lg transition border border-neutral-700"
                          title="Mark Complete"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 3: IN_REVIEW / BLOCKED */}
            <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-black text-white">
                  <AlertTriangle className="w-4 h-4 text-white" />
                  IN REVIEW / BLOCKED
                </div>
                <span className="text-xs font-extrabold bg-neutral-900 text-neutral-300 px-2 py-0.5 rounded-full border border-neutral-800">
                  {inReviewTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {inReviewTasks.length === 0 ? (
                  <div className="text-neutral-500 text-xs text-center py-6 border border-dashed border-neutral-800 rounded-xl">
                    No tickets in review
                  </div>
                ) : (
                  inReviewTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskTicket(task)}
                      className="bg-black hover:bg-neutral-900 border border-neutral-700 hover:border-neutral-500 p-4 rounded-xl space-y-3 cursor-pointer transition shadow-lg group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-neutral-300 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                          {task.department.name}
                        </span>
                        <span className="text-[10px] font-extrabold bg-neutral-800 text-white px-2 py-0.5 rounded">
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-white group-hover:text-neutral-300 transition leading-snug">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-neutral-400 line-clamp-2">{task.description}</p>
                      )}

                      <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                        <div className="flex items-center gap-1 font-medium text-neutral-300">
                          <UserCheck className="w-3.5 h-3.5 text-white" />
                          {task.assignedTo?.name || "Unassigned"}
                        </div>
                        <div className="flex items-center gap-1 text-neutral-400">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {task.comments?.length || 0}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateTaskStatus(task.id, "COMPLETED");
                        }}
                        className="w-full py-1.5 bg-white hover:bg-neutral-200 text-black font-extrabold text-[11px] rounded-lg transition flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                        Approve & Mark Completed
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 4: COMPLETED */}
            <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-black text-white">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  COMPLETED / DONE
                </div>
                <span className="text-xs font-extrabold bg-neutral-900 text-neutral-300 px-2 py-0.5 rounded-full border border-neutral-800">
                  {completedTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {completedTasks.length === 0 ? (
                  <div className="text-neutral-500 text-xs text-center py-6 border border-dashed border-neutral-800 rounded-xl">
                    No completed tickets yet
                  </div>
                ) : (
                  completedTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskTicket(task)}
                      className="bg-black opacity-80 hover:opacity-100 border border-neutral-800 hover:border-neutral-600 p-4 rounded-xl space-y-3 cursor-pointer transition shadow-lg group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-neutral-400 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                          {task.department.name}
                        </span>
                        <span className="text-[10px] font-extrabold bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded">
                          DONE
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-neutral-300 line-through group-hover:text-white transition leading-snug">
                        {task.title}
                      </h4>

                      <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                        <div className="flex items-center gap-1 font-medium text-neutral-300">
                          <UserCheck className="w-3.5 h-3.5 text-white" />
                          {task.assignedTo?.name || "Unassigned"}
                        </div>
                        <div className="flex items-center gap-1 text-neutral-400">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {task.comments?.length || 0}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 💼 TAB 2: PROJECTS VIEW */}
      {activeTab === "projects" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-white" />
              Company Projects & Telemetry
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div key={proj.id} className="goperch-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white bg-neutral-900 px-2.5 py-1 rounded-md border border-neutral-800">
                    {proj.department?.name || "Global"}
                  </span>
                  <span className="text-xs font-bold text-neutral-400">{proj.status}</span>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-white">{proj.title}</h4>
                  <p className="text-xs text-neutral-400 mt-1">{proj.description}</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
                    <span>Execution Progress</span>
                    <span className="text-white">{proj.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-900 overflow-hidden border border-neutral-800">
                    <div
                      className="h-full bg-white transition-all duration-500"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                {proj.notes && proj.notes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-neutral-800 space-y-2 text-xs">
                    <div className="font-extrabold text-neutral-300">Recent Update Note:</div>
                    <p className="text-neutral-400 italic bg-black p-2.5 rounded-xl border border-neutral-800">
                      "{proj.notes[proj.notes.length - 1].content}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎯 TAB 3: MILESTONES VIEW */}
      {activeTab === "milestones" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Target className="w-5 h-5 text-white" />
              Strategic Department Milestones
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {milestones.map((ms) => (
              <div key={ms.id} className="goperch-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white bg-neutral-900 px-2.5 py-1 rounded-md border border-neutral-800">
                    {ms.department.name}
                  </span>
                  <span className="text-xs font-bold text-neutral-400">{ms.status}</span>
                </div>

                <h4 className="text-base font-extrabold text-white">{ms.title}</h4>
                <p className="text-xs text-neutral-400">{ms.description}</p>

                <div className="pt-2 text-xs font-medium text-neutral-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-white" />
                  Target: {new Date(ms.targetDate).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 👥 TAB 4: TEAM DIRECTORY */}
      {activeTab === "team" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-white" />
              Company Team Directory
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {teamMembers.map((m) => (
              <div key={m.id} className="goperch-card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center font-black text-white text-lg">
                  {m.name.charAt(0)}
                </div>

                <div className="space-y-1">
                  <div className="font-extrabold text-sm text-white flex items-center gap-2">
                    {m.name}
                    {m.role === "CEO" && (
                      <span className="text-[10px] font-black bg-white text-black px-1.5 py-0.5 rounded">
                        CEO
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-neutral-400 font-medium">{m.title || m.role}</div>
                  <div className="text-[11px] text-neutral-400 font-mono">{m.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎓 TAB 5: SKILLS MATRIX */}
      {activeTab === "skills" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-white" />
              Employee Skills & Development Matrix
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((sk) => (
              <div key={sk.id} className="goperch-card p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-neutral-300 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                    {sk.category}
                  </span>
                  <span className="text-xs font-bold text-white">{sk.proficiency || "ACTIVE"}</span>
                </div>
                <h4 className="text-base font-extrabold text-white">{sk.name}</h4>
                {sk.notes && <p className="text-xs text-neutral-400">{sk.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ❓ TAB 6: HURDLES Q&A */}
      {activeTab === "hurdles" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-white" />
              Team Hurdles & Technical Blockers
            </h3>
          </div>

          <div className="space-y-3">
            {hurdles.map((h) => (
              <div key={h.id} className="goperch-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                      h.status === "RESOLVED"
                        ? "bg-white text-black font-black"
                        : "bg-neutral-900 text-neutral-300 border border-neutral-800"
                    }`}
                  >
                    {h.status}
                  </span>
                  <span className="text-xs text-neutral-400 font-medium">Asked by {h.askedBy.name}</span>
                </div>

                <h4 className="text-base font-extrabold text-white">{h.title}</h4>
                <p className="text-xs text-neutral-300 bg-black p-3 rounded-xl border border-neutral-800">
                  Q: {h.question}
                </p>

                {h.answer && (
                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200">
                    <span className="font-extrabold text-white">Resolution: </span>
                    {h.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 💬 TAB 7: TEAM CHAT */}
      {activeTab === "chat" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[550px]">
          {/* Channel Sidebar */}
          <div className="bg-[#121212] border border-neutral-800 rounded-2xl p-4 space-y-3 overflow-y-auto">
            <div className="text-xs font-black text-neutral-400 uppercase tracking-wider">Chat Channels</div>
            <div className="space-y-1 text-xs font-extrabold">
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannelId(ch.id)}
                  className={`w-full text-left p-2.5 rounded-xl transition flex items-center gap-2 ${
                    activeChannelId === ch.id
                      ? "bg-white text-black font-extrabold"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  #{ch.name}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Panel */}
          <div className="md:col-span-3 bg-[#121212] border border-neutral-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="overflow-y-auto space-y-3 pr-2 flex-1">
              {chatMessages.length === 0 ? (
                <div className="text-neutral-500 text-center py-20 text-xs">No messages yet in this channel</div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="bg-black p-3 rounded-xl border border-neutral-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-white">{msg.sender.name}</span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-300">{msg.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendMessage} className="mt-3 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessageContent}
                onChange={(e) => setNewMessageContent(e.target.value)}
                className="flex-1 bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
              />
              <button
                type="submit"
                className="p-2.5 bg-white text-black rounded-xl transition hover:bg-neutral-200"
              >
                <Send className="w-4 h-4 text-black" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🔍 TICKET DETAIL DRAWER / MODAL WITH COMMENTS */}
      {selectedTaskTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-neutral-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-black text-white bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                    {selectedTaskTicket.department.name}
                  </span>
                  <span className="font-extrabold bg-neutral-800 text-neutral-200 px-2 py-0.5 rounded">
                    {selectedTaskTicket.priority} PRIORITY
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">{selectedTaskTicket.title}</h3>
              </div>

              <button
                onClick={() => setSelectedTaskTicket(null)}
                className="p-1 text-neutral-400 hover:text-white bg-neutral-900 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-black p-4 rounded-2xl border border-neutral-800">
              <div>
                <span className="text-neutral-500 font-bold block">ASSIGNED EMPLOYEE</span>
                <span className="text-white font-extrabold flex items-center gap-1 mt-0.5">
                  <UserCheck className="w-3.5 h-3.5 text-white" />
                  {selectedTaskTicket.assignedTo?.name || "Unassigned"}
                </span>
              </div>

              <div>
                <span className="text-neutral-500 font-bold block">TASK CREATOR / MANAGER</span>
                <span className="text-white font-extrabold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  {selectedTaskTicket.createdBy.name}
                </span>
              </div>

              <div>
                <span className="text-neutral-500 font-bold block">DUE DATE</span>
                <span className="text-white font-extrabold flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-white" />
                  {selectedTaskTicket.dueDate
                    ? new Date(selectedTaskTicket.dueDate).toLocaleDateString()
                    : "No Deadline"}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="text-xs font-black text-neutral-400 uppercase tracking-wider">Ticket Description</div>
              <p className="text-xs text-neutral-200 bg-black p-4 rounded-2xl border border-neutral-800 leading-relaxed">
                {selectedTaskTicket.description || "No additional description provided for this task ticket."}
              </p>
            </div>

            {/* Status Movement Quick Selector */}
            <div className="space-y-2">
              <div className="text-xs font-black text-neutral-400 uppercase tracking-wider">
                Shift Ticket Status (Notifies Manager)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {(["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateTaskStatus(selectedTaskTicket.id, st)}
                    className={`p-2.5 font-extrabold rounded-xl transition border text-center ${
                      selectedTaskTicket.status === st
                        ? "bg-white text-black border-white shadow-md font-black"
                        : "bg-neutral-900 text-neutral-400 hover:text-white border-neutral-800"
                    }`}
                  >
                    {st === "TODO"
                      ? "📋 To Do"
                      : st === "IN_PROGRESS"
                      ? "⚡ In Progress"
                      : st === "IN_REVIEW"
                      ? "⚠️ In Review"
                      : "✅ Completed"}
                  </button>
                ))}
              </div>
            </div>

            {/* Ticket Discussion / Comments Section */}
            <div className="space-y-3 border-t border-neutral-800 pt-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-white" />
                  Ticket Comments & Activity Log ({selectedTaskTicket.comments?.length || 0})
                </div>
              </div>

              {/* Comments Thread */}
              <div className="max-h-48 overflow-y-auto space-y-2 text-xs pr-1">
                {(!selectedTaskTicket.comments || selectedTaskTicket.comments.length === 0) ? (
                  <div className="text-neutral-500 italic text-center py-4">No comments on this ticket yet.</div>
                ) : (
                  selectedTaskTicket.comments.map((c) => (
                    <div key={c.id} className="bg-black p-3 rounded-xl border border-neutral-800 space-y-1">
                      <div className="flex items-center justify-between text-neutral-400">
                        <span className="font-extrabold text-white">{c.author.name}</span>
                        <span className="text-[10px] font-mono">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-neutral-200">{c.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Input */}
              <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Write a comment / update for manager..."
                  value={newCommentInput}
                  onChange={(e) => setNewCommentInput(e.target.value)}
                  className="flex-1 bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newCommentInput.trim()}
                  className="px-4 py-2.5 bg-white text-black hover:bg-neutral-200 font-extrabold text-xs rounded-xl transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-black" />
                  Post Comment
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ➕ CREATE TICKET MODAL */}
      {showCreateTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTask}
            className="bg-[#121212] border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-white" />
                Assign New Task Ticket
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateTaskModal(false)}
                className="p-1 text-neutral-400 hover:text-white bg-neutral-900 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-300 mb-1">Ticket Title</label>
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Optimize Database Query Telemetry"
                className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Detailed instructions for the assigned employee..."
                className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-extrabold text-neutral-300 mb-1">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-neutral-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-300 mb-1">Assign to Employee</label>
              <select
                value={newTaskAssigneeId}
                onChange={(e) => setNewTaskAssigneeId(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
              >
                <option value="">Unassigned (Open for Pick Up)</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.department?.name || m.role})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-white hover:bg-neutral-200 text-black font-extrabold text-xs rounded-xl transition"
            >
              Assign Ticket to Kanban Board
            </button>
          </form>
        </div>
      )}

      {/* 👑 CEO CREATE PRIORITY MODAL */}
      {showCreatePriorityModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreatePriorityCard}
            className="bg-[#121212] border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-white" />
                Set CEO Strategic Priority Card
              </h3>
              <button
                type="button"
                onClick={() => setShowCreatePriorityModal(false)}
                className="p-1 text-neutral-400 hover:text-white bg-neutral-900 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-300 mb-1">Priority Title</label>
              <input
                type="text"
                required
                value={newPriorityTitle}
                onChange={(e) => setNewPriorityTitle(e.target.value)}
                placeholder="e.g. Next-Gen Telemetry Hardware Scale"
                className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={newPriorityDesc}
                onChange={(e) => setNewPriorityDesc(e.target.value)}
                placeholder="Executive directive for the leadership team..."
                className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-neutral-300 mb-1">Target Department</label>
              <select
                value={newPriorityDept}
                onChange={(e) => setNewPriorityDept(e.target.value)}
                className="w-full bg-black border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
              >
                <option value="">Cross-Departmental</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-white hover:bg-neutral-200 text-black font-extrabold text-xs rounded-xl transition"
            >
              Publish CEO Priority Card
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
