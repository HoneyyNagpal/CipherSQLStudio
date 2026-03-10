const { GoogleGenerativeAI } = require('@google/generative-ai');
const GEMINI_KEY = process.env.GEMINI_API_KEY || AIzaSyATdjYhyZA_eOWbq5DnBUtNdiJzGrE2BL4;
const ASSIGNMENTS = require('../utils/assignments');

let genAI;
const getGeminiClient = () => {
  if (!genAI) {
genAI = new GoogleGenerativeAI(GEMINI_KEY);
  }
  return genAI;
};

/**
 * POST /api/hint
 * Body: { assignmentId, currentQuery, errorMessage, questionPart }
 */
const getHint = async (req, res) => {
  console.log('Gemini key present:', !!process.env.GEMINI_API_KEY);
  console.log('Key value:', process.env.GEMINI_API_KEY);
  const { assignmentId, currentQuery, errorMessage, questionPart } = req.body;

  if (!assignmentId) {
    return res.status(400).json({ error: 'assignmentId is required.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: 'Hint service is not configured.' });
  }

  const assignment = ASSIGNMENTS.find(a => a.id === assignmentId);
  if (!assignment) {
    return res.status(404).json({ error: 'Assignment not found.' });
  }

  try {
    const client = getGeminiClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Build the prompt with strong instructions to guide, not solve
    const prompt = buildHintPrompt({
      assignment,
      currentQuery: currentQuery || '',
      errorMessage: errorMessage || '',
      questionPart: questionPart || '',
    });

    const result = await model.generateContent(prompt);
    const hint = result.response.text();

    res.json({ hint });
  } catch (err) {
    console.error('Gemini API error:', err);

    // Handle specific Gemini errors
    if (err.message && err.message.includes('API_KEY')) {
      return res.status(503).json({ error: 'Hint service configuration error.' });
    }

    res.status(500).json({ error: 'Failed to generate hint. Please try again.' });
  }
};

/**
 * Builds a carefully engineered prompt that:
 * 1. Explains the context to the LLM
 * 2. STRICTLY forbids giving the full solution
 * 3. Guides the student step by step
 * 4. Addresses the specific error if present
 */
const buildHintPrompt = ({ assignment, currentQuery, errorMessage, questionPart }) => {
  const tableList = assignment.tables.join(', ');
  const conceptsList = assignment.expectedConcepts.join(', ');

  let contextSection = '';

  if (currentQuery.trim()) {
    contextSection += `\nThe student has written this SQL query:\n\`\`\`sql\n${currentQuery}\n\`\`\`\n`;
  } else {
    contextSection += '\nThe student has not written any query yet.\n';
  }

  if (errorMessage.trim()) {
    contextSection += `\nTheir query produced this error:\n"${errorMessage}"\n`;
  }

  if (questionPart.trim()) {
    contextSection += `\nThey are specifically asking about: "${questionPart}"\n`;
  }

  return `You are a SQL teaching assistant helping a student learn SQL. Your job is to provide HINTS and GUIDANCE, never complete solutions.

## CRITICAL RULES - YOU MUST FOLLOW THESE:
1. NEVER write the complete answer or complete SQL query for the student
2. NEVER show them the exact WHERE clause, JOIN condition, or GROUP BY they need
3. Instead, ask guiding questions that lead them to discover the answer themselves
4. Point to relevant SQL concepts they should research (like: "Look into how GROUP BY works with HAVING")
5. If they have an error, explain what the error means in plain English
6. Keep your hint to 3-5 sentences maximum
7. End with an encouraging question that makes them think

## Assignment Context:
- **Title**: ${assignment.title}
- **Difficulty**: ${assignment.difficulty}  
- **Tables available**: ${tableList}
- **SQL concepts this assignment tests**: ${conceptsList}

## Assignment Question:
${assignment.question}
${contextSection}

## Your Task:
Provide a helpful hint that:
- Explains the CONCEPT needed, not the code
- If there is an error, explain what it means in simple terms
- Points to the right SQL clause or function to look into
- Asks them a guiding question to nudge their thinking
- Does NOT write any SQL for them (not even partial queries)

Remember: A good hint makes the student feel capable, not dependent on you. Guide, don't solve.`;
};

module.exports = { getHint };
