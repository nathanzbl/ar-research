import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/client.js';

const router = Router();

type DeviceType = 'mobile' | 'desktop';

interface StartSurveyBody {
  deviceType: DeviceType;
  conditionType: string;
  fingerprint?: string;
}

interface ResponseBody {
  sessionId: string;
  questionId: string;
  responseValue: string;
}

interface SessionIdBody {
  sessionId: string;
}

interface SessionRow {
  id: string;
  condition_type: string;
  device_type: string;
  started_at: Date;
  completed_at: Date | null;
  is_screened_out: boolean;
}

// Start a new survey session (with idempotency via fingerprint)
router.post('/start', async (req: Request<object, object, StartSurveyBody>, res: Response) => {
  try {
    const { deviceType, conditionType, fingerprint } = req.body;

    // Check for existing session with same fingerprint (idempotency)
    if (fingerprint) {
      const existing = await query<SessionRow>(
        `SELECT id, condition_type, device_type, started_at, completed_at, is_screened_out
         FROM sessions WHERE fingerprint = $1`,
        [fingerprint]
      );

      if (existing.rows.length > 0) {
        const session = existing.rows[0];
        res.json({
          id: session.id,
          conditionType: session.condition_type,
          deviceType: session.device_type,
          startedAt: session.started_at.toISOString(),
          completedAt: session.completed_at?.toISOString() || null,
          isScreenedOut: session.is_screened_out,
          isExisting: true,
        });
        return;
      }
    }

    const id = uuidv4();

    await query(
      `INSERT INTO sessions (id, condition_type, device_type, fingerprint) VALUES ($1, $2, $3, $4)`,
      [id, conditionType, deviceType, fingerprint || null]
    );

    res.json({
      id,
      conditionType,
      deviceType,
      startedAt: new Date().toISOString(),
      isScreenedOut: false,
      isExisting: false,
    });
  } catch (error) {
    console.error('Error starting survey:', error);
    res.status(500).json({ error: 'Failed to start survey' });
  }
});

// Save a response
router.post('/response', async (req: Request<object, object, ResponseBody>, res: Response) => {
  try {
    const { sessionId, questionId, responseValue } = req.body;

    // Check if response already exists and update, or insert new
    const existing = await query(
      `SELECT id FROM responses WHERE session_id = $1 AND question_id = $2`,
      [sessionId, questionId]
    );

    if (existing.rows.length > 0) {
      await query(
        `UPDATE responses SET response_value = $1, created_at = NOW() WHERE session_id = $2 AND question_id = $3`,
        [responseValue, sessionId, questionId]
      );
    } else {
      await query(
        `INSERT INTO responses (session_id, question_id, response_value) VALUES ($1, $2, $3)`,
        [sessionId, questionId, responseValue]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving response:', error);
    res.status(500).json({ error: 'Failed to save response' });
  }
});

// Mark survey as complete
router.post('/complete', async (req: Request<object, object, SessionIdBody>, res: Response) => {
  try {
    const { sessionId } = req.body;

    await query(
      `UPDATE sessions SET completed_at = NOW() WHERE id = $1`,
      [sessionId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error completing survey:', error);
    res.status(500).json({ error: 'Failed to complete survey' });
  }
});

// Mark session as screened out
router.post('/screen-out', async (req: Request<object, object, SessionIdBody>, res: Response) => {
  try {
    const { sessionId } = req.body;

    await query(
      `UPDATE sessions SET is_screened_out = TRUE, completed_at = NOW() WHERE id = $1`,
      [sessionId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking screen-out:', error);
    res.status(500).json({ error: 'Failed to mark screen-out' });
  }
});

export default router;
