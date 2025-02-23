import { Check, Copy, ExternalLink, ShieldAlert, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { CryptoType } from "@/utils/cryptoValidators";
import { copyToClipboard, truncateAddress, fetchBalance } from "@/utils/cryptoUtils";
import { toast } from "sonner";

interface AddressResultProps {
  address: string;
  cryptoInfo: CryptoType;
  isHistoryView?: boolean;
  savedBalance?: string;
  savedUsdValue?: string;
  savedUsdtBalance?: string;
  timestamp?: number;
  txCount?: string;
  firstTx?: string;
  lastTx?: string;
}

const AddressResult = ({ 
  address, 
  cryptoInfo, 
  isHistoryView = false,
  savedBalance,
  savedUsdValue,
  savedUsdtBalance,
  timestamp,
  txCount: savedTxCount,
  firstTx: savedFirstTx,
  lastTx: savedLastTx
}: AddressResultProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [usdValue, setUsdValue] = useState<string | null>(null);
  const [usdtBalance, setUsdtBalance] = useState<string | null>(null);
  const [txCount, setTxCount] = useState<string | null>(null);
  const [firstTx, setFirstTx] = useState<string | null>(null);
  const [lastTx, setLastTx] = useState<string | null>(null);

  const handleCopy = async () => {
    const success = await copyToClipboard(address);
    if (success) {
      setIsCopied(true);
      toast.success("Address copied to clipboard");
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const getCryptoIcon = () => {
    return cryptoInfo.logoUrl ? (
      <img 
        src={cryptoInfo.logoUrl} 
        alt={`${cryptoInfo.name} logo`} 
        className="w-6 h-6 object-contain"
      />
    ) : (
      <div className="w-6 h-6 rounded-full bg-gray-400" />
    );
  };

  const getNetworkInfo = () => {
    const symbol = cryptoInfo.symbol.toLowerCase();
    
    switch (symbol) {
      case 'eth':
        return {
          show: true,
          message: "There might be additional tokens on supported EVM networks",
          buttonText: "Check Tokens",
          link: `https://etherscan.io/address/${address}#tokens`,
          color: "blue"
        };
      case 'trx':
        return {
          show: true,
          message: "There might be additional tokens on TRON network",
          buttonText: "Check Tokens",
          link: `https://tronscan.org/#/address/${address}/tokens`,
          color: "blue"
        };
      case 'sol':
        return {
          show: true,
          message: "There might be additional tokens on Solana network",
          buttonText: "Check Tokens",
          link: `https://solscan.io/account/${address}/tokens`,
          color: "purple"
        };
      case 'ada':
        return {
          show: true,
          message: "View complete transaction history on Cardano network",
          buttonText: "Check Balance",
          link: `https://cardanoscan.io/address/${address}`,
          color: "blue"
        };
      case 'btc':
        return {
          show: true,
          message: "View complete transaction history",
          buttonText: "View History",
          link: `https://blockchair.com/bitcoin/address/${address}`,
          color: "orange"
        };
      default:
        return { show: false };
    }
  };

  const networkInfo = getNetworkInfo();

  useEffect(() => {
    if (isHistoryView) {
      // במצב היסטוריה, נשתמש בערכים השמורים
      console.log('History view - using saved values:', {
        savedBalance,
        savedUsdValue,
        savedTxCount,
        savedFirstTx,
        savedLastTx
      });
      setBalance(savedBalance || "0");
      setUsdValue(savedUsdValue || "0");
      setUsdtBalance(savedUsdtBalance || null);
      setTxCount(savedTxCount || '0');
      setFirstTx(savedFirstTx || 'Unknown');
      setLastTx(savedLastTx || 'Unknown');
    } else {
      // רק במצב חיפוש חדש נביא מידע מה-API
      const getBalance = async () => {
        try {
          console.log('Fetching balance from API for:', address);
          const result = await fetchBalance(address, cryptoInfo.symbol);
          console.log('API result:', result);
          
          // עדכון המצב המקומי
          setBalance(result.balance);
          setUsdValue(result.usdValue);
          setUsdtBalance(result.usdtBalance || null);
          setTxCount(result.txCount || '0');
          setFirstTx(result.firstTx || new Date().toLocaleString());
          setLastTx(result.lastTx || new Date().toLocaleString());

          // שמירה בהיסטוריה תמיד, עם ערכי ברירת מחדל אם חסרים נתונים
          const historyItem = {
            address,
            timestamp: Date.now(),
            result: cryptoInfo,
            balance: result.balance || '0',
            usdValue: result.usdValue || '0',
            usdtBalance: result.usdtBalance || null,
            txCount: result.txCount || '0',
            firstTx: result.firstTx || new Date().toLocaleString(),
            lastTx: result.lastTx || new Date().toLocaleString()
          };

          console.log('Saving to history:', historyItem);

          // שמירת בהיסטוריה
          const savedHistory = localStorage.getItem('address-checker-history');
          let currentHistory = [];
          
          if (savedHistory) {
            try {
              currentHistory = JSON.parse(savedHistory);
            } catch (error) {
              console.error('Error parsing history:', error);
            }
          }

          // בדיקה אם הכתובת כבר קיימת בהיסטוריה
          const existingIndex = currentHistory.findIndex(item => item.address === address);
          if (existingIndex !== -1) {
            // עדכון הרשומה הקיימת
            currentHistory[existingIndex] = historyItem;
          } else {
            // הוספת רשומה חדשה בתחילת המערך
            currentHistory.unshift(historyItem);
          }

          // שמירת 50 התוצאות האחרונות
          currentHistory = currentHistory.slice(0, 50);
          localStorage.setItem('address-checker-history', JSON.stringify(currentHistory));
          console.log('Successfully saved to history');

        } catch (error) {
          console.error('Error fetching balance:', error);
          const errorHistoryItem = {
            address,
            timestamp: Date.now(),
            result: cryptoInfo,
            balance: 'Error',
            usdValue: 'Error',
            usdtBalance: null,
            txCount: '0',
            firstTx: new Date().toLocaleString(),
            lastTx: new Date().toLocaleString()
          };

          // שמירת מידע שגיאה בהיסטוריה
          const savedHistory = localStorage.getItem('address-checker-history');
          let currentHistory = [];
          
          if (savedHistory) {
            try {
              currentHistory = JSON.parse(savedHistory);
            } catch (error) {
              console.error('Error parsing history:', error);
            }
          }

          currentHistory.unshift(errorHistoryItem);
          currentHistory = currentHistory.slice(0, 50);
          localStorage.setItem('address-checker-history', JSON.stringify(currentHistory));

          setBalance('Error');
          setUsdValue('Error');
          setTxCount('0');
          setFirstTx(new Date().toLocaleString());
          setLastTx(new Date().toLocaleString());
        }
      };
      getBalance();
    }
  }, [address, cryptoInfo, isHistoryView, savedBalance, savedUsdValue, savedUsdtBalance, savedTxCount, savedFirstTx, savedLastTx]);

  return (
    <div className="w-full max-w-2xl animate-slideUp" data-address={address}>
      <div className="bg-white/20 backdrop-blur-lg rounded-xl p-6 shadow-lg border border-white/10">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getCryptoIcon()}
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-500">Type</div>
                <div className="text-lg font-semibold">{cryptoInfo.name} ({cryptoInfo.symbol})</div>
              </div>
            </div>
            {cryptoInfo.networks && (
              <div className="flex gap-2 flex-wrap justify-end">
                {cryptoInfo.networks.map((network) => (
                  <span
                    key={network}
                    className="px-2 py-1 bg-white/10 rounded-full text-xs font-medium"
                  >
                    {network}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500">Address</div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="font-mono text-sm truncate">
                  {truncateAddress(address)}
                </div>
                <button
                  onClick={handleCopy}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Copy address"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://www.chainabuse.com/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors text-sm"
                  title="Check risk level on ChainAbuse"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Check Risk</span>
                </a>
                {cryptoInfo.explorerUrl && (
                  <a
                    href={`${cryptoInfo.explorerUrl}${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="View in explorer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-sm font-medium text-gray-500">
              {isHistoryView ? (
                <span className="flex items-center gap-2">
                  Balance at {new Date(timestamp || 0).toLocaleString()}
                  <span className="text-xs text-yellow-400">(Historical data)</span>
                </span>
              ) : (
                "Current Balance"
              )}
            </div>
            <div className="flex flex-col gap-2">
              {balance === null ? (
                <div className="animate-pulse bg-white/10 h-6 w-24 rounded"></div>
              ) : balance === 'Error' ? (
                <span className="text-red-400 text-sm">Failed to load balance</span>
              ) : balance === 'Check Explorer' ? (
                <div className="font-mono text-base">
                  <a
                    href={`${cryptoInfo.explorerUrl}${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Click here to check balance on {cryptoInfo.name} Explorer
                  </a>
                </div>
              ) : (
                <div className="font-mono">
                  <div className="text-base balance-value">
                    {balance} {cryptoInfo.symbol} {usdValue && usdValue !== 'Error' && `≈ $${usdValue} USDT`}
                  </div>
                  {usdtBalance && cryptoInfo.symbol.toLowerCase() === 'eth' && (
                    <div className="text-base balance-value">
                      ${usdtBalance} USDT
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Activity Information */}
          <div className="space-y-1 mt-4 bg-white/5 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-500 mb-2">Activity Information</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-gray-400">Total Transactions</div>
                <div className="text-sm font-mono">
                  {txCount === null ? 'Loading...' : 
                   txCount === 'Error' ? 'Error' : 
                   `${txCount} tx`}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">First Activity</div>
                <div className="text-sm font-mono">
                  {firstTx === null ? 'Loading...' : firstTx}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Last Activity</div>
                <div className="text-sm font-mono">
                  {lastTx === null ? 'Loading...' : lastTx}
                </div>
              </div>
            </div>
          </div>

          {networkInfo.show && (
            <div className={`mt-4 bg-${networkInfo.color}-500/10 p-4 rounded-lg`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm text-${networkInfo.color}-300`}>
                  {networkInfo.message}
                </span>
                <a
                  href={networkInfo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1 text-${networkInfo.color}-400 hover:text-${networkInfo.color}-300 transition-colors`}
                  title={networkInfo.buttonText}
                >
                  <span className="text-sm">{networkInfo.buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddressResult;
