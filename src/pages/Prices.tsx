import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { toast } from "sonner";
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
  volume24h?: string;
  marketCap?: string;
  logo: string;
}

const Prices = () => {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchPrices = async () => {
    try {
      const symbols = [
        'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'LTCUSDT', 'BCHUSDT',
        'ADAUSDT', 'XRPUSDT', 'TRXUSDT', 'DOGEUSDT', 'BNBUSDT'
      ];
      const responses = await Promise.all(
        symbols.map(symbol => 
          fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
        )
      );
      
      const data = await Promise.all(responses.map(res => res.json()));
      
      const formattedPrices: CryptoPrice[] = data.map((item, index) => {
        const symbol = symbols[index].replace('USDT', '');
        const name = getCryptoName(symbol);
        
        return {
          symbol,
          name,
          price: `$${parseFloat(item.lastPrice).toLocaleString(undefined, { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2 
          })}`,
          change24h: (+item.priceChangePercent).toFixed(2),
          volume24h: `$${(parseFloat(item.volume) * parseFloat(item.lastPrice)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
          marketCap: 'N/A',
          logo: getCryptoLogo(symbol)
        };
      });

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

  const getCryptoName = (symbol: string): string => {
    const names: { [key: string]: string } = {
      BTC: 'Bitcoin',
      ETH: 'Ethereum',
      SOL: 'Solana',
      LTC: 'Litecoin',
      BCH: 'Bitcoin Cash',
      ADA: 'Cardano',
      XRP: 'Ripple',
      TRX: 'TRON',
      DOGE: 'Dogecoin',
      BNB: 'Binance Coin'
    };
    return names[symbol] || symbol;
  };

  const getCryptoLogo = (symbol: string): string => {
    const logos: { [key: string]: string } = {
      BTC: '/lovable-uploads/3e1a2ab8-a663-4aab-9e49-c8606ea56aec.png',
      ETH: '/lovable-uploads/66c61bbc-c67a-414a-8c72-c704f3ceea33.png',
      SOL: '/lovable-uploads/df9dfb5f-a137-4432-bb50-3272c025312c.png',
      LTC: 'https://cryptologos.cc/logos/litecoin-ltc-logo.png',
      BCH: 'https://cryptologos.cc/logos/bitcoin-cash-bch-logo.png',
      ADA: 'https://cryptologos.cc/logos/cardano-ada-logo.png',
      XRP: 'https://cryptologos.cc/logos/xrp-xrp-logo.png',
      TRX: 'https://cryptologos.cc/logos/tron-trx-logo.png',
      DOGE: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png',
      BNB: 'https://cryptologos.cc/logos/bnb-bnb-logo.png'
    };
    return logos[symbol] || '';
  };

  const getChartSymbol = (symbol: string) => {
    return `BINANCE:${symbol}USDT`;
  };

  return (
    <div className="min-h-screen w-full relative">
      <div className="fixed inset-0 grid-pattern opacity-30"></div>
      
      <div className="relative z-10">
        <div className="sticky top-0 bg-black/40 backdrop-blur-md border-b border-white/10 px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="group flex items-center gap-2 hover:bg-white/5"
              >
                <ArrowLeft className="w-4 h-4 text-violet-400 group-hover:text-violet-300" />
                <span>Back</span>
              </Button>
              <h1 className="text-xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-violet-600">
                Crypto Market Prices
              </h1>
              <div className="w-[68px]"></div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse bg-white/5 rounded-lg p-4 h-16"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {prices.map((crypto) => (
                <div
                  key={crypto.symbol}
                  className="bg-white/5 backdrop-blur rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => setSelectedCrypto(crypto.symbol)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={crypto.logo} 
                        alt={crypto.name} 
                        className="w-8 h-8 object-contain rounded-full"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.src = 'https://cryptologos.cc/logos/question-mark.png';
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{crypto.name}</h3>
                        <p className="text-sm text-gray-400">{crypto.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium">{crypto.price}</p>
                      <p className={`text-sm ${parseFloat(crypto.change24h) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {parseFloat(crypto.change24h) >= 0 ? '↑' : '↓'}{Math.abs(parseFloat(crypto.change24h))}%
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <span>24h Volume: {crypto.volume24h}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
    </div>
  );
};

export default Prices;
