import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Search, AlertCircle, Bold } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { validateCryptoAddress } from "@/utils/cryptoValidators";
import { toast } from "sonner";
import { useQuery } from '@tanstack/react-query';
import TransactionsTable from "@/components/TransactionsTable";
import TransactionsPagination from "@/components/TransactionsPagination";
import { fetchTransactions } from "@/services/transactionService";
import { useFiltersStore } from "@/store/filtersStore";
import { useTransactionsStore } from "@/store/transactionsStore";
import { fetchBalance } from "@/utils/cryptoUtils";

interface Transaction {
  hash: string;
  timestamp: string;
  from: string;
  to: string;
  value: string;
  fee: string;
  isIncoming: boolean;
  changeAddress?: string;
  changeAmount?: string;
}

interface SearchHistoryItem {
  address: string;
  timestamp: number;
  type: 'transaction' | 'general';
}

interface CachedData {
  address: string;
  transactions: any[];
  timestamp: number;
}

const SEARCH_HISTORY_KEY = 'transaction-search-history';
const TRANSACTIONS_CACHE_KEY = 'transactions-cache';
const CACHE_EXPIRY = 1000 * 60 * 5; // 5 minutes
const ITEMS_PER_PAGE = 10;

const Transactions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const [address, setAddress] = useState('');
  const [searchInitiated, setSearchInitiated] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [totalTxs, setTotalTxs] = useState(0);
  const [lastSeenTxid, setLastSeenTxid] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [allTransactionsLoaded, setAllTransactionsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { transactions: storedTransactions, setTransactions, address: storedAddress } = useTransactionsStore();
  const [partialTransactions, setPartialTransactions] = useState<Transaction[]>(
    storedAddress === address ? storedTransactions : []
  );

  useEffect(() => {
    if (location.state?.address) {
      setAddress(location.state.address);
      if (!searchInitiated) {
        setSearchInitiated(true);
        setShouldFetch(true);
      }
    }
    const addressFromUrl = searchParams.get('address');
    if (addressFromUrl) {
      setAddress(addressFromUrl);
      if (!searchInitiated) {
        setSearchInitiated(true);
        setShouldFetch(true);
      }
    }
  }, [location.state, searchParams]);

  const resetSearchState = () => {
    setPartialTransactions([]);
    setLoadingProgress(0);
    setAllTransactionsLoaded(false);
    setIsLoadingAll(false);
    setTotalTxs(0);
    setLastSeenTxid('');
    setHasMore(true);
    setError(null);
    setShouldFetch(false);
  };

  const loadAllTransactions = useCallback(async () => {
    if (!address || isLoadingAll || !shouldFetch) return;
    
    if (storedAddress === address && storedTransactions.length > 0) {
      setPartialTransactions(storedTransactions);
      setAllTransactionsLoaded(true);
      setIsLoadingAll(false);
      return;
    }
    
    setPartialTransactions([]);
    setLoadingProgress(0);
    setAllTransactionsLoaded(false);
    setTotalTxs(0);
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    setIsLoadingAll(true);
    setError(null);
    let currentLastTxid = '';
    let currentTransactions: Transaction[] = [];
    
    try {
      while (true) {
        if (controller.signal.aborted) {
          console.log('Transaction fetch aborted');
          return;
        }

        const result = await fetchTransactions(address, currentLastTxid);
        
        if (controller.signal.aborted || abortControllerRef.current !== controller) {
          console.log('Aborting transaction processing - new search started');
          return;
        }
        
        currentTransactions = [...currentTransactions, ...result.transactions];
        setPartialTransactions(currentTransactions);
        setTotalTxs(result.totalTxs);
        setLastSeenTxid(result.lastSeenTxid);
        setHasMore(result.hasMore);
        
        const progress = (currentTransactions.length / result.totalTxs) * 100;
        setLoadingProgress(Math.min(progress, 100));
        
        if (!result.hasMore) {
          setAllTransactionsLoaded(true);
          setHasMore(false);
          setTransactions(address, currentTransactions);
          break;
        }
        
        currentLastTxid = result.lastSeenTxid;
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      if (controller.signal.aborted) {
        console.log('Transaction fetch aborted during error');
        return;
      }
      console.error('Error loading all transactions:', error);
      setError(error instanceof Error ? error : new Error('Failed to load transactions'));
      toast.error('Failed to load transactions');
    } finally {
      if (abortControllerRef.current === controller) {
        setIsLoadingAll(false);
      }
    }
  }, [address, storedAddress, storedTransactions, setTransactions, shouldFetch]);

  useEffect(() => {
    if (shouldFetch && address) {
      loadAllTransactions();
    }
  }, [shouldFetch, address, loadAllTransactions]);

  const {
    filters,
    sortConfig,
    setFilters,
    setSortConfig
  } = useFiltersStore();

  let displayTransactions = [...partialTransactions];

  if (displayTransactions.length > 0) {
    if (sortConfig?.direction && sortConfig?.field) {
      displayTransactions.sort((a, b) => {
        if (sortConfig.field === 'timestamp') {
          return sortConfig.direction === 'asc' 
            ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime() 
            : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }
        const aValue = parseFloat(a[sortConfig.field] || '0');
        const bValue = parseFloat(b[sortConfig.field] || '0');
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    if (allTransactionsLoaded) {
      displayTransactions = displayTransactions.filter(tx => {
        if (tx.isIncoming && !filters.incoming) return false;
        if (!tx.isIncoming && !filters.outgoing) return false;
        if (!filters.withChange && tx.changeAddress) return false;
        return true;
      });
    }
  }

  const currentPageData = displayTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const totalPages = Math.ceil(displayTransactions.length / ITEMS_PER_PAGE);
  const isBitcoinAddress = validateCryptoAddress(address)?.symbol.toLowerCase() === 'btc';

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return "N/A";
      }
      return date.toLocaleString('he-IL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return "N/A";
    }
  };

  const handlePageChange = (page: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', page.toString());
    newSearchParams.set('address', address);
    setSearchParams(newSearchParams);
  };

  const saveToHistory = useCallback((searchedAddress: string) => {
    const historyItem: SearchHistoryItem = {
      address: searchedAddress,
      timestamp: Date.now(),
      type: 'transaction'
    };

    const savedHistory = localStorage.getItem(SEARCH_HISTORY_KEY);
    let currentHistory: SearchHistoryItem[] = [];
    
    if (savedHistory) {
      try {
        currentHistory = JSON.parse(savedHistory);
      } catch (error) {
        console.error('Error parsing history:', error);
      }
    }

    const existingIndex = currentHistory.findIndex(item => item.address === searchedAddress);
    if (existingIndex !== -1) {
      currentHistory[existingIndex].timestamp = Date.now();
    } else {
      currentHistory.unshift(historyItem);
    }

    currentHistory = currentHistory.slice(0, 50);
    
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(currentHistory));
    console.log('Saved to transaction search history:', historyItem);
  }, []);

  const handleSearch = () => {
    if (!address.trim()) {
      toast.error("Please enter an address");
      return;
    }
    const result = validateCryptoAddress(address.trim());
    if (!result) {
      toast.error("Invalid cryptocurrency address");
      return;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    resetSearchState();
    
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('address', address.trim());
    newSearchParams.set('page', '1');
    setSearchParams(newSearchParams);
    setSearchInitiated(true);
    
    saveToHistory(address.trim());
    
    setTimeout(() => {
      setShouldFetch(true);
    }, 100);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setAddress(text);
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      toast.error("Failed to paste from clipboard");
    }
  };

  const handleRowClick = (txHash: string) => {
    navigate(`/transaction/${txHash}`, {
      state: {
        searchedAddress: address
      }
    });
  };

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const { data: btcPrice, isLoading: isPriceLoading } = useQuery({
    queryKey: ['btcPrice'],
    queryFn: async () => {
      try {
        const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT');
        const data = await response.json();
        return parseFloat(data.price);
      } catch (error) {
        console.error('Error fetching BTC price:', error);
        return null;
      }
    },
    refetchInterval: 60000,
    retry: 3,
  });

  const { data: balanceData, isLoading: isBalanceLoading } = useQuery({
    queryKey: ['balance', address],
    queryFn: async () => {
      if (!address) return null;
      const cryptoType = validateCryptoAddress(address);
      if (!cryptoType) return null;
      return await fetchBalance(address, cryptoType.symbol);
    },
    enabled: !!address,
  });

  const calculateBalance = () => {
    if (balanceData && balanceData.balance !== 'Error' && balanceData.balance !== 'Check Explorer') {
      return balanceData.balance;
    }
    
    let balance = 0;
    storedTransactions.forEach(tx => {
      const value = parseFloat(tx.value);
      if (tx.isIncoming) {
        balance += value;
      } else {
        balance -= value;
      }
    });
    return balance.toFixed(8);
  };

  const balanceInUSDT = React.useMemo(() => {
    const balance = calculateBalance();
    if (!btcPrice || isPriceLoading) return 'Loading...';
    try {
      const btcAmount = parseFloat(balance);
      const usdtAmount = btcAmount * btcPrice;
      return `$${usdtAmount.toFixed(2)}`;
    } catch (error) {
      console.error('Error converting to USDT:', error);
      return 'Error';
    }
  }, [btcPrice, isPriceLoading, balanceData, storedTransactions]);

  useEffect(() => {
    if (location.state?.address && !searchInitiated) {
      saveToHistory(location.state.address);
    }
  }, [location.state, searchInitiated, saveToHistory]);

  useEffect(() => {
    const addressFromUrl = searchParams.get('address');
    if (addressFromUrl && !searchInitiated) {
      saveToHistory(addressFromUrl);
    }
  }, [searchParams, searchInitiated, saveToHistory]);

  return (
    <div className="min-h-screen w-full">
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-white/10">
        <div className="mx-auto px-4 py-2 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          {searchInitiated && (
            <div className="font-mono text-sm truncate mx-4 flex items-center gap-2">
              <span>{address}</span>
              {allTransactionsLoaded && (
                <span className="text-muted-foreground">
                  ({displayTransactions.length} transactions)
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 pt-20 max-w-[1400px] mx-auto">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Transaction Explorer</CardTitle>
            <CardDescription>
              View Bitcoin and Ethereum transactions for any address.
              For visual transaction flow analysis, visit our{' '}
              <Button 
                variant="link" 
                className="p-0 h-auto" 
                onClick={() => navigate('/transactions-graph', { state: { address } })}
              >
                Transaction Graph
              </Button>
              {' '}page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isBitcoinAddress && <div className="bg-blue-500/10 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <h3 className="font-medium text-blue-500 mb-1">What is a Change Address?</h3>
                  <p className="text-sm text-muted-foreground">
                    In Bitcoin transactions, when you send an amount that's less than the total input amount, 
                    the remaining balance is sent back to a new address called a "change address". This is similar 
                    to receiving change in cash transactions. Change addresses are only shown for Bitcoin transactions 
                    with exactly two output addresses, where one is the payment destination and the other is the change address.
                  </p>
                </div>
              </div>}

            {!searchInitiated ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter Bitcoin or Ethereum address" className="pl-10" onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }} />
                </div>
                <Button onClick={handlePaste} className="flex items-center gap-2">
                  Paste
                </Button>
                <Button onClick={handleSearch} className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search
                </Button>
              </div>
            ) : (
              <>
                <div className="bg-purple-500/10 rounded-lg p-6 border border-purple-500/20 mb-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                          <Bold className="w-5 h-5" />
                          Address Details
                        </h3>
                        <p className="font-mono text-xl mt-2 break-all">
                          {address}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Network</p>
                          <p className="text-lg font-semibold">
                            {validateCryptoAddress(address)?.symbol.toUpperCase() || "Unknown"}
                            {allTransactionsLoaded && (
                              <span className="text-sm text-muted-foreground ml-2">
                                ({displayTransactions.length} txs)
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">First Transaction</p>
                          <p className="text-lg font-semibold">
                            {displayTransactions.length > 0
                              ? formatDate(displayTransactions[displayTransactions.length - 1].timestamp)
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Last Transaction</p>
                          <p className="text-lg font-semibold">
                            {displayTransactions.length > 0
                              ? formatDate(displayTransactions[0].timestamp)
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 bg-purple-500/5 p-4 rounded-lg">
                        <div>
                          <div className="text-sm text-muted-foreground">BTC Balance</div>
                          <div className="text-2xl font-bold">{calculateBalance()} BTC</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">USDT Value</div>
                          <div className="text-2xl font-bold">{balanceInUSDT}</div>
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => {
                      setSearchParams(new URLSearchParams());
                      setAddress('');
                      setSearchInitiated(false);
                      setShouldFetch(false);
                      setLoadingProgress(0);
                      navigate('/transactions', {
                        replace: true
                      });
                    }} variant="outline" className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      New Search
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm">
                    {allTransactionsLoaded ? (
                      <div className="bg-green-500/10 text-green-500 px-4 py-2 rounded-full font-medium">
                        Loaded all {partialTransactions.length} transactions
                      </div>
                    ) : (
                      <div className="bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full font-medium flex flex-col">
                        <span>Loading: {Math.round(loadingProgress)}%</span>
                        <span>({partialTransactions.length} of {totalTxs || '?'} transactions)</span>
                      </div>
                    )}
                  </div>
                  
                  {allTransactionsLoaded && (
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilters({
                          ...filters,
                          incoming: !filters.incoming
                        })}
                        className={!filters.incoming ? "opacity-50" : ""}
                      >
                        Incoming
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilters({
                          ...filters,
                          outgoing: !filters.outgoing
                        })}
                        className={!filters.outgoing ? "opacity-50" : ""}
                      >
                        Outgoing
                      </Button>
                      {isBitcoinAddress && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setFilters({
                            ...filters,
                            withChange: !filters.withChange
                          })}
                          className={!filters.withChange ? "opacity-50" : ""}
                        >
                          With Change
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {!allTransactionsLoaded && (
                  <div className="space-y-2 mb-4">
                    <Progress value={loadingProgress} className="h-2" />
                  </div>
                )}

                {error ? (
                  <div className="text-center py-8 text-red-500">
                    <p>Error loading transactions: {error.message}</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setError(null);
                        loadAllTransactions();
                      }}
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <>
                    {partialTransactions.length > 0 && (
                      <>
                        <TransactionsTable 
                          transactions={currentPageData} 
                          address={address}
                          onRowClick={handleRowClick}
                          isLoadingAll={isLoadingAll}
                          allTransactionsLoaded={allTransactionsLoaded}
                        />

                        <TransactionsPagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={handlePageChange}
                        />
                      </>
                    )}

                    {partialTransactions.length === 0 && !isLoadingAll && (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No transactions found for this address</p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {!searchInitiated && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Enter an address and click Search to view transactions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Transactions;
