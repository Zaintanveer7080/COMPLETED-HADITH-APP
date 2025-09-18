import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Scroll } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useData } from '@/contexts/DataContext';

const AddModal = ({ open, onOpenChange, initialData, onUpdate }) => {
  const [activeTab, setActiveTab] = useState('hadith');
  const [formData, setFormData] = useState({
    arabic_text: '', urdu_translation: '', reference_full: '', in_book_reference: '',
    hadith_number: '', quran_reference: '', surah_name: '', ayat_number: '',
    source_link: '', note: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { addEntry, updateEntry } = useData();
  const isEditMode = !!initialData;

  useEffect(() => {
    if (isEditMode) {
      setActiveTab(initialData.type);
      setFormData({ ...initialData });
    } else {
      setFormData({
        arabic_text: '', urdu_translation: '', reference_full: '', in_book_reference: '',
        hadith_number: '', quran_reference: '', surah_name: '', ayat_number: '',
        source_link: '', note: ''
      });
    }
    setErrors({});
  }, [initialData, open]);

  const validate = () => {
    const newErrors = {};
    if (!formData.arabic_text) newErrors.arabic_text = "Arabic text is required.";
    if (!formData.urdu_translation) newErrors.urdu_translation = "Urdu translation is required.";
    if (activeTab === 'hadith' && !formData.reference_full) newErrors.reference_full = "Full reference is required.";
    if (activeTab === 'ayat' && !formData.quran_reference) newErrors.quran_reference = "Quran reference is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const dataToSubmit = { type: activeTab, ...formData };
    let result;

    if (isEditMode) {
      result = await updateEntry(initialData.id, dataToSubmit);
    } else {
      result = await addEntry(dataToSubmit);
    }

    setLoading(false);
    if (result.success) {
      onOpenChange(false);
      if (onUpdate) onUpdate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/60 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">{isEditMode ? 'Edit Content' : 'Add New Content'}</span>
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Update the details of the existing entry.' : 'Fill in the details to add a new Hadith or Quran Ayat.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full p-6 pt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="hadith" className="flex items-center space-x-2" disabled={isEditMode && initialData.type !== 'hadith'}>
                <Scroll className="w-4 h-4" />
                <span>Hadith</span>
              </TabsTrigger>
              <TabsTrigger value="ayat" className="flex items-center space-x-2" disabled={isEditMode && initialData.type !== 'ayat'}>
                <BookOpen className="w-4 h-4" />
                <span>Quran Ayat</span>
              </TabsTrigger>
            </TabsList>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="arabic_text">Arabic Text *</Label>
                  <Textarea id="arabic_text" value={formData.arabic_text} onChange={(e) => handleInputChange('arabic_text', e.target.value)} className="arabic-text min-h-[120px]" placeholder="Enter Arabic text..." />
                  {errors.arabic_text && <p className="text-red-500 text-xs mt-1">{errors.arabic_text}</p>}
                </div>
                <div>
                  <Label htmlFor="urdu_translation">Urdu Translation *</Label>
                  <Textarea id="urdu_translation" value={formData.urdu_translation} onChange={(e) => handleInputChange('urdu_translation', e.target.value)} className="urdu-text min-h-[120px]" placeholder="Enter Urdu translation..." />
                  {errors.urdu_translation && <p className="text-red-500 text-xs mt-1">{errors.urdu_translation}</p>}
                </div>
                <div>
                  <Label htmlFor="source_link">Source Link</Label>
                  <Input id="source_link" type="url" value={formData.source_link} onChange={(e) => handleInputChange('source_link', e.target.value)} placeholder="https://example.com" />
                </div>
              </div>

              <div className="space-y-4">
                <TabsContent value="hadith" className="mt-0 space-y-4">
                  <div>
                    <Label htmlFor="reference_full">Full Reference *</Label>
                    <Input id="reference_full" value={formData.reference_full} onChange={(e) => handleInputChange('reference_full', e.target.value)} placeholder="e.g., Sahih al-Bukhari 1" />
                    {errors.reference_full && <p className="text-red-500 text-xs mt-1">{errors.reference_full}</p>}
                  </div>
                  <div>
                    <Label htmlFor="in_book_reference">In-Book Reference</Label>
                    <Input id="in_book_reference" value={formData.in_book_reference} onChange={(e) => handleInputChange('in_book_reference', e.target.value)} placeholder="Book 1, Hadith 1" />
                  </div>
                  <div>
                    <Label htmlFor="hadith_number">Hadith Number</Label>
                    <Input id="hadith_number" value={formData.hadith_number} onChange={(e) => handleInputChange('hadith_number', e.target.value)} placeholder="1" />
                  </div>
                </TabsContent>

                <TabsContent value="ayat" className="mt-0 space-y-4">
                  <div>
                    <Label htmlFor="quran_reference">Quran Reference *</Label>
                    <Input id="quran_reference" value={formData.quran_reference} onChange={(e) => handleInputChange('quran_reference', e.target.value)} placeholder="e.g., Al-Baqarah:255" />
                    {errors.quran_reference && <p className="text-red-500 text-xs mt-1">{errors.quran_reference}</p>}
                  </div>
                  <div>
                    <Label htmlFor="surah_name">Surah Name</Label>
                    <Input id="surah_name" value={formData.surah_name} onChange={(e) => handleInputChange('surah_name', e.target.value)} placeholder="Al-Baqarah" />
                  </div>
                  <div>
                    <Label htmlFor="ayat_number">Ayat Number</Label>
                    <Input id="ayat_number" type="text" value={formData.ayat_number} onChange={(e) => handleInputChange('ayat_number', e.target.value)} placeholder="255" />
                  </div>
                </TabsContent>

                <div>
                  <Label htmlFor="note">Note</Label>
                  <Textarea id="note" value={formData.note} onChange={(e) => handleInputChange('note', e.target.value)} placeholder="Additional notes or commentary..." className="min-h-[80px]" />
                </div>
              </div>
            </div>
          </Tabs>
          
          <div className="flex justify-end space-x-4 mt-6 p-6 pt-4 bg-secondary/50 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-primary to-primary/80">
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              ) : null}
              {loading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Content')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddModal;