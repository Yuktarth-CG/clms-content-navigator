import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  TrendingUp, 
  Bell, 
  AlertTriangle, 
  Mail, 
  RefreshCw,
  Zap,
  FileText,
  Languages,
  Lightbulb,
  CheckCircle,
  Video,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, Legend } from 'recharts';

// Mock data based on PRD
const MOCK_ORG_DATA = {
  name: 'Chhattisgarh State Education Board',
  totalCredits: 50000,
  usedCredits: 38500,
  availableCredits: 11500,
  lastUpdated: '2026-02-03T10:30:00',
  alertThresholds: { warning: 20, critical: 10, exhausted: 0 },
  accountManager: 'support@convegenius.ai',
  inceptionDate: '2025-04-01'
};

const CREDIT_CATALOG = [
  { feature: 'Evaluation (Track A/B)', tier: 'Flash', credits: 4, margin: '28%' },
  { feature: 'Evaluation (Track A/B)', tier: 'Pro', credits: 18, margin: '26%' },
  { feature: 'Translation (Text)', tier: 'Flash', credits: 1.5, margin: '33%' },
  { feature: 'Translation (Text)', tier: 'Pro', credits: 6, margin: '33%' },
  { feature: 'Translation (Image)', tier: 'Pro-Prev', credits: 220, margin: '24%' },
  { feature: 'Hint Generation', tier: 'Flash', credits: 0.5, margin: '34%' },
  { feature: 'Hint Generation', tier: 'Pro', credits: 2.5, margin: '33%' },
  { feature: 'Rephrasing', tier: 'Flash', credits: 0.5, margin: '42%' },
  { feature: 'Rephrasing', tier: 'Pro', credits: 2, margin: '33%' },
  { feature: 'Stem Validation', tier: 'Flash', credits: 5, margin: '33%' },
  { feature: 'Stem Validation', tier: 'Pro', credits: 15, margin: '33%' },
  { feature: 'Video Qs (Set of 3)', tier: 'Flash', credits: 6, margin: '35%' },
  { feature: 'Video Qs (Set of 3)', tier: 'Pro', credits: 28, margin: '28%' },
];

// Feature categories for consumption tracking
const FEATURE_CATEGORIES = [
  { id: 'evaluation', name: 'Evaluation', icon: FileText, color: 'hsl(var(--chart-1))' },
  { id: 'translation', name: 'Translation', icon: Languages, color: 'hsl(var(--chart-2))' },
  { id: 'hint', name: 'Hint Generation', icon: Lightbulb, color: 'hsl(var(--chart-3))' },
  { id: 'stemValidation', name: 'Stem Validation', icon: CheckCircle, color: 'hsl(var(--chart-4))' },
  { id: 'rephrasing', name: 'Rephrasing', icon: RefreshCw, color: 'hsl(var(--chart-5))' },
  { id: 'videoQs', name: 'Video Qs', icon: Video, color: 'hsl(220 70% 50%)' },
];

// Monthly consumption data
const MONTHLY_CONSUMPTION = [
  { month: 'Apr 2025', evaluation: 1200, translation: 800, hint: 400, stemValidation: 600, rephrasing: 300, videoQs: 200 },
  { month: 'May 2025', evaluation: 1500, translation: 900, hint: 500, stemValidation: 700, rephrasing: 400, videoQs: 300 },
  { month: 'Jun 2025', evaluation: 1800, translation: 1100, hint: 600, stemValidation: 800, rephrasing: 450, videoQs: 350 },
  { month: 'Jul 2025', evaluation: 2000, translation: 1200, hint: 700, stemValidation: 900, rephrasing: 500, videoQs: 400 },
  { month: 'Aug 2025', evaluation: 2200, translation: 1400, hint: 750, stemValidation: 1000, rephrasing: 550, videoQs: 450 },
  { month: 'Sep 2025', evaluation: 2500, translation: 1600, hint: 800, stemValidation: 1100, rephrasing: 600, videoQs: 500 },
  { month: 'Oct 2025', evaluation: 2800, translation: 1800, hint: 900, stemValidation: 1200, rephrasing: 650, videoQs: 550 },
  { month: 'Nov 2025', evaluation: 3000, translation: 2000, hint: 950, stemValidation: 1300, rephrasing: 700, videoQs: 600 },
  { month: 'Dec 2025', evaluation: 3200, translation: 2200, hint: 1000, stemValidation: 1400, rephrasing: 750, videoQs: 650 },
  { month: 'Jan 2026', evaluation: 3500, translation: 2400, hint: 1100, stemValidation: 1500, rephrasing: 800, videoQs: 700 },
  { month: 'Feb 2026', evaluation: 2800, translation: 1900, hint: 850, stemValidation: 1200, rephrasing: 600, videoQs: 550 },
];

// Quarterly consumption data
const QUARTERLY_CONSUMPTION = [
  { quarter: 'Q2 2025', evaluation: 4500, translation: 2800, hint: 1500, stemValidation: 2100, rephrasing: 1150, videoQs: 850 },
  { quarter: 'Q3 2025', evaluation: 7500, translation: 4800, hint: 2450, stemValidation: 3200, rephrasing: 1700, videoQs: 1450 },
  { quarter: 'Q4 2025', evaluation: 9000, translation: 6000, hint: 2850, stemValidation: 3900, rephrasing: 2100, videoQs: 1800 },
  { quarter: 'Q1 2026', evaluation: 6300, translation: 4300, hint: 1950, stemValidation: 2700, rephrasing: 1400, videoQs: 1250 },
];

// Since inception data (aggregated by feature)
const INCEPTION_CONSUMPTION = [
  { feature: 'Evaluation', credits: 27300 },
  { feature: 'Translation', credits: 17900 },
  { feature: 'Hint Generation', credits: 8750 },
  { feature: 'Stem Validation', credits: 11900 },
  { feature: 'Rephrasing', credits: 6350 },
  { feature: 'Video Qs', credits: 5350 },
];

// Recent usage history with more details
const USAGE_HISTORY = [
  { date: '2026-02-03', feature: 'Evaluation', tier: 'Flash', count: 45, credits: 180 },
  { date: '2026-02-03', feature: 'Translation', tier: 'Pro', count: 12, credits: 72 },
  { date: '2026-02-03', feature: 'Hint Generation', tier: 'Flash', count: 200, credits: 100 },
  { date: '2026-02-02', feature: 'Stem Validation', tier: 'Pro', count: 8, credits: 120 },
  { date: '2026-02-02', feature: 'Rephrasing', tier: 'Flash', count: 150, credits: 75 },
  { date: '2026-02-02', feature: 'Video Qs', tier: 'Flash', count: 25, credits: 150 },
  { date: '2026-02-01', feature: 'Evaluation', tier: 'Pro', count: 30, credits: 540 },
  { date: '2026-02-01', feature: 'Translation', tier: 'Flash', count: 80, credits: 120 },
  { date: '2026-01-31', feature: 'Hint Generation', tier: 'Pro', count: 45, credits: 112.5 },
  { date: '2026-01-31', feature: 'Stem Validation', tier: 'Flash', count: 60, credits: 300 },
];

const chartConfig = {
  evaluation: { label: 'Evaluation', color: 'hsl(var(--chart-1))' },
  translation: { label: 'Translation', color: 'hsl(var(--chart-2))' },
  hint: { label: 'Hint Generation', color: 'hsl(var(--chart-3))' },
  stemValidation: { label: 'Stem Validation', color: 'hsl(var(--chart-4))' },
  rephrasing: { label: 'Rephrasing', color: 'hsl(var(--chart-5))' },
  videoQs: { label: 'Video Qs', color: 'hsl(220 70% 50%)' },
};

const AICreditDashboard = () => {
  const { toast } = useToast();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [consumptionPeriod, setConsumptionPeriod] = useState<'monthly' | 'quarterly' | 'inception'>('monthly');
  const [selectedFeature, setSelectedFeature] = useState<string>('all');
  const [requestForm, setRequestForm] = useState({
    contactName: '',
    contactEmail: '',
    creditsRequested: '',
    urgency: 'normal',
    reason: '',
    additionalNotes: ''
  });
  
  const creditPercentage = (MOCK_ORG_DATA.availableCredits / MOCK_ORG_DATA.totalCredits) * 100;
  
  const getAlertStatus = () => {
    if (creditPercentage <= 0) return { level: 'exhausted', color: 'destructive' };
    if (creditPercentage <= 10) return { level: 'critical', color: 'destructive' };
    if (creditPercentage <= 20) return { level: 'warning', color: 'default' };
    return { level: 'healthy', color: 'secondary' };
  };
  
  const alertStatus = getAlertStatus();

  const handleSubmitRequest = () => {
    setRequestSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setRequestSubmitting(false);
      setShowRequestForm(false);
      toast({
        title: "Credit Request Submitted",
        description: `Your request for ${requestForm.creditsRequested} credits has been sent to ConveGenius. You'll receive a response within 24 hours.`,
      });
      setRequestForm({
        contactName: '',
        contactEmail: '',
        creditsRequested: '',
        urgency: 'normal',
        reason: '',
        additionalNotes: ''
      });
    }, 1500);
  };

  const getFeatureIcon = (feature: string) => {
    switch (feature) {
      case 'Evaluation': return <FileText className="w-4 h-4" />;
      case 'Translation': return <Languages className="w-4 h-4" />;
      case 'Hint Generation': return <Lightbulb className="w-4 h-4" />;
      case 'Stem Validation': return <CheckCircle className="w-4 h-4" />;
      case 'Rephrasing': return <RefreshCw className="w-4 h-4" />;
      case 'Video Qs': return <Video className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getChartData = () => {
    if (consumptionPeriod === 'monthly') return MONTHLY_CONSUMPTION;
    if (consumptionPeriod === 'quarterly') return QUARTERLY_CONSUMPTION;
    return INCEPTION_CONSUMPTION;
  };

  const getFilteredChartData = () => {
    const data = getChartData();
    if (selectedFeature === 'all' || consumptionPeriod === 'inception') return data;
    
    // For monthly/quarterly, filter to show only selected feature
    return data.map(item => ({
      ...item,
      [selectedFeature]: item[selectedFeature as keyof typeof item]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Credit Dashboard</h1>
          <p className="text-muted-foreground">{MOCK_ORG_DATA.name}</p>
        </div>
        <Badge variant="outline" className="text-xs">
          Price Lock: FY 2026 • 1,000 Credits = $1.00 USD
        </Badge>
      </div>

      {/* Alert Banner */}
      {alertStatus.level !== 'healthy' && (
        <Alert variant={alertStatus.color as 'default' | 'destructive'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {alertStatus.level === 'exhausted' ? 'Credits Exhausted' : 
             alertStatus.level === 'critical' ? 'Critical: Low Credits' : 'Warning: Credits Running Low'}
          </AlertTitle>
          <AlertDescription>
            {alertStatus.level === 'exhausted' 
              ? 'AI features are disabled. Request more credits to continue using AI features.'
              : `Your credit balance is at ${creditPercentage.toFixed(1)}%. Consider requesting more credits soon.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Credit Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Available Credits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {MOCK_ORG_DATA.availableCredits.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              of {MOCK_ORG_DATA.totalCredits.toLocaleString()} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Zap className="w-4 h-4" /> Used This Month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {MOCK_ORG_DATA.usedCredits.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">
              {((MOCK_ORG_DATA.usedCredits / MOCK_ORG_DATA.totalCredits) * 100).toFixed(1)}% of allocation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Avg. Daily Usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,283</div>
            <p className="text-sm text-muted-foreground">credits/day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Bell className="w-4 h-4" /> Days Until Exhausted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">~9</div>
            <p className="text-sm text-muted-foreground">at current rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Credit Balance Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Credit Balance</CardTitle>
          <CardDescription>
            {MOCK_ORG_DATA.availableCredits.toLocaleString()} of {MOCK_ORG_DATA.totalCredits.toLocaleString()} credits remaining
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={creditPercentage} className="h-4" />
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-destructive rounded" /> 0% Exhausted
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--chart-4))' }} /> 10% Critical
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: 'hsl(var(--chart-3))' }} /> 20% Warning
              </span>
            </div>
            <Button 
              onClick={() => setShowRequestForm(true)} 
              size="sm"
            >
              <Mail className="w-4 h-4 mr-2" />
              Request More Credits
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Details */}
      <Tabs defaultValue="consumption" className="space-y-4">
        <TabsList>
          <TabsTrigger value="consumption">Usage & Consumption</TabsTrigger>
          <TabsTrigger value="catalog">Credit Catalog</TabsTrigger>
          <TabsTrigger value="alerts">Alert Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="consumption">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Consumption Trends Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Consumption Trends</CardTitle>
                    <CardDescription>Credit usage by feature category</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={consumptionPeriod} onValueChange={(v) => setConsumptionPeriod(v as typeof consumptionPeriod)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="inception">Since Inception</SelectItem>
                      </SelectContent>
                    </Select>
                    {consumptionPeriod !== 'inception' && (
                      <Select value={selectedFeature} onValueChange={setSelectedFeature}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue placeholder="All Features" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Features</SelectItem>
                          <SelectItem value="evaluation">Evaluation</SelectItem>
                          <SelectItem value="translation">Translation</SelectItem>
                          <SelectItem value="hint">Hint Generation</SelectItem>
                          <SelectItem value="stemValidation">Stem Validation</SelectItem>
                          <SelectItem value="rephrasing">Rephrasing</SelectItem>
                          <SelectItem value="videoQs">Video Qs</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {consumptionPeriod === 'inception' ? (
                  <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <BarChart data={INCEPTION_CONSUMPTION} layout="vertical">
                      <XAxis type="number" />
                      <YAxis dataKey="feature" type="category" width={120} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="credits" fill="hsl(var(--primary))" radius={4} />
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <LineChart data={getFilteredChartData()}>
                      <XAxis 
                        dataKey={consumptionPeriod === 'monthly' ? 'month' : 'quarter'} 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      {(selectedFeature === 'all' ? ['evaluation', 'translation', 'hint', 'stemValidation', 'rephrasing', 'videoQs'] : [selectedFeature]).map((key) => (
                        <Line
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={chartConfig[key as keyof typeof chartConfig]?.color || 'hsl(var(--primary))'}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      ))}
                    </LineChart>
                  </ChartContainer>
                )}
                
                {/* Feature summary cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
                  {FEATURE_CATEGORIES.map((cat) => {
                    const totalCredits = consumptionPeriod === 'inception' 
                      ? INCEPTION_CONSUMPTION.find(i => i.feature === cat.name)?.credits || 0
                      : (consumptionPeriod === 'monthly' ? MONTHLY_CONSUMPTION : QUARTERLY_CONSUMPTION)
                          .reduce((sum, item) => sum + ((item as Record<string, unknown>)[cat.id] as number || 0), 0);
                    const Icon = cat.icon;
                    return (
                      <div 
                        key={cat.id} 
                        className="p-3 border rounded-lg flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => consumptionPeriod !== 'inception' && setSelectedFeature(cat.id)}
                      >
                        <div className="p-2 rounded-lg" style={{ backgroundColor: `${cat.color}20` }}>
                          <Icon className="w-4 h-4" style={{ color: cat.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{cat.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {totalCredits.toLocaleString()} credits
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Recent Usage History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Usage</CardTitle>
                <CardDescription>Last 10 transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[450px] overflow-y-auto">
                  {USAGE_HISTORY.map((row, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getFeatureIcon(row.feature)}
                        <div>
                          <p className="text-sm font-medium">{row.feature}</p>
                          <p className="text-xs text-muted-foreground">{row.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={row.tier === 'Pro' ? 'default' : 'secondary'} className="mb-1">
                          {row.tier}
                        </Badge>
                        <p className="text-sm font-medium">{row.credits} credits</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="catalog">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Master Credit Catalog</CardTitle>
              <CardDescription>Credit costs per AI feature (FY 2026 Price Lock)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Model Tier</TableHead>
                    <TableHead className="text-right">Credits/Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {CREDIT_CATALOG.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.feature}</TableCell>
                      <TableCell>
                        <Badge variant={item.tier === 'Pro' || item.tier === 'Pro-Prev' ? 'default' : 'secondary'}>
                          {item.tier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{item.credits}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alert Configuration</CardTitle>
              <CardDescription>Automated notifications for credit thresholds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-3))' }} />
                    <span className="font-medium">Warning (20%)</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Email sent to Super Admin, Admin, and Account Manager
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-4))' }} />
                    <span className="font-medium">Critical (10%)</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Urgent email + dashboard banner notification
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-destructive rounded-full" />
                    <span className="font-medium">Exhausted (0%)</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    AI features disabled, modal shown to end-users
                  </p>
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Account Manager:</strong> {MOCK_ORG_DATA.accountManager}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  All alert emails are automatically CC'd to your ConveGenius account manager.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Request Credits Dialog */}
      <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request More Credits</DialogTitle>
            <DialogDescription>
              Fill out this form to request additional AI credits. Our team will respond within 24 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Name *</Label>
                <Input
                  id="contactName"
                  value={requestForm.contactName}
                  onChange={(e) => setRequestForm({ ...requestForm, contactName: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={requestForm.contactEmail}
                  onChange={(e) => setRequestForm({ ...requestForm, contactEmail: e.target.value })}
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="creditsRequested">Credits Requested *</Label>
                <Input
                  id="creditsRequested"
                  type="number"
                  value={requestForm.creditsRequested}
                  onChange={(e) => setRequestForm({ ...requestForm, creditsRequested: e.target.value })}
                  placeholder="e.g., 50000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="urgency">Urgency</Label>
                <Select 
                  value={requestForm.urgency} 
                  onValueChange={(v) => setRequestForm({ ...requestForm, urgency: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Within a week</SelectItem>
                    <SelectItem value="normal">Normal - Within 2-3 days</SelectItem>
                    <SelectItem value="high">High - Within 24 hours</SelectItem>
                    <SelectItem value="critical">Critical - Immediate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Request *</Label>
              <Select 
                value={requestForm.reason} 
                onValueChange={(v) => setRequestForm({ ...requestForm, reason: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exhausted">Current credits exhausted</SelectItem>
                  <SelectItem value="upcoming_project">Upcoming project/campaign</SelectItem>
                  <SelectItem value="increased_usage">Increased usage needs</SelectItem>
                  <SelectItem value="new_features">Want to use new AI features</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Additional Notes</Label>
              <Textarea
                id="additionalNotes"
                value={requestForm.additionalNotes}
                onChange={(e) => setRequestForm({ ...requestForm, additionalNotes: e.target.value })}
                placeholder="Any additional information about your credit needs..."
                rows={3}
              />
            </div>
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="text-muted-foreground">
                <strong>Current Balance:</strong> {MOCK_ORG_DATA.availableCredits.toLocaleString()} credits<br />
                <strong>Request will be sent to:</strong> {MOCK_ORG_DATA.accountManager}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestForm(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitRequest}
              disabled={requestSubmitting || !requestForm.contactName || !requestForm.contactEmail || !requestForm.creditsRequested || !requestForm.reason}
            >
              {requestSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AICreditDashboard;
