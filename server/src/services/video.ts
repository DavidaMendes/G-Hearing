import { MusicDetectionService } from './music-detection.js';
import { FFmpegService } from './ffmpeg.js';
import { AudioCutterService } from './audio-cutter.js';
import { AuddService } from './audd.js';
import { DatabaseService } from './database.js';
import fs from 'fs';
import path from 'path';

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
		let audioPaths: string[] | null = null;
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

			audioPaths = await this.ffmpegService.extractAudioFromMXF(videoPath);
			console.log(`🎵 Áudio(s) extraído(s): ${audioPaths.join(', ')}`);

			console.log('🔍 Iniciando detecção de segmentos de música...');
			let segments: string[][] = [];

			for (const audioPath of audioPaths) {
				segments = await this.musicDetectionService.detectSegments(audioPath);
				console.log(`✅ Segmentos detectados: ${segments.length}`);
				segments.forEach((s, i) => console.log(`   ${i + 1}. ${s[0]} - ${s[1]}`));
			  
				const outFiles = await this.audioCutterService.cutAllSegments(audioPath, segments);
			  }

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
			for (const audioPath of audioPaths) {
				await this.databaseService.updateVideoAudioPath(videoRecord.id, audioPath);
				console.log(`💾 Arquivo de áudio mantido: ${audioPath}`);
			}

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
				audioPaths: audioPaths?.join(', ') || '',
				videoId: videoRecord?.id
			};
		} finally {
			const uploadsDir = path.dirname(videoPath);

			if (fs.existsSync(uploadsDir)) {
				const files = fs.readdirSync(uploadsDir);

				for (const file of files) {
					const filePath = path.join(uploadsDir, file);

					if (fs.statSync(filePath).isFile()) {
						fs.unlinkSync(filePath);
						console.log(`🗑️ Removido: ${file}`);
					}
				}
			}
		}
	}

	async listVideos(userId?: number) {
		try {
			console.log(`🔍 [VideoService] Buscando vídeos${userId ? ` para usuário ID: ${userId}` : ' (todos os usuários)'}`);
			
			const videos = await this.databaseService.getAllVideos(userId);
			
			console.log(`📊 [VideoService] ${videos.length} vídeo(s) encontrado(s) no banco de dados`);
			
			return {
				success: true,
				videos: videos.map(video => ({
					id: video.id,
					title: video.title,
					filePath: video.file_path,
					audioPath: video.audio_path,
					duration: video.duration,
					fileSize: video.file_size ? Number(video.file_size) : null,
					uploadDate: video.upload_date,
					processingStatus: video.processing_status,
					unrecognizedCount: video.unrecognized_count,
					createdAt: video.created_at,
					updatedAt: video.updated_at,
					user: {
						id: video.user.id,
						name: video.user.name,
						email: video.user.email
					},
					musics: video.video_musics.map(vm => ({
						id: vm.id,
						startTime: vm.start_time,
						endTime: vm.end_time,
						music: {
							id: vm.music.id,
							title: vm.music.title,
							artist: vm.music.artist,
							album: vm.music.album,
							releaseDate: vm.music.release_date,
							label: vm.music.label,
							isrc: vm.music.isrc,
							songLink: vm.music.song_link,
							appleMusicId: vm.music.apple_music_id,
							spotifyId: vm.music.spotify_id
						}
					}))
				})),
				total: videos.length
			};
		} catch (error) {
			console.error('❌ [VideoService] Erro ao listar vídeos:', error);
			console.error('   Detalhes:', error instanceof Error ? error.message : 'Erro desconhecido');
			console.error('   Stack:', error instanceof Error ? error.stack : 'N/A');
			return {
				success: false,
				message: `Erro ao listar vídeos: ${
					error instanceof Error ? error.message : 'Erro desconhecido'
				}`,
				videos: [],
				total: 0
			};
		}
	}
}
