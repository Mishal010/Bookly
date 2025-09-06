import { sendEmail } from "../config/email.js";
import Book from "../models/Book.js";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";

export const placeOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.book",
      "title price stock"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Stock availability:
    for (let item of cart.items) {
      if (item.book.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Not enough stock for ${item.book.title}` });
      }
    }

    const totalPrice = cart.items.reduce(
      (acc, item) => acc + item.book.price * item.book.quantity,
      0
    );

    const order = new Order({
      user: req.user.id,
      items: cart.items.map((item) => ({
        book: item.book._id,
        quantity: item.quantity,
        price: item.book.price,
      })),
      totalPrice,
      paymentMethod: req.body.paymentMethod || "COD",
    });
    await order.save();

    for (let item of cart.items) {
      const book = await Book.findById(item.book._id);
      book.stock -= item.quantity;
      await book.save();
    }

    cart.items = [];
    await cart.save();

    // Email successfully placed order: TO DO

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(orderId).populate("items.book");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.user.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (["shipped", "delivered"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: "Order cannot be cancelled after shipping" });
    }

    // Restock if cancelled:
    for (let item of order.items) {
      const book = await Book.findById(item.book._id);
      book.stock += item.quantity;
      await book.save();
    }

    order.status = "cancelled";
    await order.save();

    // Email on cancel :TO DO:

    res.status(200).json({ message: "Order cancelled", order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["ordered", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(orderId).populate("user", "email");
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    await sendEmail(
      order.user.email,
      `Order ${status}`,
      `Your order ${order._id} status has been updated to ${status}.`
    );

    res.status(200).json({ message: "Order status updated", order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user.id;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("items.book", "title price author coverImage");

    const orderCount = await Order.countDocuments({ user: userId });

    res.status(200).json({
      totalOrders: orderCount,
      totalPages: Math.ceil(orderCount / limit),
      currentPage: parseInt(page),
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.book", "title price")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalOrders = await Order.countDocuments();

    res.json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
