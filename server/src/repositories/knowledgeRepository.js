/**
 * Knowledge Repository
 *
 * Data access functions for the Firestore knowledge_base collection.
 */
import firebaseAdmin from "../config/firebase.js";

const COLLECTION = "knowledge_base";
const MAX_RESULTS = 5;

function getDb() {
  return firebaseAdmin.firestore();
}

// --- Firestore Knowledge Base ---

function buildKnowledgeQuery(keywords, category) {
  let ref = getDb().collection(COLLECTION);

  if (keywords && keywords.length > 0) {
    ref = ref.where("tags", "array-contains-any", keywords.slice(0, 10));
  }

  // NOTE: compound query (tags array-contains-any + category ==) requires a composite index in Firestore.
  if (category) {
    ref = ref.where("category", "==", category);
  }

  return ref;
}

export async function queryKnowledgeBase(keywords, category) {
  try {
    const ref = buildKnowledgeQuery(keywords, category);
    const snapshot = await ref.limit(MAX_RESULTS).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(
      "knowledgeRepository.queryKnowledgeBase failed:",
      error.message,
    );
    throw error;
  }
}

export async function getDocumentById(docId) {
  try {
    const db = getDb();
    const doc = await db.collection(COLLECTION).doc(docId).get();

    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error("knowledgeRepository.getDocumentById failed:", error.message);
    throw error;
  }
}

export async function createDocument(documentData) {
  try {
    const db = getDb();
    const docRef = await db.collection(COLLECTION).add({
      ...documentData,
      created_at: new Date(),
    });
    return { id: docRef.id, ...documentData };
  } catch (error) {
    console.error("knowledgeRepository.createDocument failed:", error.message);
    throw error;
  }
}

export async function updateDocument(docId, updates) {
  try {
    const db = getDb();
    await db
      .collection(COLLECTION)
      .doc(docId)
      .update({ ...updates, updated_at: new Date() });
    const updated = await getDocumentById(docId);
    return updated;
  } catch (error) {
    console.error("knowledgeRepository.updateDocument failed:", error.message);
    throw error;
  }
}

export async function deleteDocument(docId) {
  try {
    const db = getDb();
    await db.collection(COLLECTION).doc(docId).delete();
  } catch (error) {
    console.error("knowledgeRepository.deleteDocument failed:", error.message);
    throw error;
  }
}
