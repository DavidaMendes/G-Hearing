export function parseMmSsToSeconds(time: string): number {
    const [mm, ss] = time.split(':').map(Number);
  
    if (Number.isNaN(mm) || Number.isNaN(ss)) {
      throw new Error(`Invalid time format (expected MM:SS): "${time}"`);
    }
  
    return mm! * 60 + ss!;
  }

export function secondsToTimecode(
    secondsFromZero: number,
    fps = 25,
    baseHours = 1,
  ): string {
    const totalSeconds = baseHours * 3600 + secondsFromZero;
  
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const frames = 0; // como você só tem MM:SS, vamos deixar sempre :00
  
    const pad = (n: number, size = 2) => String(n).padStart(size, '0');
  
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}:${pad(frames)}`;
}
  