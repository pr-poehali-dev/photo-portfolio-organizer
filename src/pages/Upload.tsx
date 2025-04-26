import { useState, ChangeEvent } from "react";
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
import { Upload as UploadIcon, Folder, X, Image, Check } from "lucide-react";
import { PhotoProps } from "@/components/PhotoCard";

const Upload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState("Общие");
  const [isUploading, setIsUploading] = useState(false);

  // Имитация существующих папок
  const folders = ["Общие", "Природа", "Портреты", "Город", "Макро"];

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
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (files.length === 0) {
      toast({
        title: "Предупреждение",
        description: "Пожалуйста, выберите хотя бы один файл для загрузки.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    
    // Имитация загрузки с задержкой
    setTimeout(() => {
      const uploadedPhotos: PhotoProps[] = files.map((file, index) => ({
        id: Date.now().toString() + index,
        name: file.name.split('.')[0], // Автоматически получаем имя файла без расширения
        url: previews[index],
        folder: selectedFolder,
        date: new Date().toISOString().split('T')[0]
      }));

      // В настоящем приложении здесь был бы API запрос
      console.log("Загруженные фотографии:", uploadedPhotos);
      
      toast({
        title: "Успешно загружено",
        description: `${files.length} фотографий загружено в папку "${selectedFolder}".`,
      });
      
      setIsUploading(false);
      setFiles([]);
      setPreviews([]);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 container py-8 px-4 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Загрузить фотографии</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Выберите папку
                </label>
                <Select 
                  value={selectedFolder} 
                  onValueChange={setSelectedFolder}
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
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2">
                  Выберите фотографии для загрузки
                </label>
                <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center bg-muted/20">
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
                    <Image className="h-12 w-12 text-muted-foreground mb-3" />
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
            <CardContent className="p-6">
              <h3 className="font-medium mb-3 flex items-center">
                <UploadIcon className="h-4 w-4 mr-2" />
                Загрузка
              </h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground mb-3">
                  Выбрано файлов: {files.length}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  Целевая папка: <span className="font-medium text-foreground">{selectedFolder}</span>
                </p>
                <Button 
                  onClick={handleUpload} 
                  className="w-full"
                  disabled={isUploading || files.length === 0}
                >
                  {isUploading ? (
                    <>
                      <span className="animate-pulse mr-2">Загрузка...</span>
                    </>
                  ) : (
                    <>
                      <UploadIcon className="mr-2 h-4 w-4" />
                      Загрузить фотографии
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {previews.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-4">Предварительный просмотр ({previews.length})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
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
