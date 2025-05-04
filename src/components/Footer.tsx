import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 py-12">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-bold text-pdf-primary"
          >
            <FileText className="w-6 h-6" />
            <span>Asti Editor</span>
          </Link>
          <p className="text-gray-600">
            Professional PDF editing tools right in your browser.
          </p>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-4">Product</h3>
          <ul className="space-y-2">
            <li>
              <Link
                to="/features"
                className="text-gray-600 hover:text-pdf-primary"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                to="/pricing"
                className="text-gray-600 hover:text-pdf-primary"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                to="/testimonials"
                className="text-gray-600 hover:text-pdf-primary"
              >
                Testimonials
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-4">Resources</h3>
          <ul className="space-y-2">
            <li>
              <Link to="/help" className="text-gray-600 hover:text-pdf-primary">
                Help Center
              </Link>
            </li>
            <li>
              <Link
                to="/guides"
                className="text-gray-600 hover:text-pdf-primary"
              >
                Guides
              </Link>
            </li>
            <li>
              <Link to="/api" className="text-gray-600 hover:text-pdf-primary">
                API
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-medium text-gray-900 mb-4">Company</h3>
          <ul className="space-y-2">
            <li>
              <Link
                to="/about"
                className="text-gray-600 hover:text-pdf-primary"
              >
                About
              </Link>
            </li>
            <li>
              <Link to="/blog" className="text-gray-600 hover:text-pdf-primary">
                Blog
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-gray-600 hover:text-pdf-primary"
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mt-8 pt-8 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600">
            © 2025 AstI Editor. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link
              to="/privacy"
              className="text-gray-600 hover:text-pdf-primary"
            >
              Privacy
            </Link>
            <Link to="/terms" className="text-gray-600 hover:text-pdf-primary">
              Terms
            </Link>
            <Link
              to="/cookies"
              className="text-gray-600 hover:text-pdf-primary"
            >
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
