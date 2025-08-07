function getDaysOfWeekBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start > end) return [];

  const totalDays = Math.floor((end - start) / 86400000) + 1;
  if (totalDays > 7) return [0, 1, 2, 3, 4, 5, 6];

  const days = [];
  const current = new Date(start);
  for (let i = 0; i < totalDays; i++) {
    const day = (current.getDay() + 6) % 7;
    if (!days.includes(day)) days.push(day);
    current.setDate(current.getDate() + 1);
  }
  return days.sort();
}
