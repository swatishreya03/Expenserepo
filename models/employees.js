const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    employeeID: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    claims: {
        type: Array,
        required: false,
    },
},
    {
        timestamps: false,
        versionKey: false
    }
);

module.exports = mongoose.model('Employee', employeeSchema, 'employees');