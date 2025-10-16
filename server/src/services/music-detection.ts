import { spawn } from 'child_process';
import path from 'path';

export class MusicDetectionService {
	async detectSegments(audioPath: string): Promise<string[][]> {
		return new Promise((resolve, reject) => {
			const pythonScript = path.join(process.cwd(), 'music-detector-broadcast.py');
			const python = spawn('python3', [pythonScript, audioPath, 'medium']);

			let output = '';
			let errorOutput = '';

			python.stdout.on('data', (data) => {
				output += data.toString();
			});

			python.stderr.on('data', (data) => {
				errorOutput += data.toString();
			});

			python.on('close', (code) => {
				if (code === 0) {
					const segmentsMatch = output.match(/SEGMENTS:(\[.*\])/);
					if (segmentsMatch) {
						try {
							let jsonString = segmentsMatch[1] || '[]';
							jsonString = jsonString.replace(/'/g, '"');
							console.log('JSON string do Python:', jsonString);
							const segments = JSON.parse(jsonString);
							resolve(segments);
						} catch (error) {
							console.error('Erro ao parsear segmentos:', error);
							console.error('Output completo do Python:', output);
							reject(new Error('Erro ao parsear segmentos do Python'));
						}
					} else {
						console.error('Output do Python:', output);
						reject(new Error('Nenhum segmento encontrado no output do Python'));
					}
				} else {
					console.error('Erro do Python:', errorOutput);
					reject(new Error(`Script Python falhou com código ${code}: ${errorOutput}`));
				}
			});

			python.on('error', (error) => {
				console.error('Erro ao executar Python:', error);
				reject(new Error(`Erro ao executar script Python: ${error.message}`));
			});
		});
	}
}
