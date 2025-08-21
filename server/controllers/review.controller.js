import Book from "../models/Book.js";
import Review from "../models/Review.js";
import { buildQueryOptions } from "../utils/queryHelper.js";

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
      reviews.reduce((acc, r) => acc + r.rating, 0) / review.length;
    book.averageRating = Number(avgRating.toFixed(1));
    await book.save();
    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getReviews = async (req, res) => {
  try {
    const { minRating, maxRating, ...queryWithoutRating } = req.query;
    const { bookId } = req.params;
    // BookId is must:
    if (!bookId) {
      return res.status(400).json({ message: "bookId is required" });
    }

    const { filters, options, page, limit } =
      buildQueryOptions(queryWithoutRating);
    filters.book = bookId;
    if (minRating || maxRating) {
      filters.rating = filters.rating || {};
      if (minRating) filters.rating.$gte = parseInt(req.query.minRating);
      if (maxRating) filters.rating.$lte = parseInt(req.query.maxRating);
    }

    const reviews = await Review.find(filters)
      .populate("user", "name")
      .populate("book", "title")
      .sort(options.sort)
      .skip(options.skip)
      .limit(options.limit);

    const reviewCount = await Review.countDocuments(filters);

    res.status(200).json({
      reviewCount,
      totalPages: Math.ceil(reviewCount / limit),
      currentPage: page,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
