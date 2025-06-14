
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

const InstallPrompt = () => {
  const { isInstallable, installApp } = usePWA();
  const [dismissed, setDismissed] = React.useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Download className="w-5 h-5 text-orange-600" />
            <div>
              <p className="font-medium text-sm">Install SpeedySpoon</p>
              <p className="text-xs text-gray-600">Get the full app experience</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={installApp}
              className="bg-orange-600 hover:bg-orange-700 text-xs px-3 py-1"
            >
              Install
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
              className="p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstallPrompt;
