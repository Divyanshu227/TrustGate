import { Router } from 'express';
import { SpamEngine } from '../services/SpamEngine';

const router = Router();

// In a real app, you'd have an API Key verification middleware here.
// router.use(apiKeyMiddleware);

router.post('/analyze', async (req, res) => {
  try {
    const { message, source } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message content is required.' });
    }
    
    // Process through the Spam Engine
    const result = SpamEngine.analyze(message);
    
    // Normally you'd log the result to the database here using Prisma.
    // e.g. await prisma.spamLog.create({ ... })

    return res.json(result);
  } catch (error) {
    console.error("Error in spam analysis:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
