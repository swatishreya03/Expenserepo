const express = require('express');
const router = express();
const Employee = require('../models/employees');
const Claim = require('../models/claims');
const verifyToken = require('../middleware/verifyToken');
const validator = require('validator');

router.post('/add-claim', async (req, res) => {
    const { employeeID, claimAmount, category, travel, otherCategory } = req.body;

    if (validator.isEmpty(employeeID) || validator.isEmpty(claimAmount) || validator.isEmpty(category)) {
        return res.json({
            message: "Employee ID, Claim Amount and Category are required",
            status: 401
        })
    }

    if (category === 'Travel') {
        if (validator.isEmpty(travel)) {
            return res.json({
                message: "Travel Details are required",
                status: 401
            })
        }
    }

    if (category === 'Other') {
        if (validator.isEmpty(otherCategory)) {
            return res.json({
                message: "Other Category Details are required",
                status: 401
            })
        }
    }

    if (!req.files) {
        return res.status(400).json({ message: 'No files were uploaded.' });
    }

    const invoiceFile = req.files.invoice;
    const invoiveData = invoiceFile.data;
    const binaryInvoice = new Buffer.from(invoiveData).toString('base64');

    const mailFile = req.files.mail;
    const mailData = mailFile.data;
    const binaryMail = new Buffer.from(mailData).toString('base64');

    const claim = new Claim({
        employeeID: employeeID,
        claimAmount: claimAmount,
        category: category,
        travel: travel,
        otherCategory: otherCategory,
        invoice: binaryInvoice,
        mail: binaryMail
    })

    claim.save()
        .then((data) => {
            return res.json({
                message: "Claim added successfully",
                status: 200,
                claim: data
            })
        })
        .catch((err) => {
            return res.json({
                message: "Error in adding claim",
                status: 403,
                error: err
            })
        })
})


router.get('/get-all-claims', verifyToken, async (req, res) => {
    const claims = await Claim.find()
    return res.json({
        message: "Claims fetched successfully",
        status: 200,
        claims: claims
    })
})

router.get('/get-claim/:id', verifyToken, async (req, res) => {
    const claim = await Claim.findById(req.params.id)
    return res.json({
        message: "Claim fetched successfully",
        status: 200,
        claim: claim
    })
})

router.get('/get-employee-claims/:id', verifyToken, async (req, res) => {
    const claims = await Claim.find({ employeeID: req.params.id })
    return res.json({
        message: "Claims fetched successfully",
        status: 200,
        claims: claims
    })
})

router.get('/get-employee-claims-hr/', verifyToken, async (req, res) => {
    const claims = await Claim.find({ statusHR: false, statusAM: true, rejected: false })

    return res.json({
        message: "Claims fetched successfully",
        status: 200,
        claims: claims
    })
})

router.get('/get-employee-claims-am/', verifyToken, async (req, res) => {
    const claims = await Claim.find({ statusAM: false })

    return res.json({
        message: "Claims fetched successfully",
        status: 200,
        claims: claims
    })
})

router.get('/get-employee-claims-accounts/', verifyToken, async (req, res) => {
    const claims = await Claim.find({ statusAM: true, statusHR: true, rejected: false, paid: false })

    return res.json({
        message: "Claims fetched successfully",
        status: 200,
        claims: claims
    })
})

router.put('/accept-hr/:id', verifyToken, async (req, res) => {
    const claim = await Claim.findById(req.params.id)
    claim.statusHR = true
    await claim.save()
    return res.json({
        message: "Claim updated successfully",
        status: 200,
    })
})

router.put('/accept-am/:id', verifyToken, async (req, res) => {
    console.log('running')
    const claim = await Claim.findById(req.params.id)
    claim.statusAM = true
    await claim.save()
    return res.json({
        message: "Claim updated successfully",
        status: 200,
    })
})

router.put('/reject-hr/:id', verifyToken, async (req, res) => {
    const claim = await Claim.findById(req.params.id)
    claim.statusHR = true
    claim.rejected = true
    await claim.save()
    return res.json({
        message: "Claim updated successfully",
        status: 200,
    })
})

router.put('/reject-am/:id', verifyToken, async (req, res) => {
    const claim = await Claim.findById(req.params.id)
    claim.statusAM = true
    claim.rejected = true
    await claim.save()
    return res.json({
        message: "Claim updated successfully",
        status: 200,
    })
})

router.put('/reject-accounts/:id', verifyToken, async (req, res) => {
    const claim = await Claim.findById(req.params.id)
    claim.rejected = true
    await claim.save()
    return res.json({
        message: "Claim updated successfully",
        status: 200,
    })
})

router.put('/mark-paid/:id', verifyToken, async (req, res) => {
    const claim = await Claim.findById(req.params.id)
    claim.paid = true
    claim.approved = true
    await claim.save()
    return res.json({
        message: "Claim updated successfully",
        status: 200,
    })
})



router.post


module.exports = router;