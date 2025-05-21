
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const popularAssets = {
  crypto: [
    { value: "BTC", label: "Bitcoin (BTC)" }, { value: "ETH", label: "Ethereum (ETH)" },
    { value: "USDT", label: "Tether (USDT)" }, { value: "BNB", label: "BNB (BNB)" },
    { value: "SOL", label: "Solana (SOL)" }, { value: "XRP", label: "XRP (XRP)" },
    { value: "ADA", label: "Cardano (ADA)" }, { value: "DOGE", label: "Dogecoin (DOGE)" },
  ],
  stock: [
    { value: "AAPL", label: "Apple Inc. (AAPL)" }, { value: "MSFT", label: "Microsoft Corp. (MSFT)" },
    { value: "GOOGL", label: "Alphabet Inc. (GOOGL)" }, { value: "AMZN", label: "Amazon.com Inc. (AMZN)" },
    { value: "NVDA", label: "NVIDIA Corporation (NVDA)" }, { value: "TSLA", label: "Tesla, Inc. (TSLA)" },
    { value: "META", label: "Meta Platforms, Inc. (META)" }, { value: "JPM", label: "JPMorgan Chase & Co. (JPM)" },
  ],
  forex: [
    { value: "EURUSD", label: "EUR/USD" }, { value: "GBPUSD", label: "GBP/USD" },
    { value: "USDJPY", label: "USD/JPY" }, { value: "AUDUSD", label: "AUD/USD" },
    { value: "USDCAD", label: "USD/CAD" }, { value: "USDCHF", label: "USD/CHF" },
    { value: "NZDUSD", label: "NZD/USD" }, { value: "EURJPY", label: "EUR/JPY" },
  ],
};

