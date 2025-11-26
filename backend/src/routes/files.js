import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sharp from 'sharp';

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

router.post('/upload', upload.single('file'), async (req,res)=>{
  try{
    if(!req.file) return res.status(400).json({ message:'No file' });
    const filePath = path.join(uploadDir, req.file.filename);
    const ext = path.extname(req.file.filename).toLowerCase();
    let finalName = req.file.filename;
    if (['.png','.jpg','.jpeg','.webp'].includes(ext)) {
      const out = filePath + '-resized.jpg';
      await sharp(filePath).resize({ width: 1200 }).jpeg({ quality: 80 }).toFile(out);
      try { fs.unlinkSync(filePath); } catch(e){}
      finalName = path.basename(out);
    }
    res.json({ url: '/uploads/' + finalName });
  }catch(err){
    console.error('[files/upload] ', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
