const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function headerValue(headers, name) {
  if (!headers) return '';
  if (headers instanceof Headers) return headers.get(name) || headers.get(name.toLowerCase()) || '';
  if (Array.isArray(headers)) return headers.find(([key]) => String(key).toLowerCase() === name.toLowerCase())?.[1] || '';
  return headers[name] || headers[name.toLowerCase()] || '';
}
export function withHeader(headers = {}, name, value) {
  if (headers instanceof Headers) { const next = new Headers(headers); next.set(name, value); return next; }
  if (Array.isArray(headers)) return [...headers.filter(([key]) => String(key).toLowerCase() !== name.toLowerCase()), [name, value]];
  return { ...(headers || {}), [name]: value };
}
function boundaryFrom(value = '') { return String(value).match(/boundary=([^;]+)/i)?.[1]?.replace(/^"|"$/g, '') || ''; }
function indexOfBytes(haystack, needle, start = 0) {
  outer: for (let i = Math.max(0, start); i <= haystack.length - needle.length; i += 1) {
    for (let j = 0; j < needle.length; j += 1) if (haystack[i + j] !== needle[j]) continue outer;
    return i;
  }
  return -1;
}
function lastIndexOfBytes(haystack, needle) {
  outer: for (let i = haystack.length - needle.length; i >= 0; i -= 1) {
    for (let j = 0; j < needle.length; j += 1) if (haystack[i + j] !== needle[j]) continue outer;
    return i;
  }
  return -1;
}
export async function parseMultipart(input, init = {}) {
  const contentType = headerValue(init.headers || input?.headers, 'Content-Type') || '';
  const boundary = boundaryFrom(contentType);
  const body = init.body || input?.body;
  if (!boundary || !body?.arrayBuffer) return null;
  const bytes = new Uint8Array(await body.arrayBuffer());
  const crlfBoundary = encoder.encode(`\r\n--${boundary}`);
  const doubleCrlf = encoder.encode('\r\n\r\n');
  const finalBoundary = encoder.encode(`\r\n--${boundary}--`);
  const firstHeaderEnd = indexOfBytes(bytes, doubleCrlf);
  if (firstHeaderEnd < 0) return null;
  const firstContentStart = firstHeaderEnd + doubleCrlf.length;
  const firstPartEnd = indexOfBytes(bytes, crlfBoundary, firstContentStart);
  if (firstPartEnd < 0) return null;
  let metadata;
  try { metadata = JSON.parse(decoder.decode(bytes.slice(firstContentStart, firstPartEnd)).trim()); } catch { return null; }
  const secondHeaderStart = firstPartEnd + crlfBoundary.length + 2;
  const secondHeaderEnd = indexOfBytes(bytes, doubleCrlf, secondHeaderStart);
  if (secondHeaderEnd < 0) return null;
  const secondHeader = decoder.decode(bytes.slice(secondHeaderStart, secondHeaderEnd));
  const uploadContentType = secondHeader.match(/Content-Type:\s*([^\r\n]+)/i)?.[1]?.trim() || 'application/octet-stream';
  const contentStart = secondHeaderEnd + doubleCrlf.length;
  let contentEnd = lastIndexOfBytes(bytes, finalBoundary);
  if (contentEnd < 0) contentEnd = bytes.length;
  return { metadata, boundary, uploadContentType, contentBytes: bytes.slice(contentStart, contentEnd) };
}
export function multipartBody(boundary, metadata, contentBlob, contentType) {
  return new Blob([
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
    `--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`, contentBlob, `\r\n--${boundary}--`
  ], { type: `multipart/related; boundary=${boundary}` });
}
export function decodeJson(bytes) {
  try { return JSON.parse(decoder.decode(bytes)); } catch { return null; }
}
