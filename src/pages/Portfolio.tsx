import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import PhotoCard, { PhotoProps } from "@/components/PhotoCard";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Folder, FolderPlus, Search, Heart, Archive, RefreshCw, Grid3X3, Grid2X2, Trash2, Info } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

// Ключ для хранения фотографий
const PHOTOS_STORAGE_KEY = 'portfolio-photos';

// Демо-данные для примера
const demoPhotos: PhotoProps[] = [
  {
    id: "1",
    name: "Закат на море",
    url: "https://images.unsplash.com/photo-1500964757637-c85e8a162699",
    folder: "Природа",
    date: "2025-04-26",
    aspectRatio: "landscape" // 15x10
  },
  {
    id: "2",
    name: "Горный пейзаж",
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
    folder: "Природа",
    date: "2025-04-25",
    aspectRatio: "landscape" // 15x10
  },
  {
    id: "3",
    name: "Портрет девушки",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    folder: "Портреты",
    date: "2025-04-24",
    aspectRatio: "portrait" // 10x15
  },
  {
    id: "4",
    name: "Городской пейзаж",
    url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df",
    folder: "Город",
    date: "2025-04-23",
    aspectRatio: "wide" // 16:9
  },
  {
    id: "5",
    name: "Архитектура",
    url: "https://images.unsplash.com/photo-1487958449943-2429e8be8625",
    folder: "Город",
    date: "2025-04-22",
    aspectRatio: "portrait" // 10x15
  },
  {
    id: "6",
    name: "Макрофотография",
    url: "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da",
    folder: "Макро",
    date: "2025-04-21",
    aspectRatio: "square" // 1:1
  },
  {
    id: "7",
    name: "Панорама города",
    url: "https://images.unsplash.com/photo-1496588152823-86ff7695e68f",
    folder: "Город",
    date: "2025-04-20",
    aspectRatio: "panorama" // 3:1
  },
  {
    id: "8",
    name: "Кинематографический пейзаж",
    url: "https://images.unsplash.com/photo-1516298773066-c48f8e9bd92b",
    folder: "Природа",
    date: "2025-04-19",
    aspectRatio: "cinema" // 21:9
  },
  {
    id: "9",
    name: "Моментальное фото",
    url: "https://images.unsplash.com/photo-1465101162946-4377e57745c3",
    folder: "Портреты",
    date: "2025-04-18",
    aspectRatio: "instant" // 5:4
  }
];

// Статистика по фотографиям
interface PhotoStats {
  total: number;
  byFolder: Record<string, number>;
  byAspectRatio: Record<string, number>;
}

