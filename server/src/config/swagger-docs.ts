/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Tipo do erro
 *         message:
 *           type: string
 *           description: Mensagem de erro detalhada
 *     AuthRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: adm@ghearing.com
 *           description: Email do usuário
 *         password:
 *           type: string
 *           example: adm123
 *           description: Senha do usuário
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Autenticação realizada com sucesso
 *         token:
 *           type: string
 *           description: Token JWT para autenticação
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             name:
 *               type: string
 *               example: Administrador
 *             email:
 *               type: string
 *               example: adm@ghearing.com
 *     Video:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Jogadores Pernambucanos Convocados
 *         file_path:
 *           type: string
 *           description: Caminho do arquivo de vídeo
 *         audio_path:
 *           type: string
 *           nullable: true
 *           description: Caminho do arquivo de áudio extraído
 *         duration:
 *           type: integer
 *           nullable: true
 *           description: Duração em segundos
 *         file_size:
 *           type: integer
 *           nullable: true
 *           description: Tamanho do arquivo em bytes
 *         upload_date:
 *           type: string
 *           format: date-time
 *           description: Data de upload do vídeo
 *         processing_status:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *           example: completed
 *           description: Status do processamento
 *         unrecognized_count:
 *           type: integer
 *           example: 0
 *           description: Contagem de segmentos não reconhecidos
 *         user_id:
 *           type: integer
 *           example: 1
 *         musics:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/VideoMusic'
 *     VideoSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Jogadores Pernambucanos Convocados
 *         uploadDate:
 *           type: string
 *           format: date-time
 *           description: Data de upload do vídeo
 *         processingStatus:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *           example: completed
 *         musicCount:
 *           type: integer
 *           example: 5
 *           description: Quantidade de músicas identificadas
 *     Music:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: Song Title
 *         artist:
 *           type: string
 *           example: Artist Name
 *         album:
 *           type: string
 *           nullable: true
 *           example: Album Name
 *         release_date:
 *           type: string
 *           nullable: true
 *           example: '2020-01-01'
 *         label:
 *           type: string
 *           nullable: true
 *           example: Record Label
 *         isrc:
 *           type: string
 *           example: USRC17607839
 *           description: Código único internacional da música
 *         song_link:
 *           type: string
 *           nullable: true
 *           description: Link para a música
 *         apple_music_id:
 *           type: string
 *           nullable: true
 *         spotify_id:
 *           type: string
 *           nullable: true
 *         genre:
 *           type: array
 *           items:
 *             type: string
 *           example: [Pop, Rock]
 *         key_words:
 *           type: array
 *           items:
 *             type: string
 *           example: [energetic, upbeat]
 *     VideoMusic:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         video_id:
 *           type: integer
 *           example: 1
 *         music_id:
 *           type: integer
 *           example: 1
 *         start_time:
 *           type: string
 *           example: '00:00'
 *           description: Tempo de início no formato MM:SS
 *         end_time:
 *           type: string
 *           example: '00:30'
 *           description: Tempo de fim no formato MM:SS
 *         audio_segment_path:
 *           type: string
 *           nullable: true
 *           description: Caminho do arquivo de áudio cortado
 *         music:
 *           $ref: '#/components/schemas/Music'
 *     ProcessVideoResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Vídeo processado com sucesso
 *         segments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               start:
 *                 type: string
 *                 example: '00:00'
 *               end:
 *                 type: string
 *                 example: '00:30'
 *         recognizedSongs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Music'
 *         segmentsCount:
 *           type: integer
 *           example: 5
 *         songsCount:
 *           type: integer
 *           example: 3
 *         videoPath:
 *           type: string
 *           description: Caminho do vídeo processado
 *     ExportVideoResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: EDL gerado com sucesso
 *         edlPath:
 *           type: string
 *           description: Caminho do arquivo EDL gerado
 *     MostUsedMusic:
 *       type: object
 *       properties:
 *         music:
 *           $ref: '#/components/schemas/Music'
 *         usageCount:
 *           type: integer
 *           example: 10
 *           description: Quantidade de vezes que a música foi identificada
 *     TracksCountResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: 15 trilha(s) identificada(s) no último mês
 *         count:
 *           type: integer
 *           example: 15
 *         period:
 *           type: object
 *           properties:
 *             start:
 *               type: string
 *               format: date-time
 *             end:
 *               type: string
 *               format: date-time
 *     HealthCheck:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: OK
 *         message:
 *           type: string
 *           example: Server is running!
 */

