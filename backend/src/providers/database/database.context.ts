import { AsyncLocalStorage } from "node:async_hooks";

export const databaseContext = new AsyncLocalStorage<string>();

export const getAcademicYear = () => {
  return databaseContext.getStore();
};
