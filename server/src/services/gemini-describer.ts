import {
    GoogleGenAI,
    createUserContent,
    createPartFromUri,
  } from "@google/genai";
  
  function getGeminiClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. O Gemini é usado como fallback quando o Audd falha.");
    }
    return new GoogleGenAI({ apiKey });
  }

  export function isGeminiAvailable(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }

  export interface GeminiMusicData {
    title: string;
    artist: string;
    album?: string | null;
    releaseDate?: string | null;
    label?: string | null;
    isrc: string;
    songLink?: string | null;
    appleMusicId?: string | null;
    spotifyId?: string | null;
    genre?: string[];
    keyWords?: string[];
  }

  const PROMPT_TEXT = `
  Você é um analisador de áudio musical. Analise este áudio e identifique:
  1. Possíveis gêneros musicais (rock, pop, jazz, eletrônica, etc.)
  2. Palavras-chave descritivas (energético, melancólico, dançante, etc.)
  
  Retorne APENAS um JSON válido no seguinte formato:
  
  {
    "title": "Nome da música (se conseguir identificar) ou 'Música Não Identificada'",
    "artist": "Nome do artista (se conseguir identificar) ou 'Artista Desconhecido'",
    "album": null,
    "releaseDate": null,
    "label": null,
    "isrc": "GEMINI_GENERATED_" + timestamp único,
    "songLink": null,
    "appleMusicId": null,
    "spotifyId": null,
    "genre": ["gênero1", "gênero2", "gênero3"],
    "keyWords": ["palavra-chave1", "palavra-chave2", "palavra-chave3"]
  }
  
  IMPORTANTE: 
  - Retorne APENAS o JSON, sem texto adicional
  - SEMPRE inclua pelo menos 2-3 gêneros musicais no array "genre"
  - SEMPRE inclua pelo menos 3-5 palavras-chave descritivas no array "keyWords"
  - Se não conseguir identificar a música, use valores genéricos mas SEMPRE preencha os arrays
  - O campo "isrc" deve sempre começar com "GEMINI_GENERATED_" seguido de um timestamp único

  `
  
  export async function describeAudio(audioPath: string): Promise<GeminiMusicData> {
    try {
      console.log(`🤖 Analisando áudio com Gemini: ${audioPath}`);
      
      const ai = getGeminiClient();
      
      const myfile = await ai.files.upload({
        file: audioPath,
        config: { mimeType: "audio/wav" },
      });
    
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: createUserContent([
          createPartFromUri(myfile.uri!, myfile.mimeType!),
          PROMPT_TEXT,
        ]),
      });

      const responseText = response.text;
      console.log(`🤖 Resposta do Gemini: ${responseText}`);

      let musicData: GeminiMusicData;
      try {
        if (!responseText) {
          throw new Error('Empty response from Gemini');
        }
        musicData = JSON.parse(responseText);
      } catch (parseError) {
        console.warn('⚠️ Erro ao parsear resposta do Gemini, usando dados padrão');
        musicData = {
          title: "Música Não Identificada",
          artist: "Artista Desconhecido",
          album: null,
          releaseDate: null,
          label: null,
          isrc: `GEMINI_GENERATED_${Date.now()}`,
          songLink: null,
          appleMusicId: null,
          spotifyId: null,
          genre: ["desconhecido"],
          keyWords: ["não identificado", "áudio"]
        };
      }

      if (!musicData.isrc.startsWith('GEMINI_GENERATED_')) {
        musicData.isrc = `GEMINI_GENERATED_${Date.now()}`;
      }

      // Ensure genre and keyWords arrays are always present and populated
      if (!musicData.genre || !Array.isArray(musicData.genre) || musicData.genre.length === 0) {
        musicData.genre = ["desconhecido"];
      }
      
      if (!musicData.keyWords || !Array.isArray(musicData.keyWords) || musicData.keyWords.length === 0) {
        musicData.keyWords = ["não identificado", "áudio"];
      }

      console.log(`✅ Dados gerados pelo Gemini:`, musicData);
      return musicData;

    } catch (error) {
      console.error('❌ Erro ao analisar áudio com Gemini:', error);

      return {
        title: "Música Não Identificada",
        artist: "Artista Desconhecido",
        album: null,
        releaseDate: null,
        label: null,
        isrc: `GEMINI_GENERATED_${Date.now()}`,
        songLink: null,
        appleMusicId: null,
        spotifyId: null,
        genre: ["desconhecido"],
        keyWords: ["erro", "não processado"]
      };
    }
  }
  
  