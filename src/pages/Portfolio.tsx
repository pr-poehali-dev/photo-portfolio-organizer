import { useState } from "react";
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
import { Folder, FolderPlus, Search } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

// Демо-данные для примера
const demoPhotos: PhotoProps[] = [
  {
    id: "1",
    name: "Закат на море",
    url: "https://images.unsplash.com/photo-1500964757637-c85e8a162699",
    folder: "Природа",
    date: "2025-04-26"
  },
  {
    id: "2",
    name: "Горный пейзаж",
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
    folder: "Природа",
    date: "2025-04-25"
  },
  {
    id: "3",
    name: "Портрет девушки",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    folder: "Портреты",
    date: "2025-04-24"
  },
  {
    id: "4",
    name: "Городской пейзаж",
    url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df",
    folder: "Город",
    date: "2025-04-23"
  },
  {
    id: "5",
    name: "Архитектура",
    url: "https://images.unsplash.com/photo-1487958449943-2429e8be8625",
    folder: "Город",
    date: "2025-04-22"
  },
  {
    id: "6",
    name: "Макрофотография",
    url: "https://images.unsplash.com/photo-1534349762230-e0cadf78f5da",
    folder: "Макро",
    date: "2025-04-21"
  }
];

const Portfolio = () => {
  const [photos, setPhotos] = useState<PhotoProps[]>(demoPhotos);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [currentTab, setCurrentTab] = useState("all");

  // Получаем уникальные папки из фотографий
  const folders = ["Все", ...Array.from(new Set(photos.map(photo => photo.folder)))];

  // Фильтруем фотографии по поиску и выбранной папке
  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = currentTab === "all" || photo.folder.toLowerCase() === currentTab.toLowerCase();
    return matchesSearch && matchesFolder;
  });

  const handleDeletePhoto = (id: string) => {
    setPhotos(photos.filter(photo => photo.id !== id));
  };

  const handleMovePhoto = (id: string, folder: string) => {
    setPhotos(photos.map(photo => 
      photo.id === id ? { ...photo, folder } : photo
    ));
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 container py-8 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Моё портфолио</h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
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
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FolderPlus className="mr-2 h-4 w-4" />
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

        <Tabs 
          defaultValue="all" 
          onValueChange={setCurrentTab}
          className="w-full"
        >
          <div className="border-b mb-6">
            <TabsList className="bg-transparent h-auto p-0 mb-[-1px]">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
              >
                Все фото
              </TabsTrigger>
              {folders.filter(folder => folder !== "Все").map((folder) => (
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

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredPhotos.length > 0 ? (
                filteredPhotos.map((photo) => (
                  <PhotoCard 
                    key={photo.id} 
                    photo={photo} 
                    onDelete={handleDeletePhoto}
                    onMove={handleMovePhoto}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">Фотографии не найдены</p>
                </div>
              )}
            </div>
          </TabsContent>

          {folders.filter(folder => folder !== "Все").map((folder) => (
            <TabsContent key={folder} value={folder.toLowerCase()} className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredPhotos.length > 0 ? (
                  filteredPhotos.map((photo) => (
                    <PhotoCard 
                      key={photo.id} 
                      photo={photo}
                      onDelete={handleDeletePhoto}
                      onMove={handleMovePhoto}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">Фотографии не найдены</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default Portfolio;
