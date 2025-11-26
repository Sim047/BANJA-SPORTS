import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/register', async (req,res)=>{
  try{
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) return res.status(400).json({ message: 'User exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hash });
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET);
    res.json({ user: { _id: user._id, username: user.username, email: user.email, avatar: user.avatar }, token });
  }catch(err){
    console.error('[auth/register] ', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req,res)=>{
  try{
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET);
    res.json({ user: { _id: user._id, username: user.username, email: user.email, avatar: user.avatar }, token });
  }catch(err){
    console.error('[auth/login] ', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
