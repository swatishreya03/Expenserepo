const JWT = require('jsonwebtoken')

module.exports = decoder = (token) => {
    return JWT.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return err
        } else {
            return decoded
        }
    })
}
