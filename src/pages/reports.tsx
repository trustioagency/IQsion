
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { FileText, Download, Calendar, TrendingUp, BarChart3, PieChart, Users, DollarSign } from "lucide-react";

export default function Reports() {
  const [reportType, setReportType] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');

  const reports = [
    {
      id: 1,
      title: 'Aylık Performans Raporu',
      type: 'performance',
      generatedDate: '2024-01-15',
      status: 'ready',
      description: 'Tüm kanallar için aylık performans özeti',
      fileSize: '2.4 MB',
      format: 'PDF'
    },
    {
      id: 2,
      title: 'Kanal Karlılık Analizi',
      type: 'profitability',
      generatedDate: '2024-01-14',
      status: 'ready',
      description: 'Kanal bazında karlılık ve ROI analizi',
      fileSize: '1.8 MB',
      format: 'Excel'
    },
    {
      id: 3,
      title: 'Müşteri Segmentasyon Raporu',
      type: 'audience',
      generatedDate: '2024-01-13',
      status: 'generating',
      description: 'Müşteri segmentleri ve davranış analizi',
      fileSize: '-',
      format: 'PDF'
    },
    {
      id: 4,
      title: 'Kreatif Performans Raporu',
      type: 'creative',
      generatedDate: '2024-01-12',
      status: 'ready',
      description: 'Reklam kreatiflerinin performans analizi',
      fileSize: '3.1 MB',
      format: 'PDF'
    }
  ];

  const reportTemplates = [
    { name: 'Haftalık Özet', description: 'Haftalık performans ve önemli metrikler', icon: BarChart3 },
    { name: 'Aylık Dashboard', description: 'Aylık kapsamlı performans raporu', icon: PieChart },
    { name: 'Kitle Analizi', description: 'Hedef kitle davranış ve demografik analizi', icon: Users },
    { name: 'ROI Raporu', description: 'Yatırım getirisi ve karlılık analizi', icon: DollarSign }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'ready': return 'bg-green-500/20 text-green-400';
      case 'generating': return 'bg-orange-500/20 text-orange-400';
      case 'failed': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      performance: 'bg-blue-500/20 text-blue-400',
      profitability: 'bg-green-500/20 text-green-400',
      audience: 'bg-purple-500/20 text-purple-400',
      creative: 'bg-pink-500/20 text-pink-400'
    };
    return colors[type] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Raporlar</h1>
                <p className="text-slate-400">Performans raporlarınızı oluşturun ve indirin</p>
              </div>
              
              <div className="flex items-center gap-4">
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-slate-300 w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all">Tüm Raporlar</SelectItem>
                    <SelectItem value="performance">Performans</SelectItem>
                    <SelectItem value="profitability">Karlılık</SelectItem>
                    <SelectItem value="audience">Kitle</SelectItem>
                    <SelectItem value="creative">Kreatif</SelectItem>
                  </SelectContent>
                </Select>

                <Button className="bg-blue-600 hover:bg-blue-700">
                  <FileText className="w-4 h-4 mr-2" />
                  Yeni Rapor Oluştur
                </Button>
              </div>
            </div>

            {/* Report Templates */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Hızlı Rapor Şablonları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {reportTemplates.map((template, index) => (
                    <div key={index} className="bg-slate-700/50 rounded-lg p-4 cursor-pointer hover:bg-slate-700/70 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <template.icon className="w-6 h-6 text-blue-400" />
                        <h4 className="text-white font-medium">{template.name}</h4>
                      </div>
                      <p className="text-slate-400 text-sm mb-4">{template.description}</p>
                      <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                        Oluştur
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generated Reports */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Oluşturulan Raporlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="bg-slate-700/50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-white font-medium">{report.title}</h4>
                            <Badge variant="secondary" className={getTypeColor(report.type)}>
                              {report.type}
                            </Badge>
                            <Badge variant="secondary" className={getStatusColor(report.status)}>
                              {report.status === 'ready' ? 'Hazır' : 
                               report.status === 'generating' ? 'Oluşturuluyor' : 'Hata'}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm">{report.description}</p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {report.status === 'ready' && (
                            <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                              <Download className="w-4 h-4 mr-2" />
                              İndir
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Oluşturulma:</span>
                          <span className="text-white ml-2">{report.generatedDate}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Format:</span>
                          <span className="text-white ml-2">{report.format}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Boyut:</span>
                          <span className="text-white ml-2">{report.fileSize}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

    </div>
  );
}
