import Cart from "../models/Cart.js";
import Book from "../models/Book.js";

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
      (acc, item) => acc + item.price * item.quantity,
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
