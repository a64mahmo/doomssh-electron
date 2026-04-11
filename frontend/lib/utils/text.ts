/**
 * Shared text rendering utilities for HTML and PDF paths.
 */

/**
 * Splits a string into lines and removes leading bullet markers (*, -, •).
 */
export function parseBullets(text: string): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.replace(/^[•\-*]\s*/, "").trim())
    .filter(Boolean);
}

/**
 * Tokenizes markdown-style **bold** and _italic_ text.
 */
export type MdToken = {
  text: string;
  bold?: boolean;
  italic?: boolean;
};

export type MdLine = {
  type: 'paragraph' | 'bullet';
  content: string;
};

export function parseMdLines(text: string): MdLine[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      const isBullet = trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ");
      return {
        type: (isBullet ? 'bullet' : 'paragraph') as 'bullet' | 'paragraph',
        content: isBullet ? trimmed.replace(/^[•\-*]\s*/, "").trim() : line,
      };
    })
    .filter((l) => l.content.length > 0);
}

export function tokenizeMd(text: string): MdToken[] {
  if (!text) return [];
  
  // Matches **bold** or _italic_
  const regex = /(\*\*.*?\*\*|_.*?_)/g;
  const parts = text.split(regex);
  
  return parts.map(part => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return { text: part.slice(2, -2), bold: true };
    }
    if (part.startsWith('_') && part.endsWith('_')) {
      return { text: part.slice(1, -1), italic: true };
    }
    return { text: part };
  }).filter(t => t.text.length > 0);
}
