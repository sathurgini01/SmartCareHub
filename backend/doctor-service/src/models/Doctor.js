const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false
    },
    specialization: {
      type: String,
      required: function () {
        return this.role !== 'admin';
      },
      trim: true
    },
    licenseNumber: {
      type: String,
      required: function () {
        return this.role !== 'admin';
      },
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true
    },
    experience: {
      type: Number,
      required: function () {
        return this.role !== 'admin';
      },
      min: 0
    },
    hospital: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      trim: true,
      default: ''
    },
    bio: {
      type: String,
      trim: true,
      default: ''
    },
    profileImage: {
      type: String,
      trim: true,
      default: ''
    },
    title: {
      type: String,
      trim: true,
      default: ''
    },
    accessKey: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: function () {
        return this.role === 'admin' ? 'approved' : 'pending';
      }
    },
    role: {
      type: String,
      enum: ['doctor', 'admin'],
      default: 'doctor'
    }
  },
  {
    timestamps: true
  }
);

doctorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

doctorSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('Doctor', doctorSchema);
