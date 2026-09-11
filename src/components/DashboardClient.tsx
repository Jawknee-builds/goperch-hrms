"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Kanban,
  Briefcase,
  CheckSquare,
  Target,
  Users,
  GraduationCap,
  HelpCircle,
  MessageSquare,
  Plus,
  Crown,
  Sparkles,
  Lock,
  Clock,
  CheckCircle2,
  CircleDashed,
  AlertCircle,
  Send,
  Star,
  Building2,
  UserCheck,
  Search,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  X,
  ChevronDown,
  ChevronRight,
  Flame,
  ShieldCheck,
  Filter,
  Calendar,
  Layers,
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
      <section className="bg-gradient-to-r from-slate-900 via-[#0f172a] to-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                CEO Top 3 Strategic Priorities
                <span className="text-xs bg-purple-500/20 text-purple-300 font-bold px-2.5 py-0.5 rounded-full border border-purple-500/30">
                  Visible Company-Wide
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Executive focus areas directed by Ryan Bantu (CEO) across all engineering and revenue departments.
              </p>
            </div>
          </div>

          {user.role === "CEO" && (
            <button
              onClick={() => {
                setPrioritySlotIndex(topFocusProjects.length);
                setShowCreatePriorityModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-purple-500/20 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
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
                    ? "bg-[#0f172a]/90 border-purple-500/40 hover:border-purple-400 shadow-xl"
                    : "bg-slate-900/40 border-dashed border-slate-800 flex items-center justify-center text-center cursor-pointer hover:border-slate-700"
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
                        <span className="text-[10px] font-black uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                          Priority #{slotIdx + 1}
                        </span>
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-emerald-400" />
                          {proj.progress}% Done
                        </span>
                      </div>

                      <h3 className="font-extrabold text-base text-white leading-snug">{proj.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2">{proj.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold text-slate-300">
                        {proj.department?.name || "Cross-Departmental"}
                      </span>
                      <span className="text-purple-300 font-semibold">
                        Owner: {proj.createdBy?.name || "Ryan Bantu"}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5 p-4 text-center">
                    <Crown className="w-6 h-6 text-slate-600 mx-auto" />
                    <div className="text-xs font-bold text-slate-400">Priority Slot #{slotIdx + 1}</div>
                    <div className="text-[11px] text-slate-500">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => setActiveTab("kanban")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-2 ${
              activeTab === "kanban"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Kanban className="w-4 h-4" />
            Kanban Tickets ({filteredTasks.length})
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-2 ${
              activeTab === "projects"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Projects ({projects.length})
          </button>

          <button
            onClick={() => setActiveTab("milestones")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-2 ${
              activeTab === "milestones"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Target className="w-4 h-4" />
            Milestones ({milestones.length})
          </button>

          <button
            onClick={() => setActiveTab("team")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-2 ${
              activeTab === "team"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Users className="w-4 h-4" />
            Directory ({teamMembers.length})
          </button>

          <button
            onClick={() => setActiveTab("skills")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-2 ${
              activeTab === "skills"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            Skills ({skills.length})
          </button>

          <button
            onClick={() => setActiveTab("hurdles")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-2 ${
              activeTab === "hurdles"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Hurdles ({hurdles.length})
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`px-4 py-2 text-xs font-black rounded-xl transition flex items-center gap-2 ${
              activeTab === "chat"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
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
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={departmentIdFilter}
                onChange={(e) => setDepartmentIdFilter(e.target.value)}
                className="bg-slate-900 text-xs font-extrabold text-white border border-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
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
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
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
                <Kanban className="w-5 h-5 text-blue-400" />
                Department Task Ticket Board
              </h3>
              <p className="text-xs text-slate-400">
                Click any ticket to view details, update status (Picked Up, In Review, Completed), or discuss comments with managers.
              </p>
            </div>
          </div>

          {/* 4 Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
            {/* COLUMN 1: TODO */}
            <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-black text-slate-300">
                  <CircleDashed className="w-4 h-4 text-slate-400" />
                  TO DO / BACKLOG
                </div>
                <span className="text-xs font-extrabold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                  {todoTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {todoTasks.length === 0 ? (
                  <div className="text-slate-500 text-xs text-center py-6 border border-dashed border-slate-800 rounded-xl">
                    No tickets in To Do
                  </div>
                ) : (
                  todoTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskTicket(task)}
                      className="bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-blue-500/50 p-4 rounded-xl space-y-3 cursor-pointer transition shadow-lg group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          {task.department.name}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                            task.priority === "URGENT"
                              ? "bg-red-500/20 text-red-300 border border-red-500/30"
                              : task.priority === "HIGH"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-white group-hover:text-blue-400 transition leading-snug">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                      )}

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1 font-medium text-slate-300">
                          <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                          {task.assignedTo?.name || "Unassigned"}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
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
                        className="w-full py-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white font-extrabold text-[11px] rounded-lg transition border border-blue-500/30 flex items-center justify-center gap-1"
                      >
                        ⚡ Pick Up Ticket (In Progress)
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 2: IN_PROGRESS */}
            <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-black text-blue-400">
                  <Flame className="w-4 h-4 text-blue-400" />
                  IN PROGRESS (PICKED UP)
                </div>
                <span className="text-xs font-extrabold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                  {inProgressTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {inProgressTasks.length === 0 ? (
                  <div className="text-slate-500 text-xs text-center py-6 border border-dashed border-slate-800 rounded-xl">
                    No active tickets in progress
                  </div>
                ) : (
                  inProgressTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskTicket(task)}
                      className="bg-slate-900/90 hover:bg-slate-900 border border-blue-500/30 hover:border-blue-400 p-4 rounded-xl space-y-3 cursor-pointer transition shadow-lg group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {task.department.name}
                        </span>
                        <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-white group-hover:text-blue-400 transition leading-snug">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                      )}

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1 font-medium text-slate-300">
                          <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                          {task.assignedTo?.name || "Unassigned"}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
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
                          className="flex-1 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white font-extrabold text-[11px] rounded-lg transition border border-amber-500/30 flex items-center justify-center gap-1"
                        >
                          Submit Review
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUpdateTaskStatus(task.id, "COMPLETED");
                          }}
                          className="py-1.5 px-2 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white font-extrabold text-[11px] rounded-lg transition border border-emerald-500/30"
                          title="Mark Complete"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 3: IN_REVIEW / BLOCKED */}
            <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-black text-amber-400">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  IN REVIEW / BLOCKED
                </div>
                <span className="text-xs font-extrabold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  {inReviewTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {inReviewTasks.length === 0 ? (
                  <div className="text-slate-500 text-xs text-center py-6 border border-dashed border-slate-800 rounded-xl">
                    No tickets in review
                  </div>
                ) : (
                  inReviewTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskTicket(task)}
                      className="bg-slate-900/90 hover:bg-slate-900 border border-amber-500/30 hover:border-amber-400 p-4 rounded-xl space-y-3 cursor-pointer transition shadow-lg group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {task.department.name}
                        </span>
                        <span className="text-[10px] font-extrabold bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30">
                          {task.priority}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-white group-hover:text-amber-400 transition leading-snug">
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                      )}

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1 font-medium text-slate-300">
                          <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                          {task.assignedTo?.name || "Unassigned"}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {task.comments?.length || 0}
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateTaskStatus(task.id, "COMPLETED");
                        }}
                        className="w-full py-1.5 bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-white font-extrabold text-[11px] rounded-lg transition border border-emerald-500/30 flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve & Mark Completed
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 4: COMPLETED */}
            <div className="bg-[#0f172a]/70 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  COMPLETED / DONE
                </div>
                <span className="text-xs font-extrabold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {completedTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {completedTasks.length === 0 ? (
                  <div className="text-slate-500 text-xs text-center py-6 border border-dashed border-slate-800 rounded-xl">
                    No completed tickets yet
                  </div>
                ) : (
                  completedTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTaskTicket(task)}
                      className="bg-slate-900/90 opacity-90 hover:opacity-100 border border-emerald-500/20 hover:border-emerald-400 p-4 rounded-xl space-y-3 cursor-pointer transition shadow-lg group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {task.department.name}
                        </span>
                        <span className="text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">
                          DONE
                        </span>
                      </div>

                      <h4 className="font-extrabold text-sm text-slate-200 line-through group-hover:text-emerald-400 transition leading-snug">
                        {task.title}
                      </h4>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1 font-medium text-slate-300">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                          {task.assignedTo?.name || "Unassigned"}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400">
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
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-400" />
              Company Projects & Telemetry
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => (
              <div key={proj.id} className="goperch-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                    {proj.department?.name || "Global"}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{proj.status}</span>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-white">{proj.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{proj.description}</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>Execution Progress</span>
                    <span className="text-blue-400">{proj.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>

                {proj.notes && proj.notes.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-2 text-xs">
                    <div className="font-extrabold text-slate-300">Recent Update Note:</div>
                    <p className="text-slate-400 italic bg-slate-900 p-2.5 rounded-xl border border-slate-800">
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
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Strategic Department Milestones
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {milestones.map((ms) => (
              <div key={ms.id} className="goperch-card p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                    {ms.department.name}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{ms.status}</span>
                </div>

                <h4 className="text-base font-extrabold text-white">{ms.title}</h4>
                <p className="text-xs text-slate-400">{ms.description}</p>

                <div className="pt-2 text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-400" />
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
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Company Team Directory
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {teamMembers.map((m) => (
              <div key={m.id} className="goperch-card p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-black text-blue-400 text-lg">
                  {m.name.charAt(0)}
                </div>

                <div className="space-y-1">
                  <div className="font-extrabold text-sm text-white flex items-center gap-2">
                    {m.name}
                    {m.role === "CEO" && (
                      <span className="text-[10px] font-black bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded border border-purple-500/30">
                        CEO
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">{m.title || m.role}</div>
                  <div className="text-[11px] text-blue-400 font-mono">{m.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🎓 TAB 5: SKILLS MATRIX */}
      {activeTab === "skills" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-400" />
              Employee Skills & Development Matrix
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skills.map((sk) => (
              <div key={sk.id} className="goperch-card p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    {sk.category}
                  </span>
                  <span className="text-xs font-bold text-blue-400">{sk.proficiency || "ACTIVE"}</span>
                </div>
                <h4 className="text-base font-extrabold text-white">{sk.name}</h4>
                {sk.notes && <p className="text-xs text-slate-400">{sk.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ❓ TAB 6: HURDLES Q&A */}
      {activeTab === "hurdles" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-400" />
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
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {h.status}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Asked by {h.askedBy.name}</span>
                </div>

                <h4 className="text-base font-extrabold text-white">{h.title}</h4>
                <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800">
                  Q: {h.question}
                </p>

                {h.answer && (
                  <div className="p-3 bg-blue-950/30 border border-blue-500/30 rounded-xl text-xs text-blue-200">
                    <span className="font-extrabold text-blue-400">Resolution: </span>
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
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 space-y-3 overflow-y-auto">
            <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Chat Channels</div>
            <div className="space-y-1 text-xs font-extrabold">
              {channels.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveChannelId(ch.id)}
                  className={`w-full text-left p-2.5 rounded-xl transition flex items-center gap-2 ${
                    activeChannelId === ch.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  #{ch.name}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Messages Panel */}
          <div className="md:col-span-3 bg-[#0f172a] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
            <div className="overflow-y-auto space-y-3 pr-2 flex-1">
              {chatMessages.length === 0 ? (
                <div className="text-slate-500 text-center py-20 text-xs">No messages yet in this channel</div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-blue-400">{msg.sender.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200">{msg.content}</p>
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
                className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition shadow-lg shadow-blue-500/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🔍 TICKET DETAIL DRAWER / MODAL WITH COMMENTS */}
      {selectedTaskTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-black text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    {selectedTaskTicket.department.name}
                  </span>
                  <span className="font-extrabold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    {selectedTaskTicket.priority} PRIORITY
                  </span>
                </div>
                <h3 className="text-xl font-black text-white">{selectedTaskTicket.title}</h3>
              </div>

              <button
                onClick={() => setSelectedTaskTicket(null)}
                className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Ticket Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div>
                <span className="text-slate-500 font-bold block">ASSIGNED EMPLOYEE</span>
                <span className="text-white font-extrabold flex items-center gap-1 mt-0.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                  {selectedTaskTicket.assignedTo?.name || "Unassigned"}
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-bold block">TASK CREATOR / MANAGER</span>
                <span className="text-white font-extrabold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  {selectedTaskTicket.createdBy.name}
                </span>
              </div>

              <div>
                <span className="text-slate-500 font-bold block">DUE DATE</span>
                <span className="text-white font-extrabold flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {selectedTaskTicket.dueDate
                    ? new Date(selectedTaskTicket.dueDate).toLocaleDateString()
                    : "No Deadline"}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Ticket Description</div>
              <p className="text-xs text-slate-200 bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 leading-relaxed">
                {selectedTaskTicket.description || "No additional description provided for this task ticket."}
              </p>
            </div>

            {/* Status Movement Quick Selector */}
            <div className="space-y-2">
              <div className="text-xs font-black text-slate-400 uppercase tracking-wider">
                Shift Ticket Status (Notifies Manager)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {(["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateTaskStatus(selectedTaskTicket.id, st)}
                    className={`p-2.5 font-extrabold rounded-xl transition border text-center ${
                      selectedTaskTicket.status === st
                        ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/20"
                        : "bg-slate-900 text-slate-400 hover:text-white border-slate-800"
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
            <div className="space-y-3 border-t border-slate-800 pt-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  Ticket Comments & Activity Log ({selectedTaskTicket.comments?.length || 0})
                </div>
              </div>

              {/* Comments Thread */}
              <div className="max-h-48 overflow-y-auto space-y-2 text-xs pr-1">
                {(!selectedTaskTicket.comments || selectedTaskTicket.comments.length === 0) ? (
                  <div className="text-slate-500 italic text-center py-4">No comments on this ticket yet.</div>
                ) : (
                  selectedTaskTicket.comments.map((c) => (
                    <div key={c.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between text-slate-400">
                        <span className="font-extrabold text-blue-400">{c.author.name}</span>
                        <span className="text-[10px] font-mono">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-200">{c.content}</p>
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
                  className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newCommentInput.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
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
            className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                Assign New Task Ticket
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateTaskModal(false)}
                className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1">Ticket Title</label>
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Optimize Database Query Telemetry"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Detailed instructions for the assigned employee..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-extrabold text-slate-300 mb-1">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white"
                >
                  <option value="LOW">LOW</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HIGH">HIGH</option>
                  <option value="URGENT">URGENT</option>
                </select>
              </div>

              <div>
                <label className="block font-extrabold text-slate-300 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1">Assign to Employee</label>
              <select
                value={newTaskAssigneeId}
                onChange={(e) => setNewTaskAssigneeId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white"
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
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-blue-500/20"
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
            className="bg-[#0f172a] border border-purple-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-purple-400" />
                Set CEO Strategic Priority Card
              </h3>
              <button
                type="button"
                onClick={() => setShowCreatePriorityModal(false)}
                className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1">Priority Title</label>
              <input
                type="text"
                required
                value={newPriorityTitle}
                onChange={(e) => setNewPriorityTitle(e.target.value)}
                placeholder="e.g. Next-Gen Telemetry Hardware Scale"
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1">Description</label>
              <textarea
                rows={3}
                value={newPriorityDesc}
                onChange={(e) => setNewPriorityDesc(e.target.value)}
                placeholder="Executive directive for the leadership team..."
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1">Target Department</label>
              <select
                value={newPriorityDept}
                onChange={(e) => setNewPriorityDept(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white"
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
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl transition shadow-lg shadow-purple-500/20"
            >
              Publish CEO Priority Card
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
