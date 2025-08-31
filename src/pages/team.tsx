
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  Users2, 
  Plus, 
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Circle,
  PlayCircle,
  Eye,
  MoreHorizontal
} from "lucide-react";

// Mock data
const teamMembers = [
  {
    id: 1,
    name: "Ahmet Kaya",
    role: "Pazarlama Müdürü",
    avatar: "/api/placeholder/40/40",
    activeTasks: 3,
    overdueTasks: 1,
    status: "online"
  },
  {
    id: 2,
    name: "Zeynep Demir",
    role: "İçerik Uzmanı",
    avatar: "/api/placeholder/40/40",
    activeTasks: 5,
    overdueTasks: 0,
    status: "online"
  },
  {
    id: 3,
    name: "Mehmet Yılmaz",
    role: "Veri Analisti",
    avatar: "/api/placeholder/40/40",
    activeTasks: 2,
    overdueTasks: 0,
    status: "away"
  },
  {
    id: 4,
    name: "Selin Özkan",
    role: "Sosyal Medya Uzmanı",
    avatar: "/api/placeholder/40/40",
    activeTasks: 4,
    overdueTasks: 2,
    status: "online"
  }
];

const unassignedTasks = [
  {
    id: 1,
    title: "Q1 Pazar Analizi Raporu",
    priority: "high",
    deadline: "2024-01-25",
    description: "Q1 için kapsamlı pazar analizi raporu hazırlanması"
  },
  {
    id: 2,
    title: "Meta Ads Kampanya Optimizasyonu",
    priority: "medium",
    deadline: "2024-01-28",
    description: "Düşük performanslı kampanyaların optimize edilmesi"
  },
  {
    id: 3,
    title: "Müşteri Segmentasyon Analizi",
    priority: "low",
    deadline: "2024-02-05",
    description: "Yeni müşteri segmentlerinin belirlenmesi"
  }
];

const kanbanTasks = {
  todo: [
    {
      id: 4,
      title: "Google Ads ROI Analizi",
      priority: "high",
      deadline: "2024-01-26",
      assignee: { name: "Ahmet K.", avatar: "/api/placeholder/32/32" }
    },
    {
      id: 5,
      title: "İçerik Takvimi Hazırlama",
      priority: "medium",
      deadline: "2024-01-30",
      assignee: { name: "Zeynep D.", avatar: "/api/placeholder/32/32" }
    }
  ],
  inProgress: [
    {
      id: 6,
      title: "Rakip Analizi Raporu",
      priority: "high",
      deadline: "2024-01-24",
      assignee: { name: "Mehmet Y.", avatar: "/api/placeholder/32/32" }
    },
    {
      id: 7,
      title: "Instagram Hikaye Kampanyası",
      priority: "medium",
      deadline: "2024-01-27",
      assignee: { name: "Selin Ö.", avatar: "/api/placeholder/32/32" }
    }
  ],
  review: [
    {
      id: 8,
      title: "Müşteri Memnuniyet Anketi",
      priority: "low",
      deadline: "2024-01-29",
      assignee: { name: "Zeynep D.", avatar: "/api/placeholder/32/32" }
    }
  ],
  done: [
    {
      id: 9,
      title: "Aylık Performans Raporu",
      priority: "high",
      deadline: "2024-01-20",
      assignee: { name: "Ahmet K.", avatar: "/api/placeholder/32/32" }
    },
    {
      id: 10,
      title: "TikTok Ads Hesap Kurulumu",
      priority: "medium",
      deadline: "2024-01-18",
      assignee: { name: "Selin Ö.", avatar: "/api/placeholder/32/32" }
    }
  ]
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'medium':
      return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
    case 'low':
      return 'bg-green-500/10 text-green-400 border-green-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'Yüksek';
    case 'medium':
      return 'Orta';
    case 'low':
      return 'Düşük';
    default:
      return 'Normal';
  }
};

