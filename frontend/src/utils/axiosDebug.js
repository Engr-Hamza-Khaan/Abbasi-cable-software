const SENSITIVE_KEYS = ['password', 'token', 'authorization', 'resetPasswordToken'];

export const RUNTIME_DEBUG_KEY = 'abbasi-api-debug';

/** Dev: always on. Production: localStorage flag or enableApiDebug() in console (no rebuild). */
export const isDebugEnabled = () => {
  if (import.meta.env.DEV) return true;
  if (import.meta.env.VITE_API_DEBUG === 'true') return true;
  try {
    return localStorage.getItem(RUNTIME_DEBUG_KEY) === 'true';
  } catch {
    return false;
  }
};

export const enableApiDebug = () => {
  try {
    localStorage.setItem(RUNTIME_DEBUG_KEY, 'true');
  } catch {
    /* ignore */
  }
  console.info(
    '%cAPI debug ON — next requests will log here.',
    'color:#22c55e;font-weight:bold'
  );
  return true;
};

export const disableApiDebug = () => {
  try {
    localStorage.removeItem(RUNTIME_DEBUG_KEY);
  } catch {
    /* ignore */
  }
  console.info(
    '%cAPI debug OFF.',
    'color:#94a3b8;font-weight:bold'
  );
  return false;
};

const redactValue = (key, value) => {
  if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k))) {
    return value ? '***' : value;
  }
  return value;
};

const redactObject = (obj, depth = 0) => {
  if (obj == null || depth > 4) return obj;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map((item) => redactObject(item, depth + 1));
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      typeof value === 'object' && value !== null
        ? redactObject(value, depth + 1)
        : redactValue(key, value),
    ])
  );
};

const buildFullUrl = (config) => {
  const base = config.baseURL?.replace(/\/$/, '') || '';
  const path = config.url || '';
  if (/^https?:\/\//i.test(path)) return path;
  const joined = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  if (!config.params || Object.keys(config.params).length === 0) return joined;
  const qs = new URLSearchParams(config.params).toString();
  return `${joined}?${qs}`;
};

const logStyle = {
  request: 'color:#3b82f6;font-weight:bold',
  success: 'color:#22c55e;font-weight:bold',
  error: 'color:#ef4444;font-weight:bold',
  muted: 'color:#94a3b8',
};

let requestCounter = 0;
let helpersInstalled = false;

/** Expose enableApiDebug / disableApiDebug on window for production console. */
export function installApiDebugHelpers() {
  if (helpersInstalled || typeof window === 'undefined') return;
  helpersInstalled = true;
  window.enableApiDebug = enableApiDebug;
  window.disableApiDebug = disableApiDebug;

  if (!import.meta.env.DEV && !isDebugEnabled()) {
    console.info(
      '%cProduction API debug (Option 2): run enableApiDebug() in this console — no rebuild needed.',
      'color:#8b5cf6;font-weight:bold'
    );
  }
}

/**
 * Logs full request/response flow for an axios instance in the browser console.
 * Interceptors always run; logging only when isDebugEnabled() is true.
 */
export function setupAxiosDebug(axiosInstance, label = 'API') {
  axiosInstance.interceptors.request.use(
    (config) => {
      if (!isDebugEnabled()) return config;

      const id = ++requestCounter;
      const startTime = performance.now();
      const method = (config.method || 'get').toUpperCase();
      const url = buildFullUrl(config);

      config.__apiDebug = { id, startTime, label, method, url };

      const headers = { ...config.headers };
      if (headers.Authorization) headers.Authorization = 'Bearer ***';
      if (headers.authorization) headers.authorization = '***';

      console.groupCollapsed(
        `%c[${label} #${id}] → ${method}%c ${url}`,
        logStyle.request,
        logStyle.muted
      );
      console.log('Step 1 — Request started', { id, method, url, at: new Date().toISOString() });
      if (config.params && Object.keys(config.params).length) {
        console.log('Query params', redactObject(config.params));
      }
      if (config.data) {
        const body =
          typeof config.data === 'string'
            ? (() => {
                try {
                  return redactObject(JSON.parse(config.data));
                } catch {
                  return config.data;
                }
              })()
            : redactObject(config.data);
        console.log('Request body', body);
      }
      console.log('Headers', headers);
      console.groupEnd();

      return config;
    },
    (error) => {
      if (isDebugEnabled()) {
        console.error(`[${label}] Request setup failed`, error);
      }
      return Promise.reject(error);
    }
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      const meta = response.config?.__apiDebug;
      if (!meta || !isDebugEnabled()) return response;

      const durationMs = Math.round(performance.now() - meta.startTime);
      const status = response.status;

      console.groupCollapsed(
        `%c[${meta.label} #${meta.id}] ← ${status} ${meta.method}%c ${meta.url} %c(${durationMs}ms)`,
        logStyle.success,
        logStyle.muted,
        logStyle.muted
      );
      console.log('Step 2 — Response received', {
        id: meta.id,
        status,
        statusText: response.statusText,
        durationMs,
      });
      console.log('Response headers', response.headers);
      console.log('Response data', redactObject(response.data));
      console.groupEnd();

      return response;
    },
    (error) => {
      const config = error.config;
      const meta = config?.__apiDebug;
      if (!meta || !isDebugEnabled()) return Promise.reject(error);

      const durationMs = Math.round(performance.now() - meta.startTime);
      const status = error.response?.status ?? 'NETWORK';
      const labelName = meta?.label ?? label;
      const id = meta?.id ?? '?';
      const method = meta?.method ?? (config?.method || 'GET').toUpperCase();
      const url = meta?.url ?? config?.url ?? 'unknown';

      console.groupCollapsed(
        `%c[${labelName} #${id}] ✗ ${status} ${method}%c ${url} (${durationMs}ms)`,
        logStyle.error,
        logStyle.muted
      );
      console.log('Step 2 — Request failed', {
        id,
        message: error.message,
        code: error.code,
        durationMs,
      });
      if (error.response) {
        console.log('Error status', error.response.status, error.response.statusText);
        console.log('Error data', redactObject(error.response.data));
      } else {
        console.log('No response (network/CORS/timeout)', error);
      }
      console.groupEnd();

      return Promise.reject(error);
    }
  );

  if (isDebugEnabled()) {
    const mode = import.meta.env.DEV
      ? 'development'
      : import.meta.env.VITE_API_DEBUG === 'true'
        ? 'production (env)'
        : 'production (localStorage / enableApiDebug)';

    console.info(
      `%c[${label}] API debug logging ON (${mode})`,
      'color:#8b5cf6;font-weight:bold',
      { off: 'disableApiDebug()', on: 'enableApiDebug()' }
    );
  }
}
