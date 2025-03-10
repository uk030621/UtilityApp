import mongoose from "mongoose";

const TaxParameterSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Ensure efficient lookups by userId
    },
    year: {
      type: Number,
      required: true,
    },
    incomeTax: {
      personalAllowance: { type: Number, required: true },
      basicRate: { type: Number, required: true },
      higherRate: { type: Number, required: true },
      additionalRate: { type: Number, required: true },
      basicThreshold: { type: Number, required: true },
      higherThreshold: { type: Number, required: true },
      taperThreshold: { type: Number, required: true },
    },
    nationalInsurance: {
      primaryThreshold: { type: Number, required: true },
      upperEarningsLimit: { type: Number, required: true },
      primaryRate: { type: Number, required: true },
      upperRate: { type: Number, required: true },
      selfPrimaryRate: { type: Number, required: true },
      selfUpperRate: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

// Define a compound unique index for userId and year
TaxParameterSchema.index({ userId: 1, year: 1 }, { unique: true });

export default mongoose.models.TaxParameter ||
  mongoose.model("TaxParameter", TaxParameterSchema);
