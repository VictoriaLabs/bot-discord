export function timeLeft(deadline: Date): number {
  const now: Date = new Date();
  return deadline.getTime() - now.getTime();
}
