import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import { FolderOpen, Upload } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center bg-gradient-to-r from-accent to-background">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h1 className="text-5xl font-bold mb-6 text-foreground">Ваше идеальное фотопортфолио</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Удобное хранение, организация и демонстрация ваших фотографий в одном месте.
            Создавайте папки, упорядочивайте снимки и делитесь своим творчеством.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="animate-fade-in">
              <Link to="/portfolio" className="flex items-center">
                <FolderOpen className="mr-2 h-5 w-5" />
                Смотреть портфолио
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="animate-fade-in delay-150">
              <Link to="/upload" className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Загрузить фото
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <footer className="bg-card py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} ФотоПортфолио. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
