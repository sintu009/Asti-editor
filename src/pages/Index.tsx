import {
  FileText,
  Image,
  Layers,
  Pencil,
  Trash,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FeatureCard from "@/components/FeatureCard";

const Index = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-blue-50 to-white py-20">
          <div className="container">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Easy PDF editing right in your browser
                </h1>
                <p className="text-xl text-gray-600 mb-6">
                  Edit PDFs, add images, remove backgrounds, and much more - all
                  online, no installation needed.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/editor">
                    <Button className="bg-pdf-primary hover:bg-blue-700 py-6 px-8 text-lg w-full sm:w-auto">
                      Start Editing
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link to="/features">
                    <Button
                      variant="outline"
                      className="py-6 px-8 text-lg w-full sm:w-auto"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="md:w-1/2">
                <img
                  src="/cover.webp"
                  alt="PDF Editor Interface"
                  className="rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Powerful PDF Editing Features
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Our browser-based editor gives you everything you need to work
                with PDF files.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={Pencil}
                title="Edit Text"
                description="Easily modify text in your PDF documents with our intuitive text editing tools."
              />

              <FeatureCard
                icon={Image}
                title="Add Images"
                description="Insert and manipulate images in your PDFs with just a few clicks."
              />

              <FeatureCard
                icon={Layers}
                title="Background Removal"
                description="Automatically remove backgrounds from images before adding them to your PDF."
              />

              <FeatureCard
                icon={FileText}
                title="Page Management"
                description="Add, remove, and reorder pages within your PDF documents."
              />

              <FeatureCard
                icon={Trash}
                title="Content Removal"
                description="Easily remove unwanted content from your PDF files."
              />

              <FeatureCard
                icon={ArrowRight}
                title="And Much More"
                description="Discover all our powerful features by trying our editor today."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gray-50 py-20 border-y border-gray-200">
          <div className="container text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Ready to edit your PDF files?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Start editing your PDFs right now with our easy-to-use online
              editor.
            </p>
            <Link to="/editor">
              <Button className="bg-pdf-primary hover:bg-blue-700 py-6 px-8 text-lg">
                Start Editing Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
