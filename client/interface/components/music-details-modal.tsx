"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Music, Clock, Calendar, User, Disc, Building, Hash, Globe, Zap, Key } from "lucide-react"

interface MusicTrack {
  id: string
  title: string
  album: string
  isrc: string
  date: string
  duration: string
  startTime: string
  endTime: string
  authors: string
  performers: string
  genres: string
  label: string
  recordCompany: string
  bpm: number
  keyAndMode: string
  mood: string
}

interface MusicDetailsModalProps {
  music: MusicTrack | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MusicDetailsModal({ music, open, onOpenChange }: MusicDetailsModalProps) {
  if (!music) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-xl">{music.title}</DialogTitle>
              <DialogDescription className="text-base">{music.album}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Music className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span>ISRC</span>
                  </div>
                  <p className="font-mono text-sm">{music.isrc}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Data de Lançamento</span>
                  </div>
                  <p className="text-sm">{formatDate(music.date)}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Duração</span>
                  </div>
                  <p className="text-sm">{music.duration}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>Gêneros</span>
                  </div>
                  <p className="text-sm">{music.genres}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Timing no Vídeo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Tempo de Início</p>
                  <p className="text-lg font-mono">{music.startTime}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Tempo de Fim</p>
                  <p className="text-lg font-mono">{music.endTime}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Créditos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Autores</p>
                <p className="text-sm">{music.authors}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Intérpretes</p>
                <p className="text-sm">{music.performers}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="h-5 w-5" />
                Gravadora e Selo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Disc className="h-4 w-4" />
                    <span>Selo</span>
                  </div>
                  <p className="text-sm">{music.label}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>Gravadora</span>
                  </div>
                  <p className="text-sm">{music.recordCompany}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Detalhes Técnicos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4" />
                    <span>BPM</span>
                  </div>
                  <p className="text-sm font-mono">{music.bpm}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Key className="h-4 w-4" />
                    <span>Tom</span>
                  </div>
                  <p className="text-sm">{music.keyAndMode}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Music className="h-4 w-4" />
                    <span>Mood</span>
                  </div>
                  <p className="text-sm">{music.mood}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
