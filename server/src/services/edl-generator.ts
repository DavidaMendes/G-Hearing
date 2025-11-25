import { parseMmSsToSeconds, secondsToTimecode } from '../helpers/edl-timecode.js';
import { DatabaseService } from './database.js';
import fs from 'fs';
import path from 'path';

type GenerateEdlOptions = {
  fps?: number;
  baseHours?: number;
  reelName?: string;
  trackLabel?: string;
  titleOverride?: string;
};

export async function generateEdlForVideo(
  videoId: number,
  options: GenerateEdlOptions = {},
): Promise<string> {
  const databaseService = new DatabaseService();
  
  const videoMusics = await databaseService.findMusicsWithTimingByVideoId(videoId);
  
  if (!videoMusics || videoMusics.length === 0) {
    throw new Error(`No music found for video ID: ${videoId}`);
  }

  const fps = options.fps || 25;
  const baseHours = options.baseHours || 1;
  const reelName = options.reelName || 'TONE:_1000_HZ_@_-20.0_DB.1';
  const trackLabel = options.trackLabel || 'A4';
  const titleOverride = options.titleOverride || `PARODIA_SPORT_GMUSIC_.011_modified.edl`;

  let edlContent = '';
  
  edlContent += `TITLE: ${titleOverride}\n`;
  edlContent += `FCM: NON-DROP FRAME\n`;
  edlContent += `\n`;

  videoMusics.forEach((videoMusic, index) => {
    const entryNumber = String(index + 1).padStart(6, '0');
    
    const startSeconds = parseMmSsToSeconds(videoMusic.start_time);
    const endSeconds = parseMmSsToSeconds(videoMusic.end_time);
    
    const sourceIn = secondsToTimecode(startSeconds, fps, baseHours);
    const sourceOut = secondsToTimecode(endSeconds, fps, baseHours);
    const recordIn = secondsToTimecode(startSeconds, fps, baseHours);
    const recordOut = secondsToTimecode(endSeconds, fps, baseHours);

    edlContent += `${entryNumber} ${reelName} ${trackLabel}     C        ${sourceIn} ${sourceOut} ${recordIn} ${recordOut}\n`;
    
    const musicInfo = `${videoMusic.music.artist}_${videoMusic.music.title}`.replace(/\s+/g, '_').toUpperCase();
    edlContent += `* FROM CLIP NAME: ${musicInfo}\n`;

    if (index < videoMusics.length - 1) {
      edlContent += `\n`;
    }
  });

  const edlFileName = `video_${videoId}_music_edl_${Date.now()}.edl`;
  const edlFilePath = path.join(process.cwd(), 'uploads', edlFileName);

  const uploadsDir = path.dirname(edlFilePath);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  fs.writeFileSync(edlFilePath, edlContent, 'utf8');
  
  console.log(`✅ EDL file generated: ${edlFilePath}`);
  
  return edlFilePath;
}
