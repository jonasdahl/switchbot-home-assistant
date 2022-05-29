import { logger } from "./logger";

export function wait(ms: number) {
  logger.debug("Waiting %d ms", ms);
  return new Promise((resolve) => setTimeout(resolve, ms));
}
