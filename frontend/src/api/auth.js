import api from './axios';

export const authApi = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  changePassword: (data) => api.post('/auth/change-password/', data),
  // Email verification
  sendVerificationOtp: () => api.post('/auth/send-verification-otp/'),
  verifyEmail: (otp) => api.post('/auth/verify-email/', { otp }),
  // Password reset
  forgotPassword: (email) => api.post('/auth/forgot-password/', { email }),
  verifyResetOtp: (email, otp) => api.post('/auth/verify-reset-otp/', { email, otp }),
  resetPassword: (data) => api.post('/auth/reset-password/', data),
  // Dev tools
  getDevEmails: () => api.get('/auth/dev-emails/'),
  // Admin
  getUsers: (params) => api.get('/auth/users/', { params }),
  updateUser: (id, data) => api.patch(`/auth/users/${id}/`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}/`),
};
