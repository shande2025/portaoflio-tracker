
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { format } from 'date-fns';

const EditTransactionDialog = ({ isOpen, setIsOpen, transaction, onUpdateTransaction }) => {
  const [assetNameInput, setAssetNameInput] = useState('');
  const [assetType, setAssetType] = useState('crypto');
  const [type, setType] = useState('buy');
  const [quantityInput, setQuantityInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [feesInput, setFeesInput] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (transaction) {
      setAssetNameInput(transaction.asset_name || '');
      setAssetType(transaction.asset_type || 'crypto');
      setType(transaction.transaction_type || 'buy');
      setQuantityInput(transaction.quantity?.toString() || '');
      setPriceInput(transaction.price?.toString() || '');
      setDateInput(transaction.date ? format(new Date(transaction.date), 'yyyy-MM-dd') : '');
      setFeesInput(transaction.fees?.toString() || '0');
    }
  }, [transaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!transaction) return;

    const quantity = parseFloat(quantityInput);
    const price = parseFloat(priceInput);
    const fees = feesInput ? parseFloat(feesInput) : 0;

    if (assetNameInput.trim() === '') {
      toast({ title: "Error de Validación", description: "El nombre del activo no puede estar vacío.", variant: "destructive" });
      return;
    }
    if (isNaN(quantity) || quantity <= 0) {
      toast({ title: "Error de Validación", description: "La cantidad debe ser un número positivo.", variant: "destructive" });
      return;
    }
    if (isNaN(price) || price <= 0) {
      toast({ title: "Error de Validación", description: "El precio debe ser un número positivo.", variant: "destructive" });
      return;
    }
    if (isNaN(fees) || fees < 0) {
      toast({ title: "Error de Validación", description: "Las comisiones deben ser un número no negativo.", variant: "destructive" });
      return;
    }
    if (!dateInput) {
        toast({ title: "Error de Validación", description: "La fecha es obligatoria.", variant: "destructive" });
        return;
    }
    
    const updatedFields = {
      asset_name: assetNameInput.toUpperCase().trim(),
      asset_type: assetType,
      transaction_type: type,
      quantity,
      price,
      date: new Date(dateInput).toISOString(),
      fees,
    };
    
    const result = await onUpdateTransaction(transaction.id, updatedFields);
    if (result && !result.error) {
      setIsOpen(false);
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-slate-900 border-slate-700 text-slate-50">
        <DialogHeader>
          <DialogTitle className="text-sky-400">Editar Transacción</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-assetName" className="text-right text-slate-400">Activo</Label>
            <Input id="edit-assetName" value={assetNameInput} onChange={(e) => setAssetNameInput(e.target.value)} className="col-span-3 bg-slate-800 border-slate-600 text-white" placeholder="Ej: BTC, AAPL, EURUSD" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-assetType" className="text-right text-slate-400">Tipo Activo</Label>
            <Select value={assetType} onValueChange={setAssetType}>
              <SelectTrigger id="edit-assetType" className="col-span-3 bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                <SelectItem value="crypto" className="hover:bg-slate-700">Criptomoneda</SelectItem>
                <SelectItem value="stock" className="hover:bg-slate-700">Acción</SelectItem>
                <SelectItem value="forex" className="hover:bg-slate-700">Divisa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-type" className="text-right text-slate-400">Operación</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="edit-type" className="col-span-3 bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Selecciona operación" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                <SelectItem value="buy" className="hover:bg-slate-700">Compra</SelectItem>
                <SelectItem value="sell" className="hover:bg-slate-700">Venta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-quantity" className="text-right text-slate-400">Cantidad</Label>
            <Input id="edit-quantity" type="number" step="any" value={quantityInput} onChange={(e) => setQuantityInput(e.target.value)} className="col-span-3 bg-slate-800 border-slate-600 text-white" placeholder="Ej: 0.5" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-price" className="text-right text-slate-400">Precio</Label>
            <Input id="edit-price" type="number" step="any" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} className="col-span-3 bg-slate-800 border-slate-600 text-white" placeholder="Precio por unidad" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-date" className="text-right text-slate-400">Fecha</Label>
            <Input id="edit-date" type="date" value={dateInput} onChange={(e) => setDateInput(e.target.value)} className="col-span-3 bg-slate-800 border-slate-600 text-white" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-fees" className="text-right text-slate-400">Comisiones</Label>
            <Input id="edit-fees" type="number" step="any" value={feesInput} onChange={(e) => setFeesInput(e.target.value)} className="col-span-3 bg-slate-800 border-slate-600 text-white" placeholder="Opcional, ej: 2.5" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline" className="text-slate-300 border-slate-600 hover:bg-slate-700 hover:text-white">Cancelar</Button>
            </DialogClose>
            <Button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white">Guardar Cambios</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTransactionDialog;
