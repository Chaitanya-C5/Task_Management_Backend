import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Category from '../models/Category.js';

export const createTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, priority, dueDate, category, tags, estimatedHours } = req.body;

    if (category) {
      const categoryDoc = await Category.findOne({ _id: category, user: req.user.id });
      if (!categoryDoc) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
    }

    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      category,
      tags,
      estimatedHours,
      user: req.user.id
    });

    await task.save();
    await task.populate('category', 'name color');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: {
        task: {
          id: task._id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          tags: task.tags,
          estimatedHours: task.estimatedHours,
          user: task.user,
          createdAt: task.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getTasks = async (req, res) => {
  try {
    const {
      status,
      priority,
      category,
      search,
      dueDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filters = {};
    if (status) filters.status = status.split(',');
    if (priority) filters.priority = priority.split(',');
    if (category) filters.category = category;
    if (search) filters.search = search;
    if (dueDate) {
      filters.dueDate = {};
      if (dueDate.includes('[gte]')) {
        filters.dueDate.gte = dueDate.split('[gte]=')[1]?.split('&')[0];
      }
      if (dueDate.includes('[lte]')) {
        filters.dueDate.lte = dueDate.split('[lte]=')[1]?.split('&')[0];
      }
    }

    const skip = (page - 1) * limit;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const tasks = await Task.findByUser(req.user.id, filters)
      .populate('category', 'name color')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments({ user: req.user.id, ...Task.findByUser(req.user.id, filters).getQuery() });

    const stats = await Task.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const statsMap = {
      todo: 0,
      'in-progress': 0,
      completed: 0,
      archived: 0
    };

    stats.forEach(stat => {
      statsMap[stat._id] = stat.count;
    });

    res.json({
      success: true,
      data: {
        tasks: tasks.map(task => ({
          id: task._id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          category: task.category,
          tags: task.tags,
          estimatedHours: task.estimatedHours,
          actualHours: task.actualHours,
          completedAt: task.completedAt,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt
        })),
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        },
        stats: statsMap
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id })
      .populate('category', 'name color');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: {
        task: {
          id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          category: task.category,
          tags: task.tags,
          estimatedHours: task.estimatedHours,
          actualHours: task.actualHours,
          completedAt: task.completedAt,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateTask = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { title, description, priority, dueDate, category, tags, estimatedHours, actualHours } = req.body;

    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (category) {
      const categoryDoc = await Category.findOne({ _id: category, user: req.user.id });
      if (!categoryDoc) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category'
        });
      }
    }

    const oldCategory = task.category;
    
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (category !== undefined) task.category = category;
    if (tags !== undefined) task.tags = tags;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (actualHours !== undefined) task.actualHours = actualHours;

    await task.save();
    await task.populate('category', 'name color');

    if (oldCategory !== category) {
      if (oldCategory) {
        await Category.findByIdAndUpdate(oldCategory, { $inc: { taskCount: -1 } });
      }
      if (category) {
        await Category.findByIdAndUpdate(category, { $inc: { taskCount: 1 } });
      }
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: {
        task: {
          id: task._id,
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          category: task.category,
          tags: task.tags,
          estimatedHours: task.estimatedHours,
          actualHours: task.actualHours,
          completedAt: task.completedAt,
          updatedAt: task.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await task.remove();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status } = req.body;

    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    if (!task.canTransitionTo(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${task.status} to ${status}`
      });
    }

    task.status = status;
    await task.save();

    res.json({
      success: true,
      message: 'Task status updated',
      data: {
        task: {
          id: task._id,
          status: task.status,
          completedAt: task.completedAt,
          updatedAt: task.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update task status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const updateTaskPriority = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { priority } = req.body;

    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }
    
    task.priority = priority;
    await task.save();

    res.json({
      success: true,
      message: 'Task priority updated',
      data: {
        task: {
          id: task._id,
          priority: task.priority,
          updatedAt: task.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Update task priority error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
