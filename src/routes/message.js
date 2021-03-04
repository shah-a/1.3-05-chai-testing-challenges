const express = require('express')
const router = express.Router();

const User = require('../models/user')
const Message = require('../models/message')

/** Route to get all messages. */
router.get('/', (req, res) => {
    Message.find().then(messages => {
        return res.json({messages})
    })
    .catch(err => {
        throw err.message
    })
})

/** Route to get one message by id. */
router.get('/:messageId', (req, res) => {
    Message.findById(req.params.messageId).then(message => {
        return res.json({message})
    })
    .catch(err => {
        throw err.message
    })
})

/** Route to add a new message. */
router.post('/', (req, res) => {
    const message = new Message(req.body)
    message.save()
    .then(message => {
        return User.findById(message.author)
    })
    .then(user => {
        user.messages.unshift(message)
        return user.save()
    })
    .then(() => {
        return res.send(message)
    })
    .catch(err => {
        throw err.message
    })
})

/** Route to update an existing message. */
router.put('/:messageId', (req, res) => {
    Message.findByIdAndUpdate(req.params.messageId, req.body)
        .then(message => {
            return res.json({message})
        })
        .catch(err => {
            throw err.message
        })
})

/** Route to delete a message. */
router.delete('/:messageId', (req, res) => {
    Message.findByIdAndDelete(req.params.messageId)
        .then(() => {
            return res.json({
                'message': 'Successfully deleted',
                '_id': req.params.messageId
            })
        })
        .catch(err => {
            throw err.message
        })
})

module.exports = router