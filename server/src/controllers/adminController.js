/**
 * Admin Controller
 *
 * Thin HTTP handlers for admin endpoints.
 * Delegates all business logic to adminService.
 */
import * as adminService from "../services/adminService.js";
import { formatResponse } from "../helpers/formatResponse.js";
import { adminConsortiumExportSchema } from "../validators/adminSchemas.js";

function parseIntId(id) {
  const parsed = parseInt(id, 10);
  return Number.isNaN(parsed) || parsed <= 0 ? null : parsed;
}

function validateUserId(userId) {
  return typeof userId === "string" && userId.trim().length > 0;
}

// Express turns a repeated query param (`?tier=a&tier=b`) into an array and a
// bracketed one (`?tier[x]=y`) into an object. Either shape would reach the
// repository and be bound to `p.consortium_tier = $1`, which PostgreSQL rejects
// with a type error surfacing as a 500. Filters must be scalar or absent.
function collectInvalidFilters(query) {
  return ["tier", "source", "status"].filter((key) => {
    const value = query?.[key];
    return value !== undefined && typeof value !== "string";
  });
}

export async function getUsers(_req, res, next) {
  try {
    const users = await adminService.getUsers();
    res.status(200).json(formatResponse(users, "Users retrieved"));
  } catch (error) {
    next(error);
  }
}

export async function getRequestsByUser(req, res, next) {
  try {
    const { userId } = req.params;

    if (!validateUserId(userId)) {
      return res
        .status(400)
        .json({ data: null, error: "Invalid userId", message: null });
    }

    const requests = await adminService.getRequestsByUserId(userId);
    res.status(200).json(formatResponse(requests, "Requests retrieved"));
  } catch (error) {
    next(error);
  }
}

export async function getChatLeads(_req, res, next) {
  try {
    const leads = await adminService.getChatOnlyLeads();
    res.status(200).json(formatResponse(leads, "Chat leads retrieved"));
  } catch (error) {
    next(error);
  }
}

export async function getChatLeadDetail(req, res, next) {
  try {
    const { userId } = req.params;

    if (!validateUserId(userId)) {
      return res
        .status(400)
        .json({ data: null, error: "Invalid userId", message: null });
    }

    const messages = await adminService.getChatLeadDetail(userId);
    res.status(200).json(formatResponse(messages, "Chat messages retrieved"));
  } catch (error) {
    next(error);
  }
}

export async function updateRequest(req, res, next) {
  try {
    const requestId = parseIntId(req.params.id);

    if (!requestId) {
      return res
        .status(400)
        .json({ data: null, error: "Invalid request ID", message: null });
    }

    const updated = await adminService.updateRequest(requestId, req.body);
    res.status(200).json(formatResponse(updated, "Request updated"));
  } catch (error) {
    next(error);
  }
}

export async function deleteRequest(req, res, next) {
  try {
    const requestId = parseIntId(req.params.id);

    if (!requestId) {
      return res
        .status(400)
        .json({ data: null, error: "Invalid request ID", message: null });
    }

    const result = await adminService.deleteRequest(requestId);
    res.status(200).json(formatResponse(result, "Request deleted"));
  } catch (error) {
    next(error);
  }
}

export async function analyzeTopics(_req, res, next) {
  try {
    const result = await adminService.analyzeTopics();
    res.status(200).json(formatResponse(result, "Topics analyzed"));
  } catch (error) {
    next(error);
  }
}

export async function getTopics(_req, res, next) {
  try {
    const topics = await adminService.getTopics();
    res.status(200).json(formatResponse(topics, "Topics retrieved"));
  } catch (error) {
    next(error);
  }
}

export async function exportCSV(_req, res, next) {
  try {
    const csv = await adminService.exportToCSV();
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="contacts.csv"');
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
}

export async function manageAdmins(req, res, next) {
  try {
    const result = await adminService.manageAdmins(
      req.body.action,
      req.body.email,
    );
    res.status(200).json(formatResponse(result, "Admin updated"));
  } catch (error) {
    next(error);
  }
}

export async function runRetentionSweep(_req, res, next) {
  try {
    const result = await adminService.runRetentionSweep();
    res.status(200).json(formatResponse(result, "Retention sweep complete"));
  } catch (error) {
    next(error);
  }
}

export async function sendDailyDigest(_req, res, next) {
  try {
    const result = await adminService.sendDailyDigest();
    res.status(200).json(formatResponse(result, "Digest sent"));
  } catch (error) {
    next(error);
  }
}

export async function getConsortiumRegistrants(req, res, next) {
  try {
    const invalid = collectInvalidFilters(req.query);

    if (invalid.length > 0) {
      return res.status(422).json({
        data: null,
        error: invalid.map((field) => ({
          path: [field],
          message: "Filter must be a single value",
        })),
        message: "Validation failed",
      });
    }

    const { tier, source, status } = req.query;
    const rows = await adminService.getConsortiumRegistrants({
      tier,
      source,
      status,
    });
    res
      .status(200)
      .json(formatResponse(rows, "Consortium registrants retrieved"));
  } catch (error) {
    next(error);
  }
}

export async function updateConsortiumRegistrant(req, res, next) {
  try {
    const { userId } = req.params;

    if (!validateUserId(userId)) {
      return res
        .status(400)
        .json({ data: null, error: "Invalid userId", message: null });
    }

    const updated = await adminService.updateConsortiumRegistrant(
      userId,
      req.body,
    );
    res
      .status(200)
      .json(formatResponse(updated, "Consortium registrant updated"));
  } catch (error) {
    next(error);
  }
}

export async function exportConsortiumRegistrants(req, res, next) {
  try {
    const parsed = adminConsortiumExportSchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(422).json({
        data: null,
        error: parsed.error.issues,
        message: "Validation failed",
      });
    }

    const { format, group, tier, source, status } = parsed.data;
    const { csv, filename } = await adminService.exportConsortiumRegistrants({
      format,
      group,
      filters: { tier, source, status },
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
}
