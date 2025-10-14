"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { GloboLogo } from "@/components/globo-logo"
import { MusicTrackCard } from "@/components/music-track-card"
import { VideoInfoCard } from "@/components/video-info-card"
import { MusicDetailsModal } from "@/components/music-details-modal"
import { EditVideoModal } from "@/components/edit-video-modal"
import { EditMusicModal } from "@/components/edit-music-modal"
import { ArrowLeft, Search, Filter, Download, Music, Clock, Calendar, User, Bell, LogOut, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useParams } from "next/navigation"

const mockVideo = {
  id: "1",
  name: "Jornal Nacional - Edição 15/01",
  uploadDate: "2025-01-15",
  materialDate: "2025-01-15",
  thumbnail: "/news-studio.png",
  duration: "45:30",
  status: "processed" as const,
  description: "Edição especial do Jornal Nacional com reportagens sobre economia e política nacional.",
}

const mockMusicTracks = [
  {
    id: "1",
    title: "Breaking News Theme",
    album: "News Music Library Vol. 1",
    isrc: "USGF19463001",
    date: "2023-05-15",
    duration: "0:45",
    startTime: "00:02:15",
    endTime: "00:03:00",
    authors: "John Smith, Maria Silva",
    performers: "Studio Orchestra",
    genres: "Instrumental, News",
    label: "Global Music",
    recordCompany: "Universal Music",
    bpm: 120,
    keyAndMode: "C Major",
    mood: "Dramatic, Urgent",
  },
  {
    id: "2",
    title: "Economic Report Background",
    album: "Corporate Soundscapes",
    isrc: "USGF19463002",
    date: "2023-03-22",
    duration: "2:30",
    startTime: "00:15:30",
    endTime: "00:18:00",
    authors: "Carlos Santos",
    performers: "Digital Ensemble",
    genres: "Ambient, Corporate",
    label: "Business Audio",
    recordCompany: "Sony Music",
    bpm: 85,
    keyAndMode: "A Minor",
    mood: "Professional, Calm",
  },
  {
    id: "3",
    title: "Sports Highlight Reel",
    album: "Action Packed",
    isrc: "USGF19463003",
    date: "2023-08-10",
    duration: "1:15",
    startTime: "00:35:45",
    endTime: "00:37:00",
    authors: "Roberto Lima, Ana Costa",
    performers: "Power Band",
    genres: "Rock, Sports",
    label: "Action Music",
    recordCompany: "Warner Music",
    bpm: 140,
    keyAndMode: "E Major",
    mood: "Energetic, Powerful",
  },
]

export default function VideoDetailsPage() {
  const params = useParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMusic, setSelectedMusic] = useState<(typeof mockMusicTracks)[0] | null>(null)
  const [isEditVideoModalOpen, setIsEditVideoModalOpen] = useState(false)
  const [isEditMusicModalOpen, setIsEditMusicModalOpen] = useState(false)
  const [editingMusic, setEditingMusic] = useState<(typeof mockMusicTracks)[0] | null>(null)

  const filteredTracks = mockMusicTracks.filter(
    (track) =>
      track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.album.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.authors.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleEditMusic = (music: (typeof mockMusicTracks)[0]) => {
    setEditingMusic(music)
    setIsEditMusicModalOpen(true)
  }

  const handleViewMusicDetails = (music: (typeof mockMusicTracks)[0]) => {
    setSelectedMusic(music)
  }

  const getCopyrightBadge = (status: "processed" | "processing" | "error") => {
    switch (status) {
      case "processed":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Processado</Badge>
      case "processing":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Processando</Badge>
      case "error":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Erro</Badge>
    }
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
                  <h1 className="text-lg font-bold text-globo-blue-gradient">G-hearing</h1>
                  <p className="text-xs text-muted-foreground">Detalhes do Vídeo</p>
                </div>
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

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <VideoInfoCard video={mockVideo} onEdit={() => setIsEditVideoModalOpen(true)} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Músicas</CardTitle>
                  <Music className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockMusicTracks.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Duração Total</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4:30</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">{getCopyrightBadge(mockVideo.status)}</div>
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

              <Button variant="outline" className="bg-globo-blue-gradient hover:opacity-90 text-white border-0">
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </Button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Músicas Identificadas</h2>
                <Badge variant="secondary">{filteredTracks.length} músicas</Badge>
              </div>

              {filteredTracks.length === 0 ? (
                <Card className="p-8 text-center">
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      <Music className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">Nenhuma música encontrada</h3>
                      <p className="text-muted-foreground">Tente ajustar sua busca ou filtros</p>
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

      <EditVideoModal video={mockVideo} open={isEditVideoModalOpen} onOpenChange={setIsEditVideoModalOpen} />

      <EditMusicModal
        music={editingMusic}
        open={isEditMusicModalOpen}
        onOpenChange={(open) => {
          setIsEditMusicModalOpen(open)
          if (!open) setEditingMusic(null)
        }}
      />
    </div>
  )
}
