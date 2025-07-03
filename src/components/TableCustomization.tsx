import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Palette, Layout, Type, Save, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface TableCustomizationProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: TableSettings) => void;
}

export interface TableSettings {
  columnWidths: Record<string, number>;
  rowHeight: number;
  fontSize: number;
  fontWeight: string;
  textAlign: Record<string, string>;
  headerStyle: {
    backgroundColor: string;
    textColor: string;
    fontSize: number;
    fontWeight: string;
  };
  rowStyle: {
    evenRowColor: string;
    oddRowColor: string;
    hoverColor: string;
    borderColor: string;
  };
  cellPadding: number;
  borderWidth: number;
}

const DEFAULT_SETTINGS: TableSettings = {
  columnWidths: {},
  rowHeight: 48,
  fontSize: 14,
  fontWeight: 'normal',
  textAlign: {},
  headerStyle: {
    backgroundColor: '#1e293b',
    textColor: '#ffffff',
    fontSize: 14,
    fontWeight: 'semibold'
  },
  rowStyle: {
    evenRowColor: '#ffffff',
    oddRowColor: '#f8fafc',
    hoverColor: '#f1f5f9',
    borderColor: '#e2e8f0'
  },
  cellPadding: 16,
  borderWidth: 1
};

const STORAGE_KEY = 'table-customization-settings';

