import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Terms = () => {
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
            <FileText className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Terms of Use</h1>
          </div>

          <div className="space-y-6 text-gray-300">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">1. Service Description</h2>
              <p>
                Crypto Address Detector provides a service for identifying and analyzing cryptocurrency addresses across various blockchain networks. The service includes address validation, balance checking, and transaction history viewing capabilities.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">2. User Responsibilities</h2>
              <p>
                Users are responsible for ensuring the accuracy of the cryptocurrency addresses they input. We do not store private keys or sensitive wallet information. Users should verify all information through official blockchain explorers.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">3. Data Usage</h2>
              <p>
                We collect basic usage data to improve our service. This includes searched addresses and interaction patterns. All data is stored locally on your device and can be cleared at any time through the history page.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">4. Limitations</h2>
              <p>
                The service relies on third-party APIs and blockchain explorers. We cannot guarantee 100% accuracy or availability of the service. Users should always verify critical information through multiple sources.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">5. Advertisements</h2>
              <p>
                Our service includes third-party advertisements to support its operation. These ads may require page refreshes to update. Users acknowledge that ad blockers may impact site functionality.
              </p>
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

export default Terms;
