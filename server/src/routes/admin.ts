import { Router, Request, Response } from 'express';
import { query } from '../db/client.js';

const router = Router();

interface SessionRow {
  id: string;
  condition_type: string;
  device_type: string;
  started_at: Date;
  completed_at: Date | null;
  is_screened_out: boolean;
}

interface ResponseRow {
  session_id: string;
  question_id: string;
  response_value: string;
}

// Get all responses with session data
router.get('/responses', async (_req: Request, res: Response) => {
  try {
    const sessionsResult = await query<SessionRow>(
      `SELECT * FROM sessions ORDER BY started_at DESC`
    );

    const responsesResult = await query<ResponseRow>(
      `SELECT session_id, question_id, response_value FROM responses`
    );

    // Group responses by session
    const responsesBySession: Record<string, Record<string, string>> = {};
    for (const row of responsesResult.rows) {
      if (!responsesBySession[row.session_id]) {
        responsesBySession[row.session_id] = {};
      }
      responsesBySession[row.session_id][row.question_id] = row.response_value;
    }

    const sessions = sessionsResult.rows.map((session) => ({
      id: session.id,
      conditionType: session.condition_type,
      deviceType: session.device_type,
      startedAt: session.started_at,
      completedAt: session.completed_at,
      isScreenedOut: session.is_screened_out,
      responses: responsesBySession[session.id] || {},
    }));

    res.json(sessions);
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

// Get single session with all responses
router.get('/session/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sessionResult = await query<SessionRow>(
      `SELECT * FROM sessions WHERE id = $1`,
      [id]
    );

    if (sessionResult.rows.length === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    const responsesResult = await query<ResponseRow>(
      `SELECT question_id, response_value FROM responses WHERE session_id = $1 ORDER BY question_id`,
      [id]
    );

    const session = sessionResult.rows[0];
    const responses: Record<string, string> = {};
    for (const row of responsesResult.rows) {
      responses[row.question_id] = row.response_value;
    }

    res.json({
      id: session.id,
      conditionType: session.condition_type,
      deviceType: session.device_type,
      startedAt: session.started_at,
      completedAt: session.completed_at,
      isScreenedOut: session.is_screened_out,
      responses,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Update a response
router.put('/session/:id/response', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { questionId, responseValue } = req.body;

    // Check if session exists
    const sessionResult = await query<SessionRow>(
      `SELECT id FROM sessions WHERE id = $1`,
      [id]
    );

    if (sessionResult.rows.length === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    // Update or insert response
    const existing = await query(
      `SELECT id FROM responses WHERE session_id = $1 AND question_id = $2`,
      [id, questionId]
    );

    if (existing.rows.length > 0) {
      await query(
        `UPDATE responses SET response_value = $1 WHERE session_id = $2 AND question_id = $3`,
        [responseValue, id, questionId]
      );
    } else {
      await query(
        `INSERT INTO responses (session_id, question_id, response_value) VALUES ($1, $2, $3)`,
        [id, questionId, responseValue]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating response:', error);
    res.status(500).json({ error: 'Failed to update response' });
  }
});

// Delete a session and all its responses
router.delete('/session/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Delete responses first (foreign key constraint)
    await query(`DELETE FROM responses WHERE session_id = $1`, [id]);

    // Delete session
    const result = await query(`DELETE FROM sessions WHERE id = $1 RETURNING id`, [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Session not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// Get stats
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const totalResult = await query<{ count: string }>(`SELECT COUNT(*) as count FROM sessions`);
    const completedResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM sessions WHERE completed_at IS NOT NULL AND is_screened_out = FALSE`
    );
    const screenedOutResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM sessions WHERE is_screened_out = TRUE`
    );
    const byConditionResult = await query<{ condition_type: string; count: string }>(
      `SELECT condition_type, COUNT(*) as count FROM sessions GROUP BY condition_type`
    );

    const byCondition: Record<string, number> = {};
    for (const row of byConditionResult.rows) {
      byCondition[row.condition_type] = parseInt(row.count, 10);
    }

    res.json({
      total: parseInt(totalResult.rows[0].count, 10),
      completed: parseInt(completedResult.rows[0].count, 10),
      screenedOut: parseInt(screenedOutResult.rows[0].count, 10),
      byCondition,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

const QUESTION_LABELS: Record<string, string> = {
  Q1: 'Are you 18 or older?',
  Q2: 'Are you a current BYU student?',
  Q3: 'What item did you choose from the menu?',
  Q3b: 'Before today, how familiar were you with the item you chose?',
  Q4: 'Did the price of this item influence your choice?',
  Q5: 'Did the expected flavor influence your choice?',
  Q6: 'Did past experience with this dish influence your choice?',
  Q6b: 'About what percentage of the menu did you explore?',
  Q6c: 'About how long did it take you to make your decision?',
  Q6d: 'How confident are you that the item you chose will make you happy?',
  Q6e: 'What was your overall experience navigating this menu?',
  Q7a: 'This menu made it easy to find what I was looking for.',
  Q7b: 'This menu made it easy to compare options.',
  Q7c: 'This menu helped me feel confident in my decision.',
  Q7d: 'This menu made me feel overwhelmed.',
  Q7e: 'This menu made me feel curious about the food.',
  Q7f: 'This menu made me feel excited to order.',
  Q8a: 'The visual design of this menu was appealing.',
  Q8b: 'The layout of this menu was intuitive.',
  Q8c: 'The information presented was sufficient to make a decision.',
  Q8d: 'The menu was easy to navigate.',
  Q8e: 'The menu items were clearly described.',
  Q8f: 'The menu felt modern and up-to-date.',
  Q10: 'How confident are you in your choice? (%)',
  Q11: 'This menu felt realistic for a real restaurant.',
  Q12: 'This menu felt innovative.',
  Q13: 'I felt engaged while using this menu.',
  Q14: 'What did you like most about this menu?',
  Q15: 'What did you find confusing or frustrating?',
  Q16: 'How does this menu compare to other menus you\'ve used in restaurants?',
  Q17: 'What is your age?',
  Q18: 'What is your gender?',
  Q19: 'What is your major/field of study?',
  Q25: 'Have you ever used augmented reality (AR) technology before?',
  Q26: 'To what extent have you used augmented reality (AR)?',
  Q27: 'In general, when I go to a restaurant, price plays a role in what I order.',
  menu_view_duration: 'Time spent viewing menu (seconds)',
};

// Qualitative (free-text) questions — leave as-is
const QUALITATIVE_QUESTIONS = new Set([
  'Q3', 'Q6b', 'Q6e', 'Q14', 'Q15', 'Q16', 'Q19', 'menu_view_duration',
]);

// Encoding maps for categorical values
const ENCODING_MAPS: Record<string, Record<string, string>> = {
  // Yes/No → 1/0
  _yesno: { yes: '1', no: '0' },
  // True/False → 1/0
  _truefalse: { true: '1', false: '0' },
  // Gender
  Q18: { male: '1', female: '2', 'non-binary': '3', 'prefer-not': '4' },
  // Decision time (ordinal)
  Q6c: { less_than_30s: '1', '30s_to_1min': '2', '1_to_2min': '3', '2_to_5min': '4', more_than_5min: '5' },
  // AR extent (ordinal)
  Q26: { very_minimally: '1', occasionally: '2', moderately: '3', frequently: '4', very_frequently: '5' },
  // Condition type
  _condition: { ar_menu: '1', menu_image_0: '2', menu_image_1: '3' },
  // Device type
  _device: { mobile: '1', desktop: '2' },
};

// Which questions use which map
const YESNO_QUESTIONS = new Set(['Q1', 'Q2', 'Q25']);
const TRUEFALSE_QUESTIONS = new Set(['Q11', 'Q12', 'Q13']);

function encodeValue(questionId: string, value: string): string {
  if (!value) return '';
  if (QUALITATIVE_QUESTIONS.has(questionId)) return value;
  if (YESNO_QUESTIONS.has(questionId)) return ENCODING_MAPS._yesno[value.toLowerCase()] ?? value;
  if (TRUEFALSE_QUESTIONS.has(questionId)) return ENCODING_MAPS._truefalse[value.toLowerCase()] ?? value;
  if (ENCODING_MAPS[questionId]) return ENCODING_MAPS[questionId][value] ?? value;
  // Already numeric (Likert 0-4, sliders, etc.) — pass through
  return value;
}

const ENCODING_KEY: Record<string, string> = {
  condition_type: 'ar_menu=1, menu_image_0=2, menu_image_1=3',
  device_type: 'mobile=1, desktop=2',
  is_screened_out: 'true=1, false=0',
  Q1: 'yes=1, no=0',
  Q2: 'yes=1, no=0',
  Q6c: 'less_than_30s=1, 30s_to_1min=2, 1_to_2min=3, 2_to_5min=4, more_than_5min=5',
  Q11: 'true=1, false=0',
  Q12: 'true=1, false=0',
  Q13: 'true=1, false=0',
  Q18: 'male=1, female=2, non-binary=3, prefer-not=4',
  Q25: 'yes=1, no=0',
  Q26: 'very_minimally=1, occasionally=2, moderately=3, frequently=4, very_frequently=5',
};

// Export CSV
router.get('/export', async (_req: Request, res: Response) => {
  try {
    const sessionsResult = await query<SessionRow>(
      `SELECT * FROM sessions ORDER BY started_at`
    );

    const responsesResult = await query<ResponseRow>(
      `SELECT session_id, question_id, response_value FROM responses`
    );

    // Get all unique question IDs
    const questionIds = new Set<string>();
    for (const row of responsesResult.rows) {
      questionIds.add(row.question_id);
    }
    const sortedQuestionIds = Array.from(questionIds).sort();

    // Group responses by session
    const responsesBySession: Record<string, Record<string, string>> = {};
    for (const row of responsesResult.rows) {
      if (!responsesBySession[row.session_id]) {
        responsesBySession[row.session_id] = {};
      }
      responsesBySession[row.session_id][row.question_id] = row.response_value;
    }

    const escCsv = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const allColumns = [
      'session_id',
      'condition_type',
      'device_type',
      'started_at',
      'completed_at',
      'is_screened_out',
      ...sortedQuestionIds,
    ];

    // Qualtrics Row 1: Field IDs (short column names)
    const row1_ids = allColumns;

    // Qualtrics Row 2: Human-readable question text / field descriptions
    const META_LABELS: Record<string, string> = {
      session_id: 'Session ID',
      condition_type: 'Condition Type (ar_menu=1, menu_image_0=2, menu_image_1=3)',
      device_type: 'Device Type (mobile=1, desktop=2)',
      started_at: 'Started At',
      completed_at: 'Completed At',
      is_screened_out: 'Screened Out (true=1, false=0)',
    };
    const row2_labels = allColumns.map((col) => {
      if (META_LABELS[col]) return escCsv(META_LABELS[col]);
      const label = QUESTION_LABELS[col] || col;
      const encoding = ENCODING_KEY[col];
      const full = encoding ? `${label} (${encoding})` : label;
      return escCsv(full);
    });

    // Qualtrics Row 3: Import IDs (Qualtrics uses these for mapping; we use column names)
    const row3_importIds = allColumns.map((col) => escCsv(`{"ImportId":"${col}"}`));

    // Data rows
    const dataRows = sessionsResult.rows.map((session) => {
      const responses = responsesBySession[session.id] || {};
      return [
        session.id,
        ENCODING_MAPS._condition[session.condition_type] ?? session.condition_type,
        ENCODING_MAPS._device[session.device_type] ?? session.device_type,
        session.started_at?.toISOString().replace('T', ' ').replace('Z', '') || '',
        session.completed_at?.toISOString().replace('T', ' ').replace('Z', '') || '',
        session.is_screened_out ? '1' : '0',
        ...sortedQuestionIds.map((qId) => {
          const raw = responses[qId] || '';
          const encoded = encodeValue(qId, raw);
          return escCsv(encoded);
        }),
      ];
    });

    const csv = [
      row1_ids.join(','),
      row2_labels.join(','),
      row3_importIds.join(','),
      ...dataRows.map((row) => row.join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="survey_responses.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

export default router;
