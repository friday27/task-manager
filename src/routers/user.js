const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');
const User = require('../models/user');

router.post('/user', async(req, res) => {
  const user = new User(req.body); 
  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({user, token});
  } catch(e) {
    res.status(400).send({error: e.message});
  }
});

router.post('/user/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    await user.save();
    res.send({user, token});
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post('/users/logout', auth, async (req, res) => {
  try {
      req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
      await req.user.save();
      res.send();
  } catch (e) {
      res.status(500).send();
  }
});

router.patch('/user', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) return res.status(400).send({error: 'Invalid updates!'});
  
  try {
      updates.forEach((update) => req.user[update] = req.body[update]);
      await req.user.save();
      res.send(req.user);
  } catch (e) {
      res.send(400).send();
  }
});

router.delete('/user', auth, async (req, res) => {
  try {
    await User.destroy({
      where: {
        name: req.user.name
      }
    });
    res.send();
  } catch (e) {
    res.status(400).send({error: e.message});
  }
});

module.exports = router;