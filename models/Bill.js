const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  id: String,
  name: String,
  price: Number,
  quantity: Number
}, { _id: false });

const billSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  billNumber: {
    type: String,
    required: true,
    unique: true
  },
  items: [billItemSchema],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  customerName: {
    type: String,
    default: ''
  },
  customerPhone: {
    type: String,
    default: ''
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'online'],
    default: 'cash'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bill', billSchema);


