const mongoose = require("mongoose");

const chunkSchema = new mongoose.Schema(
  {
    repoName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    chunkNumber: {
      type: Number,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    embedding: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Chunk",
  chunkSchema
);