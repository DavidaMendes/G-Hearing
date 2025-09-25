"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GloboLogo } from "@/components/globo-logo"
import { VideoCard } from "@/components/video-card"
import { UploadVideoModal } from "@/components/upload-video-modal"
import { Search, Plus, Filter, Bell, User, LogOut, Settings, Upload, Play, Music, Calendar } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data for videos
const mockVideos = [
  {
    id: "1",
    name: "Jornal Nacional - Edição 15/01",
    uploadDate: "2025-01-15",
    materialDate: "2025-01-15",
    thumbnail: "/news-studio.png",
    duration: "45:30",
    status: "processed" as const,
    musicCount: 12,
  },
  {
    id: "2",
    name: "Fantástico - Reportagem Especial",
    uploadDate: "2025-01-14",
    materialDate: "2025-01-14",
    thumbnail: "/tv-show-studio.jpg",
    duration: "28:15",
    status: "processing" as const,
    musicCount: 8,
  },
  {
    id: "3",
    name: "Novela das 9 - Capítulo 120",
    uploadDate: "2025-01-13",
    materialDate: "2025-01-13",
    thumbnail: "/drama-scene.jpg",
    duration: "52:45",
    status: "processed" as const,
    musicCount: 25,
  },
  {
    id: "4",
    name: "Esporte Espetacular - Highlights",
    uploadDate: "2025-01-12",
    materialDate: "2025-01-12",
    thumbnail: "/dynamic-sports-highlights.png",
    duration: "35:20",
    status: "error" as const,
    musicCount: 0,
  },
]

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [videos] = useState(mockVideos)

  const filteredVideos = videos.filter((video) => video.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* <GloboLogo size="md" variant="orange" /> */}
              <div>
                <h1 className="text-xl font-bold text-globo-orange-gradient">G-hearing</h1>
                <p className="text-sm text-muted-foreground">Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden md:inline">João Silva</span>
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Vídeos</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{videos.length}</div>
              <p className="text-xs text-muted-foreground">+2 desde ontem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Músicas Identificadas</CardTitle>
              <Music className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{videos.reduce((acc, video) => acc + video.musicCount, 0)}</div>
              <p className="text-xs text-muted-foreground">+12 desde ontem</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processando</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{videos.filter((v) => v.status === "processing").length}</div>
              <p className="text-xs text-muted-foreground">Em análise</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mês</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">Vídeos processados</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
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

          <Button onClick={() => setIsUploadModalOpen(true)} className="bg-globo-orange-gradient hover:opacity-90">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Vídeo
          </Button>
        </div>

        {/* Videos Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Seus Vídeos</h2>
            <Badge variant="secondary">{filteredVideos.length} vídeos</Badge>
          </div>

          {filteredVideos.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Play className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Nenhum vídeo encontrado</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? "Tente ajustar sua busca" : "Comece fazendo upload do seu primeiro vídeo"}
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
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      <UploadVideoModal open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen} />
    </div>
  )
}
