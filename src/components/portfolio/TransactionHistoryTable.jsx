
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Trash2, ArrowUpRight, ArrowDownLeft, Pencil } from 'lucide-react';
import { formatCurrency, formatQuantity } from '@/lib/formatters';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';
import EditTransactionDialog from '@/components/portfolio/EditTransactionDialog';

const TransactionHistoryTable = ({ transactions, onDeleteTransaction, onUpdateTransaction }) => {
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const handleDelete = (id) => {
    onDeleteTransaction(id);
    toast({
      title: "Transacción Eliminada",
      description: "La transacción ha sido eliminada de tu historial.",
    });
  };

  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  if (!transactions || transactions.length === 0) {
    return <p className="text-center text-slate-500 py-4">No hay transacciones registradas.</p>;
  }

  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm">
        <Table className="min-w-full divide-y divide-slate-700">
          <TableHeader>
            <TableRow className="hover:bg-slate-700/20">
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Tipo</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Activo</TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Fecha</TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Cantidad</TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Precio Unitario</TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Valor Total</TableHead>
              <TableHead className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Comisiones</TableHead>
              <TableHead className="px-4 py-3 text-center text-xs font-medium text-slate-400 uppercase tracking-wider">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-700/50">
            {sortedTransactions.map((tx) => (
              <TableRow key={tx.id} className="hover:bg-slate-700/30 transition-colors duration-150">
                <TableCell className="px-4 py-3 whitespace-nowrap">
                  {tx.transaction_type === 'buy' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-300">
                      <ArrowDownLeft className="h-3 w-3 mr-1" /> Compra
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-300">
                      <ArrowUpRight className="h-3 w-3 mr-1" /> Venta
                    </span>
                  )}
                </TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-200">{tx.asset_name}</TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-slate-400">{new Date(tx.date).toLocaleDateString()}</TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-slate-300 text-right">{formatQuantity(tx.quantity)}</TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-slate-300 text-right">{formatCurrency(tx.price)}</TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-slate-300 text-right">{formatCurrency(tx.quantity * tx.price)}</TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-sm text-slate-400 text-right">{formatCurrency(tx.fees)}</TableCell>
                <TableCell className="px-4 py-3 whitespace-nowrap text-sm font-medium text-center">
                   <div className="flex justify-center items-center space-x-1">
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-sky-400" onClick={() => handleEdit(tx)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Editar Transacción</span>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                             <span className="sr-only">Eliminar Transacción</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-900 border-slate-700 text-foreground">
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente la transacción de tu historial.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(tx.id)} className="bg-red-600 hover:bg-red-700">
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                   </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {selectedTransaction && (
        <EditTransactionDialog
          isOpen={isEditDialogOpen}
          setIsOpen={setIsEditDialogOpen}
          transaction={selectedTransaction}
          onUpdateTransaction={onUpdateTransaction}
        />
      )}
    </>
  );
};

export default TransactionHistoryTable;
