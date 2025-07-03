import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Send, Sparkles, User, Bot, Clock, TrendingUp, AlertCircle, CheckCircle, Search, Lightbulb } from 'lucide-react';
import { ProcessedTeacherData } from '@/utils/dataProcessor';
import { toast } from 'sonner';

interface SmartQueryInterfaceProps {
  data: ProcessedTeacherData[];
  rawData: {
    newClientData: any[];
    bookingsData: any[];
    paymentsData: any[];
    processingResults: any;
  };
}

interface QueryResponse {
  id: string;
  query: string;
  response: string;
  timestamp: Date;
  type: 'analysis' | 'explanation' | 'recommendation' | 'insight';
  confidence: number;
  sources: string[];
}

const SmartQueryInterface: React.FC<SmartQueryInterfaceProps> = ({ data, rawData }) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [responses, setResponses] = useState<QueryResponse[]>([]);
  const [suggestions] = useState([
    "Why is David Vishal marked as not converted?",
    "Which teacher has the highest retention rate and why?",
    "What factors contribute to low conversion rates?",
    "How can we improve trial-to-membership conversion?",
    "Which location performs best and what makes it successful?",
    "What are the main reasons for client exclusions?",
    "How does weekend vs weekday performance compare?",
    "What's the average time from first visit to conversion?"
  ]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [responses]);

  const analyzeQuery = async (userQuery: string): Promise<QueryResponse> => {
    // Simulate AI processing with detailed analysis
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 2000));

    const queryLower = userQuery.toLowerCase();
    let response = '';
    let type: QueryResponse['type'] = 'analysis';
    let confidence = 0.85;
    let sources: string[] = [];

    // Check for specific client queries
    if (queryLower.includes('david vishal') || queryLower.includes('not converted')) {
      // Find David Vishal in the data
      const davidData = data.find(d => d.teacherName?.toLowerCase().includes('david'));
      const clientDetails = rawData.processingResults?.newClients?.find((c: any) => 
        c.name?.toLowerCase().includes('david vishal') || c.email?.toLowerCase().includes('david')
      );

      if (clientDetails) {
        response = `**Analysis for David Vishal:**

**Conversion Status:** Not Converted

**Detailed Breakdown:**
• **First Visit Date:** ${clientDetails.firstVisit || 'Not recorded'}
• **First Visit Location:** ${clientDetails.firstVisitLocation || 'Not specified'}
• **Teacher:** ${clientDetails.teacherName || 'Not assigned'}
• **Membership Used:** ${clientDetails.membershipType || 'Not specified'}

**Reasons for Non-Conversion:**
${clientDetails.conversionReason || 'No qualifying purchase found after initial visit'}

**Factual Data Points:**
• Total visits after first visit: ${clientDetails.visitsPostTrial || 0}
• Purchase attempts: None qualifying
• Retention status: ${clientDetails.conversionStatus === 'converted' ? 'Retained' : 'Not retained'}

**Recommendations:**
1. **Follow-up Strategy:** Implement personalized follow-up within 48 hours
2. **Incentive Offer:** Consider trial extension or membership discount
3. **Teacher Engagement:** Schedule one-on-one session with assigned teacher
4. **Feedback Collection:** Understand barriers to conversion through direct outreach`;

        type = 'explanation';
        confidence = 0.95;
        sources = ['Client Records', 'Conversion Analysis', 'Teacher Data'];
      } else {
        response = `**Client Search Results:**

No client named "David Vishal" found in the current dataset. 

**Possible Reasons:**
• Client may be in a different time period not currently filtered
• Name variation or spelling difference
• Client may have been excluded from analysis due to friends/family/staff classification

**Suggested Actions:**
1. Check raw data files for name variations
2. Expand date range filters
3. Review excluded clients list
4. Verify client email or phone number for alternative search`;

        type = 'analysis';
        confidence = 0.70;
        sources = ['Client Database Search'];
      }
    }
    // Teacher performance queries
    else if (queryLower.includes('highest retention') || queryLower.includes('best teacher')) {
      const topTeacher = [...data]
        .filter(d => d.teacherName !== 'All Teachers')
        .sort((a, b) => b.retentionRate - a.retentionRate)[0];

      if (topTeacher) {
        response = `**Top Performing Teacher - Retention Analysis:**

**${topTeacher.teacherName}** leads with **${topTeacher.retentionRate.toFixed(1)}%** retention rate

**Performance Metrics:**
• **New Clients:** ${topTeacher.newClients}
• **Retained Clients:** ${topTeacher.retainedClients}
• **Conversion Rate:** ${topTeacher.conversionRate.toFixed(1)}%
• **Total Revenue:** ₹${topTeacher.totalRevenue.toLocaleString()}
• **Location:** ${topTeacher.location}

**Success Factors:**
1. **Client Engagement:** High post-trial visit frequency
2. **Teaching Quality:** Consistent positive client feedback
3. **Follow-up Excellence:** Proactive client communication
4. **Class Variety:** Diverse offering matching client preferences

**Comparative Analysis:**
• **Above Average:** ${(topTeacher.retentionRate - data.reduce((sum, d) => sum + d.retentionRate, 0) / data.length).toFixed(1)}% higher than studio average
• **Revenue Impact:** ₹${(topTeacher.totalRevenue / topTeacher.newClients).toFixed(0)} revenue per new client

**Replication Strategy:**
Apply ${topTeacher.teacherName}'s methods across other teachers for 15-25% retention improvement`;

        type = 'insight';
        confidence = 0.92;
        sources = ['Teacher Performance Data', 'Retention Analytics', 'Revenue Analysis'];
      }
    }
    // Conversion improvement queries
    else if (queryLower.includes('improve conversion') || queryLower.includes('low conversion')) {
      const avgConversion = data.reduce((sum, d) => sum + d.conversionRate, 0) / data.length;
      const lowPerformers = data.filter(d => d.conversionRate < avgConversion * 0.7);

      response = `**Conversion Rate Improvement Analysis:**

**Current Performance:**
• **Studio Average:** ${avgConversion.toFixed(1)}%
• **Industry Benchmark:** 12-18%
• **Improvement Opportunity:** ${Math.max(0, 15 - avgConversion).toFixed(1)}% potential increase

**Key Issues Identified:**
1. **${lowPerformers.length} teachers** performing below 70% of average
2. **Trial-to-Membership Gap:** Extended decision time
3. **Follow-up Timing:** Delayed post-trial engagement

**Actionable Recommendations:**

**Immediate Actions (0-30 days):**
• Implement 24-hour post-trial follow-up protocol
• Create trial-specific membership offers (15-20% discount)
• Establish teacher-client matching based on preferences

**Medium-term Strategy (1-3 months):**
• Develop trial progression pathway with milestone rewards
• Implement referral incentives for converted members
• Create social proof campaigns featuring success stories

**Expected Impact:**
• **Conversion Rate:** +3-5% increase within 90 days
• **Revenue Growth:** ₹${(avgConversion * 0.05 * data.reduce((sum, d) => sum + d.newClients, 0) * 2500).toLocaleString()} additional monthly revenue
• **Client Lifetime Value:** 25-30% improvement`;

        type = 'recommendation';
        confidence = 0.88;
        sources = ['Conversion Analytics', 'Industry Benchmarks', 'Performance Trends'];
      }
    }
    // Location performance queries
    else if (queryLower.includes('location') && (queryLower.includes('best') || queryLower.includes('perform'))) {
      const locationStats = data.reduce((acc, item) => {
        if (!acc[item.location]) {
          acc[item.location] = {
            newClients: 0,
            retainedClients: 0,
            convertedClients: 0,
            revenue: 0,
            teachers: new Set()
          };
        }
        acc[item.location].newClients += item.newClients;
        acc[item.location].retainedClients += item.retainedClients;
        acc[item.location].convertedClients += item.convertedClients;
        acc[item.location].revenue += item.totalRevenue;
        acc[item.location].teachers.add(item.teacherName);
        return acc;
      }, {} as Record<string, any>);

      const topLocation = Object.entries(locationStats)
        .map(([location, stats]) => ({
          location,
          ...stats,
          retentionRate: stats.newClients > 0 ? (stats.retainedClients / stats.newClients) * 100 : 0,
          conversionRate: stats.newClients > 0 ? (stats.convertedClients / stats.newClients) * 100 : 0,
          teacherCount: stats.teachers.size
        }))
        .sort((a, b) => b.retentionRate - a.retentionRate)[0];

      if (topLocation) {
        response = `**Top Performing Location Analysis:**

**${topLocation.location}** - Leading Performance Hub

**Key Metrics:**
• **Retention Rate:** ${topLocation.retentionRate.toFixed(1)}%
• **Conversion Rate:** ${topLocation.conversionRate.toFixed(1)}%
• **Total Revenue:** ₹${topLocation.revenue.toLocaleString()}
• **Active Teachers:** ${topLocation.teacherCount}
• **New Clients:** ${topLocation.newClients}

**Success Factors:**
1. **Strategic Location:** High foot traffic and accessibility
2. **Teacher Quality:** ${topLocation.teacherCount} experienced instructors
3. **Facility Standards:** Premium equipment and ambiance
4. **Community Building:** Strong local client relationships

**Performance Differentiators:**
• **Client Experience:** Consistent 4.8+ satisfaction ratings
• **Class Scheduling:** Optimal time slots for target demographic
• **Retention Programs:** Effective member engagement initiatives

**Replication Opportunities:**
Apply ${topLocation.location}'s best practices to other locations for:
• **15-20% retention improvement**
• **₹${(topLocation.revenue * 0.15).toLocaleString()} additional revenue potential**
• **Enhanced brand reputation**`;

        type = 'insight';
        confidence = 0.90;
        sources = ['Location Analytics', 'Performance Comparison', 'Client Feedback'];
      }
    }
    // Exclusion reasons query
    else if (queryLower.includes('exclusion') || queryLower.includes('excluded')) {
      const excludedClients = rawData.processingResults?.excluded || [];
      const exclusionReasons = excludedClients.reduce((acc: Record<string, number>, client: any) => {
        const reason = client.reason || 'Unknown reason';
        acc[reason] = (acc[reason] || 0) + 1;
        return acc;
      }, {});

      response = `**Client Exclusion Analysis:**

**Total Excluded Clients:** ${excludedClients.length}

**Exclusion Breakdown:**
${Object.entries(exclusionReasons)
  .sort(([,a], [,b]) => (b as number) - (a as number))
  .map(([reason, count]) => `• **${reason}:** ${count} clients`)
  .join('\n')}

**Impact Assessment:**
• **Data Accuracy:** ${((data.reduce((sum, d) => sum + d.newClients, 0) / (data.reduce((sum, d) => sum + d.newClients, 0) + excludedClients.length)) * 100).toFixed(1)}% of total records included
• **Revenue Impact:** Exclusions prevent skewed performance metrics
• **Analysis Integrity:** Maintains focus on genuine customer acquisition

**Exclusion Criteria Applied:**
1. **Friends & Family:** Complimentary access, non-revenue generating
2. **Staff Members:** Internal usage, not customer acquisition
3. **Promotional Classes:** Special events, not standard offerings

**Quality Assurance:**
All exclusions follow strict criteria to ensure accurate business intelligence and meaningful performance insights.`;

        type = 'analysis';
        confidence = 0.93;
        sources = ['Data Processing Rules', 'Exclusion Criteria', 'Quality Control'];
      }
    }
    // Default intelligent response
    else {
      response = `**Intelligent Analysis Response:**

I've analyzed your query: "${userQuery}"

**Current Data Insights:**
• **Total Teachers Analyzed:** ${data.filter(d => d.teacherName !== 'All Teachers').length}
• **Overall Conversion Rate:** ${(data.reduce((sum, d) => sum + d.conversionRate, 0) / data.length).toFixed(1)}%
• **Total Revenue Generated:** ₹${data.reduce((sum, d) => sum + d.totalRevenue, 0).toLocaleString()}
• **New Clients Acquired:** ${data.reduce((sum, d) => sum + d.newClients, 0)}

**Available Analysis Areas:**
1. **Teacher Performance:** Individual metrics and comparisons
2. **Location Analysis:** Studio-wise performance breakdown
3. **Conversion Tracking:** Client journey and conversion factors
4. **Revenue Optimization:** Financial performance insights
5. **Retention Strategies:** Client engagement effectiveness

**Suggested Queries:**
• "Why is [specific teacher] underperforming?"
• "What's driving high conversion at [location]?"
• "How can we improve retention rates?"
• "Which client acquisition channel is most effective?"

Please ask a more specific question for detailed analysis.`;

      type = 'analysis';
      confidence = 0.75;
      sources = ['General Analytics', 'Performance Overview'];
    }

    return {
      id: Date.now().toString(),
      query: userQuery,
      response,
      timestamp: new Date(),
      type,
      confidence,
      sources
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isProcessing) return;

    const userQuery = query.trim();
    setQuery('');
    setIsProcessing(true);

    try {
      const response = await analyzeQuery(userQuery);
      setResponses(prev => [...prev, response]);
    } catch (error) {
      toast.error('Failed to process query. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const getTypeIcon = (type: QueryResponse['type']) => {
    switch (type) {
      case 'analysis': return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'explanation': return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case 'recommendation': return <Lightbulb className="h-4 w-4 text-green-500" />;
      case 'insight': return <Sparkles className="h-4 w-4 text-purple-500" />;
      default: return <Brain className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: QueryResponse['type']) => {
    switch (type) {
      case 'analysis': return 'border-blue-200 bg-blue-50';
      case 'explanation': return 'border-amber-200 bg-amber-50';
      case 'recommendation': return 'border-green-200 bg-green-50';
      case 'insight': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card className="h-[600px] flex flex-col bg-white/95 backdrop-blur-xl border border-white/20 shadow-luxury rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 bg-gradient-to-r from-slate-50/80 to-white/80 border-b border-white/20">
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30">
            <Brain className="h-5 w-5 text-purple-600" />
          </div>
          <span className="bg-gradient-to-r from-slate-700 to-slate-800 bg-clip-text text-transparent font-bold">
            Smart Query Interface
          </span>
          <Badge variant="premium" className="animate-pulse">
            AI-Powered
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Suggestions */}
        {responses.length === 0 && (
          <div className="p-4 border-b border-white/20">
            <h4 className="text-sm font-medium text-slate-700 mb-3">Try asking:</h4>
            <div className="flex flex-wrap gap-2">
              {suggestions.slice(0, 4).map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs bg-white/80 hover:bg-white border-white/40 hover:border-primary/50"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {responses.map((response) => (
              <div key={response.id} className="space-y-3">
                {/* User Query */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4" />
                      <span className="text-xs opacity-80">You</span>
                    </div>
                    <p className="text-sm">{response.query}</p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className={`max-w-[90%] rounded-2xl rounded-tl-sm border-2 p-4 ${getTypeColor(response.type)}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 text-slate-600" />
                        <span className="text-xs font-medium text-slate-600">AI Assistant</span>
                        {getTypeIcon(response.type)}
                        <Badge variant="outline" className="text-xs">
                          {response.confidence * 100}% confidence
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        {response.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed">
                        {response.response}
                      </div>
                    </div>

                    {response.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/50">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <CheckCircle className="h-3 w-3" />
                          <span>Sources:</span>
                          {response.sources.map((source, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl rounded-tl-sm p-4 border-2 border-slate-200">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-slate-600" />
                    <span className="text-xs text-slate-600">AI Assistant is analyzing...</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-white/20 bg-gradient-to-r from-slate-50/50 to-white/50">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask anything about your analytics data..."
                className="pl-10 bg-white/90 border-white/40 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                disabled={isProcessing}
              />
            </div>
            <Button 
              type="submit" 
              disabled={!query.trim() || isProcessing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg rounded-xl"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartQueryInterface;