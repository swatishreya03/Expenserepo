const express = require('express');
const router = express();
const Employee = require('../models/employees');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const decoder = require('../middleware/decoder');
const validator = require('validator');

router.post('/login', async (req, res) => {
    let { email, password } = req.body;

    email = email.toLowerCase()
    email = email.toLowerCase().trim()
    password = password.trim()

    if (validator.isEmpty(email) || validator.isEmpty(password)) {
        return res.json({
            message: "Email and Password are required",
            status: 401
        })
    } else if (!validator.isEmail(email)) {
        return res.json({
            message: "Email is not valid",
            status: 401
        })
    }

    const employee = await Employee.findOne({ email: email });

    if (employee) {
        const passMatch = await bcrypt.compare(password, employee.password)

        if (passMatch) {
            const token = getToken(employee)
            return res.json({
                message: "Login Successfull",
                status: 200,
                token: token
            })
        }
        else {
            return res.json({
                message: "Password is incorrect",
                status: 401
            })
        }
    }
})

const getToken = (employee) => {
    return jwt.sign(
        {
            id: employee.empID,
            email: employee.email,
            name: employee.name,
            role: employee.role,
        },
        process.env.SECRET
    )
}

module.exports = router;