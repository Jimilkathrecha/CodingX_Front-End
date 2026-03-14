import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Zap,
  ArrowLeft,
  FileText,
  Code2,
  HelpCircle,
  Star,
  RefreshCw,
  LayoutGrid,
  Video,
  X,
} from "lucide-react";
import {
  internshipService,
  moduleService,
  taskService,
} from "../../services/index";
import toast from "react-hot-toast";

// ── Circular progress ring ────────────────────────────────────────────────────
function ProgressRing({ pct, size = 96, stroke = 7 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#1e1e2e"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#6366f1"
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={off}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
}

const TYPE_CONFIG = {
  coding: {
    icon: Code2,
    color: "text-violet-400",
    bg: "bg-violet-500/10  border-violet-500/20",
  },
  "file-submission": {
    icon: FileText,
    color: "text-brand-400",
    bg: "bg-brand-500/10   border-brand-500/20",
  },
  project: {
    icon: Star,
    color: "text-amber-400",
    bg: "bg-amber-500/10   border-amber-500/20",
  },
  mcq: {
    icon: HelpCircle,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  "video-submission": {
    icon: Video,
    color: "text-pink-400",
    bg: "bg-pink-500/10    border-pink-500/20",
  },
};

// ── Module accordion ──────────────────────────────────────────────────────────
function ModuleRow({ module, tasks, index }) {
  const [open, setOpen] = useState(index === 0);
  const navigate = useNavigate();

  const doneTasks = tasks.filter(
    (t) => t.mySubmission?.status === "approved",
  ).length;
  const pct =
    tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0;

  return (
    <div
      className={`card overflow-hidden ${pct === 100 ? "border-emerald-500/20" : ""}`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-4 p-4 hover:bg-surface-elevated/40 transition-colors text-left"
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm ${
            pct === 100
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-surface-elevated border border-surface-border text-gray-400"
          }`}
        >
          {pct === 100 ? <CheckCircle2 size={16} /> : index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-sm">{module.title}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <div className="flex-1 h-1.5 bg-surface-border rounded-full overflow-hidden max-w-[120px]">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-gray-500 text-xs">
              {doneTasks}/{tasks.length} done
            </span>
          </div>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown size={16} className="text-gray-500 flex-shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {open && tasks.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-surface-border"
          >
            {tasks.map((task, i) => {
              const conf = TYPE_CONFIG[task.type] || TYPE_CONFIG["coding"];
              const TIcon = conf.icon;
              const isApproved = task.mySubmission?.status === "approved";
              const isPending = ["pending", "under-review"].includes(
                task.mySubmission?.status,
              );
              const isRejected = ["rejected", "resubmit-required"].includes(
                task.mySubmission?.status,
              );

              return (
                <motion.button
                  key={task._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => navigate(`/dashboard/tasks/${task._id}`)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 hover:bg-surface-elevated/50 transition-colors text-left group border-b border-surface-border/50 last:border-b-0 ${isApproved ? "opacity-60" : ""}`}
                >
                  {/* Status dot */}
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isApproved
                        ? "bg-emerald-500/20 border border-emerald-500/30"
                        : isPending
                          ? "bg-amber-500/20  border border-amber-500/30"
                          : isRejected
                            ? "bg-red-500/20    border border-red-500/30"
                            : "bg-surface-elevated border border-surface-border"
                    }`}
                  >
                    {isApproved ? (
                      <CheckCircle2 size={11} className="text-emerald-400" />
                    ) : isPending ? (
                      <Clock size={11} className="text-amber-400" />
                    ) : isRejected ? (
                      <X size={11} className="text-red-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-600 block" />
                    )}
                  </div>

                  {/* Type icon */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border ${conf.bg}`}
                  >
                    <TIcon size={12} className={conf.color} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium group-hover:text-brand-400 transition-colors truncate ${isApproved ? "line-through text-gray-500" : "text-white"}`}
                    >
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                      {task.isRequired && (
                        <span className="text-red-400/70">Required</span>
                      )}
                      {task.isFinalProject && (
                        <span className="text-brand-400/70">Final Project</span>
                      )}
                      {task.points > 0 && (
                        <span className="flex items-center gap-0.5 text-brand-400/70">
                          <Zap size={9} />
                          {task.points}
                        </span>
                      )}
                    </div>
                  </div>
                  {task.mySubmission?.score != null && (
                    <span className="text-emerald-400 text-xs font-semibold flex-shrink-0">
                      {task.mySubmission.score}%
                    </span>
                  )}
                  <ChevronRight
                    size={13}
                    className="text-gray-600 group-hover:text-brand-400 flex-shrink-0 transition-colors"
                  />
                </motion.button>
              );
            })}
          </motion.div>
        )}
        {open && tasks.length === 0 && (
          <div className="px-5 py-4 border-t border-surface-border text-gray-500 text-sm">
            No tasks in this module yet.
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MyInternship() {
  const { id } = useParams(); // optional — for multi-enrollment switcher
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [programs, setPrograms] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [internship, setInternship] = useState(null);
  const [modules, setModules] = useState([]);
  const [taskMap, setTaskMap] = useState({}); // moduleId → tasks[]
  const [loading, setLoading] = useState(true);

  // ── Derive enrolled programs from Redux user ──────────────────────────────
  useEffect(() => {
    const enrollments = user?.enrolledInternships || [];

    if (enrollments.length > 0) {
      const progs = enrollments
        .filter((e) => e.status !== "dropped" && e.internship)
        .map((e) => ({
          _id: e.internship?._id || e.internship,
          title: e.internship?.title || "Program",
          status: e.status,
        }));
      setPrograms(progs);

      // Pick: URL param > first enrolled
      const target = id
        ? progs.find((p) => p._id?.toString() === id) || progs[0]
        : progs[0];
      setActiveId(target?._id || null);
      return;
    }

    // Fallback: API fetch
    internshipService
      .getEnrolled()
      .then((res) => {
        const progs = (res.data.internships || []).map((p) => ({
          _id: p._id,
          title: p.title,
          status: p.enrollmentStatus,
        }));
        setPrograms(progs);
        setActiveId(
          id
            ? progs.find((p) => p._id?.toString() === id)?._id || progs[0]?._id
            : progs[0]?._id,
        );
      })
      .catch(() => {});
  }, [user, id]);

  // ── Load internship content once activeId is known ────────────────────────
  const load = useCallback(async () => {
    if (!activeId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [iRes, mRes, tRes] = await Promise.all([
        internshipService.getById(activeId),
        moduleService.getByInternship(activeId),
        taskService.getByInternship(activeId), // student: auto-adds mySubmission
      ]);

      setInternship(iRes.data.internship);
      const mods = mRes.data.modules || [];
      const tasks = tRes.data.tasks || [];

      setModules(mods);

      // Group tasks by their module._id
      const map = {};
      mods.forEach((m) => {
        map[m._id] = [];
      });
      map["__free"] = [];
      tasks.forEach((t) => {
        const key = t.module?._id || t.module || "__free";
        if (!map[key]) map[key] = [];
        map[key].push(t);
      });
      setTaskMap(map);
    } catch {
      toast.error("Failed to load program content");
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  useEffect(() => {
    load();
  }, [load]);

  // ── Empty state ───────────────────────────────────────────────────────────
  if (!loading && programs.length === 0)
    return (
      <div className="card p-20 text-center">
        <LayoutGrid size={48} className="text-gray-700 mx-auto mb-4" />
        <h3 className="text-white font-semibold text-xl mb-2">
          No Active Program
        </h3>
        <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
          You haven't enrolled in any internship yet.
        </p>
        <button
          onClick={() => navigate("/internships")}
          className="btn-primary"
        >
          Browse Programs
        </button>
      </div>
    );

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!internship) return null;

  // ── Progress calculations ─────────────────────────────────────────────────
  const allTasks = Object.values(taskMap).flat();
  const doneTasks = allTasks.filter(
    (t) => t.mySubmission?.status === "approved",
  ).length;
  const progress =
    allTasks.length > 0 ? Math.round((doneTasks / allTasks.length) * 100) : 0;

  const enrollment = user?.enrolledInternships?.find(
    (e) =>
      (e.internship?._id || e.internship)?.toString() === activeId?.toString(),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">My Program</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Track your progress and complete tasks
          </p>
        </div>
        <button
          onClick={load}
          className="btn-secondary py-2 px-3 flex items-center gap-2 text-sm"
        >
          <RefreshCw size={13} />
        </button>
      </motion.div>

      {/* Program switcher — only enrolled programs */}
      {programs.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.04 }}
          className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide"
        >
          {programs.map((prog) => (
            <button
              key={prog._id}
              onClick={() => navigate(`/dashboard/internship/${prog._id}`)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                prog._id?.toString() === activeId?.toString()
                  ? "bg-brand-500 text-white border-brand-500"
                  : "bg-surface-elevated border-surface-border text-gray-400 hover:text-white"
              }`}
            >
              {prog.title}
            </button>
          ))}
        </motion.div>
      )}

      {/* Overview card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="card p-6"
      >
        <div className="flex items-center gap-6 flex-wrap">
          {/* Progress ring */}
          <div className="relative flex-shrink-0">
            <ProgressRing pct={progress} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-white font-bold text-xl">{progress}%</span>
              <span className="text-gray-500 text-xs">done</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-xl leading-tight">
              {internship.title}
            </h2>
            <p className="text-gray-400 text-sm mt-1 line-clamp-2">
              {internship.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                {
                  label: "Tasks Done",
                  value: `${doneTasks}/${allTasks.length}`,
                  color: "text-brand-400",
                },
                {
                  label: "Modules",
                  value: modules.length,
                  color: "text-violet-400",
                },
                {
                  label: "My Points",
                  value: user?.points || 0,
                  color: "text-amber-400",
                },
                {
                  label: "Status",
                  value: enrollment?.status || "Active",
                  color: "text-emerald-400",
                  cap: true,
                },
              ].map(({ label, value, color, cap }) => (
                <div
                  key={label}
                  className="bg-surface-elevated rounded-xl p-3 border border-surface-border"
                >
                  <p
                    className={`font-bold text-lg ${color} ${cap ? "capitalize" : ""}`}
                  >
                    {value}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        {allTasks.length > 0 && (
          <div className="mt-5">
            <div className="h-2 bg-surface-border rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                className="h-full bg-gradient-to-r from-brand-500 to-violet-500 rounded-full"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>{doneTasks} tasks completed</span>
              <span>{allTasks.length - doneTasks} remaining</span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Modules */}
      <div className="space-y-3">
        {modules.map((mod, i) => (
          <motion.div
            key={mod._id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 + i * 0.04 }}
          >
            <ModuleRow module={mod} tasks={taskMap[mod._id] || []} index={i} />
          </motion.div>
        ))}

        {/* Free tasks not attached to any module */}
        {(taskMap["__free"] || []).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ModuleRow
              module={{ _id: "__free", title: "Other Tasks" }}
              tasks={taskMap["__free"]}
              index={modules.length}
            />
          </motion.div>
        )}

        {modules.length === 0 && allTasks.length === 0 && (
          <div className="card p-12 text-center">
            <BookOpen size={40} className="text-gray-700 mx-auto mb-3" />
            <p className="text-white font-medium mb-1">No content yet</p>
            <p className="text-gray-500 text-sm">
              The mentor hasn't added any tasks. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
