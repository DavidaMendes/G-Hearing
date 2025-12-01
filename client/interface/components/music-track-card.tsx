"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Clock,
  Calendar,
  Edit,
  Eye,
  Trash2,
  Music,
} from "lucide-react";

// Updated Interface
interface MusicTrack {
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
}

interface MusicTrackCardProps {
  track: MusicTrack;
  onEdit: () => void;
  onViewDetails: () => void;
}

export function MusicTrackCard({
  track,
  onEdit,
  onViewDetails,
}: MusicTrackCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString || dateString === "N/A") return "Data n/d";
    try {
      return new Date(dateString).toLocaleDateString("pt-BR");
    } catch (e) {
      return dateString;
    }
  };

  const timeToSeconds = (timeStr: string) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":").map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  };

  const calculateDuration = () => {
    if (track.startTime && track.endTime) {
      const start = timeToSeconds(track.startTime);
      const end = timeToSeconds(track.endTime);
      const diff = end - start;

      if (diff > 0) {
        const minutes = Math.floor(diff / 60);
        const seconds = diff % 60;
        return `${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;
      }
    }
    return track.duration || "--:--";
  };

  const displayDuration = calculateDuration();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <h3 className="font-semibold text-sm leading-tight">
                  {track.title}
                </h3>
                <p className="text-xs text-muted-foreground">{track.album}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="space-y-1">
                <p className="text-muted-foreground">ISRC</p>
                <p className="font-mono">{track.isrc || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Duração</p>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span className="font-medium">{displayDuration}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Início</p>
                <div className="flex items-center gap-1">
                  <Play className="h-3 w-3" />
                  <span>{track.startTime || "00:00:00"}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Fim</p>
                <span>{track.endTime || "00:00:00"}</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Music className="h-3 w-3" />
                <span>Artista: {track.performers || "Desconhecido"}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Data: {formatDate(track.date)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onViewDetails}>
              <Eye className="h-4 w-4" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onViewDetails}>
                  <Eye className="h-4 w-4 mr-2" />
                  Ver detalhes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
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
      </CardContent>
    </Card>
  );
}
