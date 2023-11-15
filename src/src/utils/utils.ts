// --- Poll --- //
export function calculatePollTimeLeft(endDate: Date): number {
  const today = new Date();
  const diff = endDate.getTime() - today.getTime();
  return diff;
}
