import api from './axios';

export const coursesApi = {
  list: (params) => api.get('/courses/', { params }),
  detail: (id) => api.get(`/courses/${id}/`),
  create: (data) => api.post('/courses/create/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.patch(`/courses/${id}/edit/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/courses/${id}/edit/`),
  categories: () => api.get('/categories/'),
  createCategory: (data) => api.post('/categories/', data),
  enroll: (courseId) => api.post('/enroll/', { course_id: courseId }),
  unenroll: (enrollmentId) => api.delete(`/enrollments/${enrollmentId}/unenroll/`),
  myEnrollments: () => api.get('/my-enrollments/'),
  updateProgress: (enrollmentId, progress) => api.patch(`/enrollments/${enrollmentId}/progress/`, { progress }),
  adminEnrollments: (params) => api.get('/admin/enrollments/', { params }),
  dashboard: () => api.get('/dashboard/'),
  reports: () => api.get('/reports/'),
};
