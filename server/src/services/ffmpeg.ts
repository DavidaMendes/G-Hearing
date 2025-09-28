import { spawn } from 'child_process';
import fs from 'fs';

export class FFmpegService {
	async extractAudio(videoPath: string): Promise<string> {
		return new Promise((resolve, reject) => {
			const audioPath = videoPath.replace(/\.[^/.]+$/, '.mp3');

			console.log(`🎬 Extraindo áudio de: ${videoPath}`);
			console.log(`🎵 Para: ${audioPath}`);

			const ffmpeg = spawn('ffmpeg', [
				'-i',
				videoPath,
				'-vn',
				'-acodec',
				'mp3',
				'-ab',
				'192k',
				'-ar',
				'44100',
				'-y',
				audioPath
			]);

			let errorOutput = '';

			ffmpeg.stderr.on('data', (data) => {
				errorOutput += data.toString();
			});

			ffmpeg.on('close', (code) => {
				if (code === 0) {
					console.log('✅ Áudio extraído com sucesso!');
					resolve(audioPath);
				} else {
					console.error('❌ Erro ao extrair áudio:', errorOutput);
					reject(new Error(`FFmpeg falhou: ${errorOutput}`));
				}
			});

			ffmpeg.on('error', (error) => {
				console.error('❌ Erro ao executar FFmpeg:', error);
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
