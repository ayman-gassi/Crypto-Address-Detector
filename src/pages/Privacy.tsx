import { Button } from "@/components/ui/button";
import { Shield, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Privacy = () => {
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
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Privacy Policy</h1>
          </div>

          <div className="space-y-6 text-gray-300">
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Data Collection</h2>
              <p>
                We collect minimal data required for service operation. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Searched cryptocurrency addresses</li>
                <li>Basic usage statistics</li>
                <li>Local storage data for history features</li>
              </ul>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Data Storage</h2>
              <p>
                All user data is stored locally on your device. We do not maintain a central database of user searches or activities. Your search history can be cleared at any time through the application interface.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Third-Party Services</h2>
              <p>
                Our service integrates with various blockchain explorers and price APIs. These third-party services may have their own privacy policies. We recommend reviewing their policies when using our service.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Advertising</h2>
              <p>
                We use third-party advertising services to support our operations. These services may use cookies and similar technologies to personalize ads. Users can manage their ad preferences through their browser settings.
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

export default Privacy;
