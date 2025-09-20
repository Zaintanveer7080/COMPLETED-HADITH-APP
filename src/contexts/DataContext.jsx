import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { user } = useAuth();

  const refreshData = useCallback(async () => {
    if (!user) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('entries_with_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Failed to fetch entries from Supabase", error);
      toast({
        title: "Error",
        description: "Could not fetch data. Please check your connection.",
        variant: "destructive",
      });
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addEntry = async (entryData) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    try {
      const newEntry = {
        created_by: user.id,
        ...entryData
      };
      
      const { data, error } = await supabase
        .from('entries')
        .insert(newEntry)
        .select()
        .single();

      if (error) throw error;

      await refreshData();
      
      addNotification({
        type: 'success',
        title: 'Content Added',
        message: `New ${entryData.type} entry has been successfully added.`
      });
      
      toast({
        title: "Success!",
        description: `${entryData.type === 'hadith' ? 'Hadith' : 'Ayat'} added successfully.`,
      });
      
      return { success: true, data };
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add content. Please try again.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const importEntries = async (newEntries) => {
    if (!user) return { success: false, error: 'User not authenticated' };
    try {
      const entriesWithUser = newEntries.map(entry => ({
        ...entry,
        created_by: user.id,
      }));

      const { data, error } = await supabase
        .from('entries')
        .insert(entriesWithUser)
        .select();

      if (error) throw error;

      await refreshData();

      toast({
        title: "Import Successful",
        description: `${data.length} entries have been imported.`,
        variant: "success",
      });

      return { success: true, count: data.length };
    } catch (error) {
      toast({
        title: "Import Error",
        description: error.message || "An error occurred during the import process.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const updateEntry = async (id, updatedData) => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .update({ ...updatedData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await refreshData();
      
      toast({
        title: "Success!",
        description: "Entry updated successfully.",
      });
      
      return { success: true };
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update entry.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const deleteEntry = async (id) => {
    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEntries(prev => prev.filter(entry => entry.id !== id));
      
      toast({
        title: "Entry Deleted",
        description: "The entry has been successfully deleted.",
      });
      
      return { success: true };
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete entry.",
        variant: "destructive",
      });
      return { success: false, error: error.message };
    }
  };

  const getEntryById = (id) => {
    return entries.find(entry => entry.id === id);
  };

  const value = {
    entries,
    loading,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntryById,
    refreshData,
    importEntries,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
