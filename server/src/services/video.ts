import { MusicDetectionService } from './music-detection.js';
import { FFmpegService } from './ffmpeg.js';
import { AudioCutterService } from './audio-cutter.js';
import { AuddService } from './audd.js';
import { DatabaseService } from './database.js';
import { describeAudio, isGeminiAvailable } from './gemini-describer.js';
import type { GeminiMusicData } from './gemini-describer.js';
import fs from 'fs';
import path from 'path';
import { generateEdlForVideo } from './edl-generator.js';
import type { Music } from '../generated/prisma/index.js';

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

			console.log('Iniciando detecção de segmentos de música');
			let segments: string[][] = [];

			for (const audioPath of audioPaths) {
				const audioSegments = await this.musicDetectionService.detectSegments(audioPath);
				console.log(`Segmentos detectados: ${audioSegments.length}`);
				audioSegments.forEach((s, i) => console.log(`${i + 1}. ${s[0]} - ${s[1]}`));
			  
				const outFiles = await this.audioCutterService.cutAllSegments(audioPath, audioSegments);
				
				segments = segments.concat(audioSegments);
				cutFiles = cutFiles.concat(outFiles);
			}

			const recognitionResults = await this.auddService.recognizeAllSegments(cutFiles);

			const processedResults = await Promise.all(
				recognitionResults.map(async (result, index) => {
					const segment = segments[index];
					const cutFile = cutFiles[index];

					if (result.status === 'success' && 
						result.result &&
						result.result.artist &&
						result.result.title) {
						return {
							segment,
							recognition: result,
							source: 'audd',
							audioSegmentPath: cutFile
						};
					}

					if (cutFile && fs.existsSync(cutFile) && isGeminiAvailable()) {
						console.log(`Audd falhou para segmento ${index + 1}, tentando Gemini`);
						try {
							const geminiData = await describeAudio(cutFile);
							
							const geminiResult = {
								status: 'success' as const,
								result: {
									artist: geminiData.artist,
									title: geminiData.title,
									album: geminiData.album,
									release_date: geminiData.releaseDate,
									label: geminiData.label,
									song_link: geminiData.songLink,
									isrc: geminiData.isrc,
									apple_music: geminiData.appleMusicId ? { id: geminiData.appleMusicId } : undefined,
									spotify: geminiData.spotifyId ? { id: geminiData.spotifyId } : undefined,
									genre: geminiData.genre,
									keyWords: geminiData.keyWords
								}
							};

							return {
								segment,
								recognition: geminiResult,
								source: 'gemini',
								audioSegmentPath: cutFile
							};
						} catch (geminiError) {
							console.error(`Gemini também falhou para segmento ${index + 1}:`, geminiError);
							return {
								segment,
								recognition: result,
								source: 'failed',
								audioSegmentPath: cutFile
							};
						}
					}

					return {
						segment,
						recognition: result,
						source: 'failed',
						audioSegmentPath: cutFile
					};
				})
			);

			const recognizedSongs = processedResults
				.filter((item) => 
					item.recognition.status === 'success' && 
					item.recognition.result && 
					item.recognition.result.artist && 
					item.recognition.result.title
				);

			const unrecognizedCount = segments.length - recognizedSongs.length;
			const auddCount = recognizedSongs.filter(song => song.source === 'audd').length;
			const geminiCount = recognizedSongs.filter(song => song.source === 'gemini').length;

			console.log(`Audd: ${auddCount}, Gemini: ${geminiCount}, Não reconhecidas: ${unrecognizedCount}`);

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
					spotifyId: song.recognition.result?.spotify?.id || '',
					genre: song.recognition.result?.genre || [],
					keyWords: song.recognition.result?.keyWords || []
				};

				const music = await this.databaseService.createMusic(musicData);

				await this.databaseService.createVideoMusicRelation({
					videoId: videoRecord.id,
					musicId: music.id,
					startTime: song.segment?.[0] || '',
					endTime: song.segment?.[1] || '',
					...(song.audioSegmentPath && { audioSegmentPath: song.audioSegmentPath })
				});
			}

			await this.databaseService.updateVideoStatus(videoRecord.id, 'completed', unrecognizedCount);
			for (const audioPath of audioPaths) {
				await this.databaseService.updateVideoAudioPath(videoRecord.id, audioPath);
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
						song_link: song.recognition.result?.song_link, 
						genre: song.recognition.result?.genre,
						key_words: song.recognition.result?.keyWords
					},
					source: song.source
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
			if (videoPath && fs.existsSync(videoPath)) {
				try {
					fs.unlinkSync(videoPath);
					console.log(`Arquivo de vídeo removido: ${videoPath}`);
				} catch (error) {
					console.error(`Erro ao remover arquivo de vídeo: ${error}`);
				}
			}
		}
	}

	async getAudiosByVideoId(videoId: number): Promise<Music[]> {
		return await this.databaseService.findMusicsByVideoId(videoId);
	}

	async deleteVideo(videoId: number) {
		try {
			const video = await this.databaseService.getVideoWithMusics(videoId);
			
			if (!video) {
				return {
					success: false,
					message: 'Vídeo não encontrado'
				};
			}

			await this.databaseService.deleteVideo(videoId);

			return {
				success: true,
				message: 'Vídeo deletado com sucesso'
			};
		} catch (error) {
			console.error('Erro ao deletar vídeo:', error);
			return {
				success: false,
				message: `Erro ao deletar vídeo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
			};
		}
	}

	async exportVideo(videoId: number) {
		try {
			const edlPath = await generateEdlForVideo(videoId);
			return {
				success: true,
				message: 'EDL gerado com sucesso',
				edlPath: edlPath
			};
		} catch (error) {
			console.error('Erro ao gerar EDL:', error);
			return {
				success: false,
				message: `Erro ao gerar EDL: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
			};
		}
	}

	async listVideos(userId?: number) {
		try {
			console.log(`Buscando vídeos${userId ? ` para usuário ID: ${userId}` : ' (todos os usuários)'}`);
			
			const videos = await this.databaseService.getAllVideos(userId);
			
			console.log(`${videos.length} vídeo(s) encontrado(s) no banco de dados`);
			
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
						audioSegmentPath: vm.audio_segment_path,
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
			console.error('Erro ao listar vídeos:', error);
			console.error('Detalhes:', error instanceof Error ? error.message : 'Erro desconhecido');
			console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
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

	async listVideosSummary(userId?: number) {
		try {
			console.log(`Buscando resumo de vídeos${userId ? ` para usuário ID: ${userId}` : ' (todos os usuários)'}`);
			
			const videos = await this.databaseService.getAllVideos(userId);
			
			console.log(`${videos.length} vídeo(s) encontrado(s) no banco de dados`);
			
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
					musicCount: video.video_musics.length
				})),
				total: videos.length
			};
		} catch (error) {
			console.error('Erro ao listar resumo de vídeos:', error);
			console.error('Detalhes:', error instanceof Error ? error.message : 'Erro desconhecido');
			console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
			return {
				success: false,
				message: `Erro ao listar resumo de vídeos: ${
					error instanceof Error ? error.message : 'Erro desconhecido'
				}`,
				videos: [],
				total: 0
			};
		}
	}
}
	