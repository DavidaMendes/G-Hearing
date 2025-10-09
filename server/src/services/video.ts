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

			audioPath = await this.ffmpegService.extractAudioFromMXF(videoPath);
			console.log(`🎵 Áudio extraído: ${audioPath}`);

			console.log('🔍 Iniciando detecção de segmentos de música...');
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

			cutFiles = await this.audioCutterService.cutAllSegments(audioPath, segments);
			console.log(`✂️ ${cutFiles.length} segmentos recortados`);

			const recognitionResults = await this.auddService.recognizeAllSegments(cutFiles);

			const recognizedSongs = recognitionResults
				.map((result, index) => ({
					segment: segments[index],
					recognition: result
				}))
				.filter((item) => item.recognition.status === 'success');

			console.log(
				`🎵 ${recognizedSongs.length} músicas reconhecidas de ${segments.length} segmentos`
			);

			console.log(`💾 Arquivo de áudio mantido: ${audioPath}`);

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
			if (cutFiles.length > 0) {
				console.log(`🗑️ Limpando ${cutFiles.length} segmentos recortados`);
				await this.audioCutterService.cleanupFiles(cutFiles);
			}
			if (audioPath) {
				console.log(`💾 Arquivo de áudio preservado: ${audioPath}`);
			}
		}
	}
}
