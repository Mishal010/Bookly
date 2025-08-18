import Book from "../models/Book.js";

// All books : GET
export const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find(
      {},
      "title author category tags price coverImage averageRating"
    ).sort({ createdAt: -1 });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Single Book : GET
export const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id).populate(
      "createdBy",
      "name email role"
    );
    if (!book) return res.status(404).json({ message: "Book Not Found" });
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Book - PATCH (ADMIN ONLY)
export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    let { tags, coverImage, ...rest } = req.body;

    // Handling tags:
    if (tags) {
      if (typeof tags === "string") {
        tags = tags.split(",").map((tag) => tag.trim());
      }
    }
    // Handling Cover Image:
    if (coverImage !== undefined) {
      coverImage =
        coverImage && coverImage.trim() !== ""
          ? coverImage
          : "https://images.unsplash.com/photo-1621944192383-34519b64a747?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    }

    const updatedBook = await Book.findByIdAndUpdate(
      id,
      {
        // Spreading data:
        ...rest,
        ...(tags && { tags }),
        ...(coverImage !== undefined && { coverImage }),
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedBook)
      return res.status(404).json({ message: "Book not found" });

    res.json({ message: "Book updated successfully", book: updatedBook });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating book", error: error.message });
  }
};

// Delete book : DELETE (ADMIN ONLY)
export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBook = await Book.findByIdAndDelete(id);
    if (!deletedBook)
      return res.status(404).json({ message: "Book not found" });
    res.json({ message: "Book deleted successfully", book: deletedBook });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting book", error: error.message });
  }
};

// Create book : POST (ADMIN ONLY)
export const createBook = async (req, res) => {
  try {
    const {
      title,
      author,
      description,
      category,
      tags,
      price,
      stock,
      coverImage,
    } = req.body;

    if (!title || !author || !description || !category || !price || !stock)
      return res.status(400).json({ message: "Missing required fields" });
    const book = await Book.create({
      title,
      author,
      description,
      category,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      price,
      stock,
      createdBy: req.user.id,
      coverImage:
        coverImage && coverImage.trim() !== ""
          ? coverImage
          : "https://images.unsplash.com/photo-1621944192383-34519b64a747?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    });
    res.status(201).json(book);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating book", error: error.message });
  }
};
