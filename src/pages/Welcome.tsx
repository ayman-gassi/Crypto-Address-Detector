
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface WelcomeProps {
  setHasSeenWelcome: (value: boolean) => void;
}

const Welcome = ({ setHasSeenWelcome }: WelcomeProps) => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

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
    setMounted(true);
  }, []);

  const handleGetStarted = () => {
    try {
      document.cookie = "welcomeSeen=true; path=/; max-age=31536000";
      setHasSeenWelcome(true);
      navigate('/', { replace: true });
    } catch (error) {
      console.error("Navigation error:", error);
    }
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

  const floatingCoins = getRandomCoins(10);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-background via-background to-purple-950/20">
      <div className="fixed inset-0 grid-pattern opacity-30"></div>
      
      {/* מטבעות מרחפים עם אנימציה מיידית */}
      {floatingCoins.map((coin, i) => {
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        
        return (
          <motion.img
            key={`coin-${i}-${coin.symbol}`}
            src={coin.image}
            alt={coin.symbol}
            className="fixed w-12 h-12 opacity-20"
            initial={{
              x: startX,
              y: startY,
              scale: 0.5
            }}
            animate={{
              x: [
                startX,
                startX + (Math.random() - 0.5) * 200,
                startX + (Math.random() - 0.5) * 200,
                startX
              ],
              y: [
                startY,
                startY + (Math.random() - 0.5) * 200,
                startY + (Math.random() - 0.5) * 200,
                startY
              ],
              scale: [0.5, 0.7, 0.5]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
              times: [0, 0.33, 0.66, 1]
            }}
          />
        );
      })}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: mounted ? 1 : 0, scale: mounted ? 1 : 0.9 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center space-y-8 max-w-3xl px-4"
      >
        {/* לוגו בגודל מתאים */}
        <div className="relative mx-auto w-40 h-40 mb-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative w-full h-full"
          >
            <img 
              src="/lovable-uploads/1497c0be-9460-453a-9cb9-589645470fd6.png"
              alt="Cryptive Logo"
              className="w-full h-full object-contain drop-shadow-lg filter brightness-150 contrast-125"
            />
          </motion.div>
        </div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-violet-500 to-purple-600">
            Welcome to Cryptive
          </span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto"
        >
          Your gateway to effortless cryptocurrency address detection and transaction tracking.
          Supporting Bitcoin, Ethereum, Solana, Litecoin, Cardano, Ripple, TRON, Dogecoin, Bitcoin Cash, and many more networks.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
        >
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="relative group px-8 py-6 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 transition-all duration-500 transform hover:scale-105"
          >
            <span className="relative z-10">Get Started</span>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-md"></div>
          </Button>
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </div>
  );
};

export default Welcome;

