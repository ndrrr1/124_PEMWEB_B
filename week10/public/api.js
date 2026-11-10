export const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
export const angka = (value) => new Intl.NumberFormat("id-ID").format(value);

export async function sendRequest(method, path, body) {
  const started = performance.now();
  const response = await fetch(path, {
    method,
    headers: {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const raw = await response.text();
  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    payload = raw;
  }
  return {
    method,
    path,
    requestBody: body,
    status: response.status,
    statusText: response.statusText,
    ok: response.ok,
    payload,
    durationMs: Math.max(1, Math.round(performance.now() - started)),
  };
}

export function errorMessage(trace) {
  const payload = trace.payload;
  const message =
    payload?.message || `Request gagal dengan status ${trace.status}.`;
  const detail = payload?.errors
    ? ` ${Object.values(payload.errors).join(" ")}`
    : "";
  return `${message}${detail}`;
}
