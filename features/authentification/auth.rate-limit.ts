type Limit = {
  count: number;
  firstAttempt: number;
};

const limits = new Map<string, Limit>();
const MAX_ATTEMPTS = 5;
const WINDOW_TIME = 60 * 1000;

export function RateLimit(key: string) {
  const now = Date.now();
  const limit = limits.get(key);
  if (!limit) {
    limits.set(key, {
      count: 1,
      firstAttempt: now,
    });
    return;
  }
  const timePassed = now - limit.firstAttempt;
  if (timePassed > WINDOW_TIME) {
    limits.set(key, {
      count: 1,
      firstAttempt: now,
    });
    return;
  }
  limit.count++;
  if (limit.count > MAX_ATTEMPTS) {
    throw new Error("Trop de tentatives. Réessayez plus tard.");
  }
  limits.set(key, limit);
}
