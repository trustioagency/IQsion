import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertTriangle, 
  TrendingUp, 
  AlertCircle,
  X,
  GripVertical,
  Bell,
  ExternalLink
} from "lucide-react";
import { ALERT_TYPES } from "@/lib/constants";

interface Alert {
  id: number;
  type: 'opportunity' | 'warning' | 'alert';
  title: string;
  description: string;
  time: string;
  metric?: string;
  change?: string;
  actionUrl?: string;
}

interface AlertsWidgetProps {
  isCustomizing?: boolean;
  onRemove?: () => void;
  dragHandleProps?: any;
}

export default function AlertsWidget({
  isCustomizing,
  onRemove,
  dragHandleProps
}: AlertsWidgetProps) {

  // Sample alerts data - in real app this would come from props
  const alerts: Alert[] = [
    {
      id: 1,
      type: 'opportunity',
      title: 'TikTok ROAS Fırsatı',
      description: 'TikTok kampanyanızın ROAS değeri %35 artış gösteriyor. Bütçe artırımı öneriliyor.',
      time: '5 dakika önce',
      metric: 'ROAS',
      change: '+35%'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Google Ads CPC Artışı',
      description: 'Son 3 günde CPC değerlerinizde %18 artış tespit edildi.',
      time: '1 saat önce',
      metric: 'CPC',
      change: '+18%'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Meta Kampanya Durumu',
      description: 'Ana kampanyanızın dönüşüm oranı hedefin altına düştü.',
      time: '2 saat önce',
      metric: 'Dönüşüm Oranı',
      change: '-12%'
    },
    {
      id: 4,
      type: 'opportunity',
      title: 'Yeni Hedef Kitle Fırsatı',
      description: 'Lookalike kitlesi %40 daha iyi performans gösteriyor.',
      time: '4 saat önce',
      metric: 'CTR',
      change: '+40%'
    },
    {
      id: 5,
      type: 'warning',
      title: 'Bütçe Uyarısı',
      description: 'Günlük bütçenizin %85\'i tükendi.',
      time: '6 saat önce',
      metric: 'Bütçe',
      change: '85%'
    }
  ];

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'opportunity':
        return TrendingUp;
      case 'warning':
        return AlertTriangle;
      case 'alert':
        return AlertCircle;
      default:
        return Bell;
    }
  };

  const getAlertConfig = (type: Alert['type']) => {
    return ALERT_TYPES[type] || ALERT_TYPES.warning;
  };

  return (
    <div className="relative widget-container">
      {/* Drag Handle */}
      {isCustomizing && (
        <div 
          className="widget-drag-handle absolute top-4 left-4 z-10 p-1 rounded cursor-grab hover:bg-slate-700"
          {...dragHandleProps}
        >
          <GripVertical className="w-4 h-4 text-slate-400" />
        </div>
      )}

      {/* Remove Button */}
      {isCustomizing && onRemove && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="widget-remove-btn absolute top-4 right-4 z-10 text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1"
        >
          <X className="w-4 h-4" />
        </Button>
      )}

      <Card className="bg-slate-800 border-slate-700 h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Bell className="w-5 h-5" />
              Uyarılar & Öneriler
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
              {alerts.length}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-80 px-6">
            <div className="space-y-4">
              {alerts.map((alert) => {
                const Icon = getAlertIcon(alert.type);
                const config = getAlertConfig(alert.type);
                
                return (
                  <div
                    key={alert.id}
                    className={`ai-recommendation ${alert.type} p-4 rounded-lg transition-all hover:scale-[1.02]`}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${config.color}20` }}
                      >
                        <Icon 
                          className="w-4 h-4" 
                          style={{ color: config.color }}
                        />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant="secondary"
                            className="text-xs"
                            style={{ 
                              backgroundColor: `${config.color}20`,
                              color: config.color 
                            }}
                          >
                            {config.label}
                          </Badge>
                          {alert.change && (
                            <Badge 
                              variant="outline"
                              className="text-xs border-slate-600 text-slate-400"
                            >
                              {alert.change}
                            </Badge>
                          )}
                        </div>
                        
                        <h4 className="font-medium text-white mb-1 text-sm">
                          {alert.title}
                        </h4>
                        
                        <p className="text-slate-400 text-xs leading-relaxed mb-3">
                          {alert.description}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-xs">
                            {alert.time}
                          </span>
                          
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs hover:no-underline"
                            style={{ color: config.color }}
                          >
                            Detaylar
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          
          {/* Footer */}
          <div className="p-4 border-t border-slate-700">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
            >
              Tüm Uyarıları Görüntüle
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
