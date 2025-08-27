
import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Zap, 
  User, 
  Loader2,
  Sparkles,
  MessageCircle,
  Bot,
  TrendingUp,
  Target,
  Lightbulb,
  Clock
} from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { QUICK_ACTIONS } from "@/lib/constants";

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

const quickSuggestions = [
  "ROAS analizi yap",
  "En karlı kanalları göster",
  "Bütçe dağılımını optimize et",
  "Müşteri segmentasyonu öner",
  "Rakip analizi yap",
  "Konversiyon oranını artır"
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Merhaba! Ben sizin AI pazarlama asistanınızım. Kampanyalarınızı optimize etmek, analizler yapmak ve stratejik öneriler sunmak için buradayım. Size nasıl yardımcı olabilirim?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: api.sendChatMessage,
    onSuccess: (response) => {
      const aiMessage: Message = {
        id: Date.now().toString() + '-ai',
        role: 'ai',
        content: response.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Yetkisiz Erişim",
          description: "Oturumunuz sonlandı. Tekrar giriş yapılıyor...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Hata",
        description: "Mesaj gönderilemedi",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (message?: string) => {
    const messageText = message || inputMessage.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    chatMutation.mutate({
      message: messageText,
      context: 'AI Assistant Page - Marketing Intelligence Platform'
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              AI Pazarlama Asistanı
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                <Sparkles className="w-3 h-3 mr-1" />
                Beta
              </Badge>
            </h1>
            <p className="text-slate-400">
              Pazarlama stratejilerinizi optimize edin ve performansınızı artırın
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-green-400 font-bold text-lg">127</p>
                  <p className="text-slate-400 text-sm">Optimizasyon Önerisi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-blue-400 font-bold text-lg">89%</p>
                  <p className="text-slate-400 text-sm">Başarılı Tahmin</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-purple-400 font-bold text-lg">{messages.length - 1}</p>
                  <p className="text-slate-400 text-sm">Sohbet Mesajı</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-full bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-400" />
                Sohbet
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0 flex flex-col h-[calc(100%-80px)]">
              {/* Messages */}
              <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div key={message.id} className={`flex items-start gap-4 ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}>
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                        {message.role === 'ai' ? (
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                            <Bot className="w-5 h-5 text-white" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-300" />
                          </div>
                        )}
                      </div>
                      
                      <div className={`message-bubble p-4 rounded-2xl max-w-[80%] ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-sm' 
                          : 'bg-slate-700 text-slate-100 rounded-tl-sm'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p className={`text-xs mt-3 flex items-center gap-1 opacity-70 ${
                          message.role === 'user' ? 'text-blue-100' : 'text-slate-400'
                        }`}>
                          <Clock className="w-3 h-3" />
                          {message.timestamp.toLocaleTimeString('tr-TR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {chatMutation.isPending && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="bg-slate-700 rounded-2xl rounded-tl-sm p-4">
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                          <span className="text-sm text-slate-400">Düşünüyorum...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-6 border-t border-slate-700">
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Sorunuzu yazın... (örn: ROAS analizi yap)"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={chatMutation.isPending}
                    className="bg-slate-700 border-slate-600 text-slate-300 placeholder-slate-400 focus:border-blue-500"
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || chatMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                  >
                    {chatMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Quick Suggestions */}
          <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                Hızlı Sorular
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage(suggestion)}
                  className="w-full justify-start bg-slate-700/50 hover:bg-slate-600 text-slate-300 border-slate-600 text-xs"
                  disabled={chatMutation.isPending}
                >
                  {suggestion}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-blue-400" />
                Hızlı İşlemler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {QUICK_ACTIONS.slice(0, 4).map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage(action.prompt)}
                  className="w-full justify-start bg-slate-700/50 hover:bg-slate-600 text-slate-300 border-slate-600 text-xs"
                  disabled={chatMutation.isPending}
                >
                  {action.label}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* AI Capabilities */}
          <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-purple-400" />
                AI Yetenekleri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                Gerçek zamanlı veri analizi
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                Otomatik optimizasyon önerileri
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                Tahminsel analitik
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                Rakip analizi
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                Trend tespiti
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
