import { spawn } from 'child_process';
import fs from 'fs';

export class FFmpegService {
	async extractAudioFromMXF(videoPath: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const audioPath = videoPath.replace(/\.[^/.]+$/, '.wav');

			console.log(`🎬 Extraindo áudio de MXF: ${videoPath}`);
			console.log(`🎵 Para: ${audioPath}`);

			const ffmpeg = spawn('ffmpeg', [
				'-i', videoPath,
				'-vn',
				'-acodec', 'pcm_s16le',
				'-ar', '48000',
				'-ac', '2',
				'-af', 'aresample=resampler=soxr',
				'-y',
				audioPath
			]);

			let errorOutput = '';

			ffmpeg.stderr.on('data', (data) => {
				errorOutput += data.toString();
			});

			ffmpeg.on('close', (code) => {
				if (code === 0) {
					console.log('✅ Áudio extraído do MXF com sucesso!');
					resolve(audioPath);
				} else {
					console.error('❌ Erro ao extrair áudio do MXF:', errorOutput);
					reject(new Error(`FFmpeg falhou ao processar MXF: ${errorOutput}`));
				}
			});

			ffmpeg.on('error', (error) => {
				console.error('❌ Erro ao executar FFmpeg no MXF:', error);
				reject(new Error(`Erro ao executar FFmpeg: ${error.message}`));
			});
		});
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
