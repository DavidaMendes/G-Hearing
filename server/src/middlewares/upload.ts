import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const extension = path.extname(file.originalname);
		cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
	}
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
	if (file.mimetype.startsWith('video/')) {
		cb(null, true);
	} else {
		cb(new Error('Apenas arquivos de vídeo são permitidos!'));
	}
};

export const upload = multer({
	storage: storage,
	fileFilter: fileFilter,
	limits: {
		fileSize: 500 * 1024 * 1024,
		files: 1
	}
});

export const uploadVideo = upload.single('video');
