import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Trash2, Loader2 } from "lucide-react";

interface DeleteVideoModalProps {
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteVideoModal({
  onConfirm,
  isDeleting,
}: DeleteVideoModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="text-red-500 focus:text-red-400 focus:bg-red-500/10 cursor-pointer w-full flex items-center"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Excluir</span>
        </DropdownMenuItem>
      </DialogTrigger>

      <DialogContent className="bg-[#1E1E1E] border-zinc-800 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-white">Excluir vídeo</DialogTitle>
        </DialogHeader>

        <div className="py-4 text-zinc-400">
          <p>
            Tem certeza que deseja excluir este vídeo permanentemente? Essa ação
            não pode ser desfeita.
          </p>
        </div>

        <DialogFooter className="flex gap-3">
          <DialogClose asChild>
            <Button
              variant="outline"
              className="border-zinc-700 bg-transparent text-white hover:bg-zinc-800 hover:text-white"
            >
              Cancelar
            </Button>
          </DialogClose>

          <Button
            variant="default"
            className="bg-red-600 hover:bg-red-700 text-white border-0"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {isDeleting ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
