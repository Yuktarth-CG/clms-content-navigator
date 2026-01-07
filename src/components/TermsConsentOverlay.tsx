import React, { useState } from 'react';
import { Shield, ScrollText, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockPrivacyPolicy, mockTermsConditions, CURRENT_TC_VERSION } from '@/data/mockTermsData';

interface TermsConsentOverlayProps {
  onAccept: () => void;
}

const TermsConsentOverlay: React.FC<TermsConsentOverlayProps> = ({ onAccept }) => {
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  
  const canProceed = privacyChecked && termsChecked;

  const handleProceed = () => {
    if (canProceed) {
      onAccept();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-3xl rounded-xl shadow-2xl border overflow-hidden">
        {/* Header */}
        <div className="bg-primary px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary-foreground" />
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">
                Terms & Conditions
              </h1>
              <p className="text-sm text-primary-foreground/80">
                Please review and accept to continue
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm font-mono">
            {CURRENT_TC_VERSION}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs defaultValue="privacy" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <ScrollText className="h-4 w-4" />
                Privacy Policy
              </TabsTrigger>
              <TabsTrigger value="terms" className="flex items-center gap-2">
                <ScrollText className="h-4 w-4" />
                Terms & Conditions
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="privacy">
              <ScrollArea className="h-[300px] w-full rounded-lg border bg-muted/30 p-4">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {mockPrivacyPolicy.split('\n').map((line, idx) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={idx} className="text-xl font-bold mt-4 mb-2">{line.replace('# ', '')}</h1>;
                    } else if (line.startsWith('## ')) {
                      return <h2 key={idx} className="text-lg font-semibold mt-4 mb-2 text-primary">{line.replace('## ', '')}</h2>;
                    } else if (line.startsWith('### ')) {
                      return <h3 key={idx} className="text-base font-medium mt-3 mb-1">{line.replace('### ', '')}</h3>;
                    } else if (line.startsWith('- ')) {
                      return <li key={idx} className="ml-4 text-muted-foreground">{line.replace('- ', '')}</li>;
                    } else if (line.trim()) {
                      return <p key={idx} className="text-muted-foreground mb-2">{line}</p>;
                    }
                    return null;
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="terms">
              <ScrollArea className="h-[300px] w-full rounded-lg border bg-muted/30 p-4">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {mockTermsConditions.split('\n').map((line, idx) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={idx} className="text-xl font-bold mt-4 mb-2">{line.replace('# ', '')}</h1>;
                    } else if (line.startsWith('## ')) {
                      return <h2 key={idx} className="text-lg font-semibold mt-4 mb-2 text-primary">{line.replace('## ', '')}</h2>;
                    } else if (line.startsWith('### ')) {
                      return <h3 key={idx} className="text-base font-medium mt-3 mb-1">{line.replace('### ', '')}</h3>;
                    } else if (line.startsWith('- ')) {
                      return <li key={idx} className="ml-4 text-muted-foreground">{line.replace('- ', '')}</li>;
                    } else if (line.trim()) {
                      return <p key={idx} className="text-muted-foreground mb-2">{line}</p>;
                    }
                    return null;
                  })}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Checkboxes */}
          <div className="mt-6 space-y-4 p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="privacy" 
                checked={privacyChecked}
                onCheckedChange={(checked) => setPrivacyChecked(checked === true)}
                className="mt-0.5"
              />
              <label 
                htmlFor="privacy" 
                className="text-sm font-medium leading-tight cursor-pointer select-none"
              >
                I have read and agree to the <span className="text-primary font-semibold">Privacy Policy</span>
              </label>
            </div>
            
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="terms" 
                checked={termsChecked}
                onCheckedChange={(checked) => setTermsChecked(checked === true)}
                className="mt-0.5"
              />
              <label 
                htmlFor="terms" 
                className="text-sm font-medium leading-tight cursor-pointer select-none"
              >
                I accept the <span className="text-primary font-semibold">Terms & Conditions</span>
              </label>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={handleProceed}
            disabled={!canProceed}
            className="w-full mt-6 h-12 text-base font-semibold"
            size="lg"
          >
            {canProceed ? (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Proceed to CLMS
              </>
            ) : (
              'Please accept both policies to continue'
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground mt-4">
            By proceeding, you acknowledge that you have read and understood our policies.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsConsentOverlay;
