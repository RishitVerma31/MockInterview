const BASE = import.meta.env.VITE_API_URL || '';

const authFetch = async (url, options = {}, getToken) => {
  const token = await getToken();
  const res = await fetch(`${BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const startInterview = (payload, getToken) =>
  authFetch('/api/interview/start', { method: 'POST', body: JSON.stringify(payload) }, getToken);

export const submitAnswer = (sessionId, payload, getToken) =>
  authFetch(`/api/interview/${sessionId}/answer`, { method: 'POST', body: JSON.stringify(payload) }, getToken);

export const completeInterview = (sessionId, getToken) =>
  authFetch(`/api/interview/${sessionId}/complete`, { method: 'POST' }, getToken);

export const fetchHistory = (getToken) =>
  authFetch('/api/interview/history', {}, getToken);

export const fetchInterview = (sessionId, getToken) =>
  authFetch(`/api/interview/${sessionId}`, {}, getToken);
