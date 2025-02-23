
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { useDevice } from "@/hooks/use-device";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CryptoPrice {
  symbol: string;
  name: string;
  price: string;
  change24h: string;
}

const CryptoPrices = () => {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const { isMobile, isTablet } = useDevice();
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchPrices = async () => {
    try {
      const [btcResponse, ethResponse, solResponse] = await Promise.all([
        fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT'),
        fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT'),
        fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=SOLUSDT')
      ]);

      const [btcData, ethData, solData] = await Promise.all([
        btcResponse.json(),
        ethResponse.json(),
        solResponse.json()
      ]);

      const formattedPrices: CryptoPrice[] = [
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          price: `$${parseFloat(btcData.lastPrice).toLocaleString(undefined, { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2 
          })}`,
          change24h: (+btcData.priceChangePercent).toFixed(2)
        },
        {
          symbol: 'ETH',
          name: 'Ethereum',
          price: `$${parseFloat(ethData.lastPrice).toLocaleString(undefined, { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2 
          })}`,
          change24h: (+ethData.priceChangePercent).toFixed(2)
        },
        {
          symbol: 'SOL',
          name: 'Solana',
          price: `$${parseFloat(solData.lastPrice).toLocaleString(undefined, { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2 
          })}`,
          change24h: (+solData.priceChangePercent).toFixed(2)
        }
      ];

      setPrices(formattedPrices);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching prices:', error);
      toast.error('Failed to fetch crypto prices');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: string) => {
    if (isTablet) {
      return price.replace(/\.\d{2}/, x => x.slice(0, 2));
    }
    return price;
  };

  const getDeviceSpecificClasses = () => {
    if (isMobile) {
      return {
        container: 'px-2 py-1.5',
        icon: 'w-3 h-3',
        price: 'text-[11px]',
        change: 'text-[10px]',
        gap: 'gap-1.5',
        divider: 'mx-1'
      };
    }
    if (isTablet) {
      return {
        container: 'px-3 py-2',
        icon: 'w-4 h-4',
        price: 'text-sm',
        change: 'text-xs',
        gap: 'gap-3',
        divider: 'mx-2'
      };
    }
    return {
      container: 'px-4 py-2.5',
      icon: 'w-5 h-5',
      price: 'text-base',
      change: 'text-sm',
      gap: 'gap-4',
      divider: 'mx-3'
    };
  };

  const classes = getDeviceSpecificClasses();

  const handleCryptoClick = (symbol: string) => {
    setSelectedCrypto(symbol);
  };

  const getChartSymbol = (symbol: string) => {
    return `BINANCE:${symbol}USDT`;
  };

  const renderLoadingSkeleton = () => (
    <div className="fixed top-0 left-0 right-0 z-50 px-2 py-2">
      <div className="flex justify-center items-center">
        <div className="gradient-border flex items-center gap-4 backdrop-blur-md p-2 max-w-4xl mx-auto">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2 animate-pulse">
              <div className="w-5 h-5 bg-white/10 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-4 bg-white/10 rounded-full w-16"></div>
                <div className="h-3 bg-white/10 rounded-full w-12"></div>
              </div>
            </div>
          ))}
          <div className="w-px h-8 bg-white/10 mx-2"></div>
          <div className="w-16 h-8 bg-white/10 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {loading ? (
        renderLoadingSkeleton()
      ) : (
        <div className="sticky top-[56px] left-0 right-0 z-20 px-2 py-2 min-h-[56px]">
          <div className="flex justify-center items-center">
            <div className={`gradient-border flex items-center ${classes.gap} backdrop-blur-md ${classes.container} max-w-4xl mx-auto overflow-x-auto scrollbar-hide`}>
              {prices.map((crypto) => (
                <div
                  key={crypto.symbol}
                  className={`flex items-center ${classes.gap} transition-all duration-300 group cursor-pointer`}
                  onClick={() => handleCryptoClick(crypto.symbol)}
                >
                  <div className={`flex items-center ${classes.gap}`}>
                    {crypto.symbol === 'BTC' && (
                      <img src="/lovable-uploads/3e1a2ab8-a663-4aab-9e49-c8606ea56aec.png" alt="Bitcoin" className={`${classes.icon} group-hover:animate-spin transition-all duration-700`} />
                    )}
                    {crypto.symbol === 'ETH' && (
                      <img src="/lovable-uploads/66c61bbc-c67a-414a-8c72-c704f3ceea33.png" alt="Ethereum" className={`${classes.icon} group-hover:animate-spin transition-all duration-700`} />
                    )}
                    {crypto.symbol === 'SOL' && (
                      <img src="/lovable-uploads/df9dfb5f-a137-4432-bb50-3272c025312c.png" alt="Solana" className={`${classes.icon} group-hover:animate-spin transition-all duration-700`} />
                    )}
                    <div className={`flex ${isMobile ? 'flex-col items-start' : 'items-center'} ${classes.gap}`}>
                      <span className={`${classes.price} font-medium whitespace-nowrap`}>
                        {formatPrice(crypto.price)}
                      </span>
                      <span className={`${classes.change} font-medium whitespace-nowrap ${parseFloat(crypto.change24h) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {parseFloat(crypto.change24h) >= 0 ? '↑' : '↓'}{Math.abs(parseFloat(crypto.change24h))}%
                      </span>
                    </div>
                  </div>
                  {crypto.symbol !== 'SOL' && <span className={`${classes.divider} text-white/20`}>|</span>}
                </div>
              ))}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/prices')}
                className="ml-2 px-2 py-1 bg-violet-500/20 hover:bg-violet-500/30 transition-all duration-300"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-xs">More</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <Dialog open={!!selectedCrypto} onOpenChange={() => setSelectedCrypto(null)}>
        <DialogContent className="max-w-4xl h-[600px] p-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>
              {prices.find(p => p.symbol === selectedCrypto)?.name} ({selectedCrypto}) Chart
            </DialogTitle>
          </DialogHeader>
          <div className="w-full h-[550px] relative">
            {selectedCrypto && (
              <iframe
                key={selectedCrypto}
                src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_cf6e4&symbol=${getChartSymbol(selectedCrypto)}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=%5B%5D&theme=dark&style=1&timezone=exchange&withdateranges=1&showpopupbutton=1`}
                className="w-full h-full"
                style={{ border: 'none' }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CryptoPrices;
