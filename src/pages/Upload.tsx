import { useState, ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Upload as UploadIcon, Folder, X, Image, Check, ArrowLeft } from "lucide-react";
import { PhotoProps } from "@/components/PhotoCard";

// Создаем локальное хранилище для фотографий
const PHOTOS_STORAGE_KEY = 'portfolio-photos';

// Максимальный размер изображения для хранения
const MAX_IMAGE_WIDTH = 1200;
const MAX_IMAGE_HEIGHT = 1200;

const Upload = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState("Общие");
  const [isUploading, setIsUploading] = useState(false);
  const [customFolderName, setCustomFolderName] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("auto");
  const [uploadProgress, setUploadProgress] = useState(0);

  // Имитация существующих папок
  const [folders, setFolders] = useState<string[]>(["Общие", "Природа", "Портреты", "Город", "Макро"]);

  // Доступные форматы
  const formats = [
    { value: "auto", label: "Автоопределение" },
    { value: "portrait", label: "Портретный (10×15)" },
    { value: "landscape", label: "Альбомный (15×10)" },
    { value: "square", label: "Квадратный (1:1)" },
    { value: "wide", label: "Широкоформатный (16:9)" },
    { value: "panorama", label: "Панорама (3:1)" },
    { value: "cinema", label: "Кинематографический (21:9)" }, 
    { value: "instant", label: "Моментальное фото (5:4)" }
  ];

  // Загружаем существующие папки из хранилища
  useEffect(() => {
    try {
      const savedPhotos = localStorage.getItem(PHOTOS_STORAGE_KEY);
      if (savedPhotos) {
        const photos: PhotoProps[] = JSON.parse(savedPhotos);
        const existingFolders = Array.from(new Set(photos.map(photo => photo.folder)));
        setFolders(prevFolders => {
          const allFolders = [...prevFolders, ...existingFolders];
          return Array.from(new Set(allFolders));
        });
      }
    } catch (error) {
      console.error("Ошибка при загрузке папок:", error);
    }
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      
      // Создаем превью для каждого файла
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setPreviews(prev => [...prev, event.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      });

      // Сбрасываем значение input, чтобы можно было загрузить те же файлы снова
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleFolderChange = (value: string) => {
    if (value === "новая_папка") {
      setShowCustomInput(true);
    } else {
      setShowCustomInput(false);
      setSelectedFolder(value);
    }
  };

  const addCustomFolder = () => {
    if (customFolderName.trim()) {
      // Добавляем новую папку в список
      setFolders(prev => [...prev, customFolderName]);
      setSelectedFolder(customFolderName);
      setCustomFolderName("");
      setShowCustomInput(false);
    }
  };

  // Функция для оптимизации изображения
  const optimizeImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Уменьшаем размер, если превышает максимальный
        if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT) {
          const ratio = Math.min(MAX_IMAGE_WIDTH / width, MAX_IMAGE_HEIGHT / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Сжимаем качество изображения
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = dataUrl;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "Предупреждение",
        description: "Пожалуйста, выберите хотя бы один файл для загрузки.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Загружаем существующие фотографии
      let existingPhotos: PhotoProps[] = [];
      const savedPhotos = localStorage.getItem(PHOTOS_STORAGE_KEY);
      if (savedPhotos) {
        existingPhotos = JSON.parse(savedPhotos);
      }

      // Создаем новые записи о фотографиях, оптимизируя изображения
      const uploadedPhotos: PhotoProps[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const preview = previews[i];
        
        // Оптимизируем изображение
        const optimizedImage = await optimizeImage(preview);
        
        // Обновляем прогресс
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        
        uploadedPhotos.push({
          id: Date.now().toString() + i,
          name: file.name.split('.')[0], // Автоматически получаем имя файла без расширения
          url: optimizedImage,
          folder: selectedFolder,
          date: new Date().toISOString().split('T')[0],
          aspectRatio: determineAspectRatio(file.name) // Добавляем информацию о соотношении сторон
        });
      }

      // Объединяем существующие и новые фотографии
      const allPhotos = [...existingPhotos, ...uploadedPhotos];
      
      // Сохраняем в локальное хранилище порциями, если много фотографий
      // Удаляем старые фото, если их слишком много
      if (allPhotos.length > 100) {
        const photosToKeep = allPhotos.slice(-100);
        localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(photosToKeep));
        toast({
          title: "Внимание",
          description: "Было сохранено только последние 100 фотографий из-за ограничений хранилища.",
          variant: "warning"
        });
      } else {
        localStorage.setItem(PHOTOS_STORAGE_KEY, JSON.stringify(allPhotos));
      }
      
      toast({
        title: "Успешно загружено",
        description: `${files.length} фотографий загружено в папку "${selectedFolder}".`,
      });
      
      setIsUploading(false);
      setFiles([]);
      setPreviews([]);
      setUploadProgress(0);

      // Перенаправляем пользователя в галерею
      navigate("/portfolio");
    } catch (error) {
      console.error("Ошибка при загрузке:", error);
      toast({
        title: "Ошибка при загрузке",
        description: "Не удалось сохранить фотографии. Возможно, превышен лимит хранилища.",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  // Функция для определения соотношения сторон фотографии
  const determineAspectRatio = (filename: string): string => {
    if (selectedFormat !== "auto") {
      return selectedFormat;
    }
    
    // Автоопределение по имени файла
    const lowerFilename = filename.toLowerCase();
    
    if (lowerFilename.includes("10x15") || lowerFilename.includes("портрет")) 
      return "portrait"; // 2:3
    if (lowerFilename.includes("15x10") || lowerFilename.includes("альбом")) 
      return "landscape"; // 3:2
    if (lowerFilename.includes("квадрат")) 
      return "square"; // 1:1
    if (lowerFilename.includes("16x9") || lowerFilename.includes("wide")) 
      return "wide"; // 16:9
    if (lowerFilename.includes("панорама") || lowerFilename.includes("panorama")) 
      return "panorama"; // 3:1
    if (lowerFilename.includes("21x9") || lowerFilename.includes("cinema")) 
      return "cinema"; // 21:9
    if (lowerFilename.includes("5x4") || lowerFilename.includes("instant")) 
      return "instant"; // 5:4
    
    // По умолчанию, если не можем определить
    const random = Math.random();
    if (random < 0.4) return "landscape";
    if (random < 0.7) return "portrait";
    if (random < 0.85) return "square";
    if (random < 0.9) return "wide";
    if (random < 0.95) return "panorama";
    if (random < 0.98) return "cinema";
    return "instant";
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 container py-6 px-4 max-w-4xl mx-auto">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/portfolio")}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Назад к галерее
          </Button>
          <h1 className="text-2xl font-bold">Загрузить фотографии</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="md:col-span-2">
            <CardContent className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Выберите папку
                </label>
                {showCustomInput ? (
                  <div className="flex gap-2">
                    <Input
                      value={customFolderName}
                      onChange={(e) => setCustomFolderName(e.target.value)}
                      placeholder="Название новой папки"
                      className="flex-1"
                    />
                    <Button onClick={addCustomFolder} size="sm">
                      <Check className="h-4 w-4 mr-1" /> Добавить
                    </Button>
                  </div>
                ) : (
                  <Select 
                    value={selectedFolder} 
                    onValueChange={handleFolderChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите папку" />
                    </SelectTrigger>
                    <SelectContent>
                      {folders.map(folder => (
                        <SelectItem key={folder} value={folder}>
                          <div className="flex items-center">
                            <Folder className="mr-2 h-4 w-4" />
                            {folder}
                          </div>
                        </SelectItem>
                      ))}
                      <SelectItem value="новая_папка">
                        <div className="flex items-center text-primary">
                          <Folder className="mr-2 h-4 w-4" />
                          + Создать новую папку
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Формат фотографий
                </label>
                <Select 
                  value={selectedFormat} 
                  onValueChange={setSelectedFormat}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Выберите формат" />
                  </SelectTrigger>
                  <SelectContent>
                    {formats.map(format => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  При выборе "Автоопределение" формат будет установлен по имени файла или случайным образом
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Выберите фотографии для загрузки
                </label>
                <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center bg-muted/20">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileChange}
                  />
                  <label 
                    htmlFor="file-upload" 
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Image className="h-10 w-10 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Перетащите файлы сюда или нажмите для выбора
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Поддерживаются форматы JPG, PNG, WebP
                    </p>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3 flex items-center">
                <UploadIcon className="h-4 w-4 mr-2" />
                Загрузка
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Выбрано файлов: {files.length}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Целевая папка: <span className="font-medium text-foreground">{selectedFolder}</span>
                </p>
                
                {isUploading && (
                  <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-primary h-2.5 rounded-full transition-all" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {uploadProgress}%
                    </p>
                  </div>
                )}
                
                <Button 
                  onClick={handleUpload} 
                  className="w-full"
                  disabled={isUploading || files.length === 0}
                >
                  {isUploading ? (
                    <>
                      <span className="mr-2">Загрузка...</span>
                    </>
                  ) : (
                    <>
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Загрузить фотографии
                    </>
                  )}
                </Button>
                
                <p className="text-xs text-muted-foreground mt-2">
                  Фотографии сохраняются локально. Оптимизация размера позволяет сохранить больше фото.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {previews.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-3">Предварительный просмотр ({previews.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square overflow-hidden rounded-lg shadow-sm border">
                    <img 
                      src={preview} 
                      alt={`Preview ${index}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <p className="text-xs truncate mt-1 text-muted-foreground">
                    {files[index]?.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
