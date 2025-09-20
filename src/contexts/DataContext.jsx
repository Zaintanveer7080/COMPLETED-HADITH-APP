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
  // IMPORTANT: also read auth loading so we don't fetch too early
  const { user, loading: authLoading } = useAuth();

  /**
   * Fetch entries after auth is ready.
   * @param {boolean} suppressToast - if true, don't toast errors (useful on first load).
   */
  const refreshData = useCallback(async (suppressToast = false) => {
    // If auth is still restoring the session, wait.
    if (authLoading) return;

    // If no user (not logged in), clear and stop.
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
      setEntries([]);
      if (!suppressToast) {
        toast({
          title: "Error",
          description: "Could not fetch data. Please check your connection.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user, authLoading, toast]);

  // First load: wait for auth to be ready; suppress toast for transient races.
  useEffect(() => {
    if (!authLoading) {
      // On initial mount after auth is ready, avoid showing an error toast for transient issues.
      refreshData(true);
    }
  }, [authLoading, refreshData]);

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

  // === UPDATED: strip non-table fields (e.g., creator_name) ONLY for updates ===
  const updateEntry = async (id, updatedData) => {
    try {
      const {
        creator_name,
        id: _ignoreId,
        created_at: _ignoreCreatedAt,
        ...rest
      } = updatedData || {};

      const payload = {
        ...rest,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('entries')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await refreshData();
      
      toast({
        title: "Success!",
        description: "Entry updated successfully.",
      });
      
      return { success: true, data };
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
