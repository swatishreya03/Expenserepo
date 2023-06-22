const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Employee = require('../models/employees')

module.exports = verifyToken = async (req, res, next) => {
    const token = req.headers['authorization']
    try {
        if (!token) {
            return res.json({ status: 410, message: 'No token provided!' })
        }
        jwt.verify(token, '0ffa7a73482f4846bc28cbce1338b540', (err, decoded) => {
            if (err) {
                return res.json({ status: 410, message: 'Invalid Token 1' })
            } else {
                let email = decoded.email
                Employee.findOne({ email: email })
                    .then((data) => {
                        if (data) {
                            req.user = data
                            next()
                        } else {
                            return res.json({ status: 410, message: 'Invalid Token 3' })
                        }
                    })
            }
        })
    } catch (error) {
        return res.json({ status: 500 })
    }
}
