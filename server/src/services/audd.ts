export interface AuddResponse {
	status: 'success' | 'error';
	result?: {
		title: string;
		artist: string;
		album?: string;
		release_date?: string;
		label?: string;
		timecode: string;
		song_link?: string;
	};
	error?: string;
}

export class AuddService {
	async recognizeMusic(audioFilePath: string): Promise<AuddResponse> {
		console.log(`🎵 Enviando para audd.io: ${audioFilePath}`);

		await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

		const shouldRecognize = Math.random() < 0.7;

		if (shouldRecognize) {
			const mockSongs = [
				{
					title: 'Bohemian Rhapsody',
					artist: 'Queen',
					album: 'A Night at the Opera',
					release_date: '1975',
					label: 'EMI',
					song_link: 'https://open.spotify.com/track/4u7EnebtmKWzUH433cf5Qv'
				},
				{
					title: 'Hotel California',
					artist: 'Eagles',
					album: 'Hotel California',
					release_date: '1976',
					label: 'Asylum Records',
					song_link: 'https://open.spotify.com/track/40riOy7x9W7GXzGZMy1y5p'
				},
				{
					title: 'Imagine',
					artist: 'John Lennon',
					album: 'Imagine',
					release_date: '1971',
					label: 'Apple Records',
					song_link: 'https://open.spotify.com/track/7pKfPomrE7XiGhQjbgwI7E'
				},
				{
					title: "Sweet Child O' Mine",
					artist: "Guns N' Roses",
					album: 'Appetite for Destruction',
					release_date: '1987',
					label: 'Geffen Records',
					song_link: 'https://open.spotify.com/track/7snQQk1zcKl8gZ92AnueZW'
				},
				{
					title: 'Stairway to Heaven',
					artist: 'Led Zeppelin',
					album: 'Led Zeppelin IV',
					release_date: '1971',
					label: 'Atlantic Records',
					song_link: 'https://open.spotify.com/track/5CQ30WqJwcep0pYcV4AMNc'
				}
			];

			const randomSong = mockSongs[Math.floor(Math.random() * mockSongs.length)];

			return {
				status: 'success',
				result: {
					title: randomSong?.title ?? 'Unknown',
					artist: randomSong?.artist ?? 'Unknown',
					album: randomSong?.album ?? 'Unknown',
					release_date: randomSong?.release_date ?? 'Unknown',
					label: randomSong?.label ?? 'Unknown',
					song_link: randomSong?.song_link ?? 'Unknown',
					timecode: this.generateRandomTimecode()
				}
			};
		} else {
			return {
				status: 'error',
				error: 'Música não reconhecida'
			};
		}
	}

	private generateRandomTimecode(): string {
		const minutes = Math.floor(Math.random() * 5);
		const seconds = Math.floor(Math.random() * 60);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}

	async recognizeAllSegments(audioFiles: string[]): Promise<AuddResponse[]> {
		const results: AuddResponse[] = [];

		console.log(`🎵 Processando ${audioFiles.length} segmentos com audd.io...`);

		for (let i = 0; i < audioFiles.length; i++) {
			console.log(`   Processando segmento ${i + 1}/${audioFiles.length}...`);
			const audioFile = audioFiles[i];
			if (audioFile) {
				const result = await this.recognizeMusic(audioFile);
				results.push(result);
			}
		}

		return results;
	}
}
