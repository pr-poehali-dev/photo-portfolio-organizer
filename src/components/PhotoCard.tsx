import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Folder, MoreVertical, Edit, Trash2 } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";

export interface PhotoProps {
  id: string;
  name: string;
  url: string;
  folder: string;
  date: string;
}

interface PhotoCardProps {
  photo: PhotoProps;
  onDelete?: (id: string) => void;
  onMove?: (id: string, folder: string) => void;
}

const PhotoCard = ({ photo, onDelete, onMove }: PhotoCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <Card 
      className="overflow-hidden group transition-all duration-300 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <CardContent className="p-0">
          <img 
            src={photo.url} 
            alt={photo.name} 
            className="w-full aspect-square object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
          {isHovered && (
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded-full bg-background/80 text-foreground hover:bg-background">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleMoveToFolder("Избранное")}>
                    <Folder className="mr-2 h-4 w-4" />
                    <span>Переместить в Избранное</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleMoveToFolder("Архив")}>
                    <Folder className="mr-2 h-4 w-4" />
                    <span>Переместить в Архив</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
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
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Folder className="h-3 w-3" />
          {photo.folder}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PhotoCard;
