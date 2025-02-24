export const formatToShortRupiah = (number) => {
  if (number >= 1000000000) {
    return `Rp ${(number / 1000000000).toFixed(1)} Miliar`;
  }
  if (number >= 1000000) {
    return `Rp ${(number / 1000000).toFixed(1)} Juta`;
  }
  if (number >= 1000) {
    return `Rp ${(number / 1000).toFixed(1)} Ribu`;
  }
  return `Rp ${number}`;
};
