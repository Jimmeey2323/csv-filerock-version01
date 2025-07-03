import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MultiSelect } from '@/components/ui/multi-select';
import { Badge } from '@/components/ui/badge';
import { Filter, Users, Building2, Calendar, RefreshCw, Save, Settings } from 'lucide-react';
import { ProcessedTeacherData } from '@/utils/dataProcessor';

interface EnhancedFilterBarProps {
  data: ProcessedTeacherData[];
  onFilterChange: (filteredData: ProcessedTeacherData[]) => void;
  selectedFilters: {
    period: string[];
    teacher: string[];
    location: string[];
  };
  onFilterUpdate: (filters: {
    period: string[];
    teacher: string[];
    location: string[];
  }) => void;
}

const STORAGE_KEY = 'analytics-filter-preferences';

const EnhancedFilterBar: React.FC<EnhancedFilterBarProps> = ({ 
  data, 
  onFilterChange, 
  selectedFilters, 
  onFilterUpdate 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get unique values for filters with proper null checks
  const uniquePeriods = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return [...new Set(data
      .map(item => item && item.period ? item.period : null)
      .filter((period): period is string => period !== null && period.trim() !== '')
    )].sort();
  }, [data]);
  
  const uniqueTeachers = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return [...new Set(data
      .map(item => item && item.teacherName ? item.teacherName : null)
      .filter((teacher): teacher is string => teacher !== null && teacher.trim() !== '' && teacher !== 'All Teachers')
    )].sort();
  }, [data]);
  
  const uniqueLocations = React.useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return [...new Set(data
      .map(item => item && item.location ? item.location : null)
      .filter((location): location is string => location !== null && location.trim() !== '')
    )].sort();
  }, [data]);

  // Set default filters on component mount
  useEffect(() => {
    const savedFilters = localStorage.getItem(STORAGE_KEY);
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        onFilterUpdate(parsed);
      } catch (error) {
        console.error('Error loading saved filters:', error);
        setDefaultFilters();
      }
    } else {
      setDefaultFilters();
    }
  }, [uniqueTeachers, uniqueLocations, uniquePeriods]);

  const setDefaultFilters = () => {
    const defaultFilters = {
      teacher: uniqueTeachers, // All teachers except "All Teachers"
      location: uniqueLocations.includes('Kwality House') ? ['Kwality House'] : uniqueLocations.slice(0, 1),
      period: uniquePeriods.includes('Jun-25') ? ['Jun-25'] : uniquePeriods.slice(0, 1)
    };
    onFilterUpdate(defaultFilters);
  };

  // Apply filters with null checks
  React.useEffect(() => {
    if (!data || !Array.isArray(data)) {
      onFilterChange([]);
      return;
    }

    let filteredData = data.filter(item => item !== null && item !== undefined);

    if (selectedFilters.period.length > 0) {
      filteredData = filteredData.filter(item => 
        item && item.period && selectedFilters.period.includes(item.period)
      );
    }

    if (selectedFilters.teacher.length > 0) {
      filteredData = filteredData.filter(item => 
        item && item.teacherName && selectedFilters.teacher.includes(item.teacherName)
      );
    }

    if (selectedFilters.location.length > 0) {
      filteredData = filteredData.filter(item => 
        item && item.location && selectedFilters.location.includes(item.location)
      );
    }

    onFilterChange(filteredData);
  }, [data, selectedFilters, onFilterChange]);

  const handleFilterChange = (type: 'period' | 'teacher' | 'location', values: string[]) => {
    const newFilters = {
      ...selectedFilters,
      [type]: values
    };
    onFilterUpdate(newFilters);
  };

  const saveFilters = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedFilters));
    // Show success feedback
    const button = document.getElementById('save-filters-btn');
    if (button) {
      button.textContent = 'Saved!';
      setTimeout(() => {
        button.textContent = 'Save Filters';
      }, 2000);
    }
  };

  const clearAllFilters = () => {
    onFilterUpdate({
      period: [],
      teacher: [],
      location: []
    });
  };

  const resetToDefaults = () => {
    setDefaultFilters();
  };

  const hasActiveFilters = selectedFilters && (
    selectedFilters.period.length > 0 || 
    selectedFilters.teacher.length > 0 || 
    selectedFilters.location.length > 0
  );

  const totalActiveFilters = (selectedFilters.period?.length || 0) + 
                           (selectedFilters.teacher?.length || 0) + 
                           (selectedFilters.location?.length || 0);

  // Early return if no data
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Card className="mb-6 animate-fade-in bg-white/95 backdrop-blur-xl border border-white/20 shadow-luxury rounded-2xl">
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No data available for filtering.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 animate-fade-in bg-white/95 backdrop-blur-xl border border-white/20 shadow-luxury rounded-2xl overflow-hidden">
      <CardHeader 
        className="pb-4 bg-gradient-to-r from-slate-50/80 to-white/80 border-b border-white/20 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30">
              <Filter className="h-5 w-5 text-primary" />
            </div>
            <span className="bg-gradient-to-r from-slate-700 to-slate-800 bg-clip-text text-transparent font-bold">
              Advanced Filters
            </span>
            {hasActiveFilters && (
              <Badge variant="premium" className="animate-pulse">
                {totalActiveFilters} active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                saveFilters();
              }}
              id="save-filters-btn"
              className="bg-white/80 hover:bg-white border-white/40 hover:border-white/60"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Filters
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              <Settings className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Period Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Period</span>
                <Badge variant="outline" className="text-xs">
                  {selectedFilters.period?.length || 0} selected
                </Badge>
              </div>
              <MultiSelect
                options={uniquePeriods.map(period => ({ label: period, value: period }))}
                selected={selectedFilters.period || []}
                onChange={(values) => handleFilterChange('period', values)}
                placeholder="Select periods..."
                className="w-full"
              />
            </div>

            {/* Teacher Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Teachers</span>
                <Badge variant="outline" className="text-xs">
                  {selectedFilters.teacher?.length || 0} selected
                </Badge>
              </div>
              <MultiSelect
                options={uniqueTeachers.map(teacher => ({ label: teacher, value: teacher }))}
                selected={selectedFilters.teacher || []}
                onChange={(values) => handleFilterChange('teacher', values)}
                placeholder="Select teachers..."
                className="w-full"
              />
            </div>

            {/* Location Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Locations</span>
                <Badge variant="outline" className="text-xs">
                  {selectedFilters.location?.length || 0} selected
                </Badge>
              </div>
              <MultiSelect
                options={uniqueLocations.map(location => ({ label: location, value: location }))}
                selected={selectedFilters.location || []}
                onChange={(values) => handleFilterChange('location', values)}
                placeholder="Select locations..."
                className="w-full"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Showing {data.length} records</span>
              <span>•</span>
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefaults}
                className="bg-white/80 hover:bg-white border-white/40 hover:border-white/60"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
              
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="bg-white/80 hover:bg-white border-white/40 hover:border-white/60"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default EnhancedFilterBar;