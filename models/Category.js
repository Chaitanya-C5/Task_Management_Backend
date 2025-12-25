import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  taskCount: {
    type: Number,
    default: 0,
    min: [0, 'Task count cannot be negative']
  }
}, {
  timestamps: true
});

categorySchema.index({ user: 1, name: 1 }, { unique: true });

categorySchema.methods.incrementTaskCount = function() {
  this.taskCount += 1;
  return this.save();
};

categorySchema.methods.decrementTaskCount = function() {
  if (this.taskCount > 0) {
    this.taskCount -= 1;
  }
  return this.save();
};

categorySchema.statics.findByUser = function(userId) {
  return this.find({ user: userId }).sort({ name: 1 });
};

const Category = mongoose.model('Category', categorySchema);

export default Category;
