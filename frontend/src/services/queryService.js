import api from './api';

export const explainQuery = (assignmentId, sql) =>
  api.post('/query/explain', { assignmentId, sql }).then(r => r.data);