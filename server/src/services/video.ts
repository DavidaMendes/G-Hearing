import { MusicDetectionService } from './music-detection.js';
import { FFmpegService } from './ffmpeg.js';
import { AudioCutterService } from './audio-cutter.js';
import { AuddService } from './audd.js';

export class VideoService {
	private musicDetectionService: MusicDetectionService;
	private ffmpegService: FFmpegService;
	private audioCutterService: AudioCutterService;
	private auddService: AuddService;

	constructor() {
		this.musicDetectionService = new MusicDetectionService();
		this.ffmpegService = new FFmpegService();
		this.audioCutterService = new AudioCutterService();
		this.auddService = new AuddService();
	}

	async processVideo(videoPath: string, title: string, userId: number) {
		let audioPath: string | null = null;
		let cutFiles: string[] = [];

		try {
			console.log(`🎬 Processando vídeo: ${videoPath}`);
			console.log(`📝 Título: ${title}`);
			console.log(`👤 User ID: ${userId}`);

			// 1. Extrair áudio do vídeo
			audioPath = await this.ffmpegService.extractAudio(videoPath);
			console.log(`🎵 Áudio extraído: ${audioPath}`);

			// 2. Detectar segmentos de música no áudio
			const segments = await this.musicDetectionService.detectSegments(audioPath);
			console.log(`✅ Segmentos detectados: ${segments.length}`);

			if (segments.length === 0) {
				return {
					success: true,
					message: 'Nenhuma música detectada no vídeo',
					segments: [],
					recognizedSongs: [],
					videoPath,
					audioPath
				};
			}

			segments.forEach((segment, index) => {
				console.log(`   ${index + 1}. ${segment[0]} - ${segment[1]}`);
			});

			// 3. Recortar áudio nos timestamps dos segmentos
			cutFiles = await this.audioCutterService.cutAllSegments(audioPath, segments);
			console.log(`✂️ ${cutFiles.length} segmentos recortados`);

			// 4. Enviar cada recorte para audd.io
			const recognitionResults = await this.auddService.recognizeAllSegments(cutFiles);

			// 5. Processar resultados
			const recognizedSongs = recognitionResults
				.map((result, index) => ({
					segment: segments[index],
					recognition: result
				}))
				.filter((item) => item.recognition.status === 'success');

			console.log(
				`🎵 ${recognizedSongs.length} músicas reconhecidas de ${segments.length} segmentos`
			);

			return {
				success: true,
				message: `${recognizedSongs.length} músicas reconhecidas de ${segments.length} segmentos`,
				segments,
				recognizedSongs,
				videoPath,
				audioPath
			};
		} catch (error) {
			console.error('Erro ao processar vídeo:', error);
			return {
				success: false,
				message: `Erro ao processar vídeo: ${
					error instanceof Error ? error.message : 'Erro desconhecido'
				}`,
				segments: [],
				recognizedSongs: [],
				videoPath,
				audioPath
			};
		} finally {
			// Limpar arquivos temporários
			if (audioPath) {
				await this.ffmpegService.cleanupFile(audioPath);
			}
			if (cutFiles.length > 0) {
				await this.audioCutterService.cleanupFiles(cutFiles);
			}
		}
	}
}
