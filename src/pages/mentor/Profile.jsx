import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import {
  Camera,
  Save,
  Eye,
  EyeOff,
  Lock,
  Plus,
  X,
  FileText,
  CheckCircle2,
  Award,
  TrendingUp,
} from "lucide-react";
import { userService, uploadService, authService } from "../../services/index";
import { getMe } from "../../redux/slices/authSlice";
import toast from "react-hot-toast";

const SKILL_SUGGESTIONS = [
  "React",
  "Node.js",
  "Python",
  "JavaScript",
  "TypeScript",
  "MongoDB",
  "Express",
  "Next.js",
  "Vue.js",
  "Django",
  "Docker",
  "AWS",
  "Git",
  "REST APIs",
  "GraphQL",
  "Machine Learning",
  "Data Science",
  "DevOps",
  "PostgreSQL",
  "Redis",
  "Kubernetes",
  "CI/CD",
  "System Design",
];

export default function MentorProfile() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const fileRef = useRef(null);

  const [avatarLoading, setAvatarLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [showCur, setShowCur] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [skills, setSkills] = useState(user?.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [tab, setTab] = useState("profile");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      bio: user?.bio || "",
    },
  });
  const {
    register: regPw,
    handleSubmit: handlePwSubmit,
    formState: { errors: pwErrors },
    watch: watchPw,
    reset: resetPw,
  } = useForm();

  useEffect(() => {
    if (user) {
      reset({ name: user.name, phone: user.phone || "", bio: user.bio || "" });
      setSkills(user.skills || []);
    }
  }, [user, reset]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Max 3MB");
      return;
    }
    try {
      setAvatarLoading(true);
      const res = await uploadService.single(file, "avatar");
      await userService.updateProfile({
        avatar: { url: res.data.url, publicId: res.data.public_id },
      });
      await dispatch(getMe());
      toast.success("Avatar updated!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setAvatarLoading(false);
    }
  };

  const onSaveProfile = async (data) => {
    try {
      setSavingProfile(true);
      await userService.updateProfile({ ...data, skills });
      await dispatch(getMe());
      toast.success("Profile saved!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const onChangePassword = async (data) => {
    try {
      setSavingPw(true);
      await authService.updatePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password changed!");
      resetPw();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setSavingPw(false);
    }
  };

  const addSkill = (s) => {
    const v = s.trim();
    if (!v || skills.includes(v) || skills.length >= 20) return;
    setSkills((p) => [...p, v]);
    setSkillInput("");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          Manage your mentor account
        </p>
      </motion.div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.04 }}
        className="card p-5 flex items-center gap-5 flex-wrap"
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-brand-500/10 border-2 border-brand-500/30 overflow-hidden flex items-center justify-center">
            {avatarLoading ? (
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            ) : user?.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-brand-400 font-bold text-3xl">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center hover:bg-brand-600 transition-colors shadow-lg"
          >
            <Camera size={14} className="text-white" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-xl">{user?.name}</h2>
          <p className="text-gray-400 text-sm">{user?.email}</p>
          <div className="flex items-center gap-1 mt-2">
            <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs capitalize">
              Mentor
            </span>
            {user?.isEmailVerified && (
              <span className="badge-success text-xs">Email Verified</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-elevated border border-surface-border rounded-xl p-1 w-fit">
        {["profile", "security"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? "bg-brand-500 text-white" : "text-gray-400 hover:text-white"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === "profile" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-5">
            <div className="card p-6 space-y-5">
              <h3 className="text-white font-semibold">Personal Information</h3>
              <div>
                <label className="label">Full Name *</label>
                <input
                  {...register("name", {
                    required: "Name is required",
                    minLength: { value: 2, message: "Min 2 chars" },
                  })}
                  placeholder="Your name"
                  className="input"
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  value={user?.email || ""}
                  disabled
                  className="input opacity-50 cursor-not-allowed"
                />
                <p className="text-gray-600 text-xs mt-1">
                  Email cannot be changed.
                </p>
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  {...register("phone")}
                  placeholder="+91 9876543210"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Bio / Expertise</label>
                <textarea
                  {...register("bio")}
                  rows={3}
                  placeholder="Describe your expertise and teaching style…"
                  className="input resize-none"
                  maxLength={500}
                />
              </div>
            </div>

            {/* Skills */}
            <div className="card p-6 space-y-4">
              <h3 className="text-white font-semibold">Expertise & Skills</h3>
              <div className="flex flex-wrap gap-2 min-h-[32px]">
                {skills.length === 0 && (
                  <p className="text-gray-600 text-sm">
                    Add your areas of expertise
                  </p>
                )}
                {skills.map((s) => (
                  <span
                    key={s}
                    className="badge-brand text-sm flex items-center gap-1.5"
                  >
                    {s}
                    <button
                      type="button"
                      onClick={() => setSkills((p) => p.filter((x) => x !== s))}
                      className="hover:text-red-400 transition-colors ml-0.5"
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addSkill(skillInput);
                    }
                  }}
                  placeholder="Type and press Enter…"
                  className="input flex-1 py-2.5 text-sm"
                  maxLength={30}
                  list="mentor-skill-suggestions"
                />
                <datalist id="mentor-skill-suggestions">
                  {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s)).map(
                    (s) => (
                      <option key={s} value={s} />
                    ),
                  )}
                </datalist>
                <button
                  type="button"
                  onClick={() => addSkill(skillInput)}
                  className="btn-secondary px-4 py-2.5"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SKILL_SUGGESTIONS.filter((s) => !skills.includes(s))
                  .slice(0, 8)
                  .map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addSkill(s)}
                      className="badge text-xs bg-surface-elevated border border-surface-border text-gray-400 hover:text-white hover:border-brand-500/40 transition-all cursor-pointer"
                    >
                      + {s}
                    </button>
                  ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="btn-primary flex items-center gap-2 min-w-[140px] justify-center"
            >
              {savingProfile ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save size={15} />
                  Save Profile
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}

      {/* Security tab */}
      {tab === "security" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <form
            onSubmit={handlePwSubmit(onChangePassword)}
            className="card p-6 space-y-5"
          >
            <h3 className="text-white font-semibold">Change Password</h3>
            <div>
              <label className="label">Current Password *</label>
              <div className="relative">
                <input
                  type={showCur ? "text" : "password"}
                  {...regPw("currentPassword", { required: "Required" })}
                  placeholder="Current password"
                  className="input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowCur((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showCur ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwErrors.currentPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {pwErrors.currentPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="label">New Password *</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  {...regPw("newPassword", {
                    required: "Required",
                    minLength: { value: 8, message: "Min 8 characters" },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: "Must include uppercase, lowercase and number",
                    },
                  })}
                  placeholder="Min 8 chars, uppercase + number"
                  className="input pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwErrors.newPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {pwErrors.newPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="label">Confirm New Password *</label>
              <input
                type="password"
                {...regPw("confirmPassword", {
                  required: "Required",
                  validate: (v) =>
                    v === watchPw("newPassword") || "Passwords do not match",
                })}
                placeholder="Re-enter new password"
                className="input"
              />
              {pwErrors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {pwErrors.confirmPassword.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={savingPw}
              className="btn-primary flex items-center gap-2 min-w-[160px] justify-center"
            >
              {savingPw ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Changing…
                </>
              ) : (
                <>
                  <Lock size={15} />
                  Change Password
                </>
              )}
            </button>
          </form>

          <div className="card p-6 mt-5 space-y-3">
            <h3 className="text-white font-semibold">Account Info</h3>
            {[
              { label: "Role", value: "Mentor" },
              {
                label: "Member since",
                value: user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                    })
                  : "—",
              },
              {
                label: "Email verified",
                value: user?.isEmailVerified ? "✓ Verified" : "✗ Not verified",
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between items-center py-2 border-b border-surface-border/50 text-sm"
              >
                <span className="text-gray-500">{label}</span>
                <span className="text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
