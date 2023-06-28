const express = require('express');
const router = express();
const Employee = require('../models/employees');
const Claim = require('../models/claims');
const verifyToken = require('../middleware/verifyToken');
const validator = require('validator');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        if (file.fieldname === 'invoice') {
            callback(null, path.join(__dirname, '../uploads/invoices'));
        }
        else if (file.fieldname === 'mail') {
            callback(null, path.join(__dirname, '../uploads/mails'));
        }
    },
    filename: (req, file, callback) => {
        const name = Date.now() + '-' + file.originalname.split(' ').join('-');
        callback(null, name);
    }
});

const fileFilter = (req, file, callback) => {
    if (file.fieldname === 'invoice') {
        file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'application/pdf' ? callback(null, true) : callback(null, false);
    }
    else if (file.fieldname === 'mail') {
        file.mimetype === 'application/pdf' ? callback(null, true) : callback(null, false);
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
}).fields([
    { name: 'invoice', maxCount: 1 },
    { name: 'mail', maxCount: 1 }
]);

router.post('/add-claim', upload, async (req, res) => {
    const { employeeID, claimAmount, category, travel, otherCategory, name } = req.body;
    console.log(req.files.invoice[0].mimetype, req.files.mail[0].mimetype)
    if (validator.isEmpty(employeeID) || validator.isEmpty(claimAmount) || validator.isEmpty(category)) {
        return res.json({
            message: "Employee ID, Claim Amount and Category are required",
            status: 401
        })
    }

    if (category === 'travel') {
        if (validator.isEmpty(travel)) {
            return res.json({
                message: "Travel Details are required",
                status: 401
            })
        }
    }

    if (category === 'other') {
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

    if (!req.files.invoice) {
        return res.status(400).json({ message: 'Invoice is required.' });
    }

    if (!req.files.mail) {
        return res.status(400).json({ message: 'Mail is required.' });
    }

    if (req.files.invoice[0].mimetype !== 'image/jpeg' && req.files.invoice[0].mimetype !== 'image/png' && req.files.invoice[0].mimetype !== 'application/pdf') {
        return res.status(400).json({ message: 'Invoice must be an image or pdf.' });
    }

    if (req.files.mail[0].mimetype !== 'application/pdf') {
        return res.status(400).json({ message: 'Mail must be a pdf.' });
    }

    const invoiceName = req.files.invoice[0].filename;
    const mailName = req.files.mail[0].filename;

    console.log(req.files.invoice[0])
    console.log(req.files.mail[0])

    const claim = new Claim({
        employeeID: employeeID,
        claimAmount: claimAmount,
        category: category,
        travel: travel,
        otherCategory: otherCategory,
        invoice: invoiceName,
        mail: mailName,
        name: name
    })

    await claim.save()
        .then(() => {
            return res.json({
                message: "Claim added successfully",
                status: 200,
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

router.get('/download-invoice/:id', async (req, res) => {
    const claim = await Claim.findById(req.params.id)
    const file = path.join(__dirname, '../uploads/invoices/' + claim.invoice);
    res.download(file);
})

router.get('/download-mail/:id', async (req, res) => {
    const claim = await Claim.findById(req.params.id)
    const file = path.join(__dirname, '../uploads/mails/' + claim.mail);
    res.download(file);
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
    const claims = await Claim.find({ statusAM: true, rejected: false })

    return res.json({
        message: "Claims fetched successfully",
        status: 200,
        claims: claims
    })
})

/*router.get('/get-employee-claims-admin/', verifyToken, async (req, res) => {
    const claims = await Claim.find({rejected: false})
 
    return res.json({
        message: "Claims fetched successfully",
        status: 200,
        claims: claims
    })
})
*/
router.get('/get-employee-claims-am/', verifyToken, async (req, res) => {
    const claims = await Claim.find({ rejected: false })

    return res.json({
        message: "Claims fetched successfully",
        status: 200,
        claims: claims
    })
})

router.get('/get-employee-claims-accounts/', verifyToken, async (req, res) => {
    const claims = await Claim.find({ statusAM: true, statusHR: true, rejected: false } || { statusAdmin: true, approvedAd: true })

    return res.json({
        message: "Claims fetched successfully",
        status: 200,
        claims: claims
    })
})
router.put('/accept-am/:id', verifyToken, async (req, res) => {
    console.log('running')
    const claim = await Claim.findById(req.params.id)
    claim.statusAM = true
    claim.approvedAm = true
    await claim.save()
    return res.json({
        message: "Claim updated successfully",
        status: 200,
    })
})


router.put('/accept-hr/:id', verifyToken, async (req, res) => {
    const claim = await Claim.findById(req.params.id)
    claim.statusHR = true;
    claim.approved = true;
    await claim.save()
    return res.json({
        message: "Claim updated successfully",
        status: 200,
    })
})
router.put('/accept-admin/:id', verifyToken, async (req, res) => {
    const claim = await Claim.findById(req.params.id)
    claim.statusAdmin = true
    claim.approvedAd = true;
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
router.put('/reject-admin/:id', verifyToken, async (req, res) => {
    const claim = await Claim.findById(req.params.id)
    claim.statusAdmin = true
    claim.rejectedAd = true
    await claim.save()
    return res.json({
        message: "Claim updated successfully",
        status: 200,
    })
})

router.put('/reject-am/:id', verifyToken, async (req, res) => {
    const claim = await Claim.findById(req.params.id)
    claim.statusAM = true
    claim.rejectedAm = true
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
    await claim.save()
    return res.json({
        message: "Claim updated successfully",
        status: 200,
    })
})



router.post


module.exports = router;