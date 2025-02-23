import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, History, Shield, HelpCircle, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";

const Guide = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>("intro");

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveSection(sectionId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-black/50 backdrop-blur-lg z-50 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex gap-2">
            {["intro", "search", "history", "features", "examples"].map((section) => (
              <Button
                key={section}
                variant={activeSection === section ? "secondary" : "ghost"}
                onClick={() => scrollToSection(section)}
                className="text-sm"
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-24 pb-12 max-w-4xl mx-auto px-4 space-y-16">
        {/* Introduction Section */}
        <section id="intro" className="space-y-6">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-indigo-500">
            User Guide - Crypto Address Detector
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Welcome to the comprehensive guide for Crypto Address Detector. 
            Here you'll learn how to effectively use the system and discover all its features.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-3">Why Use Our System?</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                  Instant wallet type detection
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                  Real-time balance checking
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                  Complete search history
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                  Multi-network support
                </li>
              </ul>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-3">Key Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-violet-500" />
                  Fast address lookup
                </li>
                <li className="flex items-center gap-2">
                  <History className="w-4 h-4 text-violet-500" />
                  Search history tracking
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-violet-500" />
                  Address security checks
                </li>
                <li className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-violet-500" />
                  Available support
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* How to Use Section */}
        <section id="search" className="space-y-6 pt-8">
          <h2 className="text-3xl font-bold">How to Use</h2>
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4">Search Steps</h3>
              <ol className="space-y-4 text-gray-400">
                <li className="flex items-start gap-3">
                  <span className="bg-violet-500/20 text-violet-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">1</span>
                  <p>Paste the wallet address in the main search field</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-violet-500/20 text-violet-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">2</span>
                  <p>System automatically detects the wallet type</p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="bg-violet-500/20 text-violet-500 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">3</span>
                  <p>View results including wallet type, balance, and activity history</p>
                </li>
              </ol>
            </div>
          </div>
        </section>

        {/* History Section */}
        <section id="history" className="space-y-6 pt-8">
          <h2 className="text-3xl font-bold">Search History</h2>
          <div className="space-y-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4">History Features</h3>
              <ul className="space-y-4 text-gray-400">
                <li className="flex items-start gap-3">
                  <History className="w-5 h-5 text-violet-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-white mb-1">Automatic Search Recording</p>
                    <p>Every address you search is automatically saved to your local history</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Search className="w-5 h-5 text-violet-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-white mb-1">Quick Access</p>
                    <p>Easily access your previously searched addresses</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Copy className="w-5 h-5 text-violet-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-white mb-1">One-Click Copy</p>
                    <p>Quickly copy any address from your history with a single click</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <ExternalLink className="w-5 h-5 text-violet-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-white mb-1">Direct Explorer Links</p>
                    <p>Access blockchain explorers directly from your history entries</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="space-y-6 pt-8">
          <h2 className="text-3xl font-bold">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4">Price Tracking</h3>
              <ul className="space-y-2 text-gray-400">
                <li>• Live price updates</li>
                <li>• Multiple currency support</li>
                <li>• Historical data</li>
                <li>• Market trends</li>
              </ul>
            </div>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold mb-4">Security Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>• Address validation</li>
                <li>• Risk assessment</li>
                <li>• Fraud detection</li>
                <li>• Security alerts</li>
              </ul>
            </div>
          </div>

          {/* Supported Networks */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10 mt-6">
            <h3 className="text-xl font-semibold mb-4">Supported Networks</h3>
            <p className="text-gray-400 mb-4">
              Our system currently supports the following cryptocurrency networks:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: "Bitcoin", symbol: "BTC" },
                { name: "Ethereum", symbol: "ETH" },
                { name: "Solana", symbol: "SOL" },
                { name: "Litecoin", symbol: "LTC" },
                { name: "Bitcoin Cash", symbol: "BCH" },
                { name: "Cardano", symbol: "ADA" },
                { name: "Ripple", symbol: "XRP" },
                { name: "TRON", symbol: "TRX" },
                { name: "Dogecoin", symbol: "DOGE" },
                { name: "Binance Coin", symbol: "BNB" }
              ].map((crypto) => (
                <li key={crypto.symbol} className="flex items-center gap-2 text-gray-300">
                  <div className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                  {crypto.name} ({crypto.symbol})
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Examples Section */}
        <section id="examples" className="space-y-6 pt-8">
          <h2 className="text-3xl font-bold">Example Addresses</h2>
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="space-y-4">
              <div>
                <p className="font-medium text-white mb-2">Bitcoin:</p>
                <code className="bg-black/30 px-3 py-1.5 rounded-lg text-sm text-gray-300">
                  1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
                </code>
              </div>
              <div>
                <p className="font-medium text-white mb-2">Ethereum:</p>
                <code className="bg-black/30 px-3 py-1.5 rounded-lg text-sm text-gray-300">
                  0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae
                </code>
              </div>
              <div>
                <p className="font-medium text-white mb-2">Solana:</p>
                <code className="bg-black/30 px-3 py-1.5 rounded-lg text-sm text-gray-300">
                  FMJiuKezug55WtTx6XJQJKLDtPzDj617tvHviY9psdyw
                </code>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Guide;
