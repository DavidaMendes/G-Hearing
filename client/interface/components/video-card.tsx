"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical, Play, Music, Calendar, Clock, Edit, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface Video {
  id: string
  name: string
  uploadDate: string
  materialDate: string
  thumbnail: string
  duration: string
  status: "processed" | "processing" | "error"
  musicCount: number
}

interface VideoCardProps {
  video: Video
}

export function VideoCard({ video }: VideoCardProps) {
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
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50">
      <div className="relative">
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <Image
            src={video.thumbnail || "/placeholder.svg"}
            alt={video.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          <div className="absolute bottom-2 right-2">
            <Badge className="bg-black/70 text-white border-0">
              <Clock className="h-3 w-3 mr-1" />
              {video.duration}
            </Badge>
          </div>
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/video/${video.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver detalhes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {video.name}
            </h3>
            {getStatusBadge(video.status)}
          </div>
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Upload: {formatDate(video.uploadDate)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Play className="h-3 w-3" />
            <span>Material: {formatDate(video.materialDate)}</span>
          </div>
          {video.status === "processed" && (
            <div className="flex items-center gap-1">
              <Music className="h-3 w-3" />
              <span>{video.musicCount} músicas identificadas</span>
            </div>
          )}
        </div>

        <div className="pt-2">
          <Button asChild variant="outline" size="sm" className="w-full bg-transparent">
            <Link href={`/video/${video.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Ver detalhes
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
