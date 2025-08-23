import Wishlist from "../models/Wishlist.js";
import Book from "../models/Book.js";

export const addToWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);

    if (!book) return res.status(404), json({ message: "Book not found" });

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        books: [bookId],
      });
    } else {
      if (wishlist.books.includes(bookId)) {
        return res.status(400).json({ message: "Book already in wishlist" });
      }
      wishlist.books.push(bookId);
      await wishlist.save();
    }
    res.status(200).json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { bookId } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    if (!wishlist)
      return res.status(404).json({ message: "Wishlist not found" });
    wishlist.books = wishlist.books.filter((id) => id.toString() !== bookId);
    await wishlist.save();
    res.status(200).json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id }).populate(
      "books",
      "title author coverImage"
    );
    if (!wishlist)
      return res.status(404).json({ message: "Wishlist not found" });

    res.status(200).json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
