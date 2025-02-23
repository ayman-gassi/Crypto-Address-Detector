
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, ExternalLink, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AddressResult from "@/components/AddressResult";

interface HistoryItem {
  address: string;
  timestamp: number;
  result?: any;
  balance?: string;
  usdValue?: string;
  usdtBalance?: string;
  txCount?: string;
  firstTx?: string;
  lastTx?: string;
  type: 'transaction' | 'general';
}

const TRANSACTION_HISTORY_KEY = 'transaction-search-history';
const ADDRESS_HISTORY_KEY = 'address-checker-history';

const History = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchHistory, setSearchHistory] = React.useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cryptoFilter, setCryptoFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  React.useEffect(() => {
    console.log('History page mounted, loading data...');
    // טעינת היסטוריית חיפושים רגילים
    const savedAddressHistory = localStorage.getItem(ADDRESS_HISTORY_KEY);
    // טעינת היסטוריית חיפושי טרנזקציות
    const savedTransactionHistory = localStorage.getItem(TRANSACTION_HISTORY_KEY);
    
    let combinedHistory: HistoryItem[] = [];

    if (savedAddressHistory) {
      try {
        const addressHistory = JSON.parse(savedAddressHistory);
        // הוספת סוג החיפוש לרשומות הקיימות
        const formattedAddressHistory = addressHistory.map((item: any) => ({
          ...item,
          type: 'general'
        }));
        combinedHistory = [...combinedHistory, ...formattedAddressHistory];
      } catch (error) {
        console.error('Error parsing address history:', error);
      }
    }

    if (savedTransactionHistory) {
      try {
        const transactionHistory = JSON.parse(savedTransactionHistory);
        combinedHistory = [...combinedHistory, ...transactionHistory];
      } catch (error) {
        console.error('Error parsing transaction history:', error);
      }
    }

    // מיון לפי תאריך
    combinedHistory.sort((a, b) => b.timestamp - a.timestamp);
    setSearchHistory(combinedHistory);
  }, []);

  const clearHistory = () => {
    localStorage.removeItem(ADDRESS_HISTORY_KEY);
    localStorage.removeItem(TRANSACTION_HISTORY_KEY);
    setSearchHistory([]);
    toast({
      title: "History Cleared",
      description: "Your search history has been cleared successfully.",
    });
  };

  const getUniqueCryptoTypes = () => {
    const types = new Set(searchHistory
      .filter(item => item.result?.symbol)
      .map(item => item.result.symbol));
    return Array.from(types);
  };

  const filteredHistory = searchHistory.filter(item => {
    const matchesSearch = item.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrypto = cryptoFilter === "all" || (item.result?.symbol === cryptoFilter);
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesCrypto && matchesType;
  });

  const handleCheckAgain = (item: HistoryItem) => {
    if (item.type === 'transaction') {
      navigate('/transactions', { state: { address: item.address } });
    } else {
      navigate('/', { state: { address: item.address } });
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <div className="fixed inset-0 grid-pattern opacity-30"></div>
      
      <div className="relative p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="group"
            >
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Search
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold">Search History</h1>
          </div>
          {searchHistory.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="hover:bg-red-600/90"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-black/90 border border-white/10">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your search history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-black/40 border-white/10 hover:bg-white/10">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={clearHistory}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete History
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {searchHistory.length > 0 && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/40 border-white/10"
              />
            </div>
            <Select
              value={cryptoFilter}
              onValueChange={setCryptoFilter}
            >
              <SelectTrigger className="w-full sm:w-[200px] bg-black/40 border-white/10">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by crypto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cryptocurrencies</SelectItem>
                {getUniqueCryptoTypes().map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={typeFilter}
              onValueChange={setTypeFilter}
            >
              <SelectTrigger className="w-full sm:w-[200px] bg-black/40 border-white/10">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Search Types</SelectItem>
                <SelectItem value="general">General Search</SelectItem>
                <SelectItem value="transaction">Transaction Search</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {searchHistory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No search history found</p>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="mt-4"
            >
              Start Searching
            </Button>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No results found for your search</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredHistory.map((item, index) => (
              <div key={`${item.address}-${index}`} className="bg-black/40 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <div className="mb-4 flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <span>
                      Searched on {new Date(item.timestamp).toLocaleDateString()} at{" "}
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.type === 'transaction' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {item.type === 'transaction' ? 'Transaction Search' : 'General Search'}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCheckAgain(item)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Check Again
                  </Button>
                </div>
                {item.type === 'general' ? (
                  <AddressResult
                    address={item.address}
                    cryptoInfo={item.result}
                    isHistoryView={true}
                    savedBalance={item.balance}
                    savedUsdValue={item.usdValue}
                    savedUsdtBalance={item.usdtBalance}
                    timestamp={item.timestamp}
                    txCount={item.txCount}
                    firstTx={item.firstTx}
                    lastTx={item.lastTx}
                  />
                ) : (
                  <div className="p-4 bg-black/20 rounded-lg">
                    <p className="font-mono break-all">{item.address}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
