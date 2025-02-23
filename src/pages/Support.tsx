import { Button } from "@/components/ui/button";
import { HelpCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Support = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Refresh ads on component mount
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('Error loading ads:', err);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Pattern */}
      <div className="fixed inset-0 grid-pattern opacity-30"></div>

      <div className="relative container max-w-4xl mx-auto py-8 px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Ad Container */}
        <div className="mb-6 text-center">
          <ins className="adsbygoogle"
               style={{ display: 'block' }}
               data-ad-client="YOUR-AD-CLIENT-ID"
               data-ad-slot="YOUR-AD-SLOT"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
        </div>

        <div className="space-y-8 bg-black/40 backdrop-blur-sm p-6 rounded-lg border border-white/10">
          <div className="flex items-center space-x-3">
            <HelpCircle className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Support Center</h1>
          </div>

          <div className="space-y-6 text-gray-300">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white">What cryptocurrencies are supported?</h3>
                  <p className="mt-2">
                    We support major cryptocurrencies including Bitcoin, Ethereum, Solana, and many others. The system automatically detects the correct network based on the address format.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white">How accurate is the balance information?</h3>
                  <p className="mt-2">
                    Balance information is fetched in real-time from blockchain explorers and APIs. While we strive for accuracy, we recommend verifying critical information through official sources.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white">Is my search history private?</h3>
                  <p className="mt-2">
                    Yes, your search history is stored locally on your device only. You can clear it at any time through the history page.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Contact Information</h2>
              <p>
                For additional support or questions, please reach out through our official channels:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email: support@cryptoaddressdetector.com</li>
                <li>Twitter: @CryptoAddrDetect</li>
                <li>Telegram: @CryptoAddressDetector</li>
              </ul>
            </section>
          </div>
        </div>

        {/* Bottom Ad Container */}
        <div className="mt-6 text-center">
          <ins className="adsbygoogle"
               style={{ display: 'block' }}
               data-ad-client="YOUR-AD-CLIENT-ID"
               data-ad-slot="YOUR-AD-SLOT"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
        </div>
      </div>
    </div>
  );
};

export default Support;
