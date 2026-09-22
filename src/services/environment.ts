import { Environment } from '../types';

export function substituteVariables(text: string, environment?: Environment | null): string {
  if (!text || !environment) return text;

  let result = text;
  environment.variables
    .filter((v) => v.enabled && v.key.trim())
    .forEach((v) => {
      const regex = new RegExp(`{{\\s*${v.key.trim()}\\s*}}`, 'g');
      result = result.replace(regex, v.value);
    });

  return result;
}

export function buildFullUrl(url: string, params: { key: string; value: string; enabled: boolean }[]): string {
  const activeParams = params.filter((p) => p.enabled && p.key.trim());
  if (activeParams.length === 0) return url;

  const delimiter = url.includes('?') ? '&' : '?';
  const query = activeParams
    .map((p) => `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(p.value.trim())}`)
    .join('&');

  return `${url}${delimiter}${query}`;
}
