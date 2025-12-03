import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'G-Hearing API',
			version: '1.0.0',
			description: 'API para reconhecimento de músicas em vídeos. Recebe vídeos enviados, separa o áudio em partes e reconhece a música de cada parte usando a API audd.io.',
			contact: {
				name: 'G-Hearing',
				email: 'adm@ghearing.com'
			}
		},
		servers: [
			{
				url: 'http://localhost:3333',
				description: 'Servidor de desenvolvimento'
			}
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT',
					description: 'Token JWT obtido através do endpoint de autenticação'
				}
			},
			schemas: {
				Error: {
					type: 'object',
					properties: {
						error: {
							type: 'string',
							description: 'Tipo do erro'
						},
						message: {
							type: 'string',
							description: 'Mensagem de erro detalhada'
						}
					}
				},
				AuthRequest: {
					type: 'object',
					required: ['email', 'password'],
					properties: {
						email: {
							type: 'string',
							format: 'email',
							example: 'adm@ghearing.com',
							description: 'Email do usuário'
						},
						password: {
							type: 'string',
							example: 'adm123',
							description: 'Senha do usuário'
						}
					}
				},
				AuthResponse: {
					type: 'object',
					properties: {
						message: {
							type: 'string',
							example: 'Autenticação realizada com sucesso'
						},
						token: {
							type: 'string',
							description: 'Token JWT para autenticação'
						},
						user: {
							type: 'object',
							properties: {
								id: {
									type: 'integer',
									example: 1
								},
								name: {
									type: 'string',
									example: 'Administrador'
								},
								email: {
									type: 'string',
									example: 'adm@ghearing.com'
								}
							}
						}
					}
				},
				Video: {
					type: 'object',
					properties: {
						id: {
							type: 'integer',
							example: 1
						},
						title: {
							type: 'string',
							example: 'Jogadores Pernambucanos Convocados'
						},
						file_path: {
							type: 'string',
							description: 'Caminho do arquivo de vídeo'
						},
						audio_path: {
							type: 'string',
							nullable: true,
							description: 'Caminho do arquivo de áudio extraído'
						},
						duration: {
							type: 'integer',
							nullable: true,
							description: 'Duração em segundos'
						},
						file_size: {
							type: 'integer',
							nullable: true,
							description: 'Tamanho do arquivo em bytes'
						},
						upload_date: {
							type: 'string',
							format: 'date-time',
							description: 'Data de upload do vídeo'
						},
						processing_status: {
							type: 'string',
							enum: ['pending', 'processing', 'completed', 'failed'],
							example: 'completed',
							description: 'Status do processamento'
						},
						unrecognized_count: {
							type: 'integer',
							example: 0,
							description: 'Contagem de segmentos não reconhecidos'
						},
						user_id: {
							type: 'integer',
							example: 1
						},
						musics: {
							type: 'array',
							items: {
								$ref: '#/components/schemas/VideoMusic'
							}
						}
					}
				},
				VideoSummary: {
					type: 'object',
					properties: {
						id: {
							type: 'integer',
							example: 1
						},
						title: {
							type: 'string',
							example: 'Jogadores Pernambucanos Convocados'
						},
						uploadDate: {
							type: 'string',
							format: 'date-time',
							description: 'Data de upload do vídeo'
						},
						processingStatus: {
							type: 'string',
							enum: ['pending', 'processing', 'completed', 'failed'],
							example: 'completed'
						},
						musicCount: {
							type: 'integer',
							example: 5,
							description: 'Quantidade de músicas identificadas'
						}
					}
				},
				Music: {
					type: 'object',
					properties: {
						id: {
							type: 'integer',
							example: 1
						},
						title: {
							type: 'string',
							example: 'Song Title'
						},
						artist: {
							type: 'string',
							example: 'Artist Name'
						},
						album: {
							type: 'string',
							nullable: true,
							example: 'Album Name'
						},
						release_date: {
							type: 'string',
							nullable: true,
							example: '2020-01-01'
						},
						label: {
							type: 'string',
							nullable: true,
							example: 'Record Label'
						},
						isrc: {
							type: 'string',
							example: 'USRC17607839',
							description: 'Código único internacional da música'
						},
						song_link: {
							type: 'string',
							nullable: true,
							description: 'Link para a música'
						},
						apple_music_id: {
							type: 'string',
							nullable: true
						},
						spotify_id: {
							type: 'string',
							nullable: true
						},
						genre: {
							type: 'array',
							items: {
								type: 'string'
							},
							example: ['Pop', 'Rock']
						},
						key_words: {
							type: 'array',
							items: {
								type: 'string'
							},
							example: ['energetic', 'upbeat']
						}
					}
				},
				VideoMusic: {
					type: 'object',
					properties: {
						id: {
							type: 'integer',
							example: 1
						},
						video_id: {
							type: 'integer',
							example: 1
						},
						music_id: {
							type: 'integer',
							example: 1
						},
						start_time: {
							type: 'string',
							example: '00:00',
							description: 'Tempo de início no formato MM:SS'
						},
						end_time: {
							type: 'string',
							example: '00:30',
							description: 'Tempo de fim no formato MM:SS'
						},
						audio_segment_path: {
							type: 'string',
							nullable: true,
							description: 'Caminho do arquivo de áudio cortado'
						},
						music: {
							$ref: '#/components/schemas/Music'
						}
					}
				},
				ProcessVideoResponse: {
					type: 'object',
					properties: {
						message: {
							type: 'string',
							example: 'Vídeo processado com sucesso'
						},
						segments: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									start: {
										type: 'string',
										example: '00:00'
									},
									end: {
										type: 'string',
										example: '00:30'
									}
								}
							}
						},
						recognizedSongs: {
							type: 'array',
							items: {
								$ref: '#/components/schemas/Music'
							}
						},
						segmentsCount: {
							type: 'integer',
							example: 5
						},
						songsCount: {
							type: 'integer',
							example: 3
						},
						videoPath: {
							type: 'string',
							description: 'Caminho do vídeo processado'
						}
					}
				},
				ExportVideoResponse: {
					type: 'object',
					properties: {
						message: {
							type: 'string',
							example: 'EDL gerado com sucesso'
						},
						edlPath: {
							type: 'string',
							description: 'Caminho do arquivo EDL gerado'
						}
					}
				},
				MostUsedMusic: {
					type: 'object',
					properties: {
						music: {
							$ref: '#/components/schemas/Music'
						},
						usageCount: {
							type: 'integer',
							example: 10,
							description: 'Quantidade de vezes que a música foi identificada'
						}
					}
				},
				TracksCountResponse: {
					type: 'object',
					properties: {
						message: {
							type: 'string',
							example: '15 trilha(s) identificada(s) no último mês'
						},
						count: {
							type: 'integer',
							example: 15
						},
						period: {
							type: 'object',
							properties: {
								start: {
									type: 'string',
									format: 'date-time'
								},
								end: {
									type: 'string',
									format: 'date-time'
								}
							}
						}
					}
				},
				HealthCheck: {
					type: 'object',
					properties: {
						status: {
							type: 'string',
							example: 'OK'
						},
						message: {
							type: 'string',
							example: 'Server is running!'
						}
					}
				}
			}
		},
		security: [
			{
				bearerAuth: []
			}
		],
		tags: [
			{
				name: 'Autenticação',
				description: 'Endpoints relacionados à autenticação de usuários'
			},
			{
				name: 'Vídeos',
				description: 'Endpoints para gerenciamento de vídeos e reconhecimento de músicas'
			},
			{
				name: 'Métricas',
				description: 'Endpoints para consulta de métricas e estatísticas'
			},
			{
				name: 'Health',
				description: 'Endpoint para verificação de saúde da API'
			}
		]
	},
	apis: ['./src/config/swagger-docs.ts']
};

export const swaggerSpec = swaggerJsdoc(options);

