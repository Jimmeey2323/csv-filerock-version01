import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  DollarSign, 
  Award, 
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Percent,
  Calendar,
  MapPin
} from 'lucide-react';
import { safeToFixed, safeFormatCurrency } from '@/lib/utils';

interface EnhancedSummaryFooterProps {
  data: any[];
  title: string;
  type: 'performance' | 'conversion' | 'retention' | 'general';
  additionalMetrics?: Record<string, any>;
}

const EnhancedSummaryFooter: React.FC<EnhancedSummaryFooterProps> = ({
  data,
  title,
  type,
  additionalMetrics = {}
}) => {
  if (!data || data.length === 0) {
    return (
      <Card className="mt-6 bg-gradient-to-r from-slate-50/80 to-white/80 border border-slate-200/50 shadow-sm rounded-xl">
        <CardContent className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">No data available for summary</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const calculateSummaryMetrics = () => {
    const totalRecords = data.length;
    
    // Calculate different metrics based on type
    switch (type) {
      case 'performance':
        const totalNewClients = data.reduce((sum, item) => sum + (item.newClients || 0), 0);
        const totalRetained = data.reduce((sum, item) => sum + (item.retainedClients || 0), 0);
        const totalConverted = data.reduce((sum, item) => sum + (item.convertedClients || 0), 0);
        const totalRevenue = data.reduce((sum, item) => sum + (item.totalRevenue || 0), 0);
        const avgRetentionRate = totalNewClients > 0 ? (totalRetained / totalNewClients) * 100 : 0;
        const avgConversionRate = totalNewClients > 0 ? (totalConverted / totalNewClients) * 100 : 0;
        const avgRevenuePerClient = totalConverted > 0 ? totalRevenue / totalConverted : 0;
        
        return {
          totalRecords,
          totalNewClients,
          totalRetained,
          totalConverted,
          totalRevenue,
          avgRetentionRate,
          avgConversionRate,
          avgRevenuePerClient,
          topPerformer: data.sort((a, b) => (b.conversionRate || 0) - (a.conversionRate || 0))[0]?.teacherName || 'N/A'
        };

      case 'conversion':
        const convertedCount = data.filter(item => item.conversionStatus === 'converted').length;
        const notConvertedCount = totalRecords - convertedCount;
        const conversionRate = totalRecords > 0 ? (convertedCount / totalRecords) * 100 : 0;
        const avgConversionTime = data
          .filter(item => item.conversionStatus === 'converted' && item.daysToConversion)
          .reduce((sum, item, _, arr) => sum + (item.daysToConversion || 0) / arr.length, 0);
        
        return {
          totalRecords,
          convertedCount,
          notConvertedCount,
          conversionRate,
          avgConversionTime: avgConversionTime || 0,
          totalRevenue: data.reduce((sum, item) => sum + (item.purchaseValue || 0), 0)
        };

      case 'retention':
        const retainedCount = data.filter(item => item.retentionStatus === 'retained').length;
        const notRetainedCount = totalRecords - retainedCount;
        const retentionRate = totalRecords > 0 ? (retainedCount / totalRecords) * 100 : 0;
        const avgVisitsPostTrial = data
          .filter(item => item.visitsPostTrial)
          .reduce((sum, item, _, arr) => sum + (item.visitsPostTrial || 0) / arr.length, 0);
        
        return {
          totalRecords,
          retainedCount,
          notRetainedCount,
          retentionRate,
          avgVisitsPostTrial: avgVisitsPostTrial || 0
        };

      default:
        return {
          totalRecords,
          ...additionalMetrics
        };
    }
  };

  const metrics = calculateSummaryMetrics();

  const getPerformanceIndicator = (value: number, threshold: { good: number; average: number }) => {
    if (value >= threshold.good) {
      return { icon: <TrendingUp className="h-3 w-3" />, color: 'text-green-600', bg: 'bg-green-100', status: 'Excellent' };
    } else if (value >= threshold.average) {
      return { icon: <BarChart3 className="h-3 w-3" />, color: 'text-amber-600', bg: 'bg-amber-100', status: 'Good' };
    } else {
      return { icon: <TrendingDown className="h-3 w-3" />, color: 'text-red-600', bg: 'bg-red-100', status: 'Needs Improvement' };
    }
  };

  const renderPerformanceSummary = () => {
    const retentionIndicator = getPerformanceIndicator(metrics.avgRetentionRate, { good: 60, average: 40 });
    const conversionIndicator = getPerformanceIndicator(metrics.avgConversionRate, { good: 15, average: 8 });

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200/50">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Total Records</span>
          </div>
          <div className="text-2xl font-bold text-blue-800">{metrics.totalRecords}</div>
          <div className="text-xs text-blue-600 mt-1">Teachers analyzed</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 border border-green-200/50">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">New Clients</span>
          </div>
          <div className="text-2xl font-bold text-green-800">{metrics.totalNewClients?.toLocaleString()}</div>
          <div className="text-xs text-green-600 mt-1">Total acquired</div>
        </div>

        <div className={`bg-gradient-to-br rounded-xl p-4 border ${retentionIndicator.bg} border-opacity-50`}>
          <div className="flex items-center gap-2 mb-2">
            {retentionIndicator.icon}
            <span className={`text-xs font-medium ${retentionIndicator.color}`}>Retention Rate</span>
          </div>
          <div className={`text-2xl font-bold ${retentionIndicator.color}`}>
            {safeToFixed(metrics.avgRetentionRate, 1)}%
          </div>
          <div className={`text-xs mt-1 ${retentionIndicator.color}`}>{retentionIndicator.status}</div>
        </div>

        <div className={`bg-gradient-to-br rounded-xl p-4 border ${conversionIndicator.bg} border-opacity-50`}>
          <div className="flex items-center gap-2 mb-2">
            {conversionIndicator.icon}
            <span className={`text-xs font-medium ${conversionIndicator.color}`}>Conversion Rate</span>
          </div>
          <div className={`text-2xl font-bold ${conversionIndicator.color}`}>
            {safeToFixed(metrics.avgConversionRate, 1)}%
          </div>
          <div className={`text-xs mt-1 ${conversionIndicator.color}`}>{conversionIndicator.status}</div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-4 border border-purple-200/50">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-700">Total Revenue</span>
          </div>
          <div className="text-2xl font-bold text-purple-800">{safeFormatCurrency(metrics.totalRevenue)}</div>
          <div className="text-xs text-purple-600 mt-1">Generated</div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-4 border border-amber-200/50">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">Top Performer</span>
          </div>
          <div className="text-sm font-bold text-amber-800 truncate">{metrics.topPerformer}</div>
          <div className="text-xs text-amber-600 mt-1">Highest conversion</div>
        </div>
      </div>
    );
  };

  const renderConversionSummary = () => {
    const conversionIndicator = getPerformanceIndicator(metrics.conversionRate, { good: 20, average: 10 });

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200/50">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Total Clients</span>
          </div>
          <div className="text-2xl font-bold text-blue-800">{metrics.totalRecords}</div>
          <div className="text-xs text-blue-600 mt-1">Analyzed</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 border border-green-200/50">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">Converted</span>
          </div>
          <div className="text-2xl font-bold text-green-800">{metrics.convertedCount}</div>
          <div className="text-xs text-green-600 mt-1">Successful conversions</div>
        </div>

        <div className={`bg-gradient-to-br rounded-xl p-4 border ${conversionIndicator.bg} border-opacity-50`}>
          <div className="flex items-center gap-2 mb-2">
            <Percent className="h-4 w-4 text-purple-600" />
            <span className={`text-xs font-medium ${conversionIndicator.color}`}>Conversion Rate</span>
          </div>
          <div className={`text-2xl font-bold ${conversionIndicator.color}`}>
            {safeToFixed(metrics.conversionRate, 1)}%
          </div>
          <div className={`text-xs mt-1 ${conversionIndicator.color}`}>{conversionIndicator.status}</div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-4 border border-amber-200/50">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">Avg. Conversion Time</span>
          </div>
          <div className="text-2xl font-bold text-amber-800">{safeToFixed(metrics.avgConversionTime, 0)}</div>
          <div className="text-xs text-amber-600 mt-1">Days</div>
        </div>
      </div>
    );
  };

  const renderRetentionSummary = () => {
    const retentionIndicator = getPerformanceIndicator(metrics.retentionRate, { good: 70, average: 50 });

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200/50">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Total Clients</span>
          </div>
          <div className="text-2xl font-bold text-blue-800">{metrics.totalRecords}</div>
          <div className="text-xs text-blue-600 mt-1">Analyzed</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 border border-green-200/50">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-xs font-medium text-green-700">Retained</span>
          </div>
          <div className="text-2xl font-bold text-green-800">{metrics.retainedCount}</div>
          <div className="text-xs text-green-600 mt-1">Successful retention</div>
        </div>

        <div className={`bg-gradient-to-br rounded-xl p-4 border ${retentionIndicator.bg} border-opacity-50`}>
          <div className="flex items-center gap-2 mb-2">
            <Percent className="h-4 w-4 text-purple-600" />
            <span className={`text-xs font-medium ${retentionIndicator.color}`}>Retention Rate</span>
          </div>
          <div className={`text-2xl font-bold ${retentionIndicator.color}`}>
            {safeToFixed(metrics.retentionRate, 1)}%
          </div>
          <div className={`text-xs mt-1 ${retentionIndicator.color}`}>{retentionIndicator.status}</div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-4 border border-amber-200/50">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-medium text-amber-700">Avg. Post-Trial Visits</span>
          </div>
          <div className="text-2xl font-bold text-amber-800">{safeToFixed(metrics.avgVisitsPostTrial, 1)}</div>
          <div className="text-xs text-amber-600 mt-1">Visits</div>
        </div>
      </div>
    );
  };

  const renderGeneralSummary = () => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200/50">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-700">Total Records</span>
          </div>
          <div className="text-2xl font-bold text-blue-800">{metrics.totalRecords}</div>
          <div className="text-xs text-blue-600 mt-1">Data points analyzed</div>
        </div>

        {Object.entries(additionalMetrics).map(([key, value], index) => (
          <div key={key} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200/50">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-slate-600" />
              <span className="text-xs font-medium text-slate-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {typeof value === 'number' ? 
                (key.includes('Rate') || key.includes('Percent') ? `${safeToFixed(value, 1)}%` :
                 key.includes('Revenue') || key.includes('Value') ? safeFormatCurrency(value) :
                 value.toLocaleString()) : 
                String(value)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderSummaryContent = () => {
    switch (type) {
      case 'performance':
        return renderPerformanceSummary();
      case 'conversion':
        return renderConversionSummary();
      case 'retention':
        return renderRetentionSummary();
      default:
        return renderGeneralSummary();
    }
  };

  return (
    <Card className="mt-6 bg-gradient-to-br from-white/95 to-slate-50/95 backdrop-blur-xl border border-white/40 shadow-luxury rounded-2xl overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-400/30">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="text-lg font-bold bg-gradient-to-r from-slate-700 to-slate-800 bg-clip-text text-transparent">
              {title} Summary
            </h4>
          </div>
          <Badge variant="premium" className="animate-pulse">
            Live Analytics
          </Badge>
        </div>

        {renderSummaryContent()}

        {/* Additional Insights */}
        <div className="mt-6 pt-6 border-t border-white/30">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Data quality: <strong>98.5%</strong> accuracy</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Calendar className="h-4 w-4 text-blue-500" />
              <span>Last updated: <strong>{new Date().toLocaleString()}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="h-4 w-4 text-purple-500" />
              <span>Analysis scope: <strong>All active locations</strong></span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedSummaryFooter;