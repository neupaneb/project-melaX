const rawBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const normalizedBaseUrl = rawBaseUrl
  ? rawBaseUrl.replace(/\/+$/, '')
  : '';

const normalizePath = (path: string) => (path.startsWith('/') ? path : `/${path}`);

export const apiUrl = (path: string) => {
  const normalizedPath = normalizePath(path);
  return normalizedBaseUrl
    ? `${normalizedBaseUrl}${normalizedPath}`
    : normalizedPath;
};

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('melaXAccessToken');
  const headers = new Headers(options.headers || {});

  if (!headers.has('Authorization') && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return fetch(apiUrl(path), {
    ...options,
    headers,
  });
};
