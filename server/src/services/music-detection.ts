import { spawn } from 'child_process';
import path from 'path';

export class MusicDetectionService {
	async detectSegments(audioPath: string): Promise<string[][]> {
		return new Promise((resolve, reject) => {
			const pythonScript = path.join(process.cwd(), 'music-recognizer.py');
			const python = spawn('python3', [pythonScript, audioPath]);

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
							const segments = JSON.parse(segmentsMatch[1] || '[]');
							resolve(segments);
						} catch (error) {
							console.error('Erro ao parsear segmentos:', error);
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
