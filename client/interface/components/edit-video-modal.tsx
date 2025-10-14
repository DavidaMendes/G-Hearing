"use client"
import { useState } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calendar, Save, X } from "lucide-react"

interface Video {
  id: string
  name: string
  uploadDate: string
  materialDate: string
  thumbnail: string
  duration: string
  status: "processed" | "processing" | "error"
  description?: string
}

interface EditVideoModalProps {
  video: Video | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditVideoModal({ video, open, onOpenChange }: EditVideoModalProps) {
  const [formData, setFormData] = useState({
    name: video?.name || "",
    materialDate: video?.materialDate || "",
    description: video?.description || "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Update video:", { id: video?.id, ...formData })
    onOpenChange(false)
  }

  const handleCancel = () => {
    setFormData({
      name: video?.name || "",
      materialDate: video?.materialDate || "",
      description: video?.description || "",
    })
    onOpenChange(false)
  }

  if (!video) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Vídeo</DialogTitle>
          <DialogDescription>Atualize as informações do vídeo</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Vídeo</Label>
            <Input
              id="name"
              placeholder="Nome do vídeo"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="materialDate">Data do Material</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="materialDate"
                type="date"
                value={formData.materialDate}
                onChange={(e) => handleInputChange("materialDate", e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Adicione uma descrição para o vídeo..."
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" className="bg-globo-blue-gradient hover:opacity-90">
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
