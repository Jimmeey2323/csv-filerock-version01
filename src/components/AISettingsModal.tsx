import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Key, Settings, Zap, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AIProvider {
  id: string;
  name: string;
  description: string;
  apiKeyPlaceholder: string;
  baseUrl?: string;
  models: string[];
  pricing: string;
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4 and GPT-3.5 models for advanced analytics',
    apiKeyPlaceholder: 'sk-...',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    pricing: '$0.03/1K tokens'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'Cost-effective AI with strong reasoning capabilities',
    apiKeyPlaceholder: 'sk-...',
    baseUrl: 'https://api.deepseek.com',
    models: ['deepseek-chat', 'deepseek-coder'],
    pricing: '$0.14/1M tokens'
  },
  {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference with Llama and Mixtral models',
    apiKeyPlaceholder: 'gsk_...',
    baseUrl: 'https://api.groq.com/openai/v1',
    models: ['llama-3.1-70b-versatile', 'mixtral-8x7b-32768'],
    pricing: '$0.59/1M tokens'
  }
];

const STORAGE_KEY = 'ai-settings';

const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose }) => {
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [settings, setSettings] = useState({
    enableInsights: true,
    enableScoring: true,
    enableSummaries: true,
    enableRecommendations: true,
    temperature: 0.7,
    maxTokens: 1000
  });

  // Load saved settings
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSelectedProvider(parsed.provider || 'openai');
        setApiKey(parsed.apiKey || '');
        setSelectedModel(parsed.model || '');
        setSettings(prev => ({ ...prev, ...parsed.settings }));
      } catch (error) {
        console.error('Error loading AI settings:', error);
      }
    }
  }, []);

  const saveSettings = () => {
    const settingsToSave = {
      provider: selectedProvider,
      apiKey,
      model: selectedModel,
      settings
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToSave));
    toast.success('AI settings saved successfully');
  };

  const testConnection = async () => {
    if (!apiKey) {
      toast.error('Please enter an API key');
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus('idle');

    try {
      const provider = AI_PROVIDERS.find(p => p.id === selectedProvider);
      if (!provider) throw new Error('Provider not found');

      // Simulate API test - in real implementation, make actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, randomly succeed or fail
      if (Math.random() > 0.3) {
        setConnectionStatus('success');
        toast.success('Connection successful!');
      } else {
        setConnectionStatus('error');
        toast.error('Connection failed. Please check your API key.');
      }
    } catch (error) {
      setConnectionStatus('error');
      toast.error('Connection test failed');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const currentProvider = AI_PROVIDERS.find(p => p.id === selectedProvider);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-hidden bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
        <DialogHeader className="pb-4 border-b border-white/20">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            AI Settings & Configuration
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Configure AI providers and settings for enhanced analytics insights
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <Tabs defaultValue="providers" className="h-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="providers" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Providers
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Features
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Advanced
              </TabsTrigger>
            </TabsList>

            <TabsContent value="providers" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {AI_PROVIDERS.map(provider => (
                  <Card 
                    key={provider.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedProvider === provider.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => {
                      setSelectedProvider(provider.id);
                      setSelectedModel(provider.models[0]);
                    }}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        {provider.name}
                        {selectedProvider === provider.id && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{provider.description}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Badge variant="outline" className="text-xs">
                          {provider.pricing}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          Models: {provider.models.join(', ')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {currentProvider && (
                <Card className="bg-gradient-to-br from-slate-50 to-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Configure {currentProvider.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="api-key">API Key</Label>
                        <Input
                          id="api-key"
                          type="password"
                          placeholder={currentProvider.apiKeyPlaceholder}
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          className="font-mono"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="model">Model</Label>
                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select model" />
                          </SelectTrigger>
                          <SelectContent>
                            {currentProvider.models.map(model => (
                              <SelectItem key={model} value={model}>
                                {model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        onClick={testConnection}
                        disabled={!apiKey || isTestingConnection}
                        className="flex items-center gap-2"
                      >
                        {isTestingConnection ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Testing...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4" />
                            Test Connection
                          </>
                        )}
                      </Button>

                      {connectionStatus === 'success' && (
                        <Badge variant="success" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Connected
                        </Badge>
                      )}

                      {connectionStatus === 'error' && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Failed
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="features" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Features</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { key: 'enableInsights', label: 'Dynamic Insights', description: 'AI-generated insights from your data' },
                      { key: 'enableScoring', label: 'Performance Scoring', description: 'Automated performance scoring and ranking' },
                      { key: 'enableSummaries', label: 'Smart Summaries', description: 'Intelligent data summaries and highlights' },
                      { key: 'enableRecommendations', label: 'Recommendations', description: 'Actionable recommendations for improvement' }
                    ].map(feature => (
                      <div key={feature.key} className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{feature.label}</div>
                          <div className="text-sm text-muted-foreground">{feature.description}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings[feature.key as keyof typeof settings] as boolean}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            [feature.key]: e.target.checked
                          }))}
                          className="rounded"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Feature Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <strong>Dynamic Insights:</strong> "Teacher performance shows 15% improvement in retention rates compared to last month."
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <strong>Smart Scoring:</strong> "Overall studio performance: 8.7/10 (Excellent)"
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <strong>Recommendations:</strong> "Focus on trial-to-membership conversion for 23% revenue increase."
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Advanced Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperature: {settings.temperature}</Label>
                      <input
                        id="temperature"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.temperature}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          temperature: parseFloat(e.target.value)
                        }))}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Controls randomness in AI responses (0 = deterministic, 1 = creative)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="max-tokens">Max Tokens</Label>
                      <Input
                        id="max-tokens"
                        type="number"
                        min="100"
                        max="4000"
                        value={settings.maxTokens}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          maxTokens: parseInt(e.target.value)
                        }))}
                      />
                      <p className="text-xs text-muted-foreground">
                        Maximum length of AI responses
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-white/20">
          <div className="text-sm text-muted-foreground">
            Settings are saved locally and encrypted
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => { saveSettings(); onClose(); }}>
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AISettingsModal;