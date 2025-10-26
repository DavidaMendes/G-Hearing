import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';


type ExecResult = { code: number | null; stdout: string; stderr: string };

function run(cmd: string, args: string[], cwd?: string): Promise<ExecResult> {
	return new Promise((resolve) => {
	  const child = spawn(cmd, args, { cwd });
	  let stdout = '';
	  let stderr = '';
	  child.stdout.on('data', (d) => (stdout += d.toString()));
	  child.stderr.on('data', (d) => (stderr += d.toString()));
	  child.on('close', (code) => resolve({ code, stdout, stderr }));
	});
  }

function ensureDir(dir: string) {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

export class FFmpegService {
  /**
   * Regras:
   * - MXF com 1 stream de áudio: extrai esse único stream e retorna [path].
   * - MXF com múltiplos streams e que contenha streams absolutos #0:4 e #0:5 do tipo áudio: extrai apenas esses dois e retorna [path4, path5] dentro de "streams/".
   * - Caso contrário: lança erro "MXF inválido".
   */
	async extractAudioFromMXF(videoPath: string): Promise<string[]> {

		const ext = path.extname(videoPath).toLowerCase();
		if (ext !== '.mxf') {
		  throw new Error('Arquivo não é MXF.');
		}
		

		const audioPath = videoPath.replace(/\.[^/.]+$/, '.wav');

		console.log(`🎬 Extraindo áudio de MXF: ${videoPath}`);
		console.log(`🎵 Para: ${audioPath}`);

		const probe = await run('ffprobe', [
			'-v', 'error',
			'-show_streams',
			'-of', 'json',
			videoPath,
		]);

		if (probe.code !== 0) {
			throw new Error(`Falha no ffprobe: ${probe.stderr || 'desconhecido'}`);
		}

		type FFprobeStream = { index: number; codec_type?: string };

		let streams: FFprobeStream[] = [];
		
		try {
			const parsed = JSON.parse(probe.stdout);
			streams = (parsed?.streams ?? []) as FFprobeStream[];
		} catch {
		throw new Error('Não foi possível ler a saída do ffprobe.');
		}
	
		const audioStreams = streams.filter((s) => s.codec_type === 'audio');
		const hasA4 = streams.some((s) => s.index === 4 && s.codec_type === 'audio');
		const hasA5 = streams.some((s) => s.index === 5 && s.codec_type === 'audio');
	
		if (audioStreams.length === 0) {
		throw new Error('MXF sem streams de áudio.');
		}		
		
		const baseDir = path.dirname(videoPath);
		const outDir = path.join(baseDir, 'streams');
		ensureDir(outDir);

		const extractMultiple = async (maps: Array<{ map: string; out: string }>) => {
			const args: string[] = ['-y', '-i', videoPath];
			for (const m of maps) {
			  args.push('-map', m.map, '-c', 'copy', m.out);
			}
			const r = await run('ffmpeg', args);
			if (r.code !== 0) {
			  throw new Error(`FFmpeg falhou ao extrair áudio: ${r.stderr || 'erro desconhecido'}`);
			}
			return maps.map((m) => path.resolve(m.out));
		};
	  
		// Caso 1: apenas 1 stream de áudio
		if (audioStreams.length === 1) {
		const only = audioStreams[0]!.index; // índice absoluto do único stream de áudio
		const outFile = path.join(outDir, this.makeOutName(videoPath, `A${only}`));
		console.log(`🎵 Extraindo único stream de áudio (#0:${only}) → ${outFile}`);
		return await extractMultiple([{ map: `0:${only}`, out: outFile }]);
		}
	  
		// Caso 2: multistream e especificamente #0:4 e #0:5 são de áudio
		if (hasA4 && hasA5) {
		const out4 = path.join(outDir, this.makeOutName(videoPath, 'Stream4'));
		const out5 = path.join(outDir, this.makeOutName(videoPath, 'Stream5'));
		console.log(`🎵 Extraindo streams #0:4 e #0:5 → ${out4}, ${out5}`);
		return await extractMultiple([
			{ map: '0:4', out: out4 },
			{ map: '0:5', out: out5 },
		]);
		}
	  
		// Outros casos: inválido para o seu fluxo
		throw new Error('MXF inválido: não é stream único nem possui as trilhas #0:4 e #0:5 de áudio.');
	}

	private makeOutName(inputPath: string, suffix: string) {
		const base = path.basename(inputPath, path.extname(inputPath));
		return `${suffix}_${base}.wav`;
	}

	async cleanupFile(filePath: string): Promise<void> {
		try {
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
				console.log(`🗑️ Arquivo removido: ${filePath}`);
			}
		} catch (error) {
			console.error('Erro ao remover arquivo:', error);
		}
	}
}
