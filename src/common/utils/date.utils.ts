export const DateFunctions = {
  formatDate(date: string | Date) {
    date = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    else if (date.toDateString() === yesterday.toDateString())
      return 'Yesterday';
    else
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
  },

  formatNorminalDate(date: string | Date) {
    date = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString())
      return `Today • ${this.getTime(date)}`;
    else if (date.toDateString() === yesterday.toDateString())
      return 'Yesterday';
    else
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
  },

  getTime(date: string | Date) {
    const dateString = new Date(date);
    const time = dateString.toLocaleTimeString([], {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
    return time;
  },
};
