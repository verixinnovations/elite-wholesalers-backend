export enum Currency {
  AUD = 'AUD',
  USD = 'USD',
  EUR = 'EUR',
}

export const NumberFunctions = {
  formatNumber(value: number) {
    const formatter = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return formatter.format(value);
  },

  formatCompactNumber(value: number) {
    const num = Number(value);
    if (isNaN(num)) return String(value);
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(num);
  },

  formatCurrency(value: number, currency = `${Currency.AUD}`) {
    const formattedNumber = Number(value);
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currencyDisplay: 'narrowSymbol',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      roundingMode: 'trunc',
    });
    return formatter.format(formattedNumber);
  },

  maskNumber: (text: string) => {
    const masked = text
      .slice(text.length - 9, text.length)
      .split('')
      .map((i, index) => (index < 5 ? (i = '*') : i));
    return {
      masked: masked.join(''),
      actual: text,
    };
  },
};
