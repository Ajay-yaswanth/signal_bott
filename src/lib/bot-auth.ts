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

export function isAuthorizedBotRequest(request: Request) {
  const expectedApiKey = process.env.ULTRON_BOT_API_KEY;

  if (!expectedApiKey) {
    return false;
  }

  const authorization = request.headers.get("authorization");
  const bearerApiKey = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : null;
  const receivedApiKey = request.headers.get("x-api-key") ?? bearerApiKey;

  return Boolean(receivedApiKey && safeEqual(expectedApiKey, receivedApiKey));
}
