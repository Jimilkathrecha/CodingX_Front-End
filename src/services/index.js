import api from "./api";

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authService = {
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, pass) =>
    api.post(`/auth/reset-password/${token}`, { password: pass }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  updatePassword: (data) => api.put("/auth/update-password", data),
};

// ── Internships ───────────────────────────────────────────────────────────────
export const internshipService = {
  // ?enrolled=true → only returns programs this student is enrolled in
  getAll: (params) => api.get("/internships", { params }),
  getEnrolled: () =>
    api.get("/internships", { params: { enrolled: true, limit: 50 } }),
  getById: (id) => api.get(`/internships/${id}`),
  create: (data) => api.post("/internships", data),
  update: (id, data) => api.put(`/internships/${id}`, data),
  delete: (id) => api.delete(`/internships/${id}`),
  enroll: (internshipId, plan) =>
    api.post("/internships/enroll", { internshipId, plan }),
  getProgress: (internshipId) =>
    api.get(`/internships/${internshipId}/progress`),
  getStudentProgress: (internshipId, sid) =>
    api.get(`/internships/${internshipId}/progress/${sid}`),
};

// ── Modules ───────────────────────────────────────────────────────────────────
export const moduleService = {
  getByInternship: (internshipId, params) =>
    api.get(`/modules/internship/${internshipId}`, { params }),
  getById: (id) => api.get(`/modules/${id}`),
  create: (data) => api.post("/modules", data),
  update: (id, data) => api.put(`/modules/${id}`, data),
  delete: (id) => api.delete(`/modules/${id}`),
};

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const taskService = {
  // showAll=true lets admin/mentor see unpublished tasks
  getByInternship: (internshipId, params) =>
    api.get(`/tasks/internship/${internshipId}`, { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post("/tasks", data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
};

// ── Submissions ───────────────────────────────────────────────────────────────
export const submissionService = {
  submit: (data) => api.post("/submissions", data),
  getMine: (params) => api.get("/submissions/my", { params }),
  getAll: (params) => api.get("/submissions", { params }),
  review: (id, data) => api.put(`/submissions/${id}/review`, data),
};

// ── Certificates ──────────────────────────────────────────────────────────────
export const certificateService = {
  getMine: () => api.get("/certificates/my"),
  verify: (certId) => api.get(`/certificates/verify/${certId}`),
  generate: (data) => api.post("/certificates/generate", data),
  getAll: (params) => api.get("/certificates", { params }),
  revoke: (id) => api.patch(`/certificates/${id}/revoke`),
  restore: (id) => api.patch(`/certificates/${id}/restore`),
  // Backend streams PDF directly — use window.open or anchor click
  downloadUrl: (certId) => `/api/certificates/download/${certId}`,
};

// ── Payments (Razorpay) ───────────────────────────────────────────────────────
export const paymentService = {
  // Create a Razorpay order for a certificate download
  createCertOrder: (certificateId) =>
    api.post("/payments/certificate-order", { certificateId }),
  // Verify payment signature after checkout
  verify: (data) => api.post("/payments/verify", data),
  // Admin: manually unlock without payment (testing)
  manualUnlock: (certId) => api.patch(`/payments/manual-unlock/${certId}`),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsService = {
  getAdminStats: () => api.get("/analytics/admin"),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const userService = {
  getAll: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
  updateRole: (id, role) => api.patch(`/users/${id}/role`, { role }),
  toggleStatus: (id) => api.patch(`/users/${id}/toggle-status`),
  updateProfile: (data) => api.put("/users/profile", data),
  getLeaderboard: (params) => api.get("/users/leaderboard", { params }),
  delete: (id) => api.delete(`/users/${id}`),
  resetPassword: (id) => api.post(`/users/${id}/reset-password`),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationService = {
  getAll: (params) => api.get("/notifications", { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
};

// ── Upload ────────────────────────────────────────────────────────────────────
export const uploadService = {
  single: (file, type = "general") => {
    const form = new FormData();
    form.append("file", file);
    form.append("type", type);
    return api.post("/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  multiple: (files, type = "general") => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("type", type);
    return api.post("/upload/multiple", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
