import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Folder, BookOpen, Scroll, Eye, Trash2, AlertTriangle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { motion } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';

const CollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getEntryById } = useData();
  const { toast } = useToast();
  const [collection, setCollection] = useState(null);
  const [collectionEntries, setCollectionEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const allCollections = JSON.parse(localStorage.getItem('collections') || '[]');
    const foundCollection = allCollections.find(c => c.id.toString() === id);
    
    if (foundCollection) {
      setCollection(foundCollection);
      const entries = (foundCollection.entryIds || []).map(entryId => getEntryById(entryId)).filter(Boolean);
      setCollectionEntries(entries);
    }
  }, [id, getEntryById]);

  const filteredEntries = useMemo(() => {
    if (!debouncedSearchTerm) return collectionEntries;
    const lowercasedTerm = debouncedSearchTerm.toLowerCase();
    return collectionEntries.filter(entry =>
      Object.values(entry).some(val =>
        String(val).toLowerCase().includes(lowercasedTerm)
      )
    );
  }, [debouncedSearchTerm, collectionEntries]);

  const handleRemoveEntry = (entryId) => {
    const updatedEntryIds = collection.entryIds.filter(eId => eId !== entryId);
    const updatedCollection = { ...collection, entryIds: updatedEntryIds };
    
    const allCollections = JSON.parse(localStorage.getItem('collections') || '[]');
    const updatedCollections = allCollections.map(c => c.id === collection.id ? updatedCollection : c);
    
    localStorage.setItem('collections', JSON.stringify(updatedCollections));
    setCollection(updatedCollection);
    
    toast({ title: 'Entry Removed', description: 'The entry has been removed from this collection.', variant: 'success' });
  };

  if (!collection) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold">Collection not found</h1>
        <p className="text-muted-foreground">The requested collection could not be located.</p>
        <Button onClick={() => navigate('/collections')} className="mt-4">Go to Collections</Button>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{collection.name} - Collections</title>
        <meta name="description" content={`Viewing entries in the "${collection.name}" collection.`} />
      </Helmet>

      <div className="space-y-6 scrollbar-hidden">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/collections')} className="hover:bg-accent">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Collections
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Folder className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl">{collection.name}</CardTitle>
                  <CardDescription>{collection.description}</CardDescription>
                </div>
              </div>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search in collection..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-10" 
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry, index) => (
                  <motion.div key={entry.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={entry.type === 'hadith' ? 'default' : 'secondary'}>{entry.type === 'hadith' ? <Scroll className="w-3 h-3 mr-1.5" /> : <BookOpen className="w-3 h-3 mr-1.5" />} {entry.type}</Badge>
                          <span className="text-sm text-muted-foreground">{entry.reference_full || entry.quran_reference}</span>
                        </div>
                        <p className="arabic-text text-lg leading-relaxed">{entry.arabic_text}</p>
                        <p className="urdu-text text-muted-foreground">{entry.urdu_translation}</p>
                      </div>
                      <div className="flex items-center space-x-1 self-start sm:self-center">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/entry/${entry.id}`)}><Eye className="w-4 h-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-destructive" />Remove from collection?</AlertDialogTitle>
                              <AlertDialogDescription>This will remove the entry from this collection, but will not delete the entry itself.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveEntry(entry.id)} className="bg-destructive hover:bg-destructive/90">Remove</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium">No Entries Found</h3>
                  <p>{searchTerm ? "Your search returned no results." : "This collection is empty."}</p>
                  {!searchTerm && <Button onClick={() => navigate('/browse')} className="mt-4">Browse Content to Add</Button>}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CollectionDetail;