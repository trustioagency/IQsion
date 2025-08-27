import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, 
  Send, 
  Zap, 
  User, 
  Loader2,
  Minimize2,
  Maximize2
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

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: 'Merhaba! Size nasıl yardımcı olabilirim? ROAS analizi, bütçe optimizasyonu veya müşteri segmentasyonu hakkında sorularınızı sorabilirsiniz.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
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
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = (message?: string) => {
    const messageText = message || inputMessage.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Clear input
    setInputMessage('');

    // Send to AI
    chatMutation.mutate({
      message: messageText,
      context: 'Marketing intelligence platform'
    });
  };

  const handleQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    handleSendMessage(action.prompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`bg-slate-800 border-slate-700 shadow-2xl transition-all duration-300 ${
        isMinimized ? 'w-80 h-16' : 'w-96 h-[500px]'
      }`}>
        
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold">AI Asistanınız</h4>
                {!isMinimized && (
                  <p className="text-xs opacity-90">Pazarlama konusunda size yardımcı olacağım</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-white/80 hover:text-white p-1"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[436px]">
            
            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                      {message.role === 'ai' ? (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-slate-300" />
                        </div>
                      )}
                    </div>
                    
                    <div className={`message-bubble p-3 rounded-2xl max-w-[75%] ${
                      message.role === 'user' 
                        ? 'user bg-blue-600 text-white rounded-tr-sm' 
                        : 'ai bg-slate-700 text-slate-300 rounded-tl-sm'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      <p className={`text-xs mt-2 opacity-70 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-slate-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString('tr-TR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {chatMutation.isPending && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-slate-700 rounded-2xl rounded-tl-sm p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                        <span className="text-sm text-slate-400">Düşünüyorum...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t border-slate-700">
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.slice(0, 3).map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickAction(action)}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600 text-xs"
                    disabled={chatMutation.isPending}
                  >
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-slate-700">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Sorunuzu yazın..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={chatMutation.isPending}
                  className="bg-slate-700 border-slate-600 text-slate-300 placeholder-slate-400 focus:border-blue-500"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || chatMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3"
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
        )}
      </Card>
    </div>
  );
}
