import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  ShieldOff,
  ShieldCheck,
  Eye,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  AlertTriangle,
  RefreshCw,
  Crown,
  BookOpen,
  Zap,
  UserCog,
  MoreVertical,
  Trash2,
  KeyRound,
} from "lucide-react";
import { userService } from "../../services/index";
import api from "../../services/api";
import toast from "react-hot-toast";

// ── Constants ─────────────────────────────────────────────────────────────────
const ROLES = ["all", "student", "mentor", "admin"];
const STATUSES = ["all", "active", "inactive"];
const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Newest First" },
  { value: "createdAt-asc", label: "Oldest First" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "points-desc", label: "Top Points" },
];
const ROLE_BADGE = {
  admin: "bg-violet-500/10 text-violet-400 border border-violet-500/20",
  mentor: "bg-brand-500/10  text-brand-400  border border-brand-500/20",
  student: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
};
const LIMIT = 15;

// ── Sub-components ────────────────────────────────────────────────────────────

function ConfirmDialog({ title, message, danger = true, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.93 }}
        className="card w-full max-w-sm p-6 shadow-2xl"
      >
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${danger ? "bg-red-500/10" : "bg-amber-500/10"}`}
        >
          <AlertTriangle
            size={22}
            className={danger ? "text-red-400" : "text-amber-400"}
          />
        </div>
        <h3 className="text-white font-semibold text-center text-lg mb-1">
          {title}
        </h3>
        <p className="text-gray-400 text-sm text-center mb-6 leading-relaxed">
          {message}
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1 py-2.5">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 font-semibold rounded-xl transition-all active:scale-95 ${
              danger
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-amber-500 hover:bg-amber-600 text-black"
            }`}
          >
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Avatar({ user, size = "md" }) {
  const s =
    size === "lg"
      ? "w-16 h-16 text-2xl rounded-2xl"
      : "w-9 h-9 text-sm rounded-xl";
  return (
    <div
      className={`${s} bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold flex-shrink-0 overflow-hidden`}
    >
      {user.avatar?.url ? (
        <img
          src={user.avatar.url}
          alt={user.name}
          className="w-full h-full object-cover"
        />
      ) : (
        user.name?.[0]?.toUpperCase()
      )}
    </div>
  );
}

function UserDrawer({
  user,
  onClose,
  onRoleChange,
  onToggleStatus,
  onResetPassword,
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="relative w-full max-w-sm bg-surface-card border-l border-surface-border h-full overflow-y-auto flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-border flex-shrink-0">
          <h2 className="text-white font-semibold">User Details</h2>
          <button onClick={onClose} className="btn-ghost p-2">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Profile */}
          <div className="flex items-center gap-4">
            <Avatar user={user} size="lg" />
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">
                {user.name}
              </h3>
              <p className="text-gray-400 text-xs mt-0.5">{user.email}</p>
              <div className="flex gap-1.5 mt-2">
                <span
                  className={`badge text-xs capitalize ${ROLE_BADGE[user.role]}`}
                >
                  {user.role}
                </span>
                <span
                  className={`badge text-xs ${user.isActive ? "badge-success" : "badge-danger"}`}
                >
                  {user.isActive ? "Active" : "Blocked"}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                icon: Zap,
                color: "text-brand-400",
                val: user.points || 0,
                lbl: "Points",
              },
              {
                icon: BookOpen,
                color: "text-emerald-400",
                val: user.enrolledInternships?.length || 0,
                lbl: "Programs",
              },
              {
                icon: Crown,
                color: "text-amber-400",
                val: user.badges?.length || 0,
                lbl: "Badges",
              },
            ].map(({ icon: Icon, color, val, lbl }) => (
              <div
                key={lbl}
                className="card-elevated rounded-xl p-3 text-center"
              >
                <Icon size={13} className={`${color} mx-auto mb-1`} />
                <p className="text-white font-bold text-xl">{val}</p>
                <p className="text-gray-500 text-xs">{lbl}</p>
              </div>
            ))}
          </div>

          {/* Meta info */}
          <div className="space-y-0 divide-y divide-surface-border">
            {[
              { label: "Phone", value: user.phone || "—" },
              {
                label: "Joined",
                value: new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
              },
              {
                label: "Email Verified",
                value: user.isEmailVerified ? "✓ Verified" : "✗ Not verified",
              },
              {
                label: "Last Active",
                value: user.lastActive
                  ? new Date(user.lastActive).toLocaleDateString()
                  : "—",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between items-center py-2.5 text-sm"
              >
                <span className="text-gray-500">{label}</span>
                <span className="text-white font-medium text-right">
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Bio */}
          {user.bio && (
            <div>
              <p className="text-gray-500 text-xs mb-1.5">Bio</p>
              <p className="text-gray-300 text-sm leading-relaxed bg-surface-elevated rounded-xl p-3">
                {user.bio}
              </p>
            </div>
          )}

          {/* Skills */}
          {user.skills?.length > 0 && (
            <div>
              <p className="text-gray-500 text-xs mb-2">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {user.skills.map((s) => (
                  <span key={s} className="badge-brand text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Enrolled programs */}
          {user.enrolledInternships?.length > 0 && (
            <div>
              <p className="text-gray-500 text-xs mb-2">Enrolled Programs</p>
              <div className="space-y-2">
                {user.enrolledInternships.slice(0, 3).map((e, i) => (
                  <div
                    key={i}
                    className="card-elevated rounded-xl px-3 py-2 flex items-center justify-between"
                  >
                    <p className="text-white text-xs font-medium truncate">
                      {e.internship?.title || "Program"}
                    </p>
                    <span
                      className={`badge text-xs ml-2 flex-shrink-0 ${
                        e.status === "completed"
                          ? "badge-success"
                          : e.status === "active"
                            ? "badge-brand"
                            : "badge-gray"
                      }`}
                    >
                      {e.status}
                    </span>
                  </div>
                ))}
                {user.enrolledInternships.length > 3 && (
                  <p className="text-gray-500 text-xs pl-1">
                    +{user.enrolledInternships.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Change role */}
          <div>
            <p className="text-gray-500 text-xs mb-2">Change Role</p>
            <div className="grid grid-cols-3 gap-2">
              {["student", "mentor", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => onRoleChange(user._id, r)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium capitalize transition-all border ${
                    user.role === r
                      ? ROLE_BADGE[r]
                      : "bg-surface-elevated border-surface-border text-gray-400 hover:text-white hover:border-brand-500/30"
                  }`}
                >
                  {user.role === r && (
                    <Check size={9} className="inline mr-0.5" />
                  )}
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-surface-border space-y-2 flex-shrink-0">
          <button
            onClick={() => onResetPassword(user)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-surface-border text-gray-300 hover:text-white hover:border-brand-500/30 bg-surface-elevated transition-all"
          >
            <KeyRound size={14} /> Send Password Reset Email
          </button>
          <button
            onClick={() => onToggleStatus(user._id, user.isActive)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
              user.isActive
                ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            {user.isActive ? (
              <>
                <ShieldOff size={15} /> Block User
              </>
            ) : (
              <>
                <ShieldCheck size={15} /> Activate User
              </>
            )}
          </button>
        </div>
      </motion.aside>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt-desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const searchTimer = useRef(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const [field, order] = sortBy.split("-");
      const res = await userService.getAll({
        page,
        limit: LIMIT,
        sortBy: field,
        order,
        ...(roleFilter !== "all" && { role: roleFilter }),
        ...(statusFilter !== "all" && { isActive: statusFilter === "active" }),
        ...(search.trim() && { search: search.trim() }),
      });
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, statusFilter, sortBy, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchChange = (val) => {
    setSearch(val);
    setPage(1);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchUsers(), 400);
  };

  const handleRoleChange = async (id, role) => {
    try {
      await userService.updateRole(id, role);
      toast.success(`Role updated to ${role}`);
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
      setSelected((prev) => (prev?._id === id ? { ...prev, role } : prev));
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update role");
    }
  };

  const handleToggleStatus = (id, isActive) => {
    setConfirm({
      title: isActive ? "Block this user?" : "Activate this user?",
      message: isActive
        ? "They will be logged out immediately and cannot sign in until re-activated."
        : "Their access will be fully restored.",
      danger: isActive,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await userService.toggleStatus(id);
          toast.success(isActive ? "User blocked" : "User activated");
          setUsers((prev) =>
            prev.map((u) =>
              u._id === id ? { ...u, isActive: !u.isActive } : u,
            ),
          );
          setSelected((prev) =>
            prev?._id === id ? { ...prev, isActive: !prev.isActive } : prev,
          );
        } catch {
          toast.error("Action failed");
        }
      },
    });
  };

  const handleResetPassword = (user) => {
    setConfirm({
      title: "Send password reset email?",
      message: `A secure reset link will be emailed to ${user.email}.`,
      danger: false,
      onConfirm: async () => {
        setConfirm(null);
        try {
          await api.post(`/users/${user._id}/reset-password`);
          toast.success("Reset email sent!");
        } catch {
          toast.error("Failed to send reset email");
        }
      },
    });
  };

  const totalPages = Math.ceil(total / LIMIT);

  const paginationNums = () => {
    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
    return Array.from({ length: Math.min(5, totalPages) }, (_, i) => start + i);
  };

  return (
    <div className="space-y-6">
      {/* ── Headers ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {total.toLocaleString()} total users on the platform
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="btn-secondary flex items-center gap-2 text-sm py-2"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </motion.div>

      {/* ── Summary cards ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          {
            label: "Students",
            icon: Users,
            color: "text-emerald-400 bg-emerald-500/10",
            role: "student",
          },
          {
            label: "Mentors",
            icon: UserCog,
            color: "text-brand-400   bg-brand-500/10",
            role: "mentor",
          },
          {
            label: "Admins",
            icon: Crown,
            color: "text-violet-400  bg-violet-500/10",
            role: "admin",
          },
          {
            label: "Total",
            icon: Users,
            color: "text-gray-400    bg-surface-elevated",
            role: "all",
          },
        ].map(({ label, icon: Icon, color, role }) => (
          <button
            key={role}
            onClick={() => {
              setRoleFilter(role);
              setPage(1);
            }}
            className={`card p-4 text-left transition-all hover:border-brand-500/30 ${roleFilter === role ? "border-brand-500/40" : ""}`}
          >
            <div
              className={`w-9 h-9 rounded-xl ${color} flex items-center justify-center mb-3`}
            >
              <Icon size={16} />
            </div>
            <p className="text-white font-bold text-2xl">
              {role === "all"
                ? total
                : users.filter((u) => u.role === role).length}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </button>
        ))}
      </motion.div>

      {/* ── Filters ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="card p-4 flex flex-wrap gap-3 items-center"
      >
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name or email…"
            className="input pl-10 py-2.5 text-sm"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Role tabs */}
        <div className="flex gap-1 bg-surface-elevated border border-surface-border rounded-xl p-1">
          {ROLES.map((r) => (
            <button
              key={r}
              onClick={() => {
                setRoleFilter(r);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${roleFilter === r ? "bg-brand-500 text-white" : "text-gray-400 hover:text-white"}`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 bg-surface-elevated border border-surface-border rounded-xl p-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${statusFilter === s ? "bg-brand-500 text-white" : "text-gray-400 hover:text-white"}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => {
            setSortBy(e.target.value);
            setPage(1);
          }}
          className="bg-surface-elevated border border-surface-border text-gray-300 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-brand-500 cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </motion.div>

      {/* ── Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="card overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20">
            <Users size={42} className="text-gray-700 mx-auto mb-3" />
            <p className="text-white font-medium mb-1">No users found</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="border-b border-surface-border bg-surface-elevated/40">
                  <tr>
                    <th className="table-header">User</th>
                    <th className="table-header">Role</th>
                    <th className="table-header hidden md:table-cell">
                      Programs
                    </th>
                    <th className="table-header hidden lg:table-cell">
                      Points
                    </th>
                    <th className="table-header hidden xl:table-cell">
                      Joined
                    </th>
                    <th className="table-header">Status</th>
                    <th className="table-header text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className="table-row"
                    >
                      {/* User */}
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <Avatar user={user} />
                          <div className="min-w-0">
                            <p className="text-white font-medium text-sm leading-tight truncate max-w-[160px]">
                              {user.name}
                            </p>
                            <p className="text-gray-500 text-xs truncate max-w-[160px]">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="table-cell">
                        <span
                          className={`badge text-xs capitalize ${ROLE_BADGE[user.role] || "badge-gray"}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* Programs */}
                      <td className="table-cell hidden md:table-cell text-gray-300 text-sm">
                        {user.enrolledInternships?.length || 0}
                      </td>

                      {/* Points */}
                      <td className="table-cell hidden lg:table-cell">
                        <div className="flex items-center gap-1 text-brand-400 font-semibold text-sm">
                          <Zap size={11} />
                          {user.points || 0}
                        </div>
                      </td>

                      {/* Joined */}
                      <td className="table-cell hidden xl:table-cell text-gray-500 text-xs">
                        {new Date(user.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Status */}
                      <td className="table-cell">
                        <span
                          className={`badge text-xs ${user.isActive ? "badge-success" : "badge-danger"}`}
                        >
                          {user.isActive ? "Active" : "Blocked"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="table-cell">
                        <div className="flex items-center justify-center gap-0.5">
                          <button
                            onClick={() => setSelected(user)}
                            title="View details"
                            className="btn-ghost p-2 text-gray-400 hover:text-white"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() =>
                              handleToggleStatus(user._id, user.isActive)
                            }
                            title={user.isActive ? "Block" : "Activate"}
                            className="btn-ghost p-2"
                          >
                            {user.isActive ? (
                              <ShieldOff size={14} className="text-red-400" />
                            ) : (
                              <ShieldCheck
                                size={14}
                                className="text-emerald-400"
                              />
                            )}
                          </button>
                          <button
                            onClick={() => handleResetPassword(user)}
                            title="Reset password"
                            className="btn-ghost p-2"
                          >
                            <Mail size={14} className="text-amber-400" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-surface-border">
                <p className="text-gray-500 text-xs">
                  Showing {(page - 1) * LIMIT + 1}–
                  {Math.min(page * LIMIT, total)} of{" "}
                  <span className="text-gray-300">{total}</span>
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn-ghost p-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {paginationNums().map((pg) => (
                    <button
                      key={pg}
                      onClick={() => setPage(pg)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                        pg === page
                          ? "bg-brand-500 text-white"
                          : "text-gray-400 hover:text-white hover:bg-surface-elevated"
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn-ghost p-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* ── Drawer ── */}
      <AnimatePresence>
        {selected && (
          <UserDrawer
            user={selected}
            onClose={() => setSelected(null)}
            onRoleChange={handleRoleChange}
            onToggleStatus={handleToggleStatus}
            onResetPassword={handleResetPassword}
          />
        )}
      </AnimatePresence>

      {/* ── Confirm ── */}
      <AnimatePresence>
        {confirm && (
          <ConfirmDialog {...confirm} onCancel={() => setConfirm(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
