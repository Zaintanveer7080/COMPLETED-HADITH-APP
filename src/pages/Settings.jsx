import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Settings as SettingsIcon, User, Shield, Palette, Languages, Save, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/DataContext';
import { exportData } from '@/lib/export';

const Settings = () => {
  const { toast } = useToast();
  const { user, updateUserMetadata, updateUserPassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { entries } = useData();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [language, setLanguage] = useState('en');

  const [exportType, setExportType] = useState('all');
  const [exportFormat, setExportFormat] = useState('excel');
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || '');
      setEmail(user.email || '');
    }
    const savedCollections = JSON.parse(localStorage.getItem('collections') || '[]');
    setCollections(savedCollections);
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    await updateUserMetadata({ name });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: 'Error', description: 'New passwords do not match.', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters long.', variant: 'destructive' });
      return;
    }
    await updateUserPassword(newPassword);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleExport = () => {
    toast({ title: 'Exporting Data', description: 'Your file is being generated...' });
    exportData(exportFormat, exportType, { entries, collections });
  };

  if (!user) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Settings - Hadith & Quran CMS</title>
        <meta name="description" content="Configure system settings, user preferences, and security options for the Islamic CMS." />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure your system preferences and account settings.</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
            <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2" />Security</TabsTrigger>
            <TabsTrigger value="appearance"><Palette className="w-4 h-4 mr-2" />Appearance</TabsTrigger>
            <TabsTrigger value="language"><Languages className="w-4 h-4 mr-2" />Language</TabsTrigger>
            <TabsTrigger value="export"><Download className="w-4 h-4 mr-2" />Export</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Manage your public profile and account information.</CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} disabled />
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button type="submit"><Save className="w-4 h-4 mr-2" />Save Changes</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Change your password and manage account security.</CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordChange}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button type="submit"><Save className="w-4 h-4 mr-2" />Update Password</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of the application.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <div className="flex items-center space-x-4">
                    <Button variant={theme === 'light' ? 'default' : 'outline'} onClick={() => theme === 'dark' && toggleTheme()}>Light</Button>
                    <Button variant={theme === 'dark' ? 'default' : 'outline'} onClick={() => theme === 'light' && toggleTheme()}>Dark</Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Select your preferred color scheme.</p>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button onClick={() => toast({ title: 'Theme settings saved!', variant: 'success' })}><Save className="w-4 h-4 mr-2" />Save Theme</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="language" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Language & Region</CardTitle>
                <CardDescription>Set your preferred language for the interface.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-[280px]">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar" disabled>العربية (Coming Soon)</SelectItem>
                      <SelectItem value="ur" disabled>اردو (Coming Soon)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">This will change the language of the user interface.</p>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button onClick={() => toast({ title: 'Language settings saved!', variant: 'success' })}><Save className="w-4 h-4 mr-2" />Save Language</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
                <CardDescription>Download your content in various formats.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Content to Export</Label>
                  <Select value={exportType} onValueChange={setExportType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Content</SelectItem>
                      <SelectItem value="hadith">Hadith Only</SelectItem>
                      <SelectItem value="ayat">Ayat Only</SelectItem>
                      <SelectItem value="collections">Collections</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <div className="flex gap-2">
                    <Button variant={exportFormat === 'excel' ? 'default' : 'outline'} className="flex-1" onClick={() => setExportFormat('excel')}>
                      <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel (.xlsx)
                    </Button>
                    <Button variant={exportFormat === 'pdf' ? 'default' : 'outline'} className="flex-1" onClick={() => setExportFormat('pdf')}>
                      <FileText className="w-4 h-4 mr-2" /> PDF (.pdf)
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button onClick={handleExport}><Download className="w-4 h-4 mr-2" />Export Data</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Settings;