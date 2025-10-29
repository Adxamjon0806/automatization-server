import mongoose from "mongoose";

const Id = new mongoose.Schema({
  count: { type: Number, required: true },
});

export default mongoose.model("Id", Id);
