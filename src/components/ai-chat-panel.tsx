
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  Sparkles, 
  TrendingUp,
  Target,
  Lightbulb,
  AlertCircle
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  message: string;
  timestamp: Date;
}

interface AIInsight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'opportunity';
  title: string;
  description: string;
  action?: string;
  icon: typeof TrendingUp;
}

interface AIChatPanelProps {
  pageContext: string;
  insights?: AIInsight[];
  suggestions?: string[];
}

export default function AIChatPanel({ pageContext, insights = [], suggestions = [] }: AIChatPanelProps) {
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      message: `Merhaba! ${pageContext} sayfası için size nasıl yardımcı olabilirim? Analiz sonuçlarınızı yorumlayabilir, öneriler verebilirim.`,
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: api.sendChatMessage,
    onSuccess: (response) => {
      const aiMessage: ChatMessage = {
        id: Date.now().toString() + '-ai',
        type: 'ai',
        message: response.response,
        timestamp: new Date()
      };
      setChatHistory(prev => [...prev, aiMessage]);
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Mesaj gönderilemedi",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: currentMessage,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMessage]);
    
    chatMutation.mutate({
      message: currentMessage,
      context: pageContext
    });

    setCurrentMessage('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setCurrentMessage(suggestion);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return TrendingUp;
      case 'warning': return AlertCircle;
      case 'opportunity': return Target;
      default: return Lightbulb;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 border-green-500/30';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30';
      case 'opportunity': return 'bg-blue-500/10 border-blue-500/30';
      default: return 'bg-purple-500/10 border-purple-500/30';
    }
  };

  return (
    <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-400" />
          AI Stratejist
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">Beta</Badge>
        </CardTitle>
        <p className="text-slate-400 text-sm">Otomatik içgörüler ve interaktif sohbet</p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* AI Insights */}
        {insights.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-white font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              Güncel İçgörüler
            </h4>
            <ScrollArea className="h-48">
              <div className="space-y-3 pr-4">
                {insights.map((insight) => {
                  const Icon = getInsightIcon(insight.type);
                  return (
                    <div 
                      key={insight.id} 
                      className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-lg ${getInsightColor(insight.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="w-5 h-5 mt-0.5 text-white" />
                        <div className="flex-1">
                          <h5 className="text-white font-medium text-sm mb-1">{insight.title}</h5>
                          <p className="text-slate-300 text-xs leading-relaxed">{insight.description}</p>
                          {insight.action && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-2 text-blue-400 hover:text-blue-300 p-0 h-auto"
                            >
                              {insight.action} →
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Quick Suggestions */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm">Hızlı Sorular</h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="bg-slate-700/50 hover:bg-slate-600 text-slate-300 border-slate-600 text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <div className="space-y-4">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            AI Danışman
          </h4>
          
          <div className="bg-slate-700/30 rounded-lg">
            <ScrollArea className="h-64 p-4">
              <div className="space-y-3">
                {chatHistory.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-600 text-slate-100'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.message}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {msg.timestamp.toLocaleTimeString('tr-TR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-slate-600 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                        <span className="text-sm text-slate-300">Düşünüyorum...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t border-slate-600">
              <div className="flex gap-2">
                <Input
                  placeholder="Sorunuzu yazın..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={chatMutation.isPending}
                  className="bg-slate-800 border-slate-600 text-slate-300 placeholder-slate-400 focus:border-blue-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || chatMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
