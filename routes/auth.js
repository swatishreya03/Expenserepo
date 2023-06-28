const express = require('express');
const router = express();
const Employee = require('../models/employees');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');
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
            status: 402
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
                token: token,
                role: employee.role
            })
        }
        else {
            return res.json({
                message: "Password is incorrect",
                status: 403
            })
        }
    }
    else {
        return res.json({
            message: "Email is not registered with us.",
            status: 403
        })
    }
})

router.post('/register', async (req, res) => {
    let { name, email, password, employeeID, role } = req.body;
    

    name = name
    email = email.toLowerCase().trim()
    password = password.trim()
    employeeID = employeeID.trim()
    role = role.trim().toLowerCase()

    if (validator.isEmpty(name) ||
        validator.isEmpty(email) ||
        validator.isEmpty(password) ||
        validator.isEmpty(employeeID) ||
        validator.isEmpty(role)) {
        return res.json({
            message: "All fields are required",
            status: 401
        })
    } else if (!validator.isEmail(email)) {
        return res.json({
            message: "Email is not valid",
            status: 401
        })
    }

    const emailExists = await Employee.find({ email: email });
    if (emailExists.length > 0) {
        return res.json({
            message: "A user with this email already exists!",
            status: 401
        })
    }

    const pass = await bcrypt.hash(password, 12)

    const employee = new Employee({
        name: name,
        email: email,
        password: pass,
        employeeID: employeeID,
        role: role,
        claims: []
    })

    await employee.save().then(() => {
        return res.json({
            message: "User registered successfully",
            status: 200
        })
    }).catch((err) => {
        return res.json({
            message: "User registration failed: ", err,
            status: 401
        })
    })
})

// Get the role of the employee using token
router.get('/', verifyToken, async (req, res) => {
    const employee = await Employee.findOne({ email: req.user.email });
    return res.json({
        message: "User found",
        status: 200,
        role: employee.role,
        id: employee.employeeID,
        name: employee.name
    })
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