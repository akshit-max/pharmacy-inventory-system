const Supplier = require("../models/supplier");
const Purchase = require("../models/purchase");

// Turn a Mongoose error into a clear response for the frontend
const sendError = (res, error, defaultMessage) => {
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({ message: errors.join(", "), errors });
  }
  if (error.name === "CastError") {
    return res.status(400).json({ message: "Invalid supplier id" });
  }
  return res.status(500).json({ message: defaultMessage, error: error.message });
};

// Only these fields can be set from the frontend
const pickSupplierFields = (body) => ({
  name: body.name,
  contactPerson: body.contactPerson,
  phone: body.phone,
  email: body.email,
  address: body.address
});

// Create supplier
exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(pickSupplierFields(req.body));
    res.status(201).json(supplier);
  } catch (error) {
    sendError(res, error, "Failed to create supplier");
  }
};

// Get all suppliers
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.status(200).json(suppliers);
  } catch (error) {
    sendError(res, error, "Failed to fetch suppliers");
  }
};

// Get one supplier
exports.getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json(supplier);
  } catch (error) {
    sendError(res, error, "Failed to fetch supplier");
  }
};

// Update supplier
exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      pickSupplierFields(req.body),
      { new: true, runValidators: true }
    );

    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json(supplier);
  } catch (error) {
    sendError(res, error, "Failed to update supplier");
  }
};

// Delete supplier
exports.deleteSupplier = async (req, res) => {
  try {
    // Keep purchase history correct: a supplier used in a purchase cannot be deleted
    const purchaseCount = await Purchase.countDocuments({ supplier: req.params.id });
    if (purchaseCount > 0) {
      return res.status(400).json({
        message: "This supplier has purchase records and cannot be deleted"
      });
    }

    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.status(200).json({ message: "Supplier deleted successfully" });
  } catch (error) {
    sendError(res, error, "Failed to delete supplier");
  }
};
