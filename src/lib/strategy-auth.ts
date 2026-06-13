import "server-only";

import { timingSafeEqual } from "node:crypto";

function safeEqual(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected, "utf8");
  const receivedBuffer = Buffer.from(received, "utf8");

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export function isAuthorizedStrategyRequest(request: Request) {
  const expectedApiKey = process.env.ULTRON_STRATEGY_API_KEY;

  if (!expectedApiKey) return false;

  const authorization = request.headers.get("authorization");
  const bearerApiKey = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : null;
  const receivedApiKey = request.headers.get("x-api-key") ?? bearerApiKey;

  return Boolean(receivedApiKey && safeEqual(expectedApiKey, receivedApiKey));
}

export function isAuthorizedCronRequest(request: Request) {
  const expectedSecret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");

  return Boolean(
    expectedSecret &&
      authorization &&
      safeEqual(`Bearer ${expectedSecret}`, authorization),
  );
}
