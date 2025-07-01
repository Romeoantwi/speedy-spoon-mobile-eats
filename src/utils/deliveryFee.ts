
export const calculateDeliveryFee = (totalItems: number): number => {
  if (totalItems === 0) return 0;
  if (totalItems === 1) return 5;
  if (totalItems === 2) return 8;
  if (totalItems === 3) return 12;
  if (totalItems === 4) return 16;
  if (totalItems >= 5) return 20;
  return 5; // fallback
};

export const getMaxOrderLimit = (): number => 5;

export const isAtMaxOrderLimit = (totalItems: number): boolean => {
  return totalItems >= getMaxOrderLimit();
};
