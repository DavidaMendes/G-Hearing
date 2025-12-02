"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Calendar, Clock, Upload } from "lucide-react"
import Image from "next/image"

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

interface VideoInfoCardProps {
  video: Video
  onEdit: () => void
}

export function VideoInfoCard({ video, onEdit }: VideoInfoCardProps) {
  const getStatusBadge = (status: Video["status"]) => {
    switch (status) {
      case "processed":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Processado</Badge>
      case "processing":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Processando</Badge>
      case "error":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Erro</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">{video.name}</CardTitle>
        </div>
        {getStatusBadge(video.status)}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="aspect-video relative overflow-hidden rounded-lg">
          <Image src={video.thumbnail || "/placeholder.svg"} alt={video.name} fill className="object-cover" />
          <div className="absolute bottom-2 right-2">
            <Badge className="bg-black/70 text-white border-0">
              <Clock className="h-3 w-3 mr-1" />
              {video.duration}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Upload className="h-4 w-4" />
              <span>Upload: {formatDate(video.uploadDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Material: {formatDate(video.materialDate)}</span>
            </div>
          </div>

          {video.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Descrição</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{video.description}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
