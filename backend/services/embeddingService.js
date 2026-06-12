const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

async function generateEmbedding(text) {
  try {

    const model = genAI.getGenerativeModel({
      model: "text-embedding-004"
    });

    const result = await model.embedContent(text);

    return result.embedding.values;

  } catch (error) {

    console.error(error);

    throw error;

  }
}

module.exports = {
  generateEmbedding,
};