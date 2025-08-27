import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  ShoppingCart,
  X,
  GripVertical
} from "lucide-react";

interface StatCardsWidgetProps {
  data?: {
    totalRevenue: number;
    totalAdSpend: number;
    avgRoas: number;
    totalConversions: number;
  };
  isCustomizing?: boolean;
  onRemove?: () => void;
  dragHandleProps?: any;
}

export default function StatCardsWidget({ 
  data = {
    totalRevenue: 0,
    totalAdSpend: 0, 
    avgRoas: 0,
    totalConversions: 0
  },
  isCustomizing,
  onRemove,
  dragHandleProps
}: StatCardsWidgetProps) {
  
  const stats = [
    {
      title: "Toplam Gelir",
      value: `₺${data.totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      changeType: "positive" as const,
      icon: DollarSign,
      color: "hsl(153, 60%, 53%)"
    },
    {
      title: "Reklam Harcaması", 
      value: `₺${data.totalAdSpend.toLocaleString()}`,
      change: "+8.2%",
      changeType: "negative" as const,
      icon: TrendingUp,
      color: "hsl(48, 96%, 53%)"
    },
    {
      title: "ROAS",
      value: `${data.avgRoas.toFixed(1)}x`,
      change: "+5.1%", 
      changeType: "positive" as const,
      icon: Target,
      color: "hsl(207, 90%, 54%)"
    },
    {
      title: "Dönüşümler",
      value: data.totalConversions.toLocaleString(),
      change: "+18.3%",
      changeType: "positive" as const,
      icon: ShoppingCart,
      color: "hsl(280, 65%, 60%)"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:col-span-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <div key={index} className="relative widget-container">
            {/* Drag Handle */}
            {isCustomizing && (
              <div 
                className="widget-drag-handle absolute top-2 left-2 z-10 p-1 rounded cursor-grab hover:bg-slate-700"
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
                className="widget-remove-btn absolute top-2 right-2 z-10 text-red-400 hover:text-red-300 hover:bg-red-500/20 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            )}

            <Card className="metric-card h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <Icon 
                      className="w-6 h-6" 
                      style={{ color: stat.color }}
                    />
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`metric-change ${stat.changeType}`}
                  >
                    {stat.change}
                  </Badge>
                </div>
                
                <h4 className="text-slate-400 text-sm mb-2">{stat.title}</h4>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-slate-500 text-xs">Bu ay</p>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
