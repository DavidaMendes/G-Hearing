import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export class AudioCutterService {
	async cutAudioSegment(
		audioPath: string,
		startTime: string,
		endTime: string,
		outputPath: string
	): Promise<string> {
		return new Promise((resolve, reject) => {
			console.log(`✂️ Recortando áudio: ${startTime} - ${endTime}`);

			const ffmpeg = spawn('ffmpeg', [
				'-i',
				audioPath,
				'-ss',
				startTime,
				'-to',
				endTime,
				'-c',
				'copy', // Copiar sem re-encoding para ser mais rápido
				'-y', // Sobrescrever arquivo se existir
				outputPath
			]);

			let errorOutput = '';

			ffmpeg.stderr.on('data', (data) => {
				errorOutput += data.toString();
			});

			ffmpeg.on('close', (code) => {
				if (code === 0) {
					console.log(`✅ Áudio recortado: ${outputPath}`);
					resolve(outputPath);
				} else {
					console.error('❌ Erro ao recortar áudio:', errorOutput);
					reject(new Error(`FFmpeg falhou ao recortar: ${errorOutput}`));
				}
			});

			ffmpeg.on('error', (error) => {
				console.error('❌ Erro ao executar FFmpeg:', error);
				reject(new Error(`Erro ao executar FFmpeg: ${error.message}`));
			});
		});
	}

	async cutAllSegments(audioPath: string, segments: string[][]): Promise<string[]> {
		const cutFiles: string[] = [];
		const baseName = path.basename(audioPath, path.extname(audioPath));
		const outputDir = path.dirname(audioPath);
		if (!segments || !Array.isArray(segments)) {
			throw new Error('segments must be a valid array');
		}

		for (let i = 0; i < segments.length; i++) {
			const segment = segments[i];
			if (!Array.isArray(segment) || segment.length !== 2) {
				throw new Error(`Invalid segment at index ${i}`);
			}
			const [startTime, endTime] = segment;
			const outputPath = path.join(outputDir, `${baseName}_segment_${i + 1}.mp3`);

			try {
				const cutFile = await this.cutAudioSegment(
					audioPath,
					startTime as string,
					endTime as string,
					outputPath
				);
				cutFiles.push(cutFile);
			} catch (error) {
				console.error(`Erro ao recortar segmento ${i + 1}:`, error);
				// Continuar com os outros segmentos mesmo se um falhar
			}
		}

		return cutFiles;
	}

	async cleanupFiles(filePaths: string[]): Promise<void> {
		for (const filePath of filePaths) {
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
}
