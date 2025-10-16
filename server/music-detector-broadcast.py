#!/usr/bin/env python3
"""
Music Detector para Broadcast/Jornalismo
Detecta música de fundo em matérias jornalísticas onde há voz principal + música

Foco: Detectar presença de música mesmo com voz por cima
"""

import numpy as np
from pydub import AudioSegment
import sys
import json


class BroadcastMusicDetector:
    def __init__(self, 
                 min_music_duration=5.0,
                 merge_gap=3.0,
                 sensitivity='medium'):
        """
        Detector de música para broadcast/jornalismo
        
        Args:
            min_music_duration: Duração mínima de música (segundos)
            merge_gap: Gap para mesclar segmentos (segundos)
            sensitivity: 'low', 'medium', 'high' - quão sensível à música de fundo
        """
        self.min_music_duration = min_music_duration
        self.merge_gap = merge_gap
        
        # Ajustar threshold baseado na sensibilidade
        self.sensitivity_thresholds = {
            'low': 0.3,      # Só detecta música muito clara
            'medium': 0.15,  # Detecta música moderada
            'high': 0.05     # Detecta até música bem baixa
        }
        self.threshold = self.sensitivity_thresholds.get(sensitivity, 0.15)
        
        print(f"🎵 Detector configurado - Sensibilidade: {sensitivity} (threshold: {self.threshold})")
    
    def load_audio(self, audio_path):
        """Carrega o áudio"""
        print(f"📂 Carregando áudio: {audio_path}")
        audio = AudioSegment.from_file(audio_path)
        audio = audio.set_channels(1)
        
        samples = np.array(audio.get_array_of_samples(), dtype=np.float32)
        sample_rate = audio.frame_rate
        
        # Normalizar
        if np.max(np.abs(samples)) > 0:
            samples = samples / np.max(np.abs(samples))
        
        print(f"✅ Áudio carregado: {len(samples)/sample_rate:.1f}s, {sample_rate} Hz")
        return samples, sample_rate
    
    def detect_harmonic_content(self, samples, sample_rate, window_size=4096, hop_length=2048):
        """
        Detecta conteúdo harmônico (música) vs não-harmônico (voz, ruído)
        
        Música de fundo cria picos harmônicos regulares no espectro,
        mesmo quando há voz por cima
        """
        print("🔍 Analisando conteúdo harmônico...")
        
        num_frames = 1 + (len(samples) - window_size) // hop_length
        harmonic_ratio = np.zeros(num_frames)
        low_freq_energy = np.zeros(num_frames)
        spectral_variance = np.zeros(num_frames)
        
        for i in range(num_frames):
            start = i * hop_length
            end = start + window_size
            
            if end > len(samples):
                break
            
            frame = samples[start:end]
            
            # Aplicar janela de Hamming
            windowed = frame * np.hamming(len(frame))
            
            # FFT
            spectrum = np.abs(np.fft.rfft(windowed))
            freqs = np.fft.rfftfreq(window_size, 1.0 / sample_rate)
            
            # 1. Calcular harmonic ratio (autocorrelação)
            # Música tem estrutura harmônica regular
            autocorr = np.correlate(spectrum, spectrum, mode='same')
            autocorr_normalized = autocorr / (np.max(autocorr) + 1e-10)
            
            # Pegar picos de autocorrelação (indica harmônicos)
            peak_threshold = 0.5
            peaks = autocorr_normalized > peak_threshold
            harmonic_ratio[i] = np.sum(peaks) / len(peaks)
            
            # 2. Energia em baixas frequências (50-500 Hz)
            # Música de fundo geralmente tem mais energia em baixas freq
            low_freq_mask = (freqs >= 50) & (freqs <= 500)
            if np.sum(low_freq_mask) > 0:
                low_freq_energy[i] = np.mean(spectrum[low_freq_mask])
            
            # 3. Variância espectral ao longo do tempo
            # Música tem variância mais consistente que apenas voz
            spectral_variance[i] = np.var(spectrum)
        
        print(f"✅ Análise harmônica concluída ({num_frames} frames)")
        return harmonic_ratio, low_freq_energy, spectral_variance, hop_length / sample_rate
    
    def detect_rhythm_patterns(self, samples, sample_rate, window_size=4096, hop_length=2048):
        """
        Detecta padrões rítmicos que indicam música
        Música tem beat/ritmo regular, voz sozinha não
        """
        print("🥁 Detectando padrões rítmicos...")
        
        num_frames = 1 + (len(samples) - window_size) // hop_length
        energy = np.zeros(num_frames)
        
        # Calcular energia por frame
        for i in range(num_frames):
            start = i * hop_length
            end = start + window_size
            
            if end > len(samples):
                break
            
            frame = samples[start:end]
            energy[i] = np.sqrt(np.mean(frame ** 2))
        
        # Detectar periodicidade na energia (indica ritmo)
        if len(energy) < 20:
            return np.zeros(num_frames)
        
        rhythm_score = np.zeros(num_frames)
        window_rhythm = 20  # Analisar 20 frames por vez
        
        for i in range(window_rhythm, num_frames):
            energy_window = energy[i-window_rhythm:i]
            
            # Autocorrelação da energia para detectar periodicidade
            autocorr = np.correlate(energy_window, energy_window, mode='same')
            autocorr = autocorr / (np.max(autocorr) + 1e-10)
            
            # Picos de autocorrelação indicam ritmo
            rhythm_score[i] = np.max(autocorr[len(autocorr)//2:])
        
        print(f"✅ Análise rítmica concluída")
        return rhythm_score
    
    def detect_background_music(self, samples, sample_rate):
        """
        Método principal: detecta música de fundo mesmo com voz
        """
        print("="*60)
        print("🎵 INICIANDO DETECÇÃO DE MÚSICA DE FUNDO")
        print("="*60)
        
        # Análises
        harmonic_ratio, low_freq_energy, spectral_variance, time_per_frame = \
            self.detect_harmonic_content(samples, sample_rate)
        
        rhythm_score = self.detect_rhythm_patterns(samples, sample_rate)
        
        # Normalizar features
        def normalize(x):
            if np.std(x) < 1e-10:
                return np.zeros_like(x)
            return (x - np.mean(x)) / (np.std(x) + 1e-10)
        
        harm_norm = normalize(harmonic_ratio)
        lowfreq_norm = normalize(low_freq_energy)
        variance_norm = normalize(spectral_variance)
        rhythm_norm = normalize(rhythm_score)
        
        # Score combinado com pesos otimizados para música de fundo
        music_score = (
            0.35 * harm_norm +      # Conteúdo harmônico (mais importante)
            0.25 * lowfreq_norm +   # Energia em baixas freq
            0.20 * variance_norm +  # Variância espectral
            0.20 * rhythm_norm      # Padrões rítmicos
        )
        
        # Suavização mais agressiva para música de fundo
        window_smooth = 21  # ~1 segundo
        music_score_smooth = np.convolve(
            music_score,
            np.ones(window_smooth) / window_smooth,
            mode='same'
        )
        
        # Threshold mais baixo para música de fundo
        threshold = np.median(music_score_smooth) + self.threshold * np.std(music_score_smooth)
        
        print(f"📊 Threshold calculado: {threshold:.3f}")
        print(f"📊 Score médio: {np.mean(music_score_smooth):.3f}")
        print(f"📊 Score máximo: {np.max(music_score_smooth):.3f}")
        
        # Detectar música
        is_music = music_score_smooth > threshold
        
        music_frames = np.sum(is_music)
        total_frames = len(is_music)
        percentage = (music_frames / total_frames * 100) if total_frames > 0 else 0
        
        print(f"🎵 Frames com música: {music_frames} / {total_frames} ({percentage:.1f}%)")
        
        return is_music, time_per_frame
    
    def frames_to_segments(self, is_music, time_per_frame):
        """Converte frames em segmentos temporais"""
        print("⏱️ Convertendo frames em segmentos...")
        
        segments = []
        in_music = False
        start_time = 0.0
        
        for i, is_music_frame in enumerate(is_music):
            current_time = i * time_per_frame
            
            if is_music_frame and not in_music:
                start_time = current_time
                in_music = True
            elif not is_music_frame and in_music:
                end_time = current_time
                segments.append([start_time, end_time])
                in_music = False
        
        if in_music:
            end_time = len(is_music) * time_per_frame
            segments.append([start_time, end_time])
        
        print(f"✅ Segmentos brutos: {len(segments)}")
        return segments
    
    def merge_close_segments(self, segments):
        """Mescla segmentos próximos"""
        if not segments:
            return []
        
        print(f"🔗 Mesclando segmentos (gap < {self.merge_gap}s)...")
        
        merged = [segments[0]]
        for current in segments[1:]:
            last = merged[-1]
            if current[0] - last[1] <= self.merge_gap:
                merged[-1] = [last[0], max(last[1], current[1])]
            else:
                merged.append(current)
        
        print(f"✅ Segmentos após mesclagem: {len(merged)}")
        return merged
    
    def filter_short_segments(self, segments):
        """Remove segmentos curtos"""
        print(f"🧹 Filtrando segmentos curtos (< {self.min_music_duration}s)...")
        
        filtered = [
            seg for seg in segments
            if (seg[1] - seg[0]) >= self.min_music_duration
        ]
        
        print(f"✅ Segmentos após filtro: {len(filtered)}")
        return filtered
    
    def split_long_segments(self, segments, max_duration=15.0, min_duration=5.0):
        """
        Divide segmentos longos em partes de no máximo max_duration segundos
        Remove partes menores que min_duration
        Limitação da API de reconhecimento de música (audd.io)
        """
        print(f"✂️ Dividindo segmentos longos (max {max_duration}s)...")
        
        split_segments = []
        removed_count = 0
        
        for start, end in segments:
            duration = end - start
            
            if duration <= max_duration:
                # Segmento dentro do limite
                split_segments.append([start, end])
            else:
                # Dividir segmento em partes de max_duration
                current_start = start
                parts_created = 0
                
                while current_start < end:
                    current_end = min(current_start + max_duration, end)
                    part_duration = current_end - current_start
                    
                    # Só adicionar se o segmento tiver pelo menos min_duration
                    if part_duration >= min_duration:
                        split_segments.append([current_start, current_end])
                        parts_created += 1
                    else:
                        removed_count += 1
                        print(f"  └─ Parte {self.seconds_to_mmss(current_start)}-{self.seconds_to_mmss(current_end)} " +
                              f"({part_duration:.1f}s) removida (< {min_duration}s)")
                    
                    current_start = current_end
                
                if parts_created > 0:
                    print(f"  └─ Segmento {self.seconds_to_mmss(start)}-{self.seconds_to_mmss(end)} " +
                          f"({duration:.1f}s) dividido em {parts_created} partes")
        
        if removed_count > 0:
            print(f"🧹 {removed_count} parte(s) curta(s) removida(s) após divisão")
        
        print(f"✅ Segmentos finais: {len(split_segments)}")
        return split_segments
    
    def seconds_to_mmss(self, seconds):
        """Converte segundos para MM:SS"""
        minutes = int(seconds // 60)
        secs = int(round(seconds % 60))
        return f"{minutes:02d}:{secs:02d}"
    
    def detect(self, audio_path):
        """Método principal"""
        # Carregar áudio
        samples, sample_rate = self.load_audio(audio_path)
        
        # Detectar música de fundo
        is_music, time_per_frame = self.detect_background_music(samples, sample_rate)
        
        # Converter para segmentos
        segments = self.frames_to_segments(is_music, time_per_frame)
        
        # Mesclar e filtrar
        segments = self.merge_close_segments(segments)
        segments = self.filter_short_segments(segments)
        
        # Dividir segmentos longos (limitação da API de reconhecimento)
        segments = self.split_long_segments(segments, max_duration=15.0)
        
        # Converter para MM:SS
        result = [
            [self.seconds_to_mmss(start), self.seconds_to_mmss(end)]
            for start, end in segments
        ]
        
        print("="*60)
        print("✅ DETECÇÃO CONCLUÍDA")
        print("="*60)
        
        if result:
            print(f"📊 {len(result)} segmento(s) de música detectado(s):")
            for i, (start, end) in enumerate(result, 1):
                duration = (int(end.split(':')[0]) * 60 + int(end.split(':')[1])) - \
                          (int(start.split(':')[0]) * 60 + int(start.split(':')[1]))
                print(f"   {i}. {start} - {end} ({duration}s)")
        else:
            print("⚠️ Nenhum segmento de música detectado")
            print("💡 Dica: Tente aumentar a sensibilidade para 'high'")
        
        print("="*60)
        
        return result


def main():
    if len(sys.argv) < 2:
        print("Uso: python3 music-detector-broadcast.py <audio> [sensibilidade]")
        print("\nSensibilidade: low, medium (padrão), high")
        print("\nExemplo:")
        print("  python3 music-detector-broadcast.py audio.wav")
        print("  python3 music-detector-broadcast.py audio.wav high")
        sys.exit(1)
    
    audio_path = sys.argv[1]
    sensitivity = sys.argv[2] if len(sys.argv) > 2 else 'medium'
    
    # Criar detector otimizado para broadcast
    detector = BroadcastMusicDetector(
        min_music_duration=5.0,  # Mínimo 5 segundos
        merge_gap=3.0,           # Mesclar se gap < 3 segundos
        sensitivity=sensitivity  # low, medium, high
    )
    
    # Detectar música
    segments = detector.detect(audio_path)
    
    # Output para Node.js
    print(f"SEGMENTS:{json.dumps(segments)}")


if __name__ == "__main__":
    main()

