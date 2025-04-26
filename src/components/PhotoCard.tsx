import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Folder, MoreVertical, Edit, Trash2, Heart, Archive, Eye } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTrigger
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

export interface PhotoProps {
  id: string;
  name: string;
  url: string;
  folder: string;
  date: string;
  aspectRatio?: string; // 'portrait' (10x15) или 'landscape' (15x10)
}

interface PhotoCardProps {
  photo: PhotoProps;
  onDelete?: (id: string) => void;
  onMove?: (id: string, folder: string) => void;
  folders?: string[];
}

const PhotoCard = ({ photo, onDelete, onMove, folders = [] }: PhotoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleDelete = () => {
    if (onDelete) {
      onDelete(photo.id);
      toast({
        title: "Фото удалено",
        description: `Фото "${photo.name}" было успешно удалено.`
      });
    }
  };

  const handleMoveToFolder = (folderName: string) => {
    if (onMove) {
      onMove(photo.id, folderName);
      toast({
        title: "Фото перемещено",
        description: `Фото "${photo.name}" перемещено в папку "${folderName}".`
      });
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Удалено из избранного" : "Добавлено в избранное",
      description: `Фото "${photo.name}" ${isLiked ? "удалено из" : "добавлено в"} избранное.`
    });
  };

  // Определяем класс для соотношения сторон
  const aspectRatioClass = photo.aspectRatio === 'portrait'
    ? "aspect-[2/3]" // соотношение 10x15
    : photo.aspectRatio === 'landscape'
      ? "aspect-[3/2]" // соотношение 15x10
      : "aspect-square"; // по умолчанию квадрат

  return (
    <Card 
      className="overflow-hidden group transition-all duration-300 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Dialog>
        <div className="relative">
          <CardContent className="p-0">
            <DialogTrigger className="w-full">
              <div className={`${aspectRatioClass} overflow-hidden`}>
                <img 
                  src={photo.url} 
                  alt={photo.name} 
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </DialogTrigger>
            
            <DialogContent className="p-0 max-w-4xl w-[95vw] overflow-hidden bg-transparent border-none shadow-none">
              <img 
                src={photo.url} 
                alt={photo.name} 
                className="w-full h-full object-contain max-h-[90vh]"
              />
            </DialogContent>
            
            {isHovered && (
              <div className="absolute top-2 right-2 flex space-x-1">
                <button 
                  className={`p-1 rounded-full bg-background/80 text-foreground hover:bg-background ${isLiked ? 'text-red-500' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike();
                  }}
                >
                  <Heart className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} />
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <button className="p-1 rounded-full bg-background/80 text-foreground hover:bg-background">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleMoveToFolder("Избранное");
                    }}>
                      <Heart className="mr-2 h-4 w-4" />
                      <span>В избранное</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleMoveToFolder("Архив");
                    }}>
                      <Archive className="mr-2 h-4 w-4" />
                      <span>В архив</span>
                    </DropdownMenuItem>
                    
                    {folders.length > 0 && (
                      <>
                        <DropdownMenuSeparator />
                        {folders.map(folder => (
                          <DropdownMenuItem 
                            key={folder} 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveToFolder(folder);
                            }}
                            disabled={folder === photo.folder}
                          >
                            <Folder className="mr-2 h-4 w-4" />
                            <span>{folder}</span>
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }} 
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Удалить</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </CardContent>
        </div>
        <CardFooter className="flex flex-col items-start pt-3 pb-3">
          <div className="text-sm font-medium truncate w-full">{photo.name}</div>
          <div className="text-xs text-muted-foreground flex items-center gap-1 w-full justify-between">
            <div className="flex items-center">
              <Folder className="h-3 w-3 mr-1" />
              {photo.folder}
            </div>
            <div className="text-xs opacity-60">
              {photo.aspectRatio === 'portrait' ? '10×15' : photo.aspectRatio === 'landscape' ? '15×10' : '1:1'}
            </div>
          </div>
        </CardFooter>
      </Dialog>
    </Card>
  );
};

export default PhotoCard;