const AssetNameInput = ({ value, onChange, assetType, assetList }) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || "");

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const handleSelect = (currentValue) => {
    const upperValue = currentValue.toUpperCase();
    setInputValue(upperValue);
    onChange(upperValue);
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const upperValue = e.target.value.toUpperCase();
    setInputValue(upperValue);
    onChange(upperValue); 
  };
  
  const filteredList = useMemo(() => 
    assetList.filter(item => item.label.toLowerCase().includes(inputValue.toLowerCase())),
  [assetList, inputValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-slate-800 border-slate-600 hover:bg-slate-700 text-white"
        >
          {inputValue
            ? assetList.find((item) => item.value.toLowerCase() === inputValue.toLowerCase())?.label || inputValue
            : "Selecciona o escribe..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-slate-800 border-slate-600">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Buscar ${assetType}...`}
            value={inputValue}
            onValueChange={setInputValue}
            className="text-white"
          />
          <CommandEmpty>No se encontró el activo. Puedes añadirlo igualmente.</CommandEmpty>
          <CommandList>
            {filteredList.map((item) => (
              <CommandItem
                key={item.value}
                value={item.value}
                onSelect={() => handleSelect(item.value)}
                className="text-white hover:bg-slate-700 aria-selected:bg-slate-600"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    inputValue.toLowerCase() === item.value.toLowerCase() ? "opacity-100" : "opacity-0"
                  )}
                />
                {item.label}
              </CommandItem>
            ))}
             {inputValue && !filteredList.some(item => item.value.toLowerCase() === inputValue.toLowerCase()) && (
                <CommandItem
                    key={inputValue}
                    value={inputValue}
                    onSelect={() => handleSelect(inputValue)}
                    className="text-white hover:bg-slate-700 aria-selected:bg-slate-600"
                >
                 <Check className={cn("mr-2 h-4 w-4", "opacity-0")} />
                 Añadir "{inputValue.toUpperCase()}"
                </CommandItem>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};


const AddTransactionForm = ({ onAddTransaction }) => {
  const { toast } = useToast();
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('crypto');
  const [transactionType, setTransactionType] = useState('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fees, setFees] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputMode, setInputMode] = useState('price');

  const assetList = useMemo(() => popularAssets[assetType] || [], [assetType]);

  const resetForm = useCallback(() => {
    setAssetName('');
    setQuantity('');
    setPrice('');
    setTotalCost('');
    setDate(new Date().toISOString().split('T')[0]);
    setFees('');
    setTransactionType('buy');
    setAssetType('crypto');
    setInputMode('price');
  }, []);

  useEffect(() => {
    const q = parseFloat(quantity);
    const p = parseFloat(price);
    if (inputMode === 'price' && !isNaN(q) && !isNaN(p) && q > 0 && p > 0) {
      setTotalCost((q * p).toFixed(2));
    } else if (inputMode === 'price') {
      setTotalCost('');
    }
  }, [quantity, price, inputMode]);

  useEffect(() => {
    const q = parseFloat(quantity);
    const tc = parseFloat(totalCost);
    if (inputMode === 'total' && !isNaN(q) && !isNaN(tc) && q > 0 && tc > 0) {
      setPrice((tc / q).toFixed(8));
    } else if (inputMode === 'total') {
      setPrice('');
    }
  }, [quantity, totalCost, inputMode]);

  const handleInputModeChange = (value) => {
    setInputMode(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const finalQuantity = parseFloat(quantity);
    const finalPrice = parseFloat(price);
    const finalTotalCost = parseFloat(totalCost);
    const parsedFees = fees ? parseFloat(fees) : 0;

    if (!assetName.trim() || isNaN(finalQuantity) || finalQuantity <= 0 || !date || !assetType) {
      toast({ title: "Campos Obligatorios", description: "Activo, cantidad, y fecha son obligatorios.", variant: "destructive" });
      return;
    }
    
    if (inputMode === 'price' && (isNaN(finalPrice) || finalPrice <=0)) {
        toast({ title: "Error de Entrada", description: "Precio unitario debe ser un número positivo.", variant: "destructive"});
        return;
    }
    if (inputMode === 'total' && (isNaN(finalTotalCost) || finalTotalCost <=0)) {
        toast({ title: "Error de Entrada", description: "Costo total debe ser un número positivo.", variant: "destructive"});
        return;
    }

    if (fees && (isNaN(parsedFees) || parsedFees < 0)) {
        toast({ title: "Error de Entrada", description: "Comisiones deben ser un número no negativo.", variant: "destructive" });
        return;
    }
    
    const actualPrice = inputMode === 'price' ? finalPrice : (finalQuantity !== 0 ? (finalTotalCost / finalQuantity) : 0);
     if (isNaN(actualPrice) || actualPrice <= 0) {
      toast({ title: "Error de Cálculo", description: "El precio calculado no es válido. Verifica cantidad y costo total.", variant: "destructive"});
      return;
    }


    const transaction = {
      asset_name: assetName.toUpperCase().trim(),
      asset_type: assetType,
      transaction_type: transactionType,
      quantity: finalQuantity,
      price: actualPrice,
      date,
      fees: parsedFees,
    };

    onAddTransaction(transaction);
    resetForm();
    setIsDialogOpen(false);
  };
  
  const handleAssetTypeChange = (value) => {
    setAssetType(value);
    setAssetName(''); 
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white">
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Transacción
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-700 text-foreground">
        <DialogHeader>
          <DialogTitle>Añadir Nueva Transacción</DialogTitle>
        </DialogHeader>
        <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
             <div className="grid grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="assetType">Tipo Activo</Label>
                    <Select value={assetType} onValueChange={handleAssetTypeChange}>
                      <SelectTrigger id="assetType" className="w-full bg-slate-800 border-slate-600">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600 text-foreground">
                        <SelectItem value="crypto">Criptomoneda</SelectItem>
                        <SelectItem value="stock">Acción</SelectItem>
                        <SelectItem value="forex">Divisa (Par)</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="assetName">
                        {assetType === 'crypto' && "Activo (Ej: BTC)"}
                        {assetType === 'stock' && "Símbolo (Ej: AAPL)"}
                        {assetType === 'forex' && "Par (Ej: EURUSD)"}
                    </Label>
                    <AssetNameInput 
                        value={assetName} 
                        onChange={setAssetName} 
                        assetType={assetType} 
                        assetList={assetList} 
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="type">Operación</Label>
                    <Select value={transactionType} onValueChange={setTransactionType}>
                      <SelectTrigger id="type" className="w-full bg-slate-800 border-slate-600">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600 text-foreground">
                        <SelectItem value="buy">Compra</SelectItem>
                        <SelectItem value="sell">Venta</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                <div>
                    <Label htmlFor="quantity">Cantidad</Label>
                    <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0.00" step="any" className="bg-slate-800 border-slate-600"/>
                </div>
            </div>
            
            <div>
                <Label>Modo de Entrada de Costo</Label>
                <Select value={inputMode} onValueChange={handleInputModeChange}>
                    <SelectTrigger className="w-full bg-slate-800 border-slate-600">
                        <SelectValue placeholder="Seleccionar modo de entrada" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600 text-foreground">
                        <SelectItem value="price">Ingresar Precio Unitario (Costo Total se calcula)</SelectItem>
                        <SelectItem value="total">Ingresar Costo Total (Precio Unitario se calcula)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="price">Precio Unitario</Label>
                    <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" step="any" className="bg-slate-800 border-slate-600" disabled={inputMode === 'total'} />
                </div>
                <div>
                    <Label htmlFor="totalCost">Costo Total</Label>
                    <Input id="totalCost" type="number" value={totalCost} onChange={(e) => setTotalCost(e.target.value)} placeholder="0.00" step="any" className="bg-slate-800 border-slate-600" disabled={inputMode === 'price'} />
                </div>
            </div>

             <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="date">Fecha</Label>
                    <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-slate-800 border-slate-600"/>
                </div>
                <div>
                    <Label htmlFor="fees">Comisiones (Opcional)</Label>
                    <Input id="fees" type="number" value={fees} onChange={(e) => setFees(e.target.value)} placeholder="0.00" step="any" className="bg-slate-800 border-slate-600"/>
                </div>
            </div>

          <DialogFooter>
            <DialogClose asChild>
               <Button type="button" variant="secondary">Cancelar</Button>
            </DialogClose>
            <Button type="submit" className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white">Guardar Transacción</Button>
          </DialogFooter>
        </motion.form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionForm;
