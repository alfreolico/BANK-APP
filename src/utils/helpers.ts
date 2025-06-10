export const generateAccountNumber = (): string => {
  return Math.floor(
    Math.random() * 90000000000000000000 + 10000000000000000000
  ).toString();
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};
