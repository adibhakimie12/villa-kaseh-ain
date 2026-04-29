export function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(value: string | Date, days: number) {
  const date = typeof value === 'string' ? new Date(`${value}T00:00:00`) : new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

export function eachDateInRange(start: string, end: string) {
  const dates: string[] = [];
  if (!start || !end) return dates;

  let current = new Date(`${start}T00:00:00`);
  const final = new Date(`${end}T00:00:00`);

  while (current <= final) {
    dates.push(toIsoDate(current));
    current = addDays(current, 1);
  }

  return dates;
}

export function eachNightInStay(start: string, end: string) {
  const dates: string[] = [];
  if (!start || !end) return dates;

  let current = new Date(`${start}T00:00:00`);
  const checkout = new Date(`${end}T00:00:00`);

  while (current < checkout) {
    dates.push(toIsoDate(current));
    current = addDays(current, 1);
  }

  return dates;
}

export function monthMatrix(anchorDate: Date) {
  const start = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const firstDay = start.getDay();
  const matrixStart = addDays(start, -firstDay);
  return Array.from({ length: 42 }, (_, index) => addDays(matrixStart, index));
}

export function formatLongDate(value: string) {
  return new Intl.DateTimeFormat('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}
