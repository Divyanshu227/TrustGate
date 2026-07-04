import natural from 'natural';
import fs from 'fs';
import path from 'path';

export class SpamEngine {
  private static classifier: natural.BayesClassifier | null = null;
  private static isTrained = false;

  private static initialize() {
    if (this.isTrained) return;
    
    try {
      const modelPath = path.join(process.cwd(), 'lib', 'classifier.json');
      const rawData = fs.readFileSync(modelPath, 'utf8');
      this.classifier = natural.BayesClassifier.restore(JSON.parse(rawData));
      this.isTrained = true;
      console.log("Successfully loaded pre-trained model from classifier.json.");
    } catch (err) {
      console.warn("Could not load classifier.json, falling back to basic training.");
      // Initialize Naive Bayes Classifier
      this.classifier = new natural.BayesClassifier();
      
      // Training Data: Spam
      this.classifier.addDocument("Congratulations! You won the lottery. Click here to claim your $5000 prize.", "Spam");
      this.classifier.addDocument("Urgent: Your account will be locked. Please verify your credentials immediately.", "Spam");
      this.classifier.addDocument("Free money! Earn $500 a day working from home. Join now.", "Spam");
      this.classifier.addDocument("Claim your free iPhone today. Offer ends in 10 minutes.", "Spam");
      this.classifier.addDocument("You have been selected for a special loan offer. Low interest guaranteed.", "Spam");
      this.classifier.addDocument("Buy cheap viagra and cialis online.", "Spam");
      this.classifier.addDocument("Invest in crypto today and 100x your returns guaranteed.", "Spam");
      
      // Training Data: Safe
      this.classifier.addDocument("Hey, are we still meeting for lunch at 12?", "Safe");
      this.classifier.addDocument("Please find attached the financial report for Q3.", "Safe");
      this.classifier.addDocument("I loved the new movie! We should watch it again.", "Safe");
      this.classifier.addDocument("Can you review my pull request when you have a moment?", "Safe");
      this.classifier.addDocument("Let's schedule a call to discuss the project architecture.", "Safe");
      this.classifier.addDocument("Happy birthday! Hope you have a wonderful day.", "Safe");
      this.classifier.addDocument("The package has been delivered to your front door.", "Safe");

      this.classifier.train();
      this.isTrained = true;
    }
  }

  public static analyze(message: string) {
    this.initialize();

    const reasons: string[] = [];
    let score = 0;
    const lowerMessage = message.toLowerCase();

    // 1. ML Classification via Naive Bayes
    const mlClassification = this.classifier!.classify(message);
    const classifications = this.classifier!.getClassifications(message);
    
    // Get the confidence of the "Spam" class vs "Safe"
    const spamProb = classifications.find(c => c.label === "Spam")?.value || 0;
    const safeProb = classifications.find(c => c.label === "Safe")?.value || 0;
    
    // Normalize probability to a percentage (0-100)
    const mlConfidence = (spamProb / (spamProb + safeProb)) * 100;
    
    if (mlConfidence > 70) {
      reasons.push("ML Model classified this text as Spam based on linguistic patterns.");
      score += (mlConfidence * 0.6); // ML accounts for 60% of total score
    }

    // 2. Advanced Heuristics (Links and Tokens)
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const urls = message.match(urlPattern);
    
    if (urls && urls.length > 0) {
      reasons.push(`Found ${urls.length} URL(s). Links from untrusted sources are high-risk.`);
      score += Math.min(urls.length * 15, 30); // Max 30 points for URLs
      
      // Check for suspicious domains or IP addresses in URLs
      const ipPattern = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/;
      if (urls.some(url => ipPattern.test(url))) {
        reasons.push("IP-based URL detected (common in phishing).");
        score += 25;
      }
    }

    // 3. Typographic & Formatting Heuristics
    const capsRatio = (message.match(/[A-Z]/g)?.length || 0) / message.length;
    if (capsRatio > 0.4 && message.length > 10) {
      reasons.push("Excessive use of capital letters.");
      score += 15;
    }

    const specialCharRatio = (message.match(/[$!%*#]/g)?.length || 0) / message.length;
    if (specialCharRatio > 0.05) {
      reasons.push("Unusually high density of special characters/symbols.");
      score += 10;
    }

    // 4. Final Scoring Logic
    const finalConfidence = Math.min(Math.round(score), 100);
    const threatScore = (finalConfidence / 10).toFixed(1);

    let classification = "Safe";
    if (finalConfidence >= 75) {
      classification = "Spam";
    } else if (finalConfidence >= 45) {
      classification = "Suspicious";
    }

    if (classification === "Safe" && reasons.length === 0) {
      reasons.push("Message appears entirely safe and conversational.");
    }

    return {
      classification,
      confidence: finalConfidence,
      threatScore: parseFloat(threatScore),
      reasons,
      mlDetails: {
        rawScore: spamProb,
        normalizedConfidence: Math.round(mlConfidence)
      }
    };
  }
}
