import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
export const getISOString = (): string => new Date().toISOString();

export function getPastTimeperiod(date: string, days = 1) {
  const today = dayjs(date);

  const previousStartTime = today.clone().subtract(days * 2, 'days');
  const previousEndTime = today.clone().subtract(days, 'days');

  return {
    start: { start: previousStartTime.toDate(), end: previousEndTime.toDate() },
    end: { start: previousEndTime.toDate(), end: today.toDate() },
  };
}

export const getISTDayEndSeconds = () => {
  const now = new Date();

  // IST offset in minutes: +5:30
  const istNow = new Date(now.getTime() + (330 - now.getTimezoneOffset()) * 60000);
  const istEnd = new Date(istNow);
  istEnd.setHours(23, 59, 0, 0);

  const seconds = Math.max(1, Math.floor((istEnd.getTime() - istNow.getTime()) / 1000));

  return seconds;
};

export function convertUtcToIstFileName(dateUtc: string): string {
  return dayjs.utc(dateUtc).utcOffset(330).format('YYYY-MM-DD_HH_mm_ss');
}

export function convertUtcToIst(dateUtc: Date | number): string {
  return dayjs.utc(dateUtc).utcOffset(330).format('YYYY-MM-DD HH:mm:ss');
}

export function getFromToDate(fromDate?: string, toDate?: string, hours = 2): { fromDate: number; toDate: number } {
  return {
    fromDate: fromDate ? dayjs(fromDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ').valueOf() : dayjs().subtract(hours, 'hours').utc().valueOf(),
    toDate: toDate ? dayjs(toDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ').valueOf() : dayjs().utc().valueOf(),
  };
}