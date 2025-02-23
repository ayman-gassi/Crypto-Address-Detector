
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import TransactionFlow from '@/components/TransactionFlow';
import { validateCryptoAddress } from "@/utils/cryptoValidators";
import { toast } from "sonner";
import { Search, List, ArrowLeft } from "lucide-react";
import { fetchTransactions } from "@/services/transactionService";

interface Address {
  address: string;
  transactions: any[];
}

const TransactionGraph = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState('');
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const addressFromParams = searchParams.get('address');
    
    if (addressFromParams) {
      handleAddAddress(addressFromParams);
    }
  }, [location]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        setIsSheetOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleAddAddress = async (addressToAdd: string = newAddress) => {
    const address = addressToAdd.trim();
    if (!address) {
      toast.error("Please enter an address");
      return;
    }

    const result = validateCryptoAddress(address);
    if (!result) {
      toast.error("Invalid cryptocurrency address");
      return;
    }

    if (addresses.find(a => a.address === address)) {
      setSelectedAddresses(prev => {
        if (!prev.includes(address)) {
          return [...prev, address];
        }
        return prev;
      });
      return;
    }

    try {
      const transactions = await fetchTransactions(address, '');
      setAddresses(prev => [...prev, { 
        address,
        transactions: transactions.transactions
      }]);
      setSelectedAddresses(prev => [...prev, address]);
      setNewAddress('');
      toast.success("Address added successfully");
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error("Failed to fetch transactions for this address");
    }
  };

  const handleToggleAddress = (address: string) => {
    setSelectedAddresses(prev => {
      if (prev.includes(address)) {
        return prev.filter(a => a !== address);
      } else {
        return [...prev, address];
      }
    });
  };

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="mx-auto px-4 py-2 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="flex items-center gap-2 text-white/70 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => navigate('/transactions')}
              className="flex items-center gap-2"
            >
              Transactions Investigator
            </Button>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2 text-white border-white/20">
                  <List className="w-4 h-4" />
                  Toggle Addresses
                </Button>
              </SheetTrigger>
              <SheetContent className="bg-black/95 border-l border-white/10 text-white">
                <div className="space-y-4 pt-4">
                  <div className="flex gap-2">
                    <Input
                      value={newAddress}
                      onChange={e => setNewAddress(e.target.value)}
                      placeholder="Enter Bitcoin or Ethereum address"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/50"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleAddAddress();
                        }
                      }}
                    />
                    <Button onClick={() => handleAddAddress()} variant="outline" className="border-white/20 hover:bg-white/10">Add</Button>
                  </div>
                  {addresses.length > 0 ? (
                    <div className="space-y-2">
                      {addresses.map((item) => (
                        <div
                          key={item.address}
                          className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                            selectedAddresses.includes(item.address)
                              ? 'bg-white/10 border-white/20'
                              : 'hover:bg-white/5 border-transparent'
                          }`}
                          onClick={() => handleToggleAddress(item.address)}
                        >
                          <div className="font-mono text-sm text-white/90">{item.address}</div>
                          <div className="text-xs text-white/50">
                            {item.transactions.length} transactions
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-white/50">
                      No addresses added yet
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      <div className="p-4 pt-20">
        {selectedAddresses.length > 0 ? (
          <TransactionFlow
            transactions={addresses
              .filter(a => selectedAddresses.includes(a.address))
              .flatMap(a => a.transactions)}
            searchedAddress={selectedAddresses[0]}
            additionalAddresses={selectedAddresses.slice(1)}
          />
        ) : (
          <Card className="w-full h-[800px] p-4 relative border-white/10 bg-black/50">
            <CardHeader>
              <CardTitle className="text-white">Transaction Graph</CardTitle>
              <CardDescription className="text-white/70">
                Add addresses using the sidebar and select one or more to view their transaction graph.
                Press spacebar or use the toggle button to open/close the address list.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[600px] text-white/50">
                Select addresses to view their transaction flow
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TransactionGraph;
