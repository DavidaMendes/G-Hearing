import numpy as np
from pydub import AudioSegment

def detect_music_segments_fast(audio_path, min_music_len=5.0, merge_gap=1.0, win_sec=0.5, hop_sec=0.25):
    print(f"🎵 Iniciando detecção de música no arquivo: {audio_path}")

    def mmss(seconds: float) -> str:
        m = int(seconds // 60)
        s = int(round(seconds % 60))
        return f"{m:02d}:{s:02d}"

    print("📁 Carregando arquivo de áudio...")
    audio = AudioSegment.from_file(audio_path)
    sr = audio.frame_rate
    print(f"✅ Arquivo carregado com sucesso! Duração: {len(audio)/1000:.1f}s, Sample Rate: {sr}Hz")

    samples = np.array(audio.set_channels(1).get_array_of_samples(), dtype=np.float32)
    print(f"🔊 Convertendo para mono e processando {len(samples)} amostras...")

    win = int(win_sec * sr)
    hop = int(hop_sec * sr)

    def zero_crossing_rate(x):
        signs = np.sign(x); signs[signs==0]=1
        return np.mean(signs[:-1] != signs[1:])

    # Usar apenas features baratas: energia, centroid/bandwidth espectral e ZCR
    print("🔍 Extraindo características do áudio...")
    energies = []
    centroids = []
    bandwidths = []
    zcrs = []
    times = []
    freqs = np.fft.rfftfreq(win, d=1.0/sr)

    total_windows = (len(samples) - win) // hop + 1
    print(f"📊 Processando {total_windows} janelas de análise...")

    for i, start in enumerate(range(0, len(samples) - win + 1, hop)):
        if i % 100 == 0:  # Print a cada 100 janelas
            print(f"   Processando janela {i+1}/{total_windows}...")
        chunk = samples[start:start+win]
        energy = float(np.mean(chunk**2))
        spectrum = np.abs(np.fft.rfft(chunk))
        spec_sum = np.sum(spectrum) + 1e-9
        centroid = float(np.sum(freqs * spectrum) / spec_sum)
        bandwidth = float(np.sqrt(np.sum(((freqs - centroid)**2) * spectrum) / spec_sum))
        zcr = float(zero_crossing_rate(chunk))
        energies.append(energy)
        centroids.append(centroid)
        bandwidths.append(bandwidth)
        zcrs.append(zcr)
        times.append((start + win//2) / sr)

    energies = np.array(energies, dtype=np.float32)
    centroids = np.array(centroids, dtype=np.float32)
    bandwidths = np.array(bandwidths, dtype=np.float32)
    zcrs = np.array(zcrs, dtype=np.float32)
    times = np.array(times, dtype=np.float32)

    print("✅ Características extraídas com sucesso!")

    if len(times) < 3:
        print("❌ Arquivo muito curto para análise. Mínimo de 3 janelas necessárias.")
        return []

    # Fluxo espectral (sem normalização cara)
    print("🌊 Calculando fluxo espectral...")
    spectrum_list = []
    for start in range(0, len(samples) - win + 1, hop):
        chunk = samples[start:start+win]
        spectrum_list.append(np.abs(np.fft.rfft(chunk)))
    S = np.array(spectrum_list, dtype=np.float32)
    flux = np.zeros(len(S), dtype=np.float32)
    flux[1:] = np.sum((S[1:] - S[:-1])**2, axis=1)

    # Normalização robusta
    print("📐 Aplicando normalização robusta...")
    def robust_z(x):
        med = np.median(x)
        mad = np.median(np.abs(x - med)) + 1e-9
        return (x - med) / (1.4826 * mad)

    z_energy = robust_z(energies)
    z_band = robust_z(bandwidths)
    z_cent = robust_z(centroids)
    z_zcr = robust_z(zcrs)
    z_flux = robust_z(flux)

    # Score de música
    print("🎯 Calculando score de música...")
    score = 0.8*z_energy + 0.8*z_band + 0.4*z_cent - 0.6*z_zcr + 0.5*z_flux

    # Suavização (média móvel de 5)
    print("🌊 Aplicando suavização...")
    k = 5
    pad = k // 2
    pad_vals = np.pad(score, (pad, pad), mode="edge")
    smooth = np.convolve(pad_vals, np.ones(k)/k, mode="valid")

    # Histerese
    print("🔍 Aplicando detecção por histerese...")
    mu, sd = float(np.mean(smooth)), float(np.std(smooth) + 1e-9)
    high_thr = mu + 0.6*sd
    low_thr = mu + 0.2*sd
    print(f"   Threshold alto: {high_thr:.3f}, Threshold baixo: {low_thr:.3f}")

    labels = np.zeros_like(smooth, dtype=bool)
    active = False
    for i, v in enumerate(smooth):
        if not active and v >= high_thr: active = True
        if active and v < low_thr: active = False
        labels[i] = active

    # Agrupar
    print("🔗 Agrupando segmentos detectados...")
    segments = []
    start_t = None
    for i, lab in enumerate(labels):
        if lab and start_t is None:
            start_t = times[i] - win_sec/2
        if (not lab or i == len(labels)-1) and start_t is not None:
            end_t = times[i] + win_sec/2 if lab and i == len(labels)-1 else times[i] - win_sec/2
            segments.append([max(0.0, start_t), max(start_t, end_t)])
            start_t = None

    print(f"   Encontrados {len(segments)} segmentos brutos")

    # Mesclar e filtrar
    print("🔀 Mesclando segmentos próximos...")
    merged = []
    for seg in segments:
        if not merged: merged.append(seg)
        else:
            if seg[0] - merged[-1][1] <= 1.5:
                merged[-1][1] = max(merged[-1][1], seg[1])
            else:
                merged.append(seg)

    print(f"   Após mesclagem: {len(merged)} segmentos")

    final_segments = [[s, e] for s, e in merged if (e - s) >= min_music_len]
    print(f"   Após filtro de duração mínima ({min_music_len}s): {len(final_segments)} segmentos finais")

    result = [[mmss(s), mmss(e)] for s, e in final_segments]

    if result:
        print("🎵 Segmentos de música detectados:")
        for i, (start, end) in enumerate(result, 1):
            print(f"   {i}. {start} - {end}")
    else:
        print("❌ Nenhuma música detectada no arquivo")

    return result

# Rodar no novo arquivo
if __name__ == "__main__":
    import sys

    if len(sys.argv) != 2:
        print("Uso: python3 music-recognizer.py <caminho_do_audio>")
        sys.exit(1)

    audio_path = sys.argv[1]

    print("=" * 60)
    print("🚀 INICIANDO ANÁLISE DE MÚSICA")
    print("=" * 60)

    segments_fast = detect_music_segments_fast(audio_path)

    print("=" * 60)
    print("✅ ANÁLISE CONCLUÍDA!")
    print("=" * 60)
    print(f"Resultado final: {segments_fast}")

    # Output especial para o Node.js capturar
    print(f"SEGMENTS:{segments_fast}")