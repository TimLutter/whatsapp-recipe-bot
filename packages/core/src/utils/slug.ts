export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[äöü]/g, (char) => {
      const map: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue' };
      return map[char] || char;
    })
    .replace(/ß/g, 'ss')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}