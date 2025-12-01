"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoCard, Video } from "@/components/video-card";
import { UploadVideoModal } from "@/components/upload-video-modal";
import {
  Search,
  Plus,
  Filter,
  Bell,
  User,
  LogOut,
  Settings,
  Upload,
  Play,
  Music,
  Calendar,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ApiVideoSummary {
  id: number;
  title: string;
  filePath: string;
  uploadDate: string;
  processingStatus: string;
  createdAt: string;
  duration?: string | null;
  musicCount?: number;
  musics?: any[];
}

export default function DashboardPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      console.log("🔄 [DEBUG] Iniciando fetch para /api/videos/summary...");

      const response = await fetch("/api/videos/summary", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 [DEBUG] Status da Resposta:", response.status);

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      const text = await response.text();
      console.log("📦 [DEBUG] Corpo da Resposta (Raw):", text);

      if (!response.ok) {
        throw new Error(`Erro na API (${response.status}): ${text}`);
      }

      if (!text) {
        console.warn("⚠️ [DEBUG] A resposta veio vazia!");
        setVideos([]);
        return;
      }

      const data = JSON.parse(text);

      const apiVideos: ApiVideoSummary[] = data.videos || [];
      console.log("🎬 [DEBUG] Vídeos encontrados:", apiVideos.length);

      // --- ADAPTER ---
      const mappedVideos: Video[] = apiVideos.map((apiVideo) => {
        let status: Video["status"] = "processing";
        if (apiVideo.processingStatus === "completed") status = "processed";
        if (apiVideo.processingStatus === "failed") status = "error";

        return {
          id: apiVideo.id.toString(),
          name: apiVideo.title,
          uploadDate: apiVideo.uploadDate,
          materialDate: apiVideo.createdAt,
          thumbnail: "/placeholder.svg",
          duration: apiVideo.duration || "N/A",
          status: status,
          musicCount: apiVideo.musicCount ?? 0,
        };
      });

      setVideos(mappedVideos);
    } catch (error) {
      console.error("🚨 [DEBUG] Erro crítico no fetchVideos:", error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleVideoDeleted = (deletedId: string) => {
    setVideos((prevVideos) => prevVideos.filter((v) => v.id !== deletedId));
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("token");
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleModalOpenChange = (open: boolean) => {
    setIsUploadModalOpen(open);
    if (!open) {
      fetchVideos();
    }
  };

  const filteredVideos = videos.filter((video) =>
    video.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-bold text-globo-orange-gradient">
                  G-hearing
                </h1>
                <p className="text-sm text-muted-foreground">Dashboard</p>
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

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10"
                  >
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Vídeos
              </CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{videos.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Músicas Identificadas
              </CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {videos.reduce((acc, video) => acc + video.musicCount, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processando</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {videos.filter((v) => v.status === "processing").length}
              </div>
              <p className="text-xs text-muted-foreground">Em análise</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{videos.length}</div>
              <p className="text-xs text-muted-foreground">Vídeos recentes</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          <div className="flex flex-1 items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar vídeos..."
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
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-globo-orange-gradient hover:opacity-90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Vídeo
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Seus Vídeos</h2>
            <Badge variant="secondary">{filteredVideos.length} vídeos</Badge>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
              <p>Carregando vídeos...</p>
            </div>
          ) : filteredVideos.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Play className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">
                    Nenhum vídeo encontrado
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? "Tente ajustar sua busca"
                      : "Comece fazendo upload do seu primeiro vídeo"}
                  </p>
                </div>
                {!searchQuery && (
                  <Button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-globo-orange-gradient hover:opacity-90"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Vídeo
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVideos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onDeleteSuccess={handleVideoDeleted}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <UploadVideoModal
        open={isUploadModalOpen}
        onOpenChange={handleModalOpenChange}
      />
    </div>
  );
}
