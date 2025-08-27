import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { 
  MoreHorizontal, 
  X, 
  GripVertical,
  TrendingUp
} from "lucide-react";
import { PLATFORM_COLORS } from "@/lib/constants";

interface TrafficChartWidgetProps {
  data?: any[];
  dateRange?: string;
  platform?: string;
  isCustomizing?: boolean;
  onRemove?: () => void;
  dragHandleProps?: any;
}

export default function TrafficChartWidget({
  data = [],
  dateRange = '30d',
  platform = 'all',
  isCustomizing,
  onRemove,
  dragHandleProps
}: TrafficChartWidgetProps) {

  // Generate sample chart data if no real data
  const chartData = data.length > 0 ? data : [
    { date: '01/01', revenue: 4500, adSpend: 1200 },
    { date: '02/01', revenue: 5200, adSpend: 1400 },
    { date: '03/01', revenue: 4800, adSpend: 1100 },
    { date: '04/01', revenue: 6100, adSpend: 1600 },
    { date: '05/01', revenue: 5800, adSpend: 1500 },
    { date: '06/01', revenue: 7200, adSpend: 1800 },
    { date: '07/01', revenue: 6800, adSpend: 1700 },
  ];

  const formatCurrency = (value: number) => {
    return `₺${value.toLocaleString()}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <p className="text-slate-300 text-sm mb-2">{`Tarih: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
              <TrendingUp className="w-5 h-5" />
              Gelir Trendi
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white p-1"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(217.2, 32.6%, 17.5%)"
                />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(215, 20.2%, 65.1%)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(215, 20.2%, 65.1%)"
                  fontSize={12}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{ color: 'hsl(215, 20.2%, 65.1%)' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(153, 60%, 53%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(153, 60%, 53%)', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(153, 60%, 53%)', strokeWidth: 2 }}
                  name="Gelir"
                />
                <Line
                  type="monotone"
                  dataKey="adSpend"
                  stroke="hsl(0, 84.2%, 60.2%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(0, 84.2%, 60.2%)', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(0, 84.2%, 60.2%)', strokeWidth: 2 }}
                  name="Reklam Harcaması"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Chart Summary */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
            <div className="text-sm text-slate-400">
              Son {dateRange === '7d' ? '7 gün' : dateRange === '30d' ? '30 gün' : '90 gün'} trendi
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-slate-400">Gelir</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-slate-400">Harcama</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
