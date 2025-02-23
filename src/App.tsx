
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import History from "./pages/History";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Support from "./pages/Support";
import Guide from "./pages/Guide";
import Prices from "./pages/Prices";
import NotFound from "./pages/NotFound";
import Transactions from "./pages/Transactions";
import TransactionDetails from "./pages/TransactionDetails";
import MultipleAddresses from "./pages/MultipleAddresses";
import TransactionGraph from "./pages/TransactionGraph";
import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <Button
            variant="secondary"
            size="icon"
            onClick={scrollToTop}
            className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const RefreshButton = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const location = useLocation();

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
    toast.success("Page refreshed successfully!");
  };

  if (location.pathname === '/welcome') return null;

  return (
    <Button
      variant="secondary"
      size="icon"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="fixed bottom-4 left-4 z-50 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
    </Button>
  );
};

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition = ({ children }: PageTransitionProps) => {
  const location = useLocation();
  
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

const PageLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isTransactionsPage = location.pathname.includes('/transaction');
  
  return (
    <div className="flex min-h-screen">
      <div className="hidden xl:block w-64 p-4">
        <div className="h-full border border-dashed border-primary/20 rounded-lg flex items-center justify-center relative overflow-hidden group">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-purple-500/10"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <p className="text-muted-foreground text-sm relative z-10 group-hover:text-primary transition-colors">
            Ad Space Left
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-screen relative">
        <PageTransition>
          {children}
        </PageTransition>
        {!isTransactionsPage && <ScrollToTop />}
        <RefreshButton />
      </div>

      <div className="hidden xl:block w-64 p-4">
        <div className="h-full border border-dashed border-primary/20 rounded-lg flex items-center justify-center relative overflow-hidden group">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-violet-500/10"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <p className="text-muted-foreground text-sm relative z-10 group-hover:text-primary transition-colors">
            Ad Space Right
          </p>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [hasSeenWelcome, setHasSeenWelcome] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkWelcomeCookie = () => {
      const cookies = document.cookie.split(';');
      const welcomeCookie = cookies.find(cookie => cookie.trim().startsWith('welcomeSeen='));
      setHasSeenWelcome(true);
      setLoading(false);
    };

    checkWelcomeCookie();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AnimatePresence mode="wait">
            <Routes>
              <Route 
                path="/" 
                element={<PageLayout><Index /></PageLayout>}
              />
              <Route path="/welcome" element={<Welcome setHasSeenWelcome={setHasSeenWelcome} />} />
              <Route path="/history" element={<PageLayout><History /></PageLayout>} />
              <Route path="/terms" element={<PageLayout><Terms /></PageLayout>} />
              <Route path="/privacy" element={<PageLayout><Privacy /></PageLayout>} />
              <Route path="/support" element={<PageLayout><Support /></PageLayout>} />
              <Route path="/guide" element={<PageLayout><Guide /></PageLayout>} />
              <Route path="/prices" element={<PageLayout><Prices /></PageLayout>} />
              <Route path="/transactions" element={<PageLayout><Transactions /></PageLayout>} />
              <Route path="/transaction/:txid" element={<PageLayout><TransactionDetails /></PageLayout>} />
              <Route path="/multiple-addresses" element={<PageLayout><MultipleAddresses /></PageLayout>} />
              <Route path="/transactions-graph" element={<PageLayout><TransactionGraph /></PageLayout>} />
              <Route path="*" element={<PageLayout><NotFound /></PageLayout>} />
            </Routes>
          </AnimatePresence>
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
