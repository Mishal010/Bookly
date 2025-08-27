import Cart from "../models/Cart.js";
import Book from "../models/Book.js";

// Get all items in cart with sum price : GET
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.book",
      "title price author"
    );
    if (!cart) {
      return res.json({ items: [], totalItems: 0, totalPrice: 0 });
    }

    const totalPrice = cart.items.reduce(
      (acc, item) => acc + item.book.price * item.quantity,
      0
    );

    res.json({
      items: cart.items,
      totalItems: cart.items.length,
      totalPrice,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add items to cart : POST
export const addToCart = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { quantity = 1 } = req.body;

    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.book.toString() === bookId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ book: bookId, quantity });
    }

    await cart.save();
    const popuatedCart = await cart.populate(
      "items.book",
      "title price author"
    );

    const totalPrice = popuatedCart.items.reduce(
      (acc, item) => acc + item.book.price * item.quantity,
      0
    );

    res.status(201).json({
      message: "Item added",
      cart: {
        items: popuatedCart.items,
        totalItems: popuatedCart.items.length,
        totalPrice,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Updating qunatity of item in cart: PATCH
export const updateCartItemQuantity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must me at least 1" });
    }

    const cart = await Cart.findOneAndUpdate(
      { user: userId, "items._id": itemId },
      { $set: { "items.$.quantity": quantity } },
      { new: true }
    ).populate("items.book", "title price author");

    if (!cart) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const totalPrice = cart.items.reduce(
      (acc, item) => acc + item.book.price * item.quantity,
      0
    );

    res.status(200).json({
      message: "Quantity updated",
      cart: {
        items: cart.items,
        totalItems: cart.items.length,
        totalPrice,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove an item from cart : DELETE
export const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    ).populate("items.book", "title price author");
    if (!cart) {
      return res.status(404).json({ message: "Item not found in cart" });
    }
    const totalPrice = cart.items.reduce(
      (acc, item) => acc + item.book.price * item.quantity,
      0
    );
    res.status(200).json({
      message: "Item removed",
      cart: {
        items: cart.items,
        totalItems: cart.items.length,
        totalPrice,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Clear cart items: DELETE
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    await cart.save();
    res.json({
      message: "Cart cleared",
      cart: { items: [], totalItems: 0, totalPrice: 0 },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
