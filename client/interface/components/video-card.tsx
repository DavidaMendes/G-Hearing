"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Play,
  Music,
  Calendar,
  Clock,
  Eye,
  Trash2,
  Loader2,
  Hash,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export interface Video {
  id: string;
  name: string;
  uploadDate: string;
  materialDate: string;
  thumbnail: string;
  duration: string;
  status: "processed" | "processing" | "error";
  musicCount: number;
}

interface VideoCardProps {
  video: Video;
  onDeleteSuccess?: (id: string) => void;
}

export function VideoCard({ video, onDeleteSuccess }: VideoCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusBadge = (status: Video["status"]) => {
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
            Falha
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Data desconhecida";
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este vídeo permanentemente?"))
      return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/videos/${video.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Falha ao deletar");
      if (onDeleteSuccess) onDeleteSuccess(video.id);
    } catch (error) {
      console.error(error);
      alert("Erro ao deletar vídeo.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border/50">
      <div className="relative">
        <div className="aspect-video relative overflow-hidden rounded-t-lg bg-muted">
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
              {video.duration || "--:--"}
            </Badge>
          </div>

          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/video/${video.id}`} className="cursor-pointer">
                    <Eye className="h-4 w-4 mr-2" /> Detalhes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-destructive cursor-pointer"
                >
                  {isDeleting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-xs font-mono text-muted-foreground mb-1 block">
                ID: {video.id}
              </span>
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {video.name}
              </h3>
            </div>
            {getStatusBadge(video.status)}
          </div>
        </div>

        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1" title="Data de Upload">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(video.uploadDate)}</span>
          </div>

          <div className="flex items-center gap-1">
            <Music className="h-3 w-3" />
            <span>{video.musicCount} música(s)</span>
          </div>
        </div>

        <div className="pt-2">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full bg-transparent"
          >
            <Link href={`/video/${video.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Ver detalhes
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
