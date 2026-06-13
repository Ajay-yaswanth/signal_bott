export function isSpreadAllowed({
  spreadPoints,
  minimum = 0,
  maximum,
}: {
  spreadPoints: number;
  minimum?: number;
  maximum: number;
}) {
  return spreadPoints >= minimum && spreadPoints <= maximum;
}

function isHourInWindow(hour: number, start: number, end: number) {
  return start <= end
    ? hour >= start && hour < end
    : hour >= start || hour < end;
}

export function isSessionActive({
  at,
  trade24Five = true,
  londonStartUtc = 7,
  londonEndUtc = 16,
  newYorkStartUtc = 12,
  newYorkEndUtc = 21,
}: {
  at: Date;
  trade24Five?: boolean;
  londonStartUtc?: number;
  londonEndUtc?: number;
  newYorkStartUtc?: number;
  newYorkEndUtc?: number;
}) {
  const day = at.getUTCDay();
  const hour = at.getUTCHours();

  if (trade24Five) {
    if (day === 6) return false;
    if (day === 0 && hour < 22) return false;
    if (day === 5 && hour >= 21) return false;
    return true;
  }

  return (
    isHourInWindow(hour, londonStartUtc, londonEndUtc) ||
    isHourInWindow(hour, newYorkStartUtc, newYorkEndUtc)
  );
}
