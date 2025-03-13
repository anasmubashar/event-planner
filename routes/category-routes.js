import express from "express";
import Category from "../models/category-model.js";
import { authenticate } from "../middleware/auth-middleware.js";

const router = express.Router();

// Apply authentication middleware to all category routes
router.use(authenticate);

// Get all categories for the current user
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user._id });

    res.json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching categories",
      error: error.message,
    });
  }
});

// Create a new category
router.post("/", async (req, res) => {
  try {
    const { name, description, color } = req.body;

    // Check if category already exists for this user
    const existingCategory = await Category.findOne({
      name,
      user: req.user._id,
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists",
      });
    }

    const category = new Category({
      name,
      description,
      color,
      user: req.user._id,
    });

    await category.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating category",
      error: error.message,
    });
  }
});

// Get a single category
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching category",
      error: error.message,
    });
  }
});

// Update a category
router.put("/:id", async (req, res) => {
  try {
    const { name, description, color } = req.body;

    // Check if category exists
    let category = await Category.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Check if new name already exists for another category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        name,
        user: req.user._id,
        _id: { $ne: req.params.id },
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists",
        });
      }
    }

    // Update category
    category = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { name, description, color },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating category",
      error: error.message,
    });
  }
});

// Delete a category
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
});

export default router;
