export function timeLeft(deadline: Date): number {
  const now = new Date();
  const difference = deadline.getTime() - now.getTime();
  return difference;
}
