"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MusicTrackCard } from "@/components/music-track-card";
import { VideoInfoCard } from "@/components/video-info-card";
import { MusicDetailsModal } from "@/components/music-details-modal";
import { EditVideoModal } from "@/components/edit-video-modal";
import { EditMusicModal } from "@/components/edit-music-modal";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Music,
  Clock,
  Calendar,
  User,
  Bell,
  LogOut,
  Settings,
  Loader2,
  FileDown, // Adicionei ícone novo
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

// --- 1. Interfaces ---

export interface VideoDetail {
  id: string;
  name: string;
  uploadDate: string;
  materialDate: string;
  thumbnail: string;
  duration: string;
  status: "processed" | "processing" | "error";
  description: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  album: string;
  authors: string;
  isrc?: string;
  date?: string;
  duration?: string;
  startTime?: string;
  endTime?: string;
  performers?: string;
  genres?: string;
  label?: string;
  recordCompany?: string;
  bpm?: number;
  keyAndMode?: string;
  mood?: string;
}

interface ApiVideoResponse {
  videos: {
    id: number;
    title: string;
    uploadDate: string;
    createdAt: string;
    processingStatus: string;
    duration: number | null;
    musics: {
      id: number;
      startTime: string;
      endTime: string;
      music: {
        id: number;
        title: string;
        artist: string;
        album: string | null;
        releaseDate: string | null;
        label: string | null;
        isrc: string | null;
      };
    }[];
  }[];
}

const timeToSeconds = (timeStr: string) => {
  if (!timeStr) return 0;
  const parts = timeStr.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return 0;
};

const secondsToFormat = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export default function VideoDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const videoId = params.id as string;

  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMusic, setSelectedMusic] = useState<MusicTrack | null>(null);

  const [isEditVideoModalOpen, setIsEditVideoModalOpen] = useState(false);
  const [isEditMusicModalOpen, setIsEditMusicModalOpen] = useState(false);
  const [editingMusic, setEditingMusic] = useState<MusicTrack | null>(null);

  const fetchVideoDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/videos/${videoId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch video details");
      }

      const data: ApiVideoResponse = await response.json();
      const apiVideo =
        data.videos && data.videos.length > 0 ? data.videos[0] : null;

      if (!apiVideo) {
        setVideo(null);
        return;
      }

      const mappedTracks: MusicTrack[] = (apiVideo.musics || []).map(
        (item: any) => {
          const m = item.music;
          return {
            id: item.id.toString(),
            title: m.title || "Música Desconhecida",
            album: m.album || "Álbum Desconhecido",
            authors: m.artist || "Artista Desconhecido",
            isrc: m.isrc || "N/A",
            date: m.releaseDate || "N/A",
            duration: "N/A",
            startTime: item.startTime || "00:00",
            endTime: item.endTime || "00:00",
            performers: m.artist || "N/A",
            label: m.label || "N/A",
            genres: "N/A",
            recordCompany: m.label || "N/A",
            bpm: 0,
            keyAndMode: "N/A",
            mood: "N/A",
          };
        }
      );

      let finalDuration = "00:00";
      if (apiVideo.duration && apiVideo.duration > 0) {
        finalDuration = secondsToFormat(apiVideo.duration);
      } else if (mappedTracks.length > 0) {
        let maxSeconds = 0;
        mappedTracks.forEach((t) => {
          if (t.endTime) {
            const endSec = timeToSeconds(t.endTime);
            if (endSec > maxSeconds) maxSeconds = endSec;
          }
        });
        finalDuration = secondsToFormat(maxSeconds);
      }

      let status: VideoDetail["status"] = "processing";
      if (apiVideo.processingStatus === "completed") status = "processed";
      if (apiVideo.processingStatus === "failed") status = "error";

      const mappedVideo: VideoDetail = {
        id: apiVideo.id.toString(),
        name: apiVideo.title,
        uploadDate: apiVideo.uploadDate,
        materialDate: apiVideo.createdAt,
        thumbnail: "/placeholder.svg",
        duration: finalDuration,
        status: status,
        description: "Descrição indisponível",
      };

      setVideo(mappedVideo);
      setTracks(mappedTracks);
    } catch (error) {
      console.error("Error loading video details:", error);
    } finally {
      setIsLoading(false);
    }
  }, [videoId, router]);

  useEffect(() => {
    fetchVideoDetails();
  }, [fetchVideoDetails]);

  const filteredTracks = tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.album.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.authors.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditMusic = (music: MusicTrack) => {
    setEditingMusic(music);
    setIsEditMusicModalOpen(true);
  };

  const handleViewMusicDetails = (music: MusicTrack) => {
    setSelectedMusic(music);
  };

  const handleExportEdl = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`/api/videos/${videoId}/export`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erro ao gerar arquivo EDL");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `video_${video?.name.replace(/\s+/g, "_")}_${videoId}.edl`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro no download:", error);
      alert("Falha ao baixar o arquivo EDL.");
    } finally {
      setIsExporting(false);
    }
  };

  const getCopyrightBadge = (status: VideoDetail["status"]) => {
    switch (status) {
      case "processed":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            Processado
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            Processando
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
            Erro
          </Badge>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando detalhes...</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Vídeo não encontrado</h1>
        <Button asChild>
          <Link href="/dashboard">Voltar para o Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-lg font-bold text-globo-orange-gradient">
                    G-hearing
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Detalhes do Vídeo
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">Usuário</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <VideoInfoCard
              video={video}
              onEdit={() => setIsEditVideoModalOpen(true)}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Músicas
                  </CardTitle>
                  <Music className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{tracks.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Duração Total
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{video.duration}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {getCopyrightBadge(video.status)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-1 items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar músicas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
              </div>

              <Button
                variant="outline"
                className="bg-globo-orange-gradient hover:opacity-90 text-white border-0"
                onClick={handleExportEdl}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando EDL...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4 mr-2" />
                    Exportar EDL
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Músicas Identificadas</h2>
                <Badge variant="secondary">
                  {filteredTracks.length} músicas
                </Badge>
              </div>

              {filteredTracks.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <Music className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">
                        Nenhuma música encontrada
                      </h3>
                      <p className="text-muted-foreground">
                        {video.status === "processing"
                          ? "O vídeo ainda está sendo processado."
                          : "Tente ajustar sua busca ou filtros"}
                      </p>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredTracks.map((track) => (
                    <MusicTrackCard
                      key={track.id}
                      track={track}
                      onEdit={() => handleEditMusic(track)}
                      onViewDetails={() => handleViewMusicDetails(track)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <MusicDetailsModal
        music={selectedMusic}
        open={!!selectedMusic}
        onOpenChange={(open) => !open && setSelectedMusic(null)}
      />

    </div>
  );
}
