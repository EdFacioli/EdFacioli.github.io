export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeZone: 'UTC' }).format(date);

export const readingTime = (body = '') =>
  Math.max(1, Math.round(body.trim().split(/\s+/).length / 200));
