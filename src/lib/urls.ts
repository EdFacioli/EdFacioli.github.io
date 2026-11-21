// BASE_URL varia conforme o deploy ("/" ou "/nome-do-repo").
// Este helper garante links corretos nos dois casos.
const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

export const url = (path = '') => {
  const clean = path.replace(/^\/+/, '');
  return clean ? `${base}/${clean}` : `${base}/`;
};
