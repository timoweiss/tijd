import moment from 'moment';

const oneSecond = 1000;
const oneMinute = oneSecond * 60;
const oneHour = oneMinute * 60;
const oneDay = oneHour * 24;

export function getDetailedTimeFromTo(from, to) {
  const then = new Date(from);
  const now = new Date(to);
  const diff = now - then;

  const days = Math.floor(diff / oneDay);
  const diffWithoutDays = diff - (days * oneDay);
  const hours = Math.floor(diffWithoutDays / oneHour);
  const diffWithoutHours = diffWithoutDays - (hours * oneHour);
  const minutes = Math.floor(diffWithoutHours / oneMinute);
  const diffWithoutMinutes = diffWithoutHours - (minutes * oneMinute);
  const seconds = Math.floor(diffWithoutMinutes / oneSecond);

  return {
    days,
    hours,
    minutes,
    seconds,
  };
}

export function getDetailedTimeToNow(from) {
  return getDetailedTimeFromTo(from, Date.now());
}

export const groupBySameday = items => items.reduce(
  (groups, item) => {
    const dayOfYear = moment(item.created).dayOfYear();
    // eslint-disable-next-line
    groups[dayOfYear] = groups[dayOfYear] || [];
    groups[dayOfYear].push(item);
    return groups;
  },
  {});

export const ta = {
  duration: (date, end) => moment(date).from(end || new Date(), true),
  ago: date => moment(date).fromNow(),
};