const TaskCard = ({ task, showAssignee = true }: { task: any, showAssignee?: boolean }) => (
  <Card className="bg-slate-800/80 border-slate-700/50 backdrop-blur-sm hover:bg-slate-700/80 transition-all cursor-pointer mb-3">
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-white font-medium text-sm line-clamp-2">{task.title}</h4>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-slate-400 hover:text-white">
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        <Badge className={`text-xs px-2 py-0.5 ${getPriorityColor(task.priority)}`}>
          {getPriorityLabel(task.priority)}
        </Badge>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Calendar className="h-3 w-3" />
          {new Date(task.deadline).toLocaleDateString('tr-TR')}
        </div>
      </div>

      {task.description && (
        <p className="text-slate-400 text-xs mb-3 line-clamp-2">{task.description}</p>
      )}

      {showAssignee && task.assignee && (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={task.assignee.avatar} />
            <AvatarFallback className="text-xs">{task.assignee.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-slate-300">{task.assignee.name}</span>
        </div>
      )}
    </CardContent>
  </Card>
);

export default function Team() {
  return (
    <div className="space-y-6">
      <div className="flex h-screen">
            
            {/* Sol Panel - Ekip */}
            <div className="w-80 border-r border-slate-700/50 p-6 overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users2 className="w-5 h-5" />
                  Ekip
                </h2>
                <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-1" />
                  Üye Ekle
                </Button>
              </div>

              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <Card key={member.id} className="bg-slate-800/80 border-slate-700/50 backdrop-blur-sm hover:bg-slate-700/80 transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800 ${
                            member.status === 'online' ? 'bg-green-500' : 'bg-yellow-500'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium text-sm truncate">{member.name}</h3>
                          <p className="text-slate-400 text-xs mb-3">{member.role}</p>
                          
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1 text-blue-400">
                              <Circle className="w-3 h-3" />
                              <span>{member.activeTasks} Aktif</span>
                            </div>
                            {member.overdueTasks > 0 && (
                              <div className="flex items-center gap-1 text-red-400">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{member.overdueTasks} Gecikmiş</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sağ Panel - Görev Panosu */}
            <div className="flex-1 p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Görev Panosu</h2>
                <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Görev Ekle
                </Button>
              </div>

              <Tabs defaultValue="kanban" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 mb-6">
                  <TabsTrigger value="unassigned" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                    Atanmamış Görevler
                  </TabsTrigger>
                  <TabsTrigger value="kanban" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                    Kanban Panosu
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white">
                    Takvim
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-hidden">
                  <TabsContent value="unassigned" className="h-full m-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full overflow-y-auto">
                      {unassignedTasks.map((task) => (
                        <TaskCard key={task.id} task={task} showAssignee={false} />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="kanban" className="h-full m-0">
                    <div className="grid grid-cols-4 gap-6 h-full">
                      {/* Yapılacak */}
                      <div className="bg-slate-800/50 rounded-lg p-4 h-full overflow-y-auto">
                        <div className="flex items-center gap-2 mb-4">
                          <Circle className="w-4 h-4 text-slate-400" />
                          <h3 className="font-medium text-white">Yapılacak</h3>
                          <Badge className="bg-slate-700 text-slate-300">{kanbanTasks.todo.length}</Badge>
                        </div>
                        {kanbanTasks.todo.map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>

                      {/* Yapılıyor */}
                      <div className="bg-slate-800/50 rounded-lg p-4 h-full overflow-y-auto">
                        <div className="flex items-center gap-2 mb-4">
                          <PlayCircle className="w-4 h-4 text-blue-400" />
                          <h3 className="font-medium text-white">Yapılıyor</h3>
                          <Badge className="bg-blue-600/20 text-blue-400">{kanbanTasks.inProgress.length}</Badge>
                        </div>
                        {kanbanTasks.inProgress.map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>

                      {/* İncelemede */}
                      <div className="bg-slate-800/50 rounded-lg p-4 h-full overflow-y-auto">
                        <div className="flex items-center gap-2 mb-4">
                          <Eye className="w-4 h-4 text-yellow-400" />
                          <h3 className="font-medium text-white">İncelemede</h3>
                          <Badge className="bg-yellow-600/20 text-yellow-400">{kanbanTasks.review.length}</Badge>
                        </div>
                        {kanbanTasks.review.map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>

                      {/* Tamamlandı */}
                      <div className="bg-slate-800/50 rounded-lg p-4 h-full overflow-y-auto">
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <h3 className="font-medium text-white">Tamamlandı</h3>
                          <Badge className="bg-green-600/20 text-green-400">{kanbanTasks.done.length}</Badge>
                        </div>
                        {kanbanTasks.done.map((task) => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="calendar" className="h-full m-0">
                    <Card className="bg-slate-800/80 border-slate-700/50 backdrop-blur-sm h-full">
                      <CardContent className="p-6 h-full flex items-center justify-center">
                        <div className="text-center">
                          <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                          <h3 className="text-white font-medium mb-2">Takvim Görünümü</h3>
                          <p className="text-slate-400">
                            Takvim görünümü geliştirme aşamasında. 
                            <br />
                            Görevlerin deadline'larını burada görüntüleyebileceksiniz.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </div>

      </div>
    </div>
  );
}
