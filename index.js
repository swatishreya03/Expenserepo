const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');

const authRoute = require('./routes/auth')
const claimRoute = require('./routes/claim')
require('dotenv').config()

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(fileUpload());

mongoose.set('strictQuery', true)
mongoose
    .connect(process.env.DBPATH, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
    .then(() => {
        console.log('Connected to MongoDB')
    })
    .catch((error) => {
        console.log('Connection Error', error)
    })

app.get('/', (req, res) => {
    res.json({
        message: "Welcome to the Edudigm Application",
        status: 200
    });
});

app.use('/auth', authRoute);
app.use('/claim', claimRoute);

app.listen(port);