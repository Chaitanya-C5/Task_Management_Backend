import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed', 'archived'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > new Date();
      },
      message: 'Due date must be in the future'
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  estimatedHours: {
    type: Number,
    min: [0, 'Estimated hours cannot be negative'],
    max: [1000, 'Estimated hours cannot exceed 1000']
  },
  actualHours: {
    type: Number,
    min: [0, 'Actual hours cannot be negative'],
    default: 0
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, priority: 1 });
taskSchema.index({ user: 1, dueDate: 1 });
taskSchema.index({ user: 1, category: 1 });
taskSchema.index({ user: 1, tags: 1 });
taskSchema.index({ title: 'text', description: 'text' });

taskSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'completed' && !this.completedAt) {
      this.completedAt = new Date();
    } else if (this.status !== 'completed') {
      this.completedAt = null;
    }
  }
  next();
});

taskSchema.post('save', async function() {
  if (this.category) {
    try {
      const Category = mongoose.model('Category');
      await Category.findByIdAndUpdate(this.category, { $inc: { taskCount: 1 } });
    } catch (error) {
      console.error('Error updating category task count:', error);
    }
  }
});

taskSchema.post('remove', async function() {
  if (this.category) {
    try {
      const Category = mongoose.model('Category');
      await Category.findByIdAndUpdate(this.category, { $inc: { taskCount: -1 } });
    } catch (error) {
      console.error('Error updating category task count:', error);
    }
  }
});

taskSchema.statics.findByUser = function(userId, filters = {}) {
  const query = { user: userId };
  
  if (filters.status) {
    query.status = Array.isArray(filters.status) 
      ? { $in: filters.status } 
      : filters.status;
  }
  
  if (filters.priority) {
    query.priority = Array.isArray(filters.priority) 
      ? { $in: filters.priority } 
      : filters.priority;
  }
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  
  if (filters.dueDate) {
    const dateQuery = {};
    if (filters.dueDate.gte) dateQuery.$gte = new Date(filters.dueDate.gte);
    if (filters.dueDate.lte) dateQuery.$lte = new Date(filters.dueDate.lte);
    if (Object.keys(dateQuery).length > 0) {
      query.dueDate = dateQuery;
    }
  }
  
  return this.find(query);
};

taskSchema.methods.canTransitionTo = function(newStatus) {
  const validTransitions = {
    'todo': ['in-progress', 'archived'],
    'in-progress': ['todo', 'completed', 'archived'],
    'completed': ['in-progress', 'archived'],
    'archived': []
  };
  
  return validTransitions[this.status].includes(newStatus);
};

const Task = mongoose.model('Task', taskSchema);

export default Task;
