export const isNull = (str: any) => str === null;
export const isUndefined = (str: any) => str === undefined;
export const isEmpty = (str: string): boolean =>
  isNull(str) || isUndefined(str) || str.trim().length === 0;
