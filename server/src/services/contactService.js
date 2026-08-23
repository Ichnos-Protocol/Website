/**
 * Contact Service
 *
 * Business logic for contact request submissions,
 * retrieval, and follow-up questions.
 */
import * as contactRepository from "../repositories/contactRepository.js";
import * as questionRepository from "../repositories/questionRepository.js";
import * as userRepository from "../repositories/userRepository.js";
import { withTransaction } from "../config/database.js";

const CONTACT_CONSENT_VERSION =
  process.env.CONTACT_CONSENT_VERSION || "v1";

const REQUEST_KIND_INQUIRY = "inquiry";
const REQUEST_KIND_CONSORTIUM = "consortium";

function buildError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function buildConsortiumData(data) {
  const { source, customerRequest, dataNeeds, ...rest } = data.consortium;
  return {
    ...rest,
    customerRequest: customerRequest ?? null,
    dataNeeds: dataNeeds ?? null,
    source: source ?? null,
  };
}

// A registrant who also asks a question gets an ordinary inquiry row: the
// consortium row is reserved for the registration itself.
function resolveKind(data) {
  return data.consortiumInterest === true && data.questions.length === 0
    ? REQUEST_KIND_CONSORTIUM
    : REQUEST_KIND_INQUIRY;
}

async function createQuestionsFor(userId, requestId, questions, client) {
  const created = [];
  for (const q of questions) {
    created.push(
      await questionRepository.createQuestion(
        userId,
        {
          question: q.text,
          answer: null,
          source: "form",
          contactRequestId: requestId,
        },
        client,
      ),
    );
  }
  return created;
}

async function resolveConsortium(userId, data, client) {
  const existing = await userRepository.getConsortiumProfile(userId, client);
  if (!data.consortiumInterest) return existing;

  const updated = await userRepository.updateConsortiumProfile(
    userId,
    buildConsortiumData(data),
    client,
  );
  return updated || existing;
}

async function runSubmitTransaction(userId, data) {
  return withTransaction(async (client) => {
    const consortium = await resolveConsortium(userId, data, client);
    const request = await contactRepository.createContactRequest(
      userId,
      {
        consentTimestamp: data.consentTimestamp,
        consentVersion: data.consentVersion || CONTACT_CONSENT_VERSION,
        kind: resolveKind(data),
      },
      client,
    );
    const questions =
      request && data.questions.length > 0
        ? await createQuestionsFor(userId, request.id, data.questions, client)
        : [];
    return { request, questions, consortium };
  });
}

function buildSubmitResponse({ request, questions, consortium }, isConsortium) {
  if (!isConsortium) return { ...request, questions };
  if (request) return { ...request, questions, consortium };
  return { id: null, questions: [], consortium };
}

export async function submitContactRequest(userId, data) {
  const result = await runSubmitTransaction(userId, data);

  await userRepository.updateUserActivity(userId);
  return buildSubmitResponse(result, data.consortiumInterest === true);
}

export async function getMyRequests(userId) {
  const requests = await contactRepository.getRequestsByUserId(userId);
  const allQuestions = await questionRepository.getQuestionsByUserId(userId);

  return requests.map((req) => ({
    ...req,
    questions: allQuestions.filter(
      (q) => q.contact_request_id === req.id,
    ),
  }));
}

export async function addQuestion(userId, requestId, questionText) {
  const request = await contactRepository.getRequestById(requestId);

  if (!request) {
    throw buildError("Contact request not found", 404);
  }
  if (request.user_id !== userId) {
    throw buildError("Not authorized to add to this request", 403);
  }

  const question = await questionRepository.createQuestion(userId, {
    question: questionText,
    answer: null,
    source: "form",
    contactRequestId: requestId,
  });

  await userRepository.updateUserActivity(userId);
  return question;
}
