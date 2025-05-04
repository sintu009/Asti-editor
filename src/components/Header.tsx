import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface HeaderProps {
  minimal?: boolean;
}

const Header = ({ minimal = false }: HeaderProps) => {
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="container flex items-center justify-between py-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-pdf-primary"
        >
          <FileText className="w-6 h-6" />
          <span>AstI Editor</span>
        </Link>

        {!minimal && (
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/features"
              className="text-gray-600 hover:text-pdf-primary"
            >
              Features
            </Link>
            <Link
              to="/pricing"
              className="text-gray-600 hover:text-pdf-primary"
            >
              Pricing
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-pdf-primary">
              About
            </Link>
          </nav>
        )}

        {!minimal && (
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="hidden md:inline-flex">
              Sign In
            </Button>
            <Button className="bg-pdf-primary hover:bg-blue-700">
              Get Started
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
