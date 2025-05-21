
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { fetchMarketData } from '@/lib/marketApi';
import { calculatePortfolioSummary } from '@/lib/portfolioCalculations';
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';

const POLYGON_API_KEY = 'Uc5Fcf5uXhDISoL5bj3xZiyHiPYrxzSp';

const usePortfolio = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const [transactions, setTransactions] = useState([]);
  const [portfolio, setPortfolio] = useState({ assets: {}, apiWarnings: [] });
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const processPortfolioCalculation = useCallback((currentTransactions, marketPrices, marketApiWarnings) => {
    const summary = calculatePortfolioSummary(currentTransactions, marketPrices);
    setPortfolio({ assets: summary, apiWarnings: marketApiWarnings || [] });
    setIsLoadingPrices(false);
  }, []);

  const fetchMarketDataAndCalculatePortfolio = useCallback(async (currentTransactions) => {
    if (!currentTransactions || currentTransactions.length === 0) {
      setPortfolio({ assets: {}, apiWarnings: [] });
      setIsLoadingPrices(false);
      setError(null);
      return;
    }
    setIsLoadingPrices(true);
    setError(null);
    let apiWarnings = [];
    try {
      const marketDataResult = await fetchMarketData(currentTransactions, POLYGON_API_KEY);
      processPortfolioCalculation(currentTransactions, marketDataResult.prices, marketDataResult.warnings);
    } catch (e) {
      console.error('Error fetching market data or calculating portfolio:', e);
      let description = "No se pudieron obtener los precios de mercado. Revisa la consola del navegador para más detalles (F12).";
      if (e.message && (e.message.includes("Polygon.io") || e.message.includes("Polygon API"))) {
        description = "Problema al obtener precios de Polygon.io (acciones/forex). Podría ser un problema con la API, el símbolo o que el mercado esté cerrado. Revisa la consola (F12).";
      }
      toast({ title: "Error al Actualizar Portafolio", description, variant: "destructive", duration: 9000 });
      processPortfolioCalculation(currentTransactions, {}, apiWarnings); 
      setError("Failed to fetch market prices.");
    }
  }, [toast, processPortfolioCalculation]);

  const loadInitialData = useCallback(async () => {
    setIsLoadingTransactions(true);
    setError(null);
    let fetchedTransactions = [];
    let fetchErrorObject = null;

    if (!userId) {
      try {
        fetchedTransactions = JSON.parse(localStorage.getItem('localTransactions') || '[]');
      } catch (e) {
        console.error("Error loading local transactions:", e);
        fetchErrorObject = e;
      }
    } else {
      try {
        const { data, error: dbError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (dbError) throw dbError;
        fetchedTransactions = data || [];
        localStorage.setItem('localTransactions', JSON.stringify(fetchedTransactions));
      } catch (e) {
        console.error('Error fetching transactions from Supabase:', e);
        let errorMessage = e.message || 'Error desconocido al cargar transacciones.';
        if (e.message && e.message.toLowerCase().includes('failed to fetch')) {
          errorMessage = 'Fallo de conexión al intentar cargar transacciones. Verifica tu conexión a internet o si hay algún bloqueo de red (firewall, VPN, extensión del navegador).';
        }
        if (e.message && e.message.toLowerCase().includes('insufficient resources')) {
          errorMessage = 'El navegador no tiene suficientes recursos para completar la solicitud. Intenta cerrar otras pestañas o aplicaciones, o recarga la página.';
        }
        const errorDetails = e.details || (e.stack ? e.stack.substring(0,100) + '...' : '');
        toast({ 
          title: "Error al Cargar Transacciones", 
          description: `Mensaje: ${errorMessage}. ${errorDetails ? 'Detalles: ' + errorDetails : ''}`, 
          variant: "destructive",
          duration: 10000 
        });
        fetchedTransactions = JSON.parse(localStorage.getItem('localTransactions') || '[]'); 
        fetchErrorObject = e;
        setError(errorMessage);
      }
    }
    
    setTransactions(fetchedTransactions);
    setIsLoadingTransactions(false);

    if (!fetchErrorObject && fetchedTransactions.length > 0) {
      await fetchMarketDataAndCalculatePortfolio(fetchedTransactions);
    } else if (fetchedTransactions.length === 0) {
      setPortfolio({ assets: {}, apiWarnings: [] });
      setIsLoadingPrices(false);
    }
  }, [userId, toast, fetchMarketDataAndCalculatePortfolio]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);
  
  const addTransaction = async (transactionData) => {
    setError(null);
    let success = false;
    let newTransactionData = null;

    if (userId) {
      try {
        const transactionWithUser = { ...transactionData, user_id: userId };
        const { data: insertedData, error: insertError } = await supabase
          .from('transactions')
          .insert([transactionWithUser])
          .select()
          .single();

        if (insertError) throw insertError;
        newTransactionData = insertedData;
        success = true;
        toast({ title: "Transacción Añadida", description: `${insertedData.asset_name} (${insertedData.transaction_type}) añadida exitosamente.` });
      } catch (e) {
        console.error('Error adding transaction to Supabase:', e);
        toast({ title: "Error al Añadir Transacción", description: e.message, variant: "destructive" });
        setError(e.message);
        return { data: null, error: e };
      }
    } else {
      const localId = `local_${new Date().getTime()}`;
      newTransactionData = { ...transactionData, id: localId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      const currentLocalTransactions = JSON.parse(localStorage.getItem('localTransactions') || '[]');
      const updatedLocalTransactions = [...currentLocalTransactions, newTransactionData];
      localStorage.setItem('localTransactions', JSON.stringify(updatedLocalTransactions));
      setTransactions(updatedLocalTransactions); 
      success = true;
      toast({ title: "Transacción Añadida (Localmente)", description: `${newTransactionData.asset_name} (${newTransactionData.transaction_type}) añadida. Inicia sesión para guardarla en la nube.` });
    }

    if (success) {
      const allTransactions = await (async () => {
        if (userId) {
            const { data, error: dbError } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
            if (dbError) {
                console.error("Failed to re-fetch transactions after add:", dbError);
                return transactions; 
            }
            localStorage.setItem('localTransactions', JSON.stringify(data || []));
            return data || [];
        }
        return JSON.parse(localStorage.getItem('localTransactions') || '[]');
      })();
      setTransactions(allTransactions);
      await fetchMarketDataAndCalculatePortfolio(allTransactions);
    }
    return { data: newTransactionData, error: null };
  };
  
  const updateTransaction = async (transactionId, updatedFields) => {
    setError(null);
    const fieldsToUpdate = { ...updatedFields, updated_at: new Date().toISOString() };
    if (fieldsToUpdate.assetName) { fieldsToUpdate.asset_name = fieldsToUpdate.assetName; delete fieldsToUpdate.assetName; }
    if (fieldsToUpdate.assetType) { fieldsToUpdate.asset_type = fieldsToUpdate.assetType; delete fieldsToUpdate.assetType; }
    if (fieldsToUpdate.type) { fieldsToUpdate.transaction_type = fieldsToUpdate.type; delete fieldsToUpdate.type; }
    let success = false;

    if (userId) {
      try {
        const { error: updateError } = await supabase
          .from('transactions')
          .update(fieldsToUpdate)
          .eq('id', transactionId)
          .eq('user_id', userId);
        if (updateError) throw updateError;
        success = true;
        toast({ title: "Transacción Actualizada", description: "La transacción ha sido actualizada." });
      } catch (e) {
        console.error('Error updating transaction in Supabase:', e);
        toast({ title: "Error al Actualizar Transacción", description: e.message, variant: "destructive" });
        setError(e.message);
        return { data: null, error: e };
      }
    } else {
      const currentLocalTransactions = JSON.parse(localStorage.getItem('localTransactions') || '[]');
      const updatedLocalTransactions = currentLocalTransactions.map(tx => 
        tx.id === transactionId ? { ...tx, ...fieldsToUpdate } : tx
      );
      localStorage.setItem('localTransactions', JSON.stringify(updatedLocalTransactions));
      setTransactions(updatedLocalTransactions);
      success = true;
      toast({ title: "Transacción Actualizada (Localmente)" });
    }
    
    if (success) {
      const allTransactions = await (async () => {
        if (userId) {
            const { data, error: dbError } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
            if (dbError) {
                console.error("Failed to re-fetch transactions after update:", dbError);
                return transactions;
            }
            localStorage.setItem('localTransactions', JSON.stringify(data || []));
            return data || [];
        }
        return JSON.parse(localStorage.getItem('localTransactions') || '[]');
      })();
      setTransactions(allTransactions);
      await fetchMarketDataAndCalculatePortfolio(allTransactions);
    }
    return { data: fieldsToUpdate, error: null };
  };

  const deleteTransaction = async (transactionId) => {
    setError(null);
    let success = false;
    if (userId) {
      try {
        const { error: deleteError } = await supabase
          .from('transactions')
          .delete()
          .eq('id', transactionId)
          .eq('user_id', userId);
        if (deleteError) throw deleteError;
        success = true;
        toast({ title: "Transacción Eliminada", description: "La transacción ha sido eliminada." });
      } catch (e) {
        console.error('Error deleting transaction from Supabase:', e);
        toast({ title: "Error al Eliminar Transacción", description: e.message, variant: "destructive" });
        setError(e.message);
        return { error: e };
      }
    } else {
      const currentLocalTransactions = JSON.parse(localStorage.getItem('localTransactions') || '[]');
      const updatedLocalTransactions = currentLocalTransactions.filter(tx => tx.id !== transactionId);
      localStorage.setItem('localTransactions', JSON.stringify(updatedLocalTransactions));
      setTransactions(updatedLocalTransactions);
      success = true;
      toast({ title: "Transacción Eliminada (Localmente)" });
    }

    if (success) {
       const allTransactions = await (async () => {
        if (userId) {
            const { data, error: dbError } = await supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false });
            if (dbError) {
                console.error("Failed to re-fetch transactions after delete:", dbError);
                return transactions;
            }
            localStorage.setItem('localTransactions', JSON.stringify(data || []));
            return data || [];
        }
        return JSON.parse(localStorage.getItem('localTransactions') || '[]');
      })();
      setTransactions(allTransactions);
      await fetchMarketDataAndCalculatePortfolio(allTransactions);
    }
    return { error: null };
  };

  const syncLocalTransactionsWithSupabase = useCallback(async (loggedInUserId) => {
    const localTransactionsRaw = localStorage.getItem('localTransactions');
    if (!localTransactionsRaw) return;
    const localTransactions = JSON.parse(localTransactionsRaw);
    if (localTransactions.length === 0) return;

    toast({ title: "Sincronizando...", description: "Guardando tus transacciones locales en la nube." });

    const transactionsToSync = localTransactions.map(tx => {
      const { id, ...restOfTx } = tx; 
      return { ...restOfTx, user_id: loggedInUserId };
    });

    try {
      const { error: upsertError } = await supabase.from('transactions').upsert(transactionsToSync, {
        onConflict: 'asset_name, date, quantity, price, transaction_type, user_id' 
      });

      if (upsertError) {
        console.error("Error syncing local transactions:", upsertError);
        toast({ title: "Error de Sincronización", description: `No se pudieron guardar todas las transacciones locales: ${upsertError.message}`, variant: "destructive" });
      } else {
        toast({ title: "Sincronización Completa", description: "Tus transacciones locales han sido guardadas en la nube." });
        localStorage.removeItem('localTransactions'); 
        await loadInitialData(); 
      }
    } catch (e) {
        console.error("Exception during sync:", e);
        toast({ title: "Error Crítico de Sincronización", description: "Ocurrió un error inesperado.", variant: "destructive"});
    }
  }, [toast, loadInitialData]); 

  useEffect(() => {
    if (user && user.id) {
        const hasSynced = sessionStorage.getItem('syncedAfterLogin');
        if (!hasSynced) {
            syncLocalTransactionsWithSupabase(user.id);
            sessionStorage.setItem('syncedAfterLogin', 'true');
        }
    } else if (!user) {
        sessionStorage.removeItem('syncedAfterLogin');
    }
  }, [user, syncLocalTransactionsWithSupabase]);

  const forceRefreshAllData = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);

  return { 
    transactions, 
    portfolio: portfolio.assets, 
    apiWarnings: portfolio.apiWarnings, 
    isLoading: isLoadingTransactions || isLoadingPrices, 
    isLoadingTransactions,
    isLoadingPrices,
    error,
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    refreshPortfolio: forceRefreshAllData,
    forceRefreshAll: forceRefreshAllData,
    syncLocalTransactionsWithSupabase
  };
};

export default usePortfolio;
