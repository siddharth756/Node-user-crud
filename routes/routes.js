const express = require('express')
const router = express.Router()
const User = require('../models/users')
const multer = require('multer')
const fs = require('fs')

// image upload middleware
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
})

var upload = multer({
    storage: storage
}).single("image")


// get all user route
router.get('/', async (req, res) => {
    try {
        const users = await User.find()
        res.render('index', { title: "Home | Page", users: users })
    } catch (err) {
        res.json({ message: err.message })
    }
})

// add user form
router.get('/add', (req, res) => {
    res.render('add_user', { title: "Add User" })
})

// insert an user into database route
router.post('/add', upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename
        });

        await user.save()
        req.session.message = {
            type: "success",
            message: 'User added successfully.'
        };

        res.redirect("/");

    } catch (err) {
        res.json({ message: err.message, type: 'danger' })
    }
})

// Edit user route
router.get('/edit/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user == null) {
            res.redirect('/')
        } else {
            res.render('edit_user', { title: "Edit User", user: user })
        }
    } catch (err) {
        res.redirect('/')
    }
})

// Update user route 
router.post('/update/:id', upload, async (req, res) => {
    const id = req.params.id;
    let newImage = null;
    if (req.file) {
        newImage = req.file.filename;
        try {
            fs.unlinkSync('./uploads/' + req.body.old_image)
        } catch (err) {
            console.log(err)
        }
    } else {
        newImage = req.body.old_image;
    }
    try {
        await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: newImage
        })
        req.session.message = {
            type: 'success',
            message: 'User updated successfully.'
        }
        res.redirect('/')
    } catch (err) {
        res.json({
            type: 'danger',
            message: err.message
        })
    }
})


// delete user route 
router.get('/delete/:id', async (req, res) => {
    let id = req.params.id;
    try {
        let user = await User.findByIdAndDelete(id);
        if (user.image != '') {
            try {
                fs.unlinkSync('./uploads/' + user.image)
            } catch (err) {
                console.log(err)
            }
        }
        req.session.message = {
            type: 'info',
            message: 'User deleted successfully.'
        }
        res.redirect('/')
    } catch (err) {
         res.json({
            message: err.message
         })
    }
})


module.exports = router;