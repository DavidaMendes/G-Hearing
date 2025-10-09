import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export class AudioCutterService {
	private convertTimestamp(timestamp: string): string {
		const parts = timestamp.split(':').map(Number);

		if (parts.length === 2) {
			const [minutes = 0, seconds = 0] = parts;
			const totalSeconds = minutes * 60 + seconds;
			return totalSeconds.toString();
		} else if (parts.length === 3) {
			const [hours = 0, minutes = 0, seconds = 0] = parts;
			const totalSeconds = hours * 3600 + minutes * 60 + seconds;
			return totalSeconds.toString();
		} else {
			return timestamp;
		}
	}

	async cutAudioSegment(
		audioPath: string,
		startTime: string,
		endTime: string,
		outputPath: string
	): Promise<string> {
		return new Promise((resolve, reject) => {
			const startSeconds = this.convertTimestamp(startTime);
			const endSeconds = this.convertTimestamp(endTime);

			const startNum = parseFloat(startSeconds);
			const endNum = parseFloat(endSeconds);

			if (isNaN(startNum) || isNaN(endNum) || startNum < 0 || endNum <= startNum) {
				reject(new Error(`Timestamps inválidos: ${startTime} - ${endTime}`));
				return;
			}

			console.log(`✂️ Recortando áudio: ${startTime} (${startSeconds}s) - ${endTime} (${endSeconds}s)`);

			this.tryCutWithCopy(audioPath, startSeconds, endSeconds, outputPath)
				.then(resolve)
				.catch(() => {
					console.log('🔄 Copy falhou, tentando re-encoding...');
					this.cutWithReencoding(audioPath, startSeconds, endSeconds, outputPath)
						.then(resolve)
						.catch(reject);
				});
		});
	}

	private async tryCutWithCopy(
		audioPath: string,
		startSeconds: string,
		endSeconds: string,
		outputPath: string
	): Promise<string> {
		return new Promise((resolve, reject) => {
			const ffmpeg = spawn('ffmpeg', [
				'-i',
				audioPath,
				'-ss',
				startSeconds,
				'-to',
				endSeconds,
				'-c',
				'copy',
				'-y',
				outputPath
			]);

			let errorOutput = '';

			ffmpeg.stderr.on('data', (data) => {
				errorOutput += data.toString();
			});

			ffmpeg.on('close', (code) => {
				if (code === 0) {
					console.log(`✅ Áudio recortado (copy): ${outputPath}`);
					resolve(outputPath);
				} else {
					reject(new Error(`Copy falhou: ${errorOutput}`));
				}
			});

			ffmpeg.on('error', (error) => {
				reject(new Error(`Erro ao executar FFmpeg: ${error.message}`));
			});
		});
	}

	private async cutWithReencoding(
		audioPath: string,
		startSeconds: string,
		endSeconds: string,
		outputPath: string
	): Promise<string> {
		return new Promise((resolve, reject) => {
			const ffmpeg = spawn('ffmpeg', [
				'-i',
				audioPath,
				'-ss',
				startSeconds,
				'-to',
				endSeconds,
				'-acodec',
				'libmp3lame',
				'-ab',
				'192k',
				'-ar',
				'44100',
				'-y',
				outputPath
			]);

			let errorOutput = '';

			ffmpeg.stderr.on('data', (data) => {
				errorOutput += data.toString();
			});

			ffmpeg.on('close', (code) => {
				if (code === 0) {
					console.log(`✅ Áudio recortado (re-encoding): ${outputPath}`);
					resolve(outputPath);
				} else {
					console.error('❌ Erro ao recortar áudio (re-encoding):');
					console.error('Comando FFmpeg:', `ffmpeg -i "${audioPath}" -ss ${startSeconds} -to ${endSeconds} -acodec libmp3lame -ab 192k -ar 44100 -y "${outputPath}"`);
					console.error('Erro FFmpeg:', errorOutput);
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