/**
 * @swagger
 * /users/auth:
 *   post:
 *     summary: Autenticar usuário
 *     description: Autentica um usuário e retorna um token JWT para uso nas requisições autenticadas
 *     tags: [Autenticação]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRequest'
 *           example:
 *             email: adm@ghearing.com
 *             password: adm123
 *     responses:
 *       200:
 *         description: Autenticação realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Falha na autenticação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /users/create-admin:
 *   post:
 *     summary: Criar usuário administrador
 *     description: 'Endpoint temporário para criar um usuário administrador padrão'
 *     tags: [Autenticação]
 *     security: []
 *     responses:
 *       200:
 *         description: Usuário admin criado ou já existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Usuário admin criado com sucesso
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Administrador
 *                     email:
 *                       type: string
 *                       example: adm@ghearing.com
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /videos/process:
 *   post:
 *     summary: Processar vídeo
 *     description: Envia um vídeo para processamento. O vídeo será analisado, o áudio será extraído e separado em segmentos, e cada segmento será enviado para a API audd.io para reconhecimento de músicas
 *     tags: [Vídeos]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - video
 *             properties:
 *               title:
 *                 type: string
 *                 example: Jogadores Pernambucanos Convocados
 *                 description: Título do vídeo
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Arquivo de vídeo a ser processado
 *     responses:
 *       200:
 *         description: Vídeo processado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProcessVideoResponse'
 *       400:
 *         description: Erro na requisição (arquivo não encontrado ou dados inválidos)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /videos/{videoId}/export:
 *   post:
 *     summary: Gerar EDL do vídeo
 *     description: Gera um arquivo EDL (Edit Decision List) contendo os timestamps das músicas identificadas no vídeo
 *     tags: [Vídeos]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do vídeo
 *         example: 1
 *     responses:
 *       200:
 *         description: EDL gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ExportVideoResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro na exportação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Listar vídeos e músicas
 *     description: Retorna uma lista completa de todos os vídeos com suas respectivas músicas identificadas
 *     tags: [Vídeos]
 *     responses:
 *       200:
 *         description: Lista de vídeos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 5 vídeo(s) encontrado(s)
 *                 videos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Video'
 *                 total:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /videos/summary:
 *   get:
 *     summary: Lista de vídeos com contagem de músicas
 *     description: Retorna um resumo dos vídeos com a contagem de músicas identificadas em cada um
 *     tags: [Vídeos]
 *     responses:
 *       200:
 *         description: Resumo de vídeos retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 5 vídeo(s) encontrado(s)
 *                 videos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VideoSummary'
 *                 total:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /videos/list:
 *   get:
 *     summary: Lista de vídeos com contagem de músicas (alias)
 *     description: Alias para /videos/summary. Retorna um resumo dos vídeos com a contagem de músicas identificadas
 *     tags: [Vídeos]
 *     responses:
 *       200:
 *         description: Resumo de vídeos retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 5 vídeo(s) encontrado(s)
 *                 videos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VideoSummary'
 *                 total:
 *                   type: integer
 *                   example: 5
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /videos/{videoId}/audios:
 *   get:
 *     summary: Lista músicas do vídeo
 *     description: Retorna todas as músicas identificadas em um vídeo específico
 *     tags: [Vídeos]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do vídeo
 *         example: 1
 *     responses:
 *       200:
 *         description: Músicas encontradas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 3 música(s) encontrada(s)
 *                 musics:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/VideoMusic'
 *       400:
 *         description: ID de vídeo inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Nenhum áudio encontrado para o vídeo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /videos/{videoId}:
 *   delete:
 *     summary: Deletar um vídeo
 *     description: Remove um vídeo e todas as suas músicas associadas do sistema
 *     tags: [Vídeos]
 *     parameters:
 *       - in: path
 *         name: videoId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do vídeo a ser deletado
 *         example: 1
 *     responses:
 *       200:
 *         description: Vídeo deletado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Vídeo deletado com sucesso
 *       400:
 *         description: ID de vídeo inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Vídeo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /metrics/mais-usados:
 *   get:
 *     summary: Trilhas mais usadas
 *     description: Retorna as músicas mais identificadas no sistema, ordenadas por quantidade de uso
 *     tags: [Métricas]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número máximo de resultados a retornar (entre 1 e 100)
 *         example: 10
 *     responses:
 *       200:
 *         description: Lista de músicas mais usadas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 10 música(s) encontrada(s)
 *                 musics:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MostUsedMusic'
 *       400:
 *         description: Parâmetro limit inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /metrics/quantidade-trilhas-ultimo-mes:
 *   get:
 *     summary: Quantidade de trilhas no último mês
 *     description: Retorna a quantidade total de trilhas (músicas) identificadas no último mês
 *     tags: [Métricas]
 *     responses:
 *       200:
 *         description: Quantidade de trilhas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TracksCountResponse'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *     description: Verifica se o servidor está funcionando corretamente
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Servidor está funcionando
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthCheck'
 */

