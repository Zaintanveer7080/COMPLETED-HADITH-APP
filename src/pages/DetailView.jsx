import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, BookOpen, Scroll, Edit, Trash2, Copy, Check, Link as LinkIcon, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useData } from '@/contexts/DataContext';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import AddModal from '@/components/AddModal';

const DetailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEntryById, deleteEntry, refreshData } = useData();
  const { toast } = useToast();
  const [copied, setCopied] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const entry = getEntryById(id);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = async () => {
    await deleteEntry(id);
    navigate('/browse');
  };

  if (!entry) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Entry not found</h1>
        <p className="text-muted-foreground">The requested content could not be located.</p>
        <Button onClick={() => navigate('/browse')} className="mt-4">Go to Browse</Button>
      </div>
    );
  }

  const reference = entry.type === 'hadith' ? entry.reference_full : entry.quran_reference;

  return (
    <>
      <Helmet>
        <title>{reference} - Hadith & Quran CMS</title>
        <meta name="description" content={entry.urdu_translation} />
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="hover:bg-accent">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" onClick={() => setIsEditModalOpen(true)}><Edit className="w-4 h-4" /></Button>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-destructive" />Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone. This will permanently delete the entry.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-3">
                {entry.type === 'hadith' ? <Scroll className="w-6 h-6 text-primary" /> : <BookOpen className="w-6 h-6 text-primary" />}
                <span className="text-2xl">{reference}</span>
              </CardTitle>
              <Badge variant={entry.type === 'hadith' ? 'default' : 'secondary'}>{entry.type}</Badge>
            </div>
            <CardDescription>
              {/* CHANGED: use profile name from the view, fallback to 'User' */}
              Added by {entry.creator_name || 'User'} on {format(new Date(entry.created_at), 'PPP p')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Arabic Text</h2>
              <div className="relative group">
                <p className="arabic-text text-2xl leading-loose bg-background p-4 rounded-md border">{entry.arabic_text}</p>
                <Button variant="ghost" size="icon" className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCopy(entry.arabic_text, 'arabic')}>
                  {copied === 'arabic' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Urdu Translation</h2>
              <div className="relative group">
                <p className="urdu-text text-lg leading-relaxed bg-background p-4 rounded-md border">{entry.urdu_translation}</p>
                <Button variant="ghost" size="icon" className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCopy(entry.urdu_translation, 'urdu')}>
                  {copied === 'urdu' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {entry.note && (
              <div className="space-y-2">
                <h2 className="text-lg font-semibold">Notes</h2>
                <p className="text-muted-foreground p-4 bg-muted/50 rounded-md border">{entry.note}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div className="space-y-3">
                <h3 className="font-semibold">Details</h3>
                {entry.type === 'hadith' && (
                  <>
                    <DetailItem label="In-Book Ref" value={entry.in_book_reference} />
                    <DetailItem label="Hadith No." value={entry.hadith_number} />
                  </>
                )}
                {entry.type === 'ayat' && (
                  <>
                    <DetailItem label="Surah Name" value={entry.surah_name} />
                    <DetailItem label="Ayat No." value={entry.ayat_number} />
                  </>
                )}
                {entry.source_link && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Source Link:</span>
                    <a href={entry.source_link} target="_blank" rel="noopener noreferrer" className="flex items-center text-primary hover:underline">
                      {new URL(entry.source_link).hostname} <LinkIcon className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Metadata</h3>
                <DetailItem label="Entry ID" value={entry.id} copyable onCopy={() => handleCopy(entry.id, 'id')} copied={copied === 'id'} />
                <DetailItem label="Last Updated" value={entry.updated_at ? format(new Date(entry.updated_at), 'PPP p') : 'N/A'} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {entry && <AddModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} initialData={entry} onUpdate={refreshData} />}
    </>
  );
};

const DetailItem = ({ label, value, copyable, onCopy, copied }) => (
  <div className="flex justify-between items-center text-sm">
    <span className="text-muted-foreground">{label}:</span>
    <div className="flex items-center space-x-2 font-medium">
      <span>{value || 'N/A'}</span>
      {copyable && (
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCopy}>
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
        </Button>
      )}
    </div>
  </div>
);

export default DetailView;
