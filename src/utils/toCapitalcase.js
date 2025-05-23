// Fungsi untuk mengubah string menjadi Title Case (huruf pertama setiap kata kapital)
export const toCapitalCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
