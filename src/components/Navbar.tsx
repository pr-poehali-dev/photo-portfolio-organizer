import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FolderOpen, Upload, Home } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="bg-card shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <FolderOpen className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-semibold">ФотоПортфолио</span>
            </Link>
          </div>
          <div className="flex space-x-4">
            <Button asChild variant="ghost">
              <Link to="/" className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Главная
              </Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/portfolio" className="flex items-center">
                <FolderOpen className="mr-2 h-4 w-4" />
                Портфолио
              </Link>
            </Button>
            <Button asChild>
              <Link to="/upload" className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                Загрузить
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
