function getWeekNumber(date) {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const pastDays = Math.floor((date - firstDay) / 86400000);
  return Math.ceil((pastDays + firstDay.getDay() + 1) / 7);
}

function getWeekRange(week, year) {
  const firstDayOfYear = new Date(year, 0, 1);
  const daysOffset = (week - 1) * 7;

  const start = new Date(firstDayOfYear);
  start.setDate(firstDayOfYear.getDate() + daysOffset);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function getISOWeekRange(week, year) {
  // Jan 4 is always in week 1 (ISO rule)
  const jan4 = new Date(year, 0, 4);

  // Get Monday of week 1
  const dayOfWeek = jan4.getDay() || 7; // Sunday = 7
  const week1Monday = new Date(jan4);
  week1Monday.setDate(jan4.getDate() - (dayOfWeek - 1));
  week1Monday.setHours(0, 0, 0, 0);

  // Calculate target week start (Monday)
  const start = new Date(week1Monday);
  start.setDate(week1Monday.getDate() + (week - 1) * 7);

  // End of week (Sunday)
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}


function getCurrentISOWeek() {
  const today = new Date();
  const temp = new Date(today);
  temp.setHours(0, 0, 0, 0);

  // Thursday determines the week
  temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));

  const week1 = new Date(temp.getFullYear(), 0, 4);
  return {
    week: Math.ceil((((temp - week1) / 86400000) + 1) / 7),
    year: temp.getFullYear()
  };
}



module.exports = { getWeekNumber, getWeekRange, getISOWeekRange, getCurrentISOWeek};