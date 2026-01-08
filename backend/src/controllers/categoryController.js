import { supabase } from '../config/supabase.js';

export const getAllCategories = async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = supabase.from('categories').select('*').order('name');
    
    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and type are required' 
      });
    }

    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Type must be either income or expense' 
      });
    }

    const { data, error } = await supabase
      .from('categories')
      .insert([{ name, type }])
      .select();

    if (error) {
      if (error.code === '23505') {
        return res.status(400).json({ 
          success: false, 
          message: 'Category already exists' 
        });
      }
      throw error;
    }

    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};