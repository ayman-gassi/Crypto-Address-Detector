import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AddressChecker from "@/components/AddressChecker";
import CryptoPrices from "@/components/CryptoPrices";
import { Button } from "@/components/ui/button";
import { FileText, Shield, HelpCircle, BookOpen, History, SearchCode, Users, Share2 } from "lucide-react";
import { useDevice } from "@/hooks/use-device";
import { motion } from "framer-motion";

const Index = () => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isMobile,
    isTablet,
    width
  } = useDevice();

  const cryptoIcons = [
    { symbol: 'BTC', name: 'Bitcoin', image: '/lovable-uploads/df9dfb5f-a137-4432-bb50-3272c025312c.png' },
    { symbol: 'ETH', name: 'Ethereum', image: '/lovable-uploads/66c61bbc-c67a-414a-8c72-c704f3ceea33.png' },
    { symbol: 'SOL', name: 'Solana', image: '/lovable-uploads/8e78163c-2807-4f6b-a07b-9dcb5101533c.png' },
    { symbol: 'USDT', name: 'Tether', image: '/lovable-uploads/3e1a2ab8-a663-4aab-9e49-c8606ea56aec.png' },
    { symbol: 'XRP', name: 'Ripple', image: '/lovable-uploads/df9dfb5f-a137-4432-bb50-3272c025312c.png' },
    { symbol: 'DOGE', name: 'Dogecoin', image: '/lovable-uploads/df9dfb5f-a137-4432-bb50-3272c025312c.png' },
    { symbol: 'ADA', name: 'Cardano', image: '/lovable-uploads/66c61bbc-c67a-414a-8c72-c704f3ceea33.png' },
    { symbol: 'BNB', name: 'Binance Coin', image: '/lovable-uploads/8e78163c-2807-4f6b-a07b-9dcb5101533c.png' },
    { symbol: 'LTC', name: 'Litecoin', image: '/lovable-uploads/3e1a2ab8-a663-4aab-9e49-c8606ea56aec.png' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFirstLoad(false);
    }, 1000);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const getTitleSize = () => {
    if (width < 375) return 'text-2xl';
    if (width < 640) return 'text-3xl';
    if (width < 768) return 'text-4xl';
    return 'text-6xl';
  };

  const getRandomCoins = (count: number) => {
    const coins = [...cryptoIcons];
    const result = [];
    const usedSymbols = new Map<string, number>();

    while (result.length < count && coins.length > 0) {
      const randomIndex = Math.floor(Math.random() * coins.length);
      const coin = coins[randomIndex];
      const symbolCount = usedSymbols.get(coin.symbol) || 0;

      if (symbolCount < 2) {
        result.push(coin);
        usedSymbols.set(coin.symbol, symbolCount + 1);
      }
      coins.splice(randomIndex, 1);
    }

    return result;
  };

  const floatingCoins = getRandomCoins(6);

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <div className="fixed inset-0 grid-pattern opacity-30"></div>

      {floatingCoins.map((coin, i) => {
        return (
          <motion.img
            key={`coin-${i}-${coin.symbol}`}
            src={coin.image}
            alt={coin.symbol}
            className="fixed w-12 h-12 opacity-20"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0.5
            }}
            animate={{
              x: [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth
              ],
              y: [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight
              ],
              scale: [0.5, 0.7, 0.5]
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear"
            }}
          />
        );
      })}
      
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isMobile && <span className="font-semibold text-sm bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-violet-600">CryptoX</span>}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size={isMobile ? "sm" : "default"} onClick={() => navigate('/terms')} className="group relative hover:bg-white/5">
              <FileText className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'} text-violet-400 group-hover:text-violet-300 transition-colors`} />
              {!isMobile && <span>Terms</span>}
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Button>

            <Button variant="ghost" size={isMobile ? "sm" : "default"} onClick={() => navigate('/privacy')} className="group relative hover:bg-white/5">
              <Shield className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'} text-violet-400 group-hover:text-violet-300 transition-colors`} />
              {!isMobile && <span>Privacy</span>}
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Button>

            <Button variant="ghost" size={isMobile ? "sm" : "default"} onClick={() => navigate('/support')} className="group relative hover:bg-white/5">
              <HelpCircle className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'} text-violet-400 group-hover:text-violet-300 transition-colors`} />
              {!isMobile && <span>Support</span>}
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Button>

            <Button variant="ghost" size={isMobile ? "sm" : "default"} onClick={() => navigate('/guide')} className="group relative hover:bg-white/5">
              <BookOpen className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'} text-violet-400 group-hover:text-violet-300 transition-colors`} />
              {!isMobile && <span>Guide</span>}
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-violet-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Button>
          </div>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-screen p-2 sm:p-4 md:p-6">
        <div className="w-full max-w-4xl space-y-4 sm:space-y-6 md:space-y-8">
          <CryptoPrices />
          
          <div className="text-center space-y-2 sm:space-y-4 px-2 mt-16">
            <h1 className={`${getTitleSize()} font-bold tracking-tight relative glow ${isFirstLoad ? 'animate-title-entry' : ''}`}>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/70 to-primary-foreground">
                Crypto Address Detector
              </span>
            </h1>
            <p className={`text-sm ${isMobile ? 'text-base' : 'sm:text-lg'} text-gray-400 max-w-2xl mx-auto`}>
              Enter a cryptocurrency address to instantly detect its type and network
            </p>
            
            <div className="flex flex-wrap justify-center items-center gap-4 mt-4">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => navigate('/history')} 
                className="relative group bg-gradient-to-r from-violet-600/20 to-violet-800/20 hover:from-violet-600/30 hover:to-violet-800/30 border-violet-500/50 hover:border-violet-400 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
              >
                <History className="w-4 h-4 mr-2" />
                <span className="text-violet-100">Transaction History</span>
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-violet-500/20 to-violet-700/20 animate-pulse"></div>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/transactions')}
                className="relative group bg-gradient-to-r from-teal-600/20 to-teal-800/20 hover:from-teal-600/30 hover:to-teal-800/30 border-teal-500/50 hover:border-teal-400 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
              >
                <SearchCode className="w-4 h-4 mr-2" />
                <span className="text-teal-100">Transactions Investigator</span>
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-teal-500/20 to-teal-700/20 animate-pulse"></div>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/multiple-addresses')}
                className="relative group bg-gradient-to-r from-orange-600/20 to-orange-800/20 hover:from-orange-600/30 hover:to-orange-800/30 border-orange-500/50 hover:border-orange-400 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
              >
                <Users className="w-4 h-4 mr-2" />
                <span className="text-orange-100">Multiple Addresses Checker</span>
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-orange-500/20 to-orange-700/20 animate-pulse"></div>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/transactions-graph')}
                className="relative group bg-gradient-to-r from-purple-600/20 to-purple-800/20 hover:from-purple-600/30 hover:to-purple-800/30 border-purple-500/50 hover:border-purple-400 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
              >
                <Share2 className="w-4 h-4 mr-2" />
                <span className="text-purple-100">Transaction Flow Visualizer</span>
                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-purple-500/20 to-purple-700/20 animate-pulse"></div>
              </Button>
            </div>
          </div>
          
          <AddressChecker initialAddress={location.state?.address} />
          
          <div className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} text-gray-500 animate-fade-in text-center`}>
            Supports Bitcoin, Ethereum, Solana, and many other networks
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