const TableCustomization: React.FC<TableCustomizationProps> = ({
  isOpen,
  onClose,
  onSettingsChange
}) => {
  const [settings, setSettings] = useState<TableSettings>(DEFAULT_SETTINGS);
  const [selectedColumn, setSelectedColumn] = useState<string>('');

  // Common table columns
  const tableColumns = [
    'teacherName',
    'location', 
    'period',
    'newClients',
    'retainedClients',
    'retentionRate',
    'convertedClients',
    'conversionRate',
    'totalRevenue',
    'averageRevenuePerClient'
  ];

  // Load saved settings
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Error loading table settings:', error);
      }
    }
  }, []);

  // Apply settings when they change
  useEffect(() => {
    onSettingsChange(settings);
  }, [settings, onSettingsChange]);

  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    toast.success('Table settings saved successfully');
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
    toast.success('Settings reset to defaults');
  };

  const updateColumnWidth = (column: string, width: number) => {
    setSettings(prev => ({
      ...prev,
      columnWidths: {
        ...prev.columnWidths,
        [column]: width
      }
    }));
  };

  const updateTextAlign = (column: string, align: string) => {
    setSettings(prev => ({
      ...prev,
      textAlign: {
        ...prev.textAlign,
        [column]: align
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-hidden bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
        <DialogHeader className="pb-4 border-b border-white/20">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-400/30">
              <Settings className="h-6 w-6 text-blue-600" />
            </div>
            Table Customization
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          <Tabs defaultValue="layout" className="h-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="layout" className="flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="columns" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                Columns
              </TabsTrigger>
              <TabsTrigger value="styling" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Styling
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="layout" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Table Dimensions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="row-height">Row Height (px)</Label>
                      <Input
                        id="row-height"
                        type="number"
                        min="32"
                        max="100"
                        value={settings.rowHeight}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          rowHeight: parseInt(e.target.value) || 48
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cell-padding">Cell Padding (px)</Label>
                      <Input
                        id="cell-padding"
                        type="number"
                        min="4"
                        max="32"
                        value={settings.cellPadding}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          cellPadding: parseInt(e.target.value) || 16
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="border-width">Border Width (px)</Label>
                      <Input
                        id="border-width"
                        type="number"
                        min="0"
                        max="5"
                        value={settings.borderWidth}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          borderWidth: parseInt(e.target.value) || 1
                        }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Typography</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="font-size">Font Size (px)</Label>
                      <Input
                        id="font-size"
                        type="number"
                        min="10"
                        max="20"
                        value={settings.fontSize}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          fontSize: parseInt(e.target.value) || 14
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="font-weight">Font Weight</Label>
                      <Select 
                        value={settings.fontWeight} 
                        onValueChange={(value) => setSettings(prev => ({
                          ...prev,
                          fontWeight: value
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="semibold">Semibold</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="columns" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Column Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="column-select">Select Column</Label>
                      <Select value={selectedColumn} onValueChange={setSelectedColumn}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a column to customize" />
                        </SelectTrigger>
                        <SelectContent>
                          {tableColumns.map(column => (
                            <SelectItem key={column} value={column}>
                              {column.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedColumn && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                        <div className="space-y-2">
                          <Label htmlFor="column-width">Width (px)</Label>
                          <Input
                            id="column-width"
                            type="number"
                            min="80"
                            max="400"
                            value={settings.columnWidths[selectedColumn] || 150}
                            onChange={(e) => updateColumnWidth(selectedColumn, parseInt(e.target.value) || 150)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="text-align">Text Alignment</Label>
                          <Select 
                            value={settings.textAlign[selectedColumn] || 'left'} 
                            onValueChange={(value) => updateTextAlign(selectedColumn, value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="left">Left</SelectItem>
                              <SelectItem value="center">Center</SelectItem>
                              <SelectItem value="right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="styling" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Header Styling</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="header-bg">Background Color</Label>
                      <Input
                        id="header-bg"
                        type="color"
                        value={settings.headerStyle.backgroundColor}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          headerStyle: {
                            ...prev.headerStyle,
                            backgroundColor: e.target.value
                          }
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="header-text">Text Color</Label>
                      <Input
                        id="header-text"
                        type="color"
                        value={settings.headerStyle.textColor}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          headerStyle: {
                            ...prev.headerStyle,
                            textColor: e.target.value
                          }
                        }))}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Row Styling</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="even-row">Even Row Color</Label>
                      <Input
                        id="even-row"
                        type="color"
                        value={settings.rowStyle.evenRowColor}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          rowStyle: {
                            ...prev.rowStyle,
                            evenRowColor: e.target.value
                          }
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="odd-row">Odd Row Color</Label>
                      <Input
                        id="odd-row"
                        type="color"
                        value={settings.rowStyle.oddRowColor}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          rowStyle: {
                            ...prev.rowStyle,
                            oddRowColor: e.target.value
                          }
                        }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hover-color">Hover Color</Label>
                      <Input
                        id="hover-color"
                        type="color"
                        value={settings.rowStyle.hoverColor}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          rowStyle: {
                            ...prev.rowStyle,
                            hoverColor: e.target.value
                          }
                        }))}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Table Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full" style={{ fontSize: `${settings.fontSize}px` }}>
                      <thead>
                        <tr 
                          style={{ 
                            backgroundColor: settings.headerStyle.backgroundColor,
                            color: settings.headerStyle.textColor,
                            fontSize: `${settings.headerStyle.fontSize}px`,
                            fontWeight: settings.headerStyle.fontWeight
                          }}
                        >
                          <th style={{ padding: `${settings.cellPadding}px`, height: `${settings.rowHeight}px` }}>Teacher</th>
                          <th style={{ padding: `${settings.cellPadding}px`, height: `${settings.rowHeight}px` }}>Location</th>
                          <th style={{ padding: `${settings.cellPadding}px`, height: `${settings.rowHeight}px` }}>New Clients</th>
                          <th style={{ padding: `${settings.cellPadding}px`, height: `${settings.rowHeight}px` }}>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { teacher: 'John Doe', location: 'Studio A', clients: 25, revenue: '$2,500' },
                          { teacher: 'Jane Smith', location: 'Studio B', clients: 18, revenue: '$1,800' }
                        ].map((row, index) => (
                          <tr 
                            key={index}
                            style={{ 
                              backgroundColor: index % 2 === 0 ? settings.rowStyle.evenRowColor : settings.rowStyle.oddRowColor,
                              fontWeight: settings.fontWeight,
                              borderBottom: `${settings.borderWidth}px solid ${settings.rowStyle.borderColor}`
                            }}
                          >
                            <td style={{ padding: `${settings.cellPadding}px`, height: `${settings.rowHeight}px` }}>{row.teacher}</td>
                            <td style={{ padding: `${settings.cellPadding}px`, height: `${settings.rowHeight}px` }}>{row.location}</td>
                            <td style={{ padding: `${settings.cellPadding}px`, height: `${settings.rowHeight}px`, textAlign: 'center' }}>{row.clients}</td>
                            <td style={{ padding: `${settings.cellPadding}px`, height: `${settings.rowHeight}px`, textAlign: 'right' }}>{row.revenue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-white/20">
          <Button variant="outline" onClick={resetToDefaults} className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={() => { saveSettings(); onClose(); }} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Save & Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TableCustomization;