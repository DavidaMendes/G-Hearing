import { MusicDetectionService } from './music-detection.js';
import { FFmpegService } from './ffmpeg.js';
import { AudioCutterService } from './audio-cutter.js';
import { AuddService } from './audd.js';
import { DatabaseService } from './database.js';
import fs from 'fs';

export class VideoService {
	private musicDetectionService: MusicDetectionService;
	private ffmpegService: FFmpegService;
	private audioCutterService: AudioCutterService;
	private auddService: AuddService;
	private databaseService: DatabaseService;

	constructor() {
		this.musicDetectionService = new MusicDetectionService();
		this.ffmpegService = new FFmpegService();
		this.audioCutterService = new AudioCutterService();
		this.auddService = new AuddService();
		this.databaseService = new DatabaseService();
	}

	async processVideo(videoPath: string, title: string, userId: number) {
		let audioPath: string | null = null;
		let cutFiles: string[] = [];
		let videoRecord: any = null;

		try {
			console.log(`🎬 Processando vídeo: ${videoPath}`);
			console.log(`📝 Título: ${title}`);
			console.log(`👤 User ID: ${userId}`);

			const fileStats = fs.statSync(videoPath);
			const fileSize = fileStats.size;

			videoRecord = await this.databaseService.createVideo({
				title,
				filePath: videoPath,
				duration: 0,
				fileSize: BigInt(fileSize),
				userId
			});

			audioPath = await this.ffmpegService.extractAudioFromMXF(videoPath);
			console.log(`🎵 Áudio extraído: ${audioPath}`);

			console.log('🔍 Iniciando detecção de segmentos de música...');
			const segments = await this.musicDetectionService.detectSegments(audioPath);
			console.log(`✅ Segmentos detectados: ${segments.length}`);

			if (segments.length === 0) {
				await this.databaseService.updateVideoStatus(videoRecord.id, 'completed', 0);
				await this.databaseService.updateVideoAudioPath(videoRecord.id, audioPath);
				return {
					success: true,
					message: 'Nenhuma música detectada no vídeo',
					segments: [],
					recognizedSongs: [],
					segmentsCount: 0,
					songsCount: 0,
					videoPath,
					videoId: videoRecord.id
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
				.filter((item) => 
					item.recognition.status === 'success' && 
					item.recognition.result &&
					item.recognition.result.artist &&
					item.recognition.result.title
				);

			const unrecognizedCount = segments.length - recognizedSongs.length;

			console.log(
				`🎵 ${recognizedSongs.length} músicas reconhecidas de ${segments.length} segmentos`
			);

			for (const song of recognizedSongs) {
				const musicData = {
					title: song.recognition.result?.title || '',
					artist: song.recognition.result?.artist || '',
					album: song.recognition.result?.album || '',
					releaseDate: song.recognition.result?.release_date || '',
					label: song.recognition.result?.label || '',
					isrc: song.recognition.result?.isrc || '',
					songLink: song.recognition.result?.song_link || '',
					appleMusicId: song.recognition.result?.apple_music?.id || '',
					spotifyId: song.recognition.result?.spotify?.id || ''
				};

				const music = await this.databaseService.findOrCreateMusic(musicData);

				await this.databaseService.createVideoMusicRelation({
					videoId: videoRecord.id,
					musicId: music.id,
					startTime: song.segment?.[0] || '',
					endTime: song.segment?.[1] || ''
				});
			}

			await this.databaseService.updateVideoStatus(videoRecord.id, 'completed', unrecognizedCount);
			await this.databaseService.updateVideoAudioPath(videoRecord.id, audioPath);

			console.log(`💾 Arquivo de áudio mantido: ${audioPath}`);

			return {
				success: true,
				message: `${recognizedSongs.length} músicas reconhecidas de ${segments.length} segmentos`,
				segments: segments.map(segment => [segment[0], segment[1]]),
				recognizedSongs: recognizedSongs.map(song => ({
					segment: [song.segment?.[0] || '', song.segment?.[1] || ''],
					music: {
						artist: song.recognition.result?.artist,
						title: song.recognition.result?.title,
						album: song.recognition.result?.album,
						release_date: song.recognition.result?.release_date,
						label: song.recognition.result?.label,
						isrc: song.recognition.result?.isrc,
						song_link: song.recognition.result?.song_link
					}
				})),
				segmentsCount: segments.length,
				songsCount: recognizedSongs.length,
				videoPath,
				videoId: videoRecord.id
			};
		} catch (error) {
			console.error('Erro ao processar vídeo:', error);

			if (videoRecord) {
				await this.databaseService.updateVideoStatus(videoRecord.id, 'failed');
			}

			return {
				success: false,
				message: `Erro ao processar vídeo: ${
					error instanceof Error ? error.message : 'Erro desconhecido'
				}`,
				segments: [],
				recognizedSongs: [],
				videoPath,
				audioPath,
				videoId: videoRecord?.id
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
