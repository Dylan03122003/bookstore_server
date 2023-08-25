import multer from 'multer';
import AppError from '../util/AppError.js';
import Book from './../models/bookModel.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/books');
  },
  filename: (req, file, cb) => {
    const extension = file.mimetype.split('/')[1];

    cb(null, `book-${req.user._id}-${Date.now()}.${extension}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image file please upload image files'), false);
  }
};

const upload = multer({ storage, fileFilter: multerFilter });

export const uploadBookImage = upload.single('image');

export async function createBook(req, res, next) {
  const newBook = { ...req.body, image: req.file.filename, categories: req.body.categories.split(', ') };
  try {
    const book = await Book.create(newBook);

    res.status(201).json({ status: 'success', book });
  } catch (error) {
    return next(error);
  }
}

export async function getAllBooks(req, res, next) {
  try {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = limit * (page - 1);

    const totalBooks = await Book.countDocuments();

    const books = await Book.find().skip(skip).limit(limit);
    res.status(200).json({ status: 'success', totalBooks, result: books.length, books });
  } catch (error) {
    return next(error);
  }
}

export async function getABook(req, res, next) {
  const { bookID } = req.params;
  try {
    const book = await Book.findById(bookID).populate('reviews');

    res.status(200).json({ status: 'success', book });
  } catch (error) {
    return next(error);
  }
}

export async function updateBook(req, res, next) {
  try {
    const { bookID } = req.params;
    let updatedBook;
    if (req.file) {
      updatedBook = { ...req.body, image: req.file.filename, categories: req.body.categories.split(', ') };
    } else {
      const book = await Book.findById(bookID);
      updatedBook = { ...req.body, image: book.image, categories: req.body.categories.split(', ') };
    }

    const book = await Book.findByIdAndUpdate(bookID, updatedBook, {
      new: true,
      runValidators: true,
    });

    if (!book) {
      return next(new AppError('No book found with that id', 404));
    }

    res.status(200).json({ status: 'success', book });
  } catch (error) {
    next(error);
  }
}

export async function deleteBook(req, res, next) {
  try {
    const { bookID } = req.params;
    const book = await Book.findByIdAndDelete(bookID);

    if (!book) {
      return next(new AppError('No book found with that id', 404));
    }

    res.status(204).json({ status: 'success' });
  } catch (error) {
    next(error);
  }
}
