const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getToken = () => localStorage.getItem('token');

const getHeaders = (withAuth = false) => {
  const headers = {
    Accept: 'application/json',
  };

  if (withAuth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
};

const handleResponse = async (res) => {
  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json')
    ? await res.json()
    : await res.text();

  if (!res.ok) {
    const message = data?.message || 'Error en la petición';
    throw new Error(message);
  }

  return data;
};

// AUTH
export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: {
      ...getHeaders(false),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await handleResponse(res);

  if (data.token) {
    localStorage.setItem('token', data.token);
  }

  return data;
};

export const logout = async () => {
  const res = await fetch(`${API_URL}/api/logout`, {
    method: 'POST',
    headers: getHeaders(true),
  });

  const data = await handleResponse(res);
  localStorage.removeItem('token');
  return data;
};

export const me = async () => {
  const res = await fetch(`${API_URL}/api/me`, {
    headers: getHeaders(true),
  });

  return handleResponse(res);
};

// TASKS
export const getTasks = async () => {
  const res = await fetch(`${API_URL}/api/tasks`, {
    headers: getHeaders(true),
  });

  return handleResponse(res);
};

export const createTask = async (payload) => {
  const res = await fetch(`${API_URL}/api/tasks`, {
    method: 'POST',
    headers: {
      ...getHeaders(true),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
};

export const updateTask = async (id, payload) => {
  const res = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: {
      ...getHeaders(true),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(res);
};

export const deleteTask = async (id) => {
  const res = await fetch(`${API_URL}/api/tasks/${id}`, {
    method: 'DELETE',
    headers: getHeaders(true),
  });

  return handleResponse(res);
};



