import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';
import { Search, Filter, Eye, Edit, Trash2, BookOpen, Scroll, AlertTriangle, ChevronLeft, ChevronRight, FolderPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useData } from '@/contexts/DataContext';
import AddModal from '@/components/AddModal';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/ui/use-toast';

const Browse = () => {
  const { entries, deleteEntry, refreshData } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [collections, setCollections] = useState([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const navigate = useNavigate();

  useEffect(() => {
    refreshData();
    const savedCollections = JSON.parse(localStorage.getItem('collections') || '[]');
    setCollections(savedCollections);
  }, []);

  const filteredEntries = useMemo(() => {
    let filtered = entries;
    if (debouncedSearchTerm) {
      const lowercasedTerm = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(entry =>
        Object.values(entry).some(val =>
          String(val).toLowerCase().includes(lowercasedTerm)
        )
      );
    }
    if (typeFilter !== 'all') {
      filtered = filtered.filter(entry => entry.type === typeFilter);
    }
    return filtered;
  }, [debouncedSearchTerm, typeFilter, entries]);

  const totalPages = Math.max(1, Math.ceil(filteredEntries.length / itemsPerPage));
  const currentEntries = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredEntries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredEntries, currentPage, itemsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    await deleteEntry(id);
  };

  const handleAddToCollection = (entryId, collectionId) => {
    const updatedCollections = collections.map(collection => {
      if (collection.id === collectionId) {
        const entryIds = collection.entryIds || [];
        if (!entryIds.includes(entryId)) {
          return { ...collection, entryIds: [...entryIds, entryId] };
        }
      }
      return collection;
    });
    setCollections(updatedCollections);
    localStorage.setItem('collections', JSON.stringify(updatedCollections));
    const collectionName = collections.find(c => c.id === collectionId)?.name;
    toast({
      title: 'Added to Collection',
      description: `Entry added to "${collectionName}".`,
      variant: 'success',
    });
  };

  return (
    <>
      <Helmet>
        <title>Browse Content - Hadith & Quran CMS</title>
        <meta name="description" content="Browse, search, and manage Hadith and Quran content with advanced filtering and pagination." />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Browse Content</h1>
          <p className="text-muted-foreground">Search and manage your Islamic content collection.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2"><Filter className="w-5 h-5" /><span>Search & Filter</span></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search anything..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Filter by type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="hadith">Hadith</SelectItem>
                  <SelectItem value="ayat">Ayat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Results</CardTitle>
                <CardDescription>{filteredEntries.length} entries found</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentEntries.length > 0 ? (
                currentEntries.map((entry, index) => (
                  <motion.div key={entry.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant={entry.type === 'hadith' ? 'default' : 'secondary'} className="capitalize">{entry.type === 'hadith' ? <Scroll className="w-3 h-3 mr-1.5" /> : <BookOpen className="w-3 h-3 mr-1.5" />} {entry.type}</Badge>
                          <span className="text-sm text-muted-foreground">{entry.reference_full || entry.quran_reference}</span>
                        </div>
                        <p className="arabic-text text-lg leading-relaxed">{entry.arabic_text}</p>
                        <p className="urdu-text text-muted-foreground">{entry.urdu_translation}</p>
                      </div>
                      <div className="flex items-center space-x-1 self-start sm:self-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><FolderPlus className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {collections.map(collection => (
                              <DropdownMenuItem key={collection.id} onClick={() => handleAddToCollection(entry.id, collection.id)}>
                                {collection.name}
                              </DropdownMenuItem>
                            ))}
                             {collections.length === 0 && <DropdownMenuItem disabled>No collections found</DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/entry/${entry.id}`)}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)}><Edit className="w-4 h-4" /></Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button></AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-destructive" />Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone. This will permanently delete the entry.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(entry.id)} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
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
                  <p>Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-muted-foreground">Rows per page</p>
              <Select value={String(itemsPerPage)} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-20 h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map(v => <SelectItem key={v} value={String(v)}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      {editingEntry && <AddModal open={isEditModalOpen} onOpenChange={setIsEditModalOpen} initialData={editingEntry} onUpdate={refreshData} />}
    </>
  );
};

export default Browse;
