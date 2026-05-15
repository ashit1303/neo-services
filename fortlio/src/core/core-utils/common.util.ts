
import { createHash } from 'crypto';
import dayjs from 'dayjs';
import { readFileSync } from 'fs';

export const generateUUID = (): string => crypto.randomUUID();
export const replacePlaceholders = (
  template: string,
  variables: Record<string, string> = {},
  defaultVariables: Record<string, string> = {},
): string => {
  const formatIfDate = (key: string, value: string): string => {
    if (key === 'createdAt' || key === 'createdAt') {
      return dayjs.utc(value).format('DD-MM-YYYY HH:mm:ss');
    }
    return value;
  };

  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const trimmedKey = key.trim();
    let value = variables[trimmedKey] ?? defaultVariables[trimmedKey];
    if (value === undefined || value === null) { return 'null'; }
    value = formatIfDate(trimmedKey, value);
    return value;
  });
};

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function randomString(length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let result = '';

  for (let i = 0; i < length; i++) {
    result += CHARS[bytes[i] % CHARS.length];
  }

  return result;
}

export function generateRandomString(): string {
  const raw = randomString(10);
  return `${raw.slice(0, 3)}-${raw.slice(3, 6)}-${raw.slice(6)}`;
}

export function getSkipLimit(page?: number, limit?: number): { skip: number; limit: number } {
  const defaultPage = page ? Number(page) : 1;
  const defaultLimit = limit ? Number(limit) : 10;
  return { skip: (defaultPage - 1) * defaultLimit, limit: defaultLimit };
}

function getKeyCamelCaseToSnakeCase(key: string): string {
  return key.replace(/([A-Z])/g, '_$1').toLowerCase();
}

export function getDefaultSortKeyAndOrder(sortKey?: string, sortOrder?: string): { sortKey: string; sortOrder: string } {
  return { sortKey: getKeyCamelCaseToSnakeCase(sortKey || 'packetCreatedAt'), sortOrder: (sortOrder || 'desc') };
}

export function generateShortCode() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const parts = [];
  for (let i = 0; i < 3; i++) {
    let part = '';
    for (let j = 0; j < 3; j++) {
      part += chars[Math.floor(Math.random() * chars.length)];
    }
    parts.push(part);
  }
  return { shortCode: parts.join('-') };
}
export function sanitizeName(name: string): string {
  const sanitizedName = name.replace(/[^a-zA-Z0-9\s]/g, '');
  return sanitizedName;
}

export function cleanHTML(html: String): string {
  // 1. Decode HTML entities
  try {
    const decodedHtml = html
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');

    // 2. Remove HTML tags but preserve line breaks and spaces
    const cleanText = decodedHtml
      .replace(/<pre>|<\/pre>/g, '\n') // Keep new lines from <pre>
      .replace(/<code>|<\/code>/g, '') // Remove <code> tags but keep content
      .replace(/<\/?[^>]+(>|$)/g, '') // Remove all remaining HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim(); // Remove leading/trailing spaces

    return cleanText;
  } catch (e) {
    console.error('Error cleaning HTML:', e, 'Input:', html, 'Output:', '');
    return ''; 
  }
}

export function generateSHA(filePath: string): string {
  const fileBuffer = readFileSync(filePath);
  return createHash('sha256').update(fileBuffer).digest('hex');
}
export function formatName(name: string): string {
  let userName = name.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const titles = ['Mr.', 'Mr ', 'MR.', 'Ms.', 'MS.', 'MRS.', 'Mrs.', 'MISS.', 'Miss'];
  for (const title of titles) {
    userName = userName.replace(new RegExp(`^${title}\\s+`, 'i'), '').trim();
  }
  const words = userName.split(' ');
  const formattedWords = words.map((word, _index) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  return formattedWords.join(' ');
}