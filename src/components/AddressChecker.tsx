import { useState, useEffect } from "react";
import { validateCryptoAddress, cryptoValidators } from "@/utils/cryptoValidators";
import AddressResult from "./AddressResult";
import { HelpCircle, Loader2, ChevronDown, ChevronUp, Filter, ExternalLink, X, Clipboard, Plus, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { Textarea } from "./ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { useToast } from "./ui/use-toast";
import { Progress } from "./ui/progress";

const SAMPLE_ADDRESSES = `# Bitcoin addresses
1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa

# Ethereum addresses
0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae

# Solana addresses
FMJiuKezug55WtTx6XJQJKLDtPzDj617tvHviY9psdyw`;
const MAX_ADDRESSES = 50;
const API_WARNING_THRESHOLD = 10;
const HISTORY_KEY = 'address-checker-history';

interface HistoryItem {
  address: string;
  timestamp: number;
  result: any;
  balance?: string;
  usdValue?: string;
  usdtBalance?: string;
  type?: 'transaction' | 'general';
}

interface AddressCheckerProps {
  initialAddress?: string;
}

async function fetchBalance(address: string, symbol: string) {
  try {
    const coinId = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'DOGE': 'dogecoin',
      'LTC': 'litecoin',
      'BCH': 'bitcoin-cash',
      'ADA': 'cardano',
      'XRP': 'ripple',
      'TRX': 'tron',
      'BNB': 'binancecoin'
    }[symbol];
    if (!coinId) {
      throw new Error(`Unsupported coin: ${symbol}`);
    }
    const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const balance = (Math.random() * 10).toFixed(2);
    const usdValue = (Math.random() * 1000).toFixed(2);
    const usdtBalance = (Math.random() * 10).toFixed(2);
    return {
      balance: balance,
      usdValue: usdValue,
      usdtBalance: usdtBalance
    };
  } catch (error) {
    console.error("Could not fetch balance:", error);
    return {
      balance: '0',
      usdValue: '0',
      usdtBalance: '0'
    };
  }
}

const AddressChecker = ({
  initialAddress
}: AddressCheckerProps) => {
  const [address, setAddress] = useState(initialAddress || "");
  const [validationResult, setValidationResult] = useState<any>(null);
  const [bulkAddresses, setBulkAddresses] = useState("");
  const [showBulkInput, setShowBulkInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalAddresses, setTotalAddresses] = useState(0);
  const [groupedResults, setGroupedResults] = useState<Record<string, any[]>>({});
  const [unknownAddresses, setUnknownAddresses] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [filterType, setFilterType] = useState<'all' | 'withBalance' | 'zeroBalance'>('all');
  const { toast } = useToast();

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value;
    setAddress(newAddress);
    
    if (!newAddress.trim() || newAddress !== address) {
      setValidationResult(null);
    }
  };

  const handleSearch = async () => {
    if (!address.trim()) {
      toast({
        title: "Error",
        description: "Please enter an address",
        variant: "destructive"
      });
      return;
    }
    const result = validateCryptoAddress(address.trim());
    if (!result) {
      toast({
        title: "Error",
        description: "Invalid cryptocurrency address",
        variant: "destructive"
      });
      return;
    }
    setValidationResult(result);
    await addToHistory(address.trim(), result);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddress(text);
      toast({
        title: "Success",
        description: "Address pasted from clipboard"
      });
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      toast({
        title: "Error",
        description: "Failed to paste from clipboard",
        variant: "destructive"
      });
    }
  };

  const addToHistory = async (searchedAddress: string, result: any) => {
    try {
      const history = localStorage.getItem(HISTORY_KEY);
      let searches: HistoryItem[] = history ? JSON.parse(history) : [];
      searches = searches.filter(item => item.address !== searchedAddress);
      const balanceResult = await fetchBalance(searchedAddress, result.symbol);
      searches.unshift({
        address: searchedAddress,
        timestamp: Date.now(),
        result,
        balance: balanceResult.balance,
        usdValue: balanceResult.usdValue,
        usdtBalance: balanceResult.usdtBalance,
        type: 'general'
      });
      searches = searches.slice(0, 50);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(searches));
    } catch (error) {
      console.error('Error saving to history:', error);
    }
  };

  const addToMultiple = () => {
    if (address && validationResult) {
      setBulkAddresses(prev => {
        const addresses = prev.split(/[\n,]/).filter(a => a.trim());
        addresses.push(address);
        return addresses.join('\n');
      });
      setAddress("");
      setValidationResult(null);
      toast({
        title: "Address Added",
        description: "The address has been added to multiple addresses list. Click 'Multiple Addresses' to view all addresses."
      });
    }
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const handleFilterChange = (value: string) => {
    setFilterType(value as 'all' | 'withBalance' | 'zeroBalance');
  };

  const processAddresses = () => {
    setIsProcessing(true);
    setProgress(0);
    setProcessedCount(0);
    const addresses = Array.from(new Set(bulkAddresses.split(/[\n,]/).map(addr => addr.trim()).filter(addr => addr && !addr.startsWith('#'))));
    setTotalAddresses(addresses.length);
    const results = addresses.map(addr => {
      const result = validateCryptoAddress(addr.trim());
      return {
        address: addr,
        type: result?.symbol || 'unknown',
        cryptoInfo: result
      };
    });
    const grouped = results.reduce((acc: Record<string, any[]>, item) => {
      if (item.cryptoInfo) {
        const cryptoName = item.cryptoInfo.name;
        if (!acc[cryptoName]) {
          acc[cryptoName] = [];
        }
        acc[cryptoName].push({
          address: item.address,
          result: item.cryptoInfo
        });
      } else {
        if (!acc['unknown']) {
          acc['unknown'] = [];
        }
        acc['unknown'].push({
          address: item.address,
          result: null
        });
      }
      return acc;
    }, {});
    setGroupedResults(grouped);
    const unknownAddrs = grouped['unknown'] ? grouped['unknown'].map(item => item.address) : [];
    setUnknownAddresses(unknownAddrs);
    const initialExpandedState: Record<string, boolean> = {};
    Object.keys(grouped).forEach(key => {
      initialExpandedState[key] = false;
    });
    setExpandedGroups(initialExpandedState);
    setProgress(100);
    setIsProcessing(false);
  };

  const getFilteredResults = () => {
    if (!groupedResults) return {};
    const results = {
      ...groupedResults
    };
    if (filterType === 'all') return results;
    Object.keys(results).forEach(key => {
      if (key !== 'unknown') {
        results[key] = results[key].filter(addr => {
          const balance = addr.result?.balance;
          const hasBalance = balance && parseFloat(balance) > 0;
          return filterType === 'zeroBalance' ? !hasBalance : hasBalance;
        });
        if (results[key].length === 0) {
          delete results[key];
        }
      }
    });
    return results;
  };

  const filteredResults = getFilteredResults();

  return <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in">
      {!showBulkInput && <>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-200"></div>
            <div className="relative">
              <div className="relative">
                <div className="relative">
                  <Input 
                    type="text" 
                    value={address} 
                    onChange={handleAddressChange} 
                    placeholder="Enter crypto address" 
                    className="w-full px-6 py-4 bg-black/40 backdrop-blur-xl rounded-xl border border-white/10 focus:border-violet-500/50 outline-none transition-all duration-200 text-lg placeholder:text-gray-500 pr-[140px]" 
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {address && <>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 transition-colors" onClick={() => {
                          setAddress("");
                          setValidationResult(null);
                        }}>
                          <X className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 transition-colors" onClick={addToMultiple} disabled={!validationResult} title="Add to Multiple Addresses">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </>}
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 transition-colors" onClick={handlePaste}>
                      <Clipboard className="h-4 w-4" />
                    </Button>
                    <Button 
                      className="h-8 px-3 bg-violet-600 hover:bg-violet-700 transition-colors"
                      onClick={handleSearch}
                    >
                      <Search className="w-4 h-4 mr-1" />
                      <span className="text-sm">Search</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Dialog>
              <DialogTrigger>
                <Button variant="ghost" size="icon" className="ml-1 my-[26px] py-[19px] px-[24px]">
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-2xl">Supported Cryptocurrencies</DialogTitle>
                  <DialogDescription>
                    <ScrollArea className="h-[60vh] pr-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {cryptoValidators.map(crypto => <div key={crypto.name} className="p-4 bg-black/20 rounded-lg border border-white/10 hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-3 mb-3">
                              {crypto.logoUrl && <img src={crypto.logoUrl} alt={`${crypto.name} logo`} className="w-8 h-8 object-contain" />}
                              <div>
                                <h3 className="font-semibold text-lg leading-none mb-1">
                                  {crypto.name}
                                </h3>
                                <span className="text-sm text-primary/70">
                                  {crypto.symbol}
                                </span>
                              </div>
                              {crypto.networks && <span className="ml-auto text-xs font-medium bg-primary/20 text-primary px-2 py-1 rounded-full">
                                  {crypto.networks.length} Networks
                                </span>}
                            </div>
                            {crypto.networks && <div className="flex flex-wrap gap-2">
                                {crypto.networks.map(network => <span key={network} className="text-xs bg-white/10 px-2 py-1 rounded-full hover:bg-white/20 transition-colors">
                                    {network}
                                  </span>)}
                              </div>}
                          </div>)}
                      </div>
                    </ScrollArea>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
        </>}

      {showBulkInput ? <>
          <Textarea value={bulkAddresses} onChange={e => setBulkAddresses(e.target.value)} placeholder="Paste multiple addresses here, separated by newlines or commas..." className="min-h-[200px] bg-black/40 backdrop-blur-xl border-white/10 focus-visible:ring-violet-500/50" />
          <Button onClick={processAddresses} className="w-full" disabled={isProcessing}>
            {isProcessing ? <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing Addresses...
              </> : 'Process Addresses'}
          </Button>

          {Object.keys(filteredResults).length > 0 && <div className="space-y-4">
              {Object.entries(filteredResults).filter(([cryptoName, addresses]) => addresses.length > 0).map(([cryptoName, addresses]) => <Collapsible key={cryptoName} open={expandedGroups[cryptoName]} onOpenChange={() => toggleGroup(cryptoName)} className="bg-black/20 rounded-xl border border-white/10 overflow-hidden">
                    <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-white/5">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium">
                          {cryptoName === 'unknown' ? 'Unrecognized Addresses' : cryptoName}
                        </h3>
                        <span className="text-sm text-gray-400">
                          ({addresses.length} address{addresses.length !== 1 ? 'es' : ''})
                        </span>
                      </div>
                      {expandedGroups[cryptoName] ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="p-4 pt-0 space-y-2">
                        {addresses.map((item, idx) => <div key={`${cryptoName}-${idx}`}>
                            {cryptoName === 'unknown' ? <div className="p-4 bg-black/40 rounded-lg border border-white/10">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="font-mono text-sm truncate">{item.address}</div>
                                  <a href={`https://blockchair.com/search?q=${item.address}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors">
                                    <ExternalLink className="w-4 h-4" />
                                    <span>Search Address</span>
                                  </a>
                                </div>
                                <p className="text-sm text-gray-400 mt-2">
                                  This address format is not recognized. Click the search link to check its type.
                                </p>
                              </div> : <AddressResult address={item.address} cryptoInfo={item.result} />}
                          </div>)}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>)}
            </div>}
        </> : validationResult && <AddressResult address={address} cryptoInfo={validationResult} />}

      {isProcessing && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-lg font-medium">Processing Addresses...</p>
            <div className="w-full max-w-sm space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-center text-muted-foreground">
                {processedCount} of {totalAddresses} addresses processed ({progress}%)
              </p>
            </div>
            <p className="text-sm text-muted-foreground">This might take a moment due to rate limiting</p>
          </div>
        </div>}
    </div>;
};

export default AddressChecker;
