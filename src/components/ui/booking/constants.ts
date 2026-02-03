export const OPTIONS = [
  { label: "1 Game", value: 1, price: 12.99 },
  { label: "2 Games", value: 2, price: 20 },
  { label: "3 Games", value: 3, price: 26 },
] as const;

export const SLOTS = [
  { t: "6:00 am" },
  { t: "6:30 am", off: true },
  { t: "7:00 am" },
  { t: "7:30 am" },
  { t: "8:00 am" },
  { t: "8:30 am" },
  { t: "9:00 am" },
  { t: "9:30 am" },
  { t: "10:00 am" },
  { t: "10:30 am" },
  { t: "11:00 am", off: true },
  { t: "11:30 am" },
  { t: "12:00 pm" },
  { t: "12:30 pm" },
  { t: "1:00 pm" },
  { t: "1:30 pm" },
] as const;

export const SHIFT = [
  { id: 1, label: "Morning" },
  { id: 2, label: "Afternoon" },
  { id: 3, label: "Evening" },
] as const;
