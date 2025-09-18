import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Folder, Plus, Edit, Trash2, AlertTriangle, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { motion } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';

const Collections = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [collections, setCollections] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const savedCollections = JSON.parse(localStorage.getItem('collections') || '[]');
    if (savedCollections.length === 0) {
      const defaultCollections = [
        { id: 1, name: 'Sahih Bukhari', description: 'Authentic Hadith Collection', entryIds: ['h1', 'h2'] },
        { id: 2, name: 'Favorite Ayat', description: 'Bookmarked Quran Verses', entryIds: ['q1'] },
      ];
      setCollections(defaultCollections);
      localStorage.setItem('collections', JSON.stringify(defaultCollections));
    } else {
      setCollections(savedCollections);
    }
  }, []);

  const filteredCollections = useMemo(() => {
    if (!debouncedSearchTerm) return collections;
    const lowercasedTerm = debouncedSearchTerm.toLowerCase();
    return collections.filter(collection =>
      collection.name.toLowerCase().includes(lowercasedTerm) ||
      (collection.description && collection.description.toLowerCase().includes(lowercasedTerm))
    );
  }, [debouncedSearchTerm, collections]);

  const handleSaveCollection = () => {
    if (!collectionName) {
      toast({ title: 'Error', description: 'Collection name is required.', variant: 'destructive' });
      return;
    }

    let updatedCollections;
    if (editingCollection) {
      updatedCollections = collections.map(c =>
        c.id === editingCollection.id ? { ...c, name: collectionName, description: collectionDescription } : c
      );
      toast({ title: 'Collection Updated', description: `"${collectionName}" has been updated.`, variant: 'success' });
    } else {
      const newCollection = {
        id: Date.now(),
        name: collectionName,
        description: collectionDescription,
        entryIds: [],
      };
      updatedCollections = [...collections, newCollection];
      toast({ title: 'Collection Created', description: `"${collectionName}" has been created.`, variant: 'success' });
    }
    setCollections(updatedCollections);
    localStorage.setItem('collections', JSON.stringify(updatedCollections));
    setIsModalOpen(false);
    setEditingCollection(null);
    setCollectionName('');
    setCollectionDescription('');
  };

  const openModal = (collection = null) => {
    setEditingCollection(collection);
    setCollectionName(collection ? collection.name : '');
    setCollectionDescription(collection ? collection.description : '');
    setIsModalOpen(true);
  };

  const handleDeleteCollection = (id) => {
    const updatedCollections = collections.filter(c => c.id !== id);
    setCollections(updatedCollections);
    localStorage.setItem('collections', JSON.stringify(updatedCollections));
    toast({ title: 'Collection Deleted', description: 'The collection has been deleted.', variant: 'destructive' });
  };

  return (
    <>
      <Helmet>
        <title>Collections - Hadith & Quran CMS</title>
        <meta name="description" content="Organize your Islamic content into collections for better management and categorization." />
      </Helmet>

      <div className="space-y-6 scrollbar-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Collections</h1>
            <p className="text-muted-foreground">Organize your content into meaningful collections.</p>
          </div>
          <div className="flex w-full md:w-auto items-center space-x-2">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search collections..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-10 w-full"
              />
            </div>
            <Button onClick={() => openModal()} className="flex-shrink-0">
              <Plus className="w-4 h-4 mr-2" /> Create
            </Button>
          </div>
        </div>

        {filteredCollections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((collection, index) => (
              <motion.div key={collection.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className="hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Folder className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{collection.name}</CardTitle>
                          <CardDescription>{collection.description || 'No description'}</CardDescription>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openModal(collection)}><Edit className="w-4 h-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-destructive" />Delete Collection?</AlertDialogTitle>
                              <AlertDialogDescription>This will permanently delete the "{collection.name}" collection. Entries within it will not be deleted.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCollection(collection.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col justify-between">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Entries:</span>
                      <span className="font-medium">{(collection.entryIds || []).length}</span>
                    </div>
                    <Button variant="outline" className="w-full mt-4" onClick={() => navigate(`/collections/${collection.id}`)}>
                      View Collection
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Collections Found</h3>
            <p className="text-muted-foreground mb-4">{searchTerm ? "Your search returned no results." : "Create your first collection to get started."}</p>
            {!searchTerm && <Button onClick={() => openModal()}>Create Your First Collection</Button>}
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCollection ? 'Edit Collection' : 'Create New Collection'}</DialogTitle>
            <DialogDescription>
              {editingCollection ? 'Update the name and description of your collection.' : 'Enter a name and optional description for your new collection.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="collection-name">Name *</Label>
              <Input id="collection-name" value={collectionName} onChange={(e) => setCollectionName(e.target.value)} placeholder="e.g., Ramadan Reflections" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="collection-description">Description</Label>
              <Input id="collection-description" value={collectionDescription} onChange={(e) => setCollectionDescription(e.target.value)} placeholder="e.g., Ayat and Hadith for daily study" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCollection}>Save Collection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Collections;