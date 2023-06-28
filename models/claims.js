const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
    employeeID: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    otherCategory: {
        type: String,
        default: '',
    },
    travel: {
        type: Object,
    },
    claimDate: {
        type: String,
        default: new Date().toLocaleDateString(),
    },
    
    claimAmount: {
        type: Number,
        default: 0,
        required: true,
    },
    rejected: {
        type: Boolean,
        default: false,
    },
    rejectedAd: {
        type: Boolean,
        default: false,
    },
    rejectedAm: {
        type: Boolean,
        default: false,
    },
    statusHR: {
        type: Boolean,
        default: false,
    },
    statusAdmin: {
        type: Boolean,
        default: false,
    },
    statusAM: {
        type: Boolean,
        default: false,
    },
    paid: {
        type: Boolean,
        default: false,
    },
    approved: {
        type: Boolean,
        default: false,
    },
    approvedAd: {
        type: Boolean,
        default: false,
    },
    approvedAm: {
        type: Boolean,
        default: false,
    },
    invoice: {
        type: Buffer,
        default: null,
    },
    mail: {
        type: Buffer,
        default: null,
    }
});

module.exports = mongoose.model('Claim', claimSchema, 'claims');