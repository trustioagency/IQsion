import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { getNavigationUrl } from "../lib/navigation";

export default function NotFound() {
  return (
    <div className="space-y-6">
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-8 pb-8">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">Sayfa Bulunamadı</h1>
              <p className="text-slate-400 mb-6">
                Bu özellik henüz geliştirilme aşamasında. Şimdilik dashboard ve pazar analizi sayfalarını kullanabilirsin.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => window.location.href = getNavigationUrl('/')}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard'a Dön
                </Button>
                <Button 
                  onClick={() => window.location.href = getNavigationUrl('/market-analysis')}
                  variant="outline"
                  className="bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600"
                >
                  Pazar Analizi
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
