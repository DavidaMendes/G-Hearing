"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, X, Calendar, Clock, Hash, Music, User, Building } from "lucide-react"

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
  copyrightStatus: "licensed" | "pending" | "unlicensed"
  bpm: number
  keyAndMode: string
  mood: string
}

interface EditMusicModalProps {
  music: MusicTrack | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditMusicModal({ music, open, onOpenChange }: EditMusicModalProps) {
  const [formData, setFormData] = useState({
    title: music?.title || "",
    album: music?.album || "",
    isrc: music?.isrc || "",
    date: music?.date || "",
    duration: music?.duration || "",
    startTime: music?.startTime || "",
    endTime: music?.endTime || "",
    authors: music?.authors || "",
    performers: music?.performers || "",
    genres: music?.genres || "",
    label: music?.label || "",
    recordCompany: music?.recordCompany || "",
    copyrightStatus: music?.copyrightStatus || "pending",
    bpm: music?.bpm || 120,
    keyAndMode: music?.keyAndMode || "",
    mood: music?.mood || "",
  })

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement music update logic
    console.log("Update music:", { id: music?.id, ...formData })
    onOpenChange(false)
  }

  const handleCancel = () => {
    // Reset form to original values
    if (music) {
      setFormData({
        title: music.title,
        album: music.album,
        isrc: music.isrc,
        date: music.date,
        duration: music.duration,
        startTime: music.startTime,
        endTime: music.endTime,
        authors: music.authors,
        performers: music.performers,
        genres: music.genres,
        label: music.label,
        recordCompany: music.recordCompany,
        copyrightStatus: music.copyrightStatus,
        bpm: music.bpm,
        keyAndMode: music.keyAndMode,
        mood: music.mood,
      })
    }
    onOpenChange(false)
  }

  if (!music) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Música</DialogTitle>
          <DialogDescription>Atualize as informações da música identificada</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Music className="h-5 w-5" />
              Informações Básicas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="album">Álbum</Label>
                <Input
                  id="album"
                  value={formData.album}
                  onChange={(e) => handleInputChange("album", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isrc">ISRC</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="isrc"
                    value={formData.isrc}
                    onChange={(e) => handleInputChange("isrc", e.target.value)}
                    className="pl-10 font-mono"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Data de Lançamento</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Timing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duração</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                  placeholder="0:00"
                  className="font-mono"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Tempo de Início</Label>
                <Input
                  id="startTime"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange("startTime", e.target.value)}
                  placeholder="00:00:00"
                  className="font-mono"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Tempo de Fim</Label>
                <Input
                  id="endTime"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange("endTime", e.target.value)}
                  placeholder="00:00:00"
                  className="font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {/* Credits */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Créditos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="authors">Autores</Label>
                <Input
                  id="authors"
                  value={formData.authors}
                  onChange={(e) => handleInputChange("authors", e.target.value)}
                  placeholder="Nome dos autores"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="performers">Intérpretes</Label>
                <Input
                  id="performers"
                  value={formData.performers}
                  onChange={(e) => handleInputChange("performers", e.target.value)}
                  placeholder="Nome dos intérpretes"
                />
              </div>
            </div>
          </div>

          {/* Label & Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building className="h-5 w-5" />
              Gravadora e Selo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="label">Selo</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => handleInputChange("label", e.target.value)}
                  placeholder="Nome do selo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recordCompany">Gravadora</Label>
                <Input
                  id="recordCompany"
                  value={formData.recordCompany}
                  onChange={(e) => handleInputChange("recordCompany", e.target.value)}
                  placeholder="Nome da gravadora"
                />
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Adicionais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="genres">Gêneros</Label>
                <Input
                  id="genres"
                  value={formData.genres}
                  onChange={(e) => handleInputChange("genres", e.target.value)}
                  placeholder="Rock, Pop, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="copyrightStatus">Status de Direitos</Label>
                <Select
                  value={formData.copyrightStatus}
                  onValueChange={(value) => handleInputChange("copyrightStatus", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="licensed">Licenciado</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="unlicensed">Não Licenciado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bpm">BPM</Label>
                <Input
                  id="bpm"
                  type="number"
                  value={formData.bpm}
                  onChange={(e) => handleInputChange("bpm", Number.parseInt(e.target.value) || 120)}
                  min="1"
                  max="300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="keyAndMode">Tom</Label>
                <Input
                  id="keyAndMode"
                  value={formData.keyAndMode}
                  onChange={(e) => handleInputChange("keyAndMode", e.target.value)}
                  placeholder="C Major, A Minor, etc."
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mood">Mood</Label>
              <Input
                id="mood"
                value={formData.mood}
                onChange={(e) => handleInputChange("mood", e.target.value)}
                placeholder="Energetic, Calm, Dramatic, etc."
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-globo-teal-gradient hover:opacity-90">
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
