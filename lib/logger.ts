export const logger = {
  info: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.log("INFO", ...args);
  },
  error: (...args: unknown[]) => {
    // eslint-disable-next-line no-console
    console.error("ERROR", ...args);
  },
};


