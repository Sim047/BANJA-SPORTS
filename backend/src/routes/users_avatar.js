import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '..', '..', process.env.UPLOAD_DIR || 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, Date.now() + '-' + Math.round(Math.random()*1e9) + ext);
  }
});
const upload = multer({ storage });

const router = express.Router();

router.post('/avatar', auth, upload.single('avatar'), async (req,res)=>{
  try{
    if(!req.file) return res.status(400).json({ success:false, message:'No file uploaded' });
    const filePath = path.join(uploadDir, req.file.filename);
    const outPath = filePath + '-resized.jpg';
    await sharp(filePath).resize({ width: 800 }).jpeg({ quality: 80 }).toFile(outPath);
    try { fs.unlinkSync(filePath); } catch(e){}
    const finalName = '/uploads/' + path.basename(outPath);
    const user = await User.findByIdAndUpdate(req.user.id, { avatar: finalName }, { new: true }).select('-password');
    res.json({ success: true, user });
  }catch(err){
    console.error('[users/avatar] ', err);
    res.status(500).json({ success:false, message: err.message });
  }
});

export default router;