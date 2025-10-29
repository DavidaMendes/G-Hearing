import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export class MusicDetectionService {
	async detectSegments(audioPath: string): Promise<string[][]> {
		return new Promise((resolve, reject) => {
				const serverRoot = process.cwd();
				const pythonScript = path.join(serverRoot, 'music-detector-broadcast.py');

				// O interpretador Python prioriza o venv do projeto
				const venvPythonWin = path.join(serverRoot, 'venv', 'Scripts', 'python.exe');
				const venvPythonUnix = path.join(serverRoot, 'venv', 'bin', 'python3');
				const pythonExec = fs.existsSync(venvPythonWin)
					? venvPythonWin
					: fs.existsSync(venvPythonUnix)
						? venvPythonUnix
						: process.platform === 'win32'
							? 'python'
							: 'python3';

				const python = spawn(
					pythonExec,
					[pythonScript, audioPath, 'medium'],
					{
						env: {
							...process.env,
							PYTHONIOENCODING: 'utf-8',
							PYTHONUTF8: '1'
						}
					}
				);

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
