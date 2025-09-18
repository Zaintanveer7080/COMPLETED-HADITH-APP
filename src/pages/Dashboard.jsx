import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { BookOpen, Scroll, TrendingUp, Calendar, Plus, Eye, Edit, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AddModal from '@/components/AddModal';
import { useData } from '@/contexts/DataContext';
import { formatDistanceToNow } from 'date-fns';

const Dashboard = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const { entries, refreshData } = useData();
  const navigate = useNavigate();

  useEffect(() => {
    refreshData();
  }, []);

  const stats = useMemo(() => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const todayEntries = entries.filter(e => new Date(e.created_at).toDateString() === today.toDateString());
    const yesterdayEntries = entries.filter(e => new Date(e.created_at).toDateString() === yesterday.toDateString());

    const todayHadithCount = todayEntries.filter(e => e.type === 'hadith').length;
    const yesterdayHadithCount = yesterdayEntries.filter(e => e.type === 'hadith').length;
    
    const hadithChange = yesterdayHadithCount > 0 
      ? ((todayHadithCount - yesterdayHadithCount) / yesterdayHadithCount) * 100
      : todayHadithCount > 0 ? 100 : 0;

    return {
      totalHadith: entries.filter(e => e.type === 'hadith').length,
      totalAyat: entries.filter(e => e.type === 'ayat').length,
      todayHadith: todayHadithCount,
      todayAyat: todayEntries.filter(e => e.type === 'ayat').length,
      hadithChange: hadithChange.toFixed(0),
    };
  }, [entries]);

  const recentEntries = useMemo(() => entries.slice(0, 10), [entries]);

  const randomTodaysHadith = useMemo(() => {
    const hadiths = entries.filter(e => e.type === 'hadith');
    if (hadiths.length === 0) return null;
    const todaysHadiths = hadiths.filter(e => new Date(e.created_at).toDateString() === new Date().toDateString());
    if (todaysHadiths.length > 0) {
      return todaysHadiths[Math.floor(Math.random() * todaysHadiths.length)];
    }
    return hadiths[Math.floor(Math.random() * hadiths.length)];
  }, [entries]);

  const randomTodaysAyat = useMemo(() => {
    const ayats = entries.filter(e => e.type === 'ayat');
    if (ayats.length === 0) return null;
    const todaysAyats = ayats.filter(e => new Date(e.created_at).toDateString() === new Date().toDateString());
    if (todaysAyats.length > 0) {
      return todaysAyats[Math.floor(Math.random() * todaysAyats.length)];
    }
    return ayats[Math.floor(Math.random() * ayats.length)];
  }, [entries]);

  const statCards = [
    { title: 'Total Hadith', value: stats.totalHadith, icon: Scroll, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950' },
    { title: 'Total Quran Ayat', value: stats.totalAyat, icon: BookOpen, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50 dark:bg-green-950' },
    { title: "Today's Hadith", value: stats.todayHadith, icon: TrendingUp, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950', change: stats.hadithChange, content: randomTodaysHadith },
    { title: "Today's Ayat", value: stats.todayAyat, icon: Calendar, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950', content: randomTodaysAyat },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - Hadith & Quran CMS</title>
        <meta name="description" content="Dashboard overview of Islamic content management system with statistics and recent additions." />
      </Helmet>

      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's an overview of your content.</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-primary to-primary/80 shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Add Content
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}><stat.icon className="w-4 h-4 text-muted-foreground" /></div>
                </CardHeader>
                <CardContent className="cursor-pointer flex-grow" onClick={() => stat.content && navigate(`/entry/${stat.content.id}`)}>
                  {stat.content ? (
                    <div className="space-y-1">
                      <p className="text-sm arabic-text">{stat.content.arabic_text}</p>
                      <p className="text-xs urdu-text text-muted-foreground">{stat.urdu_translation}</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">
                        {stat.change ? (
                          <span className={`flex items-center ${stat.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            <ArrowUpRight className={`w-4 h-4 mr-1 ${stat.change < 0 && 'rotate-180'}`} /> {stat.change}% vs yesterday
                          </span>
                        ) : (stat.title.includes('Today') ? 'No entries today' : 'Total entries')}
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 flex flex-col h-[450px]">
            <CardHeader>
              <CardTitle>Recent Additions</CardTitle>
              <CardDescription>Latest content added to the system.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto">
              <div className="space-y-2">
                {recentEntries.length > 0 ? (
                  recentEntries.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => navigate(`/entry/${entry.id}`)}
                      className="flex items-center space-x-4 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                    >
                      <div className={`p-2 rounded-lg ${entry.type === 'hadith' ? 'bg-blue-50 dark:bg-blue-950' : 'bg-green-50 dark:bg-green-950'}`}>
                        {entry.type === 'hadith' ? <Scroll className="w-4 h-4 text-blue-600" /> : <BookOpen className="w-4 h-4 text-green-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium arabic-text truncate">{entry.arabic_text}</p>
                        <p className="text-xs text-muted-foreground urdu-text truncate">{entry.urdu_translation}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={entry.type === 'hadith' ? 'default' : 'secondary'} className="mb-1">{entry.type}</Badge>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}</p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No content added yet</p>
                    <p className="text-sm">Start by adding your first Hadith or Ayat.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="h-[450px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used actions.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { icon: Plus, label: 'Add New Content', desc: 'Add Hadith or Quran Ayat', action: () => setShowAddModal(true) },
                  { icon: Eye, label: 'Browse Content', desc: 'Search and filter entries', action: () => navigate('/browse') },
                  { icon: Edit, label: 'Import Data', desc: 'Bulk import from files', action: () => navigate('/import') },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button variant="outline" className="justify-start h-auto p-4 w-full hover:bg-accent group" onClick={item.action}>
                      <item.icon className="w-5 h-5 mr-4 text-primary group-hover:scale-110 transition-transform duration-200" />
                      <div className="text-left">
                        <div className="font-semibold">{item.label}</div>
                        <div className="text-sm text-muted-foreground">{item.desc}</div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddModal open={showAddModal} onOpenChange={setShowAddModal} onUpdate={refreshData} />
    </>
  );
};

export default Dashboard;