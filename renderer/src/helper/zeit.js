
const oneSecond = 1000;
const oneMinute = oneSecond * 60;
const oneHour = oneMinute * 60;
const oneDay = oneHour * 24;

export function getDetailedTimeFromTo(from, to) {
  const then = new Date(from);
  const now = new Date(to);
  const diff = now - then;

  const days = Math.floor(diff / oneDay);
  const diffWithoutDays = diff - days * oneDay;
  const hours = Math.floor(diffWithoutDays / oneHour);
  const diffWithoutHours = diffWithoutDays - hours * oneHour;
  const minutes = Math.floor(diffWithoutHours / oneMinute);
  const diffWithoutMinutes = diffWithoutHours - minutes * oneMinute;
  const seconds = Math.floor(diffWithoutMinutes / oneSecond);

  return {
    days,
    hours,
    minutes,
    seconds
  }

}
