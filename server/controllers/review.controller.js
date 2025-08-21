import Book from "../models/Book.js";
import Review from "../models/Review.js";

export const createReview = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { rating, comment } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Handle duplicate reviews by same user:
    const existingReview = await Review.findOne({
      book: bookId,
      user: req.user.id,
    });

    if (existingReview)
      return res
        .status(400)
        .json({ message: "You already reviewed this book" });

    const review = await Review.create({
      book: bookId,
      user: req.user.id,
      rating,
      comment,
    });

    // Average rating logic:
    const reviews = await Review.find({ book: bookId });
    const avgRating =
      review.reduce((acc, r) => acc + r.rating, 0) / review.length;
    book.averageRating = avgRating.toFixed(1);
    await book.save();
    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const { minRating, maxRating, ...queryWithoutRating } = req.query;
    const { filters, options, page, limit } =
      buildQueryOptions(queryWithoutRating);

    let filter = {};
    if (minRating || maxRating) {
      if (minRating) filters.rating.$gte = parseInt(req.query.minRating);
      if (maxRating) filters.rating.$lte = parseInt(req.query.maxRating);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