const Portfolio = () => {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<PhotoProps[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [currentTab, setCurrentTab] = useState("all");
  const [gridSize, setGridSize] = useState<"default" | "large" | "compact">("default");
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  const [photoStats, setPhotoStats] = useState<PhotoStats>({
    total: 0,
    byFolder: {},
    byAspectRatio: {}
  });
  const [showStats, setShowStats] = useState(false);

  // Загружаем фотографии при монтировании компонента
  useEffect(() => {
    loadPhotos();
  }, []);

  // Функция загрузки фотографий из localStorage
  const loadPhotos = () => {
    try {
      const savedPhotos = localStorage.getItem(PHOTOS_STORAGE_KEY);
      if (savedPhotos) {
        const parsedPhotos = JSON.parse(savedPhotos);
        setPhotos(parsedPhotos);
        calculateStats(parsedPhotos);
      } else {
        // Если в localStorage нет фотографий, используем демо-данные
        setPhotos(demoPhotos);
        calculateStats(demoPhotos);
        // И сохраняем их для дальнейшего использования
        localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(demoPhotos));
      }
    } catch (error) {
      console.error("Ошибка при загрузке фотографий:", error);
      setPhotos(demoPhotos);
      calculateStats(demoPhotos);
    }
  };

  // Рассчитываем статистику по фотографиям
  const calculateStats = (photosData: PhotoProps[]) => {
    const stats: PhotoStats = {
      total: photosData.length,
      byFolder: {},
      byAspectRatio: {}
    };

    photosData.forEach(photo => {
      // Счётчик по папкам
      if (stats.byFolder[photo.folder]) {
        stats.byFolder[photo.folder]++;
      } else {
        stats.byFolder[photo.folder] = 1;
      }

      // Счётчик по соотношениям сторон
      const aspectRatio = photo.aspectRatio || 'unknown';
      if (stats.byAspectRatio[aspectRatio]) {
        stats.byAspectRatio[aspectRatio]++;
      } else {
        stats.byAspectRatio[aspectRatio] = 1;
      }
    });

    setPhotoStats(stats);
  };

  // Получаем уникальные папки из фотографий
  const folders = Array.from(new Set(photos.map(photo => photo.folder)));

  // Фильтруем фотографии по поиску и выбранной папке
  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          photo.folder.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = currentTab === "all" || 
                          (currentTab === "favorites" && photo.folder === "Избранное") ||
                          (currentTab === "archive" && photo.folder === "Архив") ||
                          photo.folder.toLowerCase() === currentTab.toLowerCase();
    return matchesSearch && matchesFolder;
  });

  const handleDeletePhoto = (id: string) => {
    const updatedPhotos = photos.filter(photo => photo.id !== id);
    setPhotos(updatedPhotos);
    localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updatedPhotos));
    calculateStats(updatedPhotos);
  };

  const handleDeleteAllPhotos = () => {
    const photosToKeep = currentTab === "all" 
      ? [] 
      : photos.filter(photo => {
          if (currentTab === "favorites") return photo.folder !== "Избранное";
          if (currentTab === "archive") return photo.folder !== "Архив";
          return photo.folder.toLowerCase() !== currentTab.toLowerCase();
        });
    
    setPhotos(photosToKeep);
    localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(photosToKeep));
    calculateStats(photosToKeep);
    
    toast({
      title: "Фотографии удалены",
      description: currentTab === "all" 
        ? "Все фотографии были удалены" 
        : `Все фотографии в папке "${currentTab === "favorites" ? "Избранное" : currentTab === "archive" ? "Архив" : currentTab}" были удалены`
    });
    
    setIsDeleteAllOpen(false);
  };

  const handleMovePhoto = (id: string, folder: string) => {
    const updatedPhotos = photos.map(photo => 
      photo.id === id ? { ...photo, folder } : photo
    );
    setPhotos(updatedPhotos);
    localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(updatedPhotos));
    calculateStats(updatedPhotos);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      toast({
        title: "Папка создана",
        description: `Папка "${newFolderName}" успешно создана.`
      });
      setNewFolderName("");
    }
  };

  const handleAddPhotos = () => {
    navigate("/upload");
  };

  // Функция для отображения локализованного названия формата
  const getFormatLabel = (format: string): string => {
    switch(format) {
      case 'portrait': return 'Портретный (10×15)';
      case 'landscape': return 'Альбомный (15×10)';
      case 'square': return 'Квадратный (1:1)';
      case 'wide': return 'Широкоформатный (16:9)';
      case 'panorama': return 'Панорама (3:1)';
      case 'cinema': return 'Кинематографический (21:9)';
      case 'instant': return 'Моментальное фото (5:4)';
      default: return format;
    }
  };

  // Определяем класс для сетки в зависимости от выбранного размера
  const getGridClass = () => {
    switch(gridSize) {
      case 'compact':
        return "grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-1";
      case 'large':
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4";
      default: // default
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 container py-4 px-2 sm:py-6 sm:px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
          <h1 className="text-2xl font-bold">Моё портфолио</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск по названию..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleAddPhotos} size="sm">
                <FolderPlus className="mr-2 h-4 w-4" />
                Загрузить фото
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Folder className="mr-2 h-4 w-4" />
                    Новая папка
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Создать новую папку</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <Input
                      placeholder="Название папки"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Отмена</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button onClick={handleCreateFolder}>Создать</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Button 
              variant={gridSize === "compact" ? "secondary" : "outline"} 
              size="icon" 
              onClick={() => setGridSize("compact")}
              className="w-8 h-8"
              title="Компактный вид"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button 
              variant={gridSize === "default" ? "secondary" : "outline"} 
              size="icon" 
              onClick={() => setGridSize("default")}
              className="w-8 h-8"
              title="Стандартный вид"
            >
              <Grid2X2 className="h-4 w-4" />
            </Button>
            <Button 
              variant={gridSize === "large" ? "secondary" : "outline"} 
              size="icon" 
              onClick={() => setGridSize("large")}
              className="w-8 h-8"
              title="Крупный вид"
            >
              <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                <div className="bg-current"></div>
                <div className="bg-current"></div>
              </div>
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowStats(!showStats)}
              className="text-xs flex items-center"
              title="Статистика"
            >
              <Info className="h-3 w-3 mr-1" />
              {photoStats.total} фото
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={loadPhotos}
              className="text-xs flex items-center"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Обновить
            </Button>
            
            {filteredPhotos.length > 0 && (
              <Dialog open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs flex items-center text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Удалить все
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Удалить все фотографии?</DialogTitle>
                    <DialogDescription>
                      {currentTab === "all" 
                        ? "Вы уверены, что хотите удалить все фотографии из галереи? Это действие нельзя отменить." 
                        : `Вы уверены, что хотите удалить все фотографии из папки "${currentTab === "favorites" ? "Избранное" : currentTab === "archive" ? "Архив" : currentTab}"? Это действие нельзя отменить.`}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsDeleteAllOpen(false)}
                    >
                      Отмена
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAllPhotos}
                    >
                      Удалить
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {showStats && (
          <div className="mb-4 p-3 bg-muted/30 rounded-lg text-sm">
            <h3 className="font-medium mb-2">Статистика фотографий</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-medium mb-1">По папкам:</h4>
                <ul className="text-xs space-y-1">
                  {Object.entries(photoStats.byFolder).map(([folder, count]) => (
                    <li key={folder} className="flex justify-between">
                      <span>{folder}</span>
                      <span className="font-medium">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-medium mb-1">По форматам:</h4>
                <ul className="text-xs space-y-1">
                  {Object.entries(photoStats.byAspectRatio).map(([format, count]) => (
                    <li key={format} className="flex justify-between">
                      <span>{getFormatLabel(format)}</span>
                      <span className="font-medium">{count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <Tabs 
          defaultValue="all" 
          onValueChange={setCurrentTab}
          className="w-full"
          value={currentTab}
        >
          <div className="border-b mb-4 overflow-x-auto">
            <TabsList className="bg-transparent h-auto p-0 mb-[-1px] flex">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
              >
                Все фото
              </TabsTrigger>
              <TabsTrigger 
                value="favorites" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 flex items-center"
              >
                <Heart className="h-4 w-4 mr-1" />
                Избранное
              </TabsTrigger>
              <TabsTrigger 
                value="archive" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 flex items-center"
              >
                <Archive className="h-4 w-4 mr-1" />
                Архив
              </TabsTrigger>
              {folders.filter(folder => !["Избранное", "Архив"].includes(folder)).map((folder) => (
                <TabsTrigger
                  key={folder}
                  value={folder.toLowerCase()}
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2 flex items-center"
                >
                  <Folder className="h-4 w-4 mr-1" />
                  {folder}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value={currentTab} className="mt-0">
            <div className={`grid ${getGridClass()}`}>
              {filteredPhotos.length > 0 ? (
                filteredPhotos.map((photo) => (
                  <PhotoCard 
                    key={photo.id} 
                    photo={photo} 
                    onDelete={handleDeletePhoto}
                    onMove={handleMovePhoto}
                    folders={folders}
                  />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center py-12">
                  <p className="text-muted-foreground mb-4">Фотографии не найдены</p>
                  <Button onClick={handleAddPhotos}>
                    <FolderPlus className="mr-2 h-4 w-4" />
                    Загрузить фотографии
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Portfolio;
