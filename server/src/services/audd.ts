import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';

export interface AuddResponse {
	status: 'success' | 'error';
	result?: {
		artist: string;
		title: string;
		album?: string;
		release_date?: string;
		label?: string;
		timecode?: string;
		song_link?: string;
		isrc?: string;
		apple_music?: any;
		spotify?: any;
		genre?: string[];
		keyWords?: string[];
	} | undefined;
	error?: string | undefined;
	rawResponse?: any;
}

export class AuddService {
	private apiToken: string;
	private baseUrl: string = 'https://api.audd.io/';

	constructor() {
		this.apiToken = process.env.AUDD_IO_TOKEN || '';
	}

	async recognizeMusic(audioFilePath: string): Promise<AuddResponse> {
		try {
			console.log(`Enviando áudio para audd.io: ${audioFilePath}`);

			if (!fs.existsSync(audioFilePath)) {
				throw new Error(`Arquivo de áudio não encontrado: ${audioFilePath}`);
			}

			const formData = new FormData();
			formData.append('file', fs.createReadStream(audioFilePath));
			formData.append('return', 'apple_music,spotify');
			formData.append('api_token', this.apiToken);

			console.log("api audd", this.baseUrl, this.apiToken)

			const response = await axios.post(this.baseUrl, formData, {
				headers: {
					...formData.getHeaders(),
				},
				timeout: 30000, // 30 sec
			});

			const hasResult = !!response.data.result;

			console.log(`Resposta recebida do audd.io:`, {
				status: response.data.status,
				hasResult: hasResult,
				artist: response.data.result?.artist || 'N/A',
				title: response.data.result?.title || 'N/A',
				isrc: this.extractISRC(response.data.result)
			});

			if (!hasResult) {
				console.log(`Nenhuma música reconhecida pelo audd.io`);
				return {
					status: 'error',
					result: undefined,
					error: 'Nenhuma música reconhecida',
					rawResponse: response.data
				};
			}

			return {
				status: response.data.status,
				result: this.extractMusicInfo(response.data.result),
				rawResponse: response.data
			};

		} catch (error) {
			console.error('Erro ao reconhecer áudio com audd.io:', error);

			if (axios.isAxiosError(error)) {
				console.error('Detalhes do erro HTTP:', {
					status: error.response?.status,
					statusText: error.response?.statusText,
					data: error.response?.data
				});
			}

			return {
				status: 'error',
				result: undefined,
				error: error instanceof Error ? error.message : 'Erro desconhecido'
			};
		}
	}

	async recognizeAllSegments(audioFiles: string[]): Promise<AuddResponse[]> {
		const results: AuddResponse[] = [];

		for (let i = 0; i < audioFiles.length; i++) {
			const audioFile = audioFiles[i];

			if (!audioFile) {
				console.error(`Arquivo de áudio não encontrado no índice ${i + 1}`);
				results.push({
					status: 'error',
					result: undefined,
					error: 'Arquivo de áudio não encontrado'
				});

				continue;
			}

			try {
				const result = await this.recognizeMusic(audioFile);
				results.push(result);

				if (i < audioFiles.length - 1) {
					await new Promise(resolve => setTimeout(resolve, 1000));
				}
			} catch (error) {
				console.error(`Erro ao processar segmento ${i + 1}:`, error);
				results.push({
					status: 'error',
					result: undefined,
					error: error instanceof Error ? error.message : 'Erro desconhecido'
				});
			}
		}

		const successCount = results.filter(r => r.status === 'success').length;
		console.log(`Reconhecimento concluído: ${successCount}/${audioFiles.length} sucessos`);

		return results;
	}

	private extractMusicInfo(auddResult: any): any {
		return {
			artist: auddResult.artist,
			title: auddResult.title,
			album: auddResult.album,
			release_date: auddResult.release_date,
			label: auddResult.label,
			timecode: auddResult.timecode,
			song_link: auddResult.song_link,
			isrc: this.extractISRC(auddResult),
			apple_music: auddResult.apple_music,
			spotify: auddResult.spotify, 
			genre: [],
			keyWords: []
		};
	}

	private extractISRC(auddResult: any): string | undefined {
		return auddResult?.apple_music?.isrc ||
			   auddResult?.spotify?.external_ids?.isrc ||
			   undefined;
	}
}
