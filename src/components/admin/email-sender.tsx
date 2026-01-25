"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getLeads } from '@/lib/data-supabase';
import type { Lead } from '@/lib/types';
import { Mail, Send, Eye, Filter, CheckCircle2, XCircle, Clock } from 'lucide-react';

const DEFAULT_TEMPLATE = {
  subject: "Invite for Collaboration | {company} | BITS Hyderabad Consulting Group",
  body: `<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333">
    <p>Dear {name},</p>

    <p>Greetings from the BITS Hyderabad Consulting Group (BHCG)</p>

    <p>
        We are a student-led consulting organization from BITS Pilani,
        Hyderabad Campus, passionate about solving real-world business
        challenges through structured problem-solving, fresh perspectives,
        and data-backed insights.
    </p>

    <p>
        Over the years, our club has successfully executed live projects and
        consulting collaborations with startups, corporates, and NGOs across
        diverse sectors. Our core competencies include:
    </p>

    <ul>
        <li>Market research, sizing and competitor analysis</li>
        <li>Go-to-market and growth strategies</li>
        <li>Financial modeling and Valuation</li>
        <li>Product Management and Marketing</li>
        <li>Data analytics and dashboarding</li>
        <li>Web development and UI/UX Design</li>
    </ul>

    <p>
        Our alumni have gone on to work at reputed firms such as
        <b>PwC, Deloitte, EY, KPMG, JPMC, Nomura, Amazon, Jio, Navi</b>
        amongst other MNCs, bringing the same analytical rigour and drive
        that we practice at BHCG.
    </p>

    <p>
        We are reaching out to explore a potential
        <b>collaboration or live project</b> with your organization. We are
        also open to <b>internship opportunities</b> or any form of
        engagement that enables our members to
        <b>contribute to real business problems while learning in the process.</b>
    </p>

    <p>
        We've attached our brochure for more details on past engagements and
        offerings. If this interests you, we would love to schedule a brief
        call to explore the next steps.
    </p>

    <p>Looking forward to the opportunity to work and grow together.</p>

    <p>
        <a href="https://drive.google.com/file/d/1MdHjyei0b5e52hps_Y18TuAcTRjK1_sv/view?usp=sharing"
           style="color: #0066cc">Link to our Brochure</a>
    </p>

    <p>
        Kind Regards,<br />
        BITS Hyderabad Consulting Group<br />
        BITS Pilani, Hyderabad Campus
    </p>

    <p>
        <a href="https://www.linkedin.com/company/bits-hyderabad-consulting-group/"
           style="color: #0066cc; text-decoration: none; margin-right: 8px;">LinkedIn</a>
        |
        <a href="https://www.instagram.com/bhcg.bitshyd/"
           style="color: #0066cc; text-decoration: none; margin: 0 8px">Instagram</a>
        |
        <a href="https://www.bhcg.netlify.app/"
           style="color: #0066cc; text-decoration: none; margin-left: 8px">Website</a>
    </p>
</body>
</html>`
};

