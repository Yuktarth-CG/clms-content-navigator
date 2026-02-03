import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data based on PRD
const MOCK_ORG_DATA = {
  name: 'Chhattisgarh State Education Board',
  totalCredits: 50000,
  usedCredits: 38500,
  availableCredits: 11500,
  lastUpdated: '2026-02-03T10:30:00',
  alertThresholds: { warning: 20, critical: 10, exhausted: 0 },
  accountManager: 'support@convegenius.ai'
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

const USAGE_HISTORY = [
  { date: '2026-02-03', feature: 'Evaluation', tier: 'Flash', count: 45, credits: 180 },
  { date: '2026-02-03', feature: 'Translation', tier: 'Pro', count: 12, credits: 72 },
  { date: '2026-02-02', feature: 'Hint Generation', tier: 'Flash', count: 200, credits: 100 },
  { date: '2026-02-02', feature: 'Stem Validation', tier: 'Pro', count: 8, credits: 120 },
  { date: '2026-02-01', feature: 'Rephrasing', tier: 'Flash', count: 150, credits: 75 },
  { date: '2026-02-01', feature: 'Video Qs', tier: 'Flash', count: 25, credits: 150 },
];

const WEEKLY_CONSUMPTION = [
  { week: 'Week 1', credits: 8500 },
  { week: 'Week 2', credits: 9200 },
  { week: 'Week 3', credits: 10800 },
  { week: 'Week 4', credits: 10000 },
];

const AICreditDashboard = () => {
  const { toast } = useToast();
  const [requestSent, setRequestSent] = useState(false);
  
  const creditPercentage = (MOCK_ORG_DATA.availableCredits / MOCK_ORG_DATA.totalCredits) * 100;
  const dollarValue = (MOCK_ORG_DATA.availableCredits / 1000).toFixed(2);
  
  const getAlertStatus = () => {
    if (creditPercentage <= 0) return { level: 'exhausted', color: 'destructive' };
    if (creditPercentage <= 10) return { level: 'critical', color: 'destructive' };
    if (creditPercentage <= 20) return { level: 'warning', color: 'default' };
    return { level: 'healthy', color: 'secondary' };
  };
  
  const alertStatus = getAlertStatus();

  const handleRequestCredits = () => {
    setRequestSent(true);
    toast({
      title: "Credit Request Sent",
      description: `Your request has been sent to ${MOCK_ORG_DATA.accountManager}. You'll receive a response within 24 hours.`,
    });
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
            <p className="text-sm text-muted-foreground">≈ ${dollarValue} USD</p>
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
                <div className="w-3 h-3 bg-red-500 rounded" /> 0% Exhausted
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded" /> 10% Critical
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded" /> 20% Warning
              </span>
            </div>
            <Button 
              onClick={handleRequestCredits} 
              disabled={requestSent}
              size="sm"
            >
              <Mail className="w-4 h-4 mr-2" />
              {requestSent ? 'Request Sent' : 'Request More Credits'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Details */}
      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Usage History</TabsTrigger>
          <TabsTrigger value="trends">Consumption Trends</TabsTrigger>
          <TabsTrigger value="catalog">Credit Catalog</TabsTrigger>
          <TabsTrigger value="alerts">Alert Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent AI Feature Usage</CardTitle>
              <CardDescription>Detailed breakdown of credit consumption</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Feature</TableHead>
                    <TableHead>Model Tier</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    <TableHead className="text-right">Credits Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {USAGE_HISTORY.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        {row.feature === 'Evaluation' && <FileText className="w-4 h-4" />}
                        {row.feature === 'Translation' && <Languages className="w-4 h-4" />}
                        {row.feature === 'Hint Generation' && <Lightbulb className="w-4 h-4" />}
                        {row.feature === 'Stem Validation' && <CheckCircle className="w-4 h-4" />}
                        {row.feature === 'Rephrasing' && <RefreshCw className="w-4 h-4" />}
                        {row.feature === 'Video Qs' && <FileText className="w-4 h-4" />}
                        {row.feature}
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.tier === 'Pro' ? 'default' : 'secondary'}>
                          {row.tier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{row.count}</TableCell>
                      <TableCell className="text-right font-medium">{row.credits}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Consumption Trends</CardTitle>
              <CardDescription>Credit usage over the past 4 weeks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {WEEKLY_CONSUMPTION.map((week, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="w-20 text-sm text-muted-foreground">{week.week}</span>
                    <div className="flex-1">
                      <Progress value={(week.credits / 12000) * 100} className="h-6" />
                    </div>
                    <span className="w-24 text-right font-medium">
                      {week.credits.toLocaleString()} credits
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm">
                  <strong>Trend Analysis:</strong> Your consumption has increased by 12% over the last 4 weeks. 
                  At the current rate, you'll exhaust credits in approximately 9 days.
                </p>
              </div>
            </CardContent>
          </Card>
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
                    <TableHead className="text-right">USD Value</TableHead>
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
                      <TableCell className="text-right text-muted-foreground">
                        ${(item.credits / 1000).toFixed(4)}
                      </TableCell>
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
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <span className="font-medium">Warning (20%)</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Email sent to Super Admin, Admin, and Account Manager
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full" />
                    <span className="font-medium">Critical (10%)</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Urgent email + dashboard banner notification
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
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
    </div>
  );
};

export default AICreditDashboard;
