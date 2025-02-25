export const formatToShortRupiah = (number) => {
  if (number >= 1000000000) {
    const value = number / 1000000000;
    return `Rp ${value % 1 === 0 ? Math.floor(value) : value.toFixed(1)} Miliar`;
  }
  if (number >= 1000000) {
    const value = number / 1000000;
    return `Rp ${value % 1 === 0 ? Math.floor(value) : value.toFixed(1)} Juta`;
  }
  if (number >= 1000) {
    const value = number / 1000;
    return `Rp ${value % 1 === 0 ? Math.floor(value) : value.toFixed(1)} Ribu`;
  }
  return `Rp ${number}`;
};