export default function AdminEmailSender() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<'all' | 'not_mailed' | 'mailed' | 'failed'>('not_mailed');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [emailTemplate, setEmailTemplate] = useState(DEFAULT_TEMPLATE);
  const [smtpConfig, setSmtpConfig] = useState({
    smtpServer: 'smtp.gmail.com',
    smtpPort: 587,
    email: 'bhcg@hyderabad.bits-pilani.ac.in',
    password: '',
    displayName: 'BITS Hyderabad Consulting Group'
  });
  const [isSending, setIsSending] = useState(false);
  const [previewLead, setPreviewLead] = useState<Lead | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    const allLeads = await getLeads();
    setLeads(allLeads);
    if (allLeads.length > 0) {
      setPreviewLead(allLeads[0]);
    }
  };

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = filterStatus === 'all' || (lead.status || 'not_mailed') === filterStatus;
    const matchesIndustry = filterIndustry === 'all' || lead.industry === filterIndustry;
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.latestCompany.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesIndustry && matchesSearch;
  });

  // Get unique industries for filter
  const uniqueIndustries = Array.from(new Set(leads.map(lead => lead.industry))).sort();

  const toggleLead = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  const selectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(l => l.id)));
    }
  };

  const getPreviewHtml = () => {
    if (!previewLead) return { subject: '', body: '' };
    
    const subject = emailTemplate.subject
      .replace(/\{name\}/g, previewLead.name)
      .replace(/\{company\}/g, previewLead.latestCompany)
      .replace(/\{roleType\}/g, previewLead.roleType)
      .replace(/\{industry\}/g, previewLead.industry);

    const body = emailTemplate.body
      .replace(/\{name\}/g, previewLead.name)
      .replace(/\{company\}/g, previewLead.latestCompany)
      .replace(/\{roleType\}/g, previewLead.roleType)
      .replace(/\{industry\}/g, previewLead.industry);

    return { subject, body };
  };

  const handleSendEmails = async () => {
    if (selectedLeads.size === 0) {
      toast({
        variant: "destructive",
        title: "No leads selected",
        description: "Please select at least one lead to send emails to.",
      });
      return;
    }

    if (!smtpConfig.password) {
      toast({
        variant: "destructive",
        title: "SMTP password required",
        description: "Please enter your email password or app password.",
      });
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to send emails to ${selectedLeads.size} recipients?`
    );

    if (!confirmed) return;

    setIsSending(true);

    try {
      const response = await fetch('/api/send-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadIds: Array.from(selectedLeads),
          emailTemplate,
          smtpConfig,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Emails sent successfully!",
          description: `${result.results.successful.length} sent, ${result.results.failed.length} failed`,
        });
        
        // Refresh leads and clear selection
        await fetchLeads();
        setSelectedLeads(new Set());
      } else {
        throw new Error(result.error || 'Failed to send emails');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to send emails",
        description: error.message,
      });
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status: string = 'not_mailed') => {
    switch (status) {
      case 'mailed':
        return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" />Mailed</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Failed</Badge>;
      default:
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Not Mailed</Badge>;
    }
  };

  const statusCounts = {
    total: leads.length,
    mailed: leads.filter(l => l.status === 'mailed').length,
    not_mailed: leads.filter(l => !l.status || l.status === 'not_mailed').length,
    failed: leads.filter(l => l.status === 'failed').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Leads</CardDescription>
            <CardTitle className="text-3xl">{statusCounts.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mailed</CardDescription>
            <CardTitle className="text-3xl text-green-600">{statusCounts.mailed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Not Mailed</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{statusCounts.not_mailed}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-3xl text-red-600">{statusCounts.failed}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send"><Mail className="h-4 w-4 mr-2" />Send Emails</TabsTrigger>
          <TabsTrigger value="template"><Eye className="h-4 w-4 mr-2" />Template</TabsTrigger>
          <TabsTrigger value="smtp"><Filter className="h-4 w-4 mr-2" />SMTP Config</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Select Recipients</CardTitle>
                  <CardDescription>Choose leads to send emails to</CardDescription>
                </div>
                <Button 
                  onClick={handleSendEmails} 
                  disabled={isSending || selectedLeads.size === 0}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSending ? 'Sending...' : `Send to ${selectedLeads.size} leads`}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search by name, email, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="not_mailed">Not Mailed</SelectItem>
                    <SelectItem value="mailed">Mailed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterIndustry} onValueChange={(v: string) => setFilterIndustry(v)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {uniqueIndustries.map(industry => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox 
                  checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                  onCheckedChange={selectAll}
                />
                <Label>Select All ({filteredLeads.length} leads)</Label>
              </div>

              <div className="border rounded-md max-h-[400px] overflow-y-auto">
                {filteredLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center gap-4 p-3 hover:bg-accent border-b last:border-b-0">
                    <Checkbox
                      checked={selectedLeads.has(lead.id)}
                      onCheckedChange={() => toggleLead(lead.id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-muted-foreground">{lead.email} • {lead.latestCompany}</div>
                    </div>
                    {getStatusBadge(lead.status)}
                  </div>
                ))}
                {filteredLeads.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No leads found matching your filters
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="template" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Template</CardTitle>
              <CardDescription>
                Use variables: {'{name}'}, {'{company}'}, {'{roleType}'}, {'{industry}'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={emailTemplate.subject}
                  onChange={(e) => setEmailTemplate({...emailTemplate, subject: e.target.value})}
                  placeholder="Email subject..."
                />
              </div>
              <div>
                <Label htmlFor="body">Email Body (HTML)</Label>
                <Textarea
                  id="body"
                  value={emailTemplate.body}
                  onChange={(e) => setEmailTemplate({...emailTemplate, body: e.target.value})}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
              <Button variant="outline" onClick={() => setEmailTemplate(DEFAULT_TEMPLATE)}>
                Reset to Default Template
              </Button>
            </CardContent>
          </Card>

          {previewLead && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Preview for: {previewLead.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label>Subject:</Label>
                    <div className="p-2 bg-muted rounded">{getPreviewHtml().subject}</div>
                  </div>
                  <div>
                    <Label>Body:</Label>
                    <div 
                      className="p-4 bg-muted rounded border"
                      dangerouslySetInnerHTML={{ __html: getPreviewHtml().body }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="smtp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
              <CardDescription>Configure your email server settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpServer">SMTP Server</Label>
                  <Input
                    id="smtpServer"
                    value={smtpConfig.smtpServer}
                    onChange={(e) => setSmtpConfig({...smtpConfig, smtpServer: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={smtpConfig.smtpPort}
                    onChange={(e) => setSmtpConfig({...smtpConfig, smtpPort: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={smtpConfig.displayName}
                  onChange={(e) => setSmtpConfig({...smtpConfig, displayName: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={smtpConfig.email}
                  onChange={(e) => setSmtpConfig({...smtpConfig, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="password">App Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={smtpConfig.password}
                  onChange={(e) => setSmtpConfig({...smtpConfig, password: e.target.value})}
                  placeholder="Enter your email app password"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  For Gmail: Use an App Password from Google Account Security settings
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
