import dayjs from 'dayjs';

export function getSkipLimit(page?: number, limit?: number): { skip: number; limit: number } {
  const defaultPage = page ? Number(page) : 1;
  const defaultLimit = limit ? Number(limit) : 10;
  return { skip: (defaultPage - 1) * defaultLimit, limit: defaultLimit };
}

function getKeyCamelCaseToSnakeCase(key: string): string {
  return key.replace(/([A-Z])/g, '_$1').toLowerCase();
}

export function getDefaultSortKeyAndOrder(sortKey?: string, sortOrder?: string): { sortKey: string; sortOrder: string } {
  return { sortKey: getKeyCamelCaseToSnakeCase(sortKey || 'packetCreatedAt'), sortOrder: (sortOrder || 'desc') };
}

export function getFromToDate(fromDate?: string, toDate?: string, hours = 2): { fromDate: number; toDate: number } {
  return {
    fromDate: fromDate ? dayjs(fromDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ').valueOf() : dayjs().subtract(hours, 'hours').utc().valueOf(),
    toDate: toDate ? dayjs(toDate, 'YYYY-MM-DDTHH:mm:ss.SSSZ').valueOf() : dayjs().utc().valueOf(),
  };
}