import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/firebase.js';
import { chat } from '../config/groq.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/interview/start
router.post('/start', verifyToken, async (req, res) => {
  const { role, level, techStack } = req.body;
  const uid = req.user.uid;

  if (!role || !level || !techStack) {
    return res.status(400).json({ error: 'role, level, and techStack are required' });
  }

  try {
    const prompt = `You are an expert technical interviewer. Generate 5 interview questions for a ${level} ${role} developer with expertise in ${techStack}.
Return ONLY a valid JSON array, no markdown, no explanation, no code fences:
[{"id":1,"question":"...","type":"technical"},{"id":2,"question":"...","type":"behavioral"},{"id":3,"question":"...","type":"technical"},{"id":4,"question":"...","type":"technical"},{"id":5,"question":"...","type":"behavioral"}]
Mix technical and behavioral questions. Make them realistic and challenging for the level specified.`;

    const text = await chat(prompt);
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const questions = JSON.parse(cleaned);

    const sessionId = uuidv4();
    const sessionData = {
      sessionId,
      uid,
      role,
      level,
      techStack,
      questions,
      answers: [],
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('interviews').doc(sessionId).set(sessionData);
    res.json({ sessionId, questions });
  } catch (err) {
    console.error('Error starting interview:', err.message);
    res.status(500).json({ error: err.message || 'Failed to start interview' });
  }
});

// POST /api/interview/:sessionId/answer
router.post('/:sessionId/answer', verifyToken, async (req, res) => {
  const { sessionId } = req.params;
  const { questionId, question, answer } = req.body;
  const uid = req.user.uid;

  if (!questionId || !question || answer === undefined) {
    return res.status(400).json({ error: 'questionId, question, and answer are required' });
  }

  try {
    const docRef = db.collection('interviews').doc(sessionId);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().uid !== uid) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    const prompt = `You are an expert technical interviewer evaluating a candidate's answer.

Question: ${question}
Candidate's Answer: ${answer}

Return ONLY valid JSON, no markdown, no code fences:
{"score":<1-10>,"feedback":"<2-3 sentences of constructive feedback>","strengths":"<what was good>","improvements":"<what could be better>","sampleAnswer":"<brief ideal answer>"}`;

    const text = await chat(prompt);
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const feedback = JSON.parse(cleaned);

    const answerEntry = {
      questionId,
      question,
      answer,
      feedback,
      answeredAt: new Date().toISOString(),
    };

    await docRef.update({
      answers: [...(doc.data().answers || []), answerEntry],
      updatedAt: new Date().toISOString(),
    });

    res.json({ feedback });
  } catch (err) {
    console.error('Error submitting answer:', err.message);
    res.status(500).json({ error: err.message || 'Failed to process answer' });
  }
});

// POST /api/interview/:sessionId/complete
router.post('/:sessionId/complete', verifyToken, async (req, res) => {
  const { sessionId } = req.params;
  const uid = req.user.uid;

  try {
    const docRef = db.collection('interviews').doc(sessionId);
    const doc = await docRef.get();

    if (!doc.exists || doc.data().uid !== uid) {
      return res.status(404).json({ error: 'Interview session not found' });
    }

    const data = doc.data();
    const answers = data.answers || [];

    const answersText = answers
      .map((a) => `Q: ${a.question}\nA: ${a.answer}\nScore: ${a.feedback?.score}/10`)
      .join('\n\n');

    const prompt = `You are an expert technical interviewer. Provide an overall assessment of this mock interview.

Role: ${data.role} (${data.level})
Tech Stack: ${data.techStack}

Interview Q&A:
${answersText}

Return ONLY valid JSON, no markdown, no code fences:
{"overallScore":<average out of 10>,"summary":"<3-4 sentence overall assessment>","topStrengths":["<strength 1>","<strength 2>","<strength 3>"],"areasToImprove":["<area 1>","<area 2>","<area 3>"],"recommendation":"<Hire or Consider or Not Ready>","nextSteps":"<advice for the candidate>"}`;

    const text = await chat(prompt);
    const cleaned = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const report = JSON.parse(cleaned);

    await docRef.update({
      status: 'completed',
      report,
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    res.json({ report });
  } catch (err) {
    console.error('Error completing interview:', err.message);
    res.status(500).json({ error: err.message || 'Failed to complete interview' });
  }
});

// GET /api/interview/history
router.get('/history', verifyToken, async (req, res) => {
  const uid = req.user.uid;

  try {
    let snapshot;
    try {
      snapshot = await db
        .collection('interviews')
        .where('uid', '==', uid)
        .orderBy('createdAt', 'desc')
        .get();
    } catch (indexErr) {
      console.warn('Composite index not ready, falling back to in-memory sort');
      snapshot = await db.collection('interviews').where('uid', '==', uid).get();
    }

    const interviews = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ interviews });
  } catch (err) {
    console.error('Error fetching history:', err);
    res.status(500).json({ error: 'Failed to fetch interview history' });
  }
});

// GET /api/interview/:sessionId
router.get('/:sessionId', verifyToken, async (req, res) => {
  const { sessionId } = req.params;
  const uid = req.user.uid;

  try {
    const doc = await db.collection('interviews').doc(sessionId).get();

    if (!doc.exists || doc.data().uid !== uid) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    res.json({ interview: { id: doc.id, ...doc.data() } });
  } catch (err) {
    console.error('Error fetching interview:', err);
    res.status(500).json({ error: 'Failed to fetch interview' });
  }
});

export default router;
