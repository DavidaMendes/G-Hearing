import { PrismaClient, type Music } from '../generated/prisma/index.js';
import fs from 'fs';

const prisma = new PrismaClient();

export interface VideoData {
	title: string;
	filePath: string;
	audioPath?: string;
	duration?: number;
	fileSize?: bigint;
	userId: number;
}

export interface MusicData {
	title: string;
	artist: string;
	album?: string;
	releaseDate?: string;
	label?: string;
	isrc: string;
	songLink?: string;
	appleMusicId?: string;
	spotifyId?: string;
	genre: string[];
	keyWords: string[];
}

export interface VideoMusicRelation {
	videoId: number;
	musicId: number;
	startTime: string;
	endTime: string;
	audioSegmentPath?: string;
}

export class DatabaseService {
	async createVideo(videoData: VideoData) {
		console.log(`💾 Criando vídeo no banco: ${videoData.title}`);

		const video = await prisma.video.create({
			data: {
				title: videoData.title,
				file_path: videoData.filePath,
				audio_path: videoData.audioPath || null,
				duration: videoData.duration || null,
				file_size: videoData.fileSize || null,
				user_id: videoData.userId,
				processing_status: 'processing'
			}
		});

		console.log(`✅ Vídeo criado com ID: ${video.id}`);
		return video;
	}

	async updateVideoStatus(videoId: number, status: string, unrecognizedCount?: number) {
		console.log(`🔄 Atualizando status do vídeo ${videoId}: ${status}`);

		const updateData: any = { processing_status: status };
		if (unrecognizedCount !== undefined) {
			updateData.unrecognized_count = unrecognizedCount;
		}

		const video = await prisma.video.update({
			where: { id: videoId },
			data: updateData
		});

		console.log(`✅ Status atualizado: ${video.processing_status}`);
		return video;
	}

	async updateVideoAudioPath(videoId: number, audioPath: string) {
		console.log(`🎵 Salvando caminho do áudio para vídeo ${videoId}: ${audioPath}`);

		const video = await prisma.video.update({
			where: { id: videoId },
			data: { audio_path: audioPath }
		});

		console.log(`✅ Caminho do áudio salvo: ${video.audio_path}`);

		return video;
	}

	async createMusic(musicData: MusicData) {
		console.log(`🎵 Buscando/criando música: ${musicData.artist} - ${musicData.title}`);

		let music = await prisma.music.findUnique({
			where: { isrc: musicData.isrc }
		});

		if (!music) {
			console.log(`➕ Criando nova música no banco`);
			music = await prisma.music.create({
				data: {
					title: musicData.title,
					artist: musicData.artist,
					album: musicData.album || null,
					release_date: musicData.releaseDate || null,
					label: musicData.label || null,
					isrc: musicData.isrc,
					song_link: musicData.songLink || null,
					apple_music_id: musicData.appleMusicId || null,
					spotify_id: musicData.spotifyId || null,
					genre: musicData.genre || [],
					key_words: musicData.keyWords || []
				}
			});
			console.log(`✅ Música criada com ID: ${music.id}`);
		} else {
			console.log(`♻️ Música já existe com ID: ${music.id}`);
		}

		return music;
	}

	async findMusicsByVideoId(videoId: number): Promise<Music[]>{
		return await prisma.music.findMany({
			where: { video_musics: { some: { video_id: videoId } } }
		});
	}

	async findMusicsWithTimingByVideoId(videoId: number) {
		return await prisma.videoMusic.findMany({
			where: { video_id: videoId },
			include: {
				music: true
			},
			orderBy: { start_time: 'asc' }
		});
	}

	async createVideoMusicRelation(relation: VideoMusicRelation) {
		console.log(`🔗 Criando relação vídeo-música: ${relation.videoId} ↔ ${relation.musicId}`);

		const videoMusic = await prisma.videoMusic.create({
			data: {
				video_id: relation.videoId,
				music_id: relation.musicId,
				start_time: relation.startTime,
				end_time: relation.endTime,
				audio_segment_path: relation.audioSegmentPath || null
			}
		});

		console.log(`✅ Relação criada com ID: ${videoMusic.id}${relation.audioSegmentPath ? ` (áudio: ${relation.audioSegmentPath})` : ''}`);
		return videoMusic;
	}

	async getVideoWithMusics(videoId: number) {
		return await prisma.video.findUnique({
			where: { id: videoId },
			include: {
				video_musics: {
					include: {
						music: true
					}
				},
				user: {
					select: {
						id: true,
						name: true,
						email: true
					}
				}
			}
		});
	}

	async getAllVideos(userId?: number) {
		const where = userId ? { user_id: userId } : {};

		return await prisma.video.findMany({
			where,
			include: {
				video_musics: {
					include: {
						music: true
					}
				},
				user: {
					select: {
						id: true,
						name: true,
						email: true
					}
				}
			},
			orderBy: { created_at: 'desc' }
		});
	}

	async deleteVideo(videoId: number) {
		console.log(`🗑️ Deletando vídeo: ${videoId}`);

		const video = await prisma.video.findUnique({
			where: { id: videoId }
		});

		if (video) {
			if (fs.existsSync(video.file_path)) {
				fs.unlinkSync(video.file_path);
				console.log(`🗑️ Arquivo de vídeo removido: ${video.file_path}`);
			}

			if (video.audio_path && fs.existsSync(video.audio_path)) {
				fs.unlinkSync(video.audio_path);
				console.log(`🗑️ Arquivo de áudio removido: ${video.audio_path}`);
			}
		}

		await prisma.video.delete({
			where: { id: videoId }
		});

		console.log(`✅ Vídeo deletado: ${videoId}`);
	}
}
