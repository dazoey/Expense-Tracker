// File: budget-tracker-backend/src/controllers/transactionController.js
import { supabase } from '../config/supabase.js';

// --- Get All Transactions ---
export const getAllTransactions = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Get Transaction By ID ---
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Create Transaction (DENGAN LOGIKA CEK SALDO) ---
export const createTransaction = async (req, res) => {
  try {
    const { type, category, amount, description } = req.body;

    // 1. Validasi Input
    if (!type || !category || !amount) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type, category, and amount are required' 
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type must be either income or expense' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Amount must be greater than 0' 
      });
    }

    // 2. Cek Saldo jika tipe adalah Pengeluaran
    if (type === 'expense') {
      const { data: allTransactions, error: balanceError } = await supabase
        .from('transactions')
        .select('type, amount');

      if (balanceError) throw balanceError;

      // Hitung saldo saat ini
      const currentBalance = allTransactions.reduce((acc, curr) => {
        const val = parseFloat(curr.amount);
        return curr.type === 'income' ? acc + val : acc - val;
      }, 0);

      // Tolak jika saldo kurang
      if (parseFloat(amount) > currentBalance) {
        return res.status(400).json({ 
          success: false, 
          message: 'Transaksi ditolak: Saldo tidak mencukupi' 
        });
      }
    }

    // 3. Simpan ke Database
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ type, category, amount, description }])
      .select();

    if (error) throw error;

    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Update Transaction ---
export const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, category, amount, description } = req.body;

    const updateData = {};
    if (type) updateData.type = type;
    if (category) updateData.category = category;
    if (amount) updateData.amount = amount;
    if (description !== undefined) updateData.description = description;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No fields to update' 
      });
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Delete Transaction (INI YANG SEBELUMNYA HILANG) ---
export const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- Get Summary ---
export const getTransactionsSummary = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount');

    if (error) throw error;

    const summary = data.reduce((acc, transaction) => {
      if (transaction.type === 'income') {
        acc.totalIncome += parseFloat(transaction.amount);
      } else {
        acc.totalExpense += parseFloat(transaction.amount);
      }
      return acc;
    }, { totalIncome: 0, totalExpense: 0 });

    summary.balance = summary.totalIncome - summary.totalExpense;

    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};