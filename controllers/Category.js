import { validationResult } from 'express-validator';
import Category from '../models/Category.js';
import Task from '../models/Task.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findByUser(req.user.id);

    res.json({
      success: true,
      data: {
        categories: categories.map(category => ({
          id: category._id,
          name: category.name,
          color: category.color,
          taskCount: category.taskCount,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt
        }))
      }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, color } = req.body;

    const existingCategory = await Category.findOne({ 
      user: req.user.id, 
      name: name.trim() 
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = new Category({
      name: name.trim(),
      color,
      user: req.user.id
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: {
        category: {
          id: category._id,
          name: category.name,
          color: category.color,
          taskCount: category.taskCount,
          createdAt: category.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await Task.updateMany(
      { category: category._id },
      { category: null }
    );

    await category.remove();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
