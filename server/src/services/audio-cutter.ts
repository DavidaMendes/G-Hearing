import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export class AudioCutterService {
  private ensureDir(dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  private toSeconds(ts: string): number {
    if (!ts) return NaN;
    if (/^\d+(\.\d+)?$/.test(ts)) return Number(ts);

    const parts = ts.split(':');
    const parseLast = (s: string) => Number(s);

    if (parts.length === 2) {
      const [mm, ss] = parts;
      const m = Number(mm);
      const s = parseLast(ss!);
      return m * 60 + s;
    }
    if (parts.length === 3) {
      const [hh, mm, ss] = parts;
      const h = Number(hh);
      const m = Number(mm);
      const s = parseLast(ss!);
      return h * 3600 + m * 60 + s;
    }
    return NaN;
  }

  private async runFfmpeg(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const ff = spawn('ffmpeg', args);
      let stderr = '';
      ff.stderr.on('data', (d) => (stderr += d.toString()));
      ff.on('close', (code) => (code === 0 ? resolve() : reject(new Error(stderr || `ffmpeg exited ${code}`))));
      ff.on('error', (err) => reject(err));
    });
  }

  /**
   * Cut one segment from `audioPath` into `outputPath`.
   * `segment` is [start, end], where both are strings like "mm:ss(.ms)".
   * Returns the output path.
   */
  async cutAudioSegment(
    audioPath: string,
    segment: [string, string],
    outputPath: string
  ): Promise<string> {
    const [startStr, endStr] = segment;

    const start = this.toSeconds(startStr);
    const end = this.toSeconds(endStr);

    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end <= start) {
      throw new Error(`Invalid segment: [${startStr}, ${endStr}]`);
    }

    const duration = end - start;

    const args = [
      '-v', 'error',
      '-i', audioPath,
      '-ss', String(start),
      '-t', String(duration),
      '-acodec', 'libmp3lame',
      '-ab', '192k',
      '-ar', '44100',
      '-y',
      outputPath,
    ];

    await this.runFfmpeg(args);
    return outputPath;
  }

  /**
   * Cuts all `segments` (each `[start, end]`) from ONE stream file.
   * Creates `<dir>/audios/` if needed and returns the list of output paths.
   */
  async cutAllSegments(audioPath: string, segments: string[][]): Promise<string[]> {
    if (!Array.isArray(segments)) {
      throw new Error('segments must be an array of [start, end]');
    }

    const baseDir = path.dirname(audioPath);
    const outDir = path.join(baseDir, 'audios');
    this.ensureDir(outDir);

    const baseName = path.basename(audioPath, path.extname(audioPath));

    const outputs: string[] = [];
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (!Array.isArray(seg) || seg.length !== 2) {
        throw new Error(`Invalid segment at index ${i}; expected [start, end]`);
      }
      const indexStr = String(i + 1).padStart(2, '0');
      const outFile = path.join(outDir, `segment_${indexStr}_${baseName}.mp3`);

      try {
        const out = await this.cutAudioSegment(audioPath, [seg[0]!, seg[1]!], outFile);
        outputs.push(out);
      } catch (err) {
        console.error(`Falha ao processar segmento ${i + 1} [${seg[0]} - ${seg[1]}]:`, err);
      }
    }

    return outputs;
  }

  async cleanupFiles(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Arquivo removido: ${filePath}`);
        }
      } catch (error) {
        console.error('Erro ao remover arquivo:', error);
      }
    }
  }
}
