const { ChromaClient } = require("chromadb");

const client = new ChromaClient();

async function createCollection() {
  const collection = await client.getOrCreateCollection({
    name: "code_chunks",
  });

  console.log("Collection created:", collection);

  return collection;
}

module.exports = {
  createCollection,
};