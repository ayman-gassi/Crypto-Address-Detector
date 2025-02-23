
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { validateCryptoAddress } from "@/utils/cryptoValidators";
import { toast } from "sonner";
import AddressResult from "@/components/AddressResult";

const SAMPLE_ADDRESSES = `# Bitcoin addresses
1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa

# Ethereum addresses
0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae

# Solana addresses
FMJiuKezug55WtTx6XJQJKLDtPzDj617tvHviY9psdyw`;

const MAX_ADDRESSES = 50;

const MultipleAddresses = () => {
  const [addresses, setAddresses] = useState("");
  const [filterType, setFilterType] = useState<'all' | 'valid' | 'invalid'>('all');
  const [results, setResults] = useState<Array<{ address: string; cryptoInfo: any | null }>>([]);
  const navigate = useNavigate();

  const handleAnalyze = () => {
    const addressList = addresses
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'));

    if (addressList.length > MAX_ADDRESSES) {
      toast.error(`Maximum ${MAX_ADDRESSES} addresses allowed`);
      return;
    }

    const analyzed = addressList.map(address => {
      const validation = validateCryptoAddress(address);
      return {
        address,
        cryptoInfo: validation
      };
    });

    setResults(analyzed);
    toast.success("Addresses analyzed successfully");
  };

  const getFilteredResults = () => {
    switch (filterType) {
      case 'valid':
        return results.filter(r => r.cryptoInfo !== null);
      case 'invalid':
        return results.filter(r => r.cryptoInfo === null);
      default:
        return results;
    }
  };

  const handleLoadSample = () => {
    setAddresses(SAMPLE_ADDRESSES);
    toast.success("Sample addresses loaded");
  };

  const handleClear = () => {
    setAddresses("");
    setResults([]);
    toast.success("Cleared all addresses");
  };

  return (
    <div className="min-h-screen w-full max-w-4xl mx-auto p-4 pt-20 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="hover:bg-white/5"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Multiple Addresses Checker</h1>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={handleLoadSample} variant="outline" className="flex-1">
            Load Sample Addresses
          </Button>
          <Button onClick={handleClear} variant="outline" className="flex-1">
            Clear All
          </Button>
        </div>

        <Textarea
          value={addresses}
          onChange={(e) => setAddresses(e.target.value)}
          placeholder="Enter addresses (one per line)..."
          className="min-h-[200px] bg-black/40 backdrop-blur-xl border-white/10 focus-visible:ring-violet-500/50"
        />

        <div className="flex gap-2">
          <Button onClick={handleAnalyze} className="flex-1">
            Analyze Addresses
          </Button>
          
          <Select value={filterType} onValueChange={(value) => setFilterType(value as 'all' | 'valid' | 'invalid')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter results" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Addresses</SelectItem>
              <SelectItem value="valid">Valid Only</SelectItem>
              <SelectItem value="invalid">Invalid Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-4 mt-8">
          <h2 className="text-xl font-semibold">Results ({getFilteredResults().length} addresses)</h2>
          <div className="space-y-4">
            {getFilteredResults().map((result, index) => (
              <div key={index}>
                {result.cryptoInfo ? (
                  <AddressResult 
                    address={result.address}
                    cryptoInfo={result.cryptoInfo}
                  />
                ) : (
                  <div className="p-4 rounded-lg backdrop-blur-md border bg-red-500/10 border-red-500/50">
                    <div className="font-mono text-sm break-all">{result.address}</div>
                    <div className="mt-1 text-sm text-red-400">
                      Invalid address format
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultipleAddresses;
