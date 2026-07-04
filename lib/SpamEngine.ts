export class SpamEngine {
  public static analyze(message: string) {
    const lowercaseMessage = message.toLowerCase();
    
    const spamKeywords = ["congratulations", "won", "$", "click now", "urgent", "lottery", "free money"];
    const suspiciousUrls = ["http://", "https://"]; // simplistic check
    
    let score = 0;
    const reasons: string[] = [];
    
    spamKeywords.forEach(keyword => {
      if (lowercaseMessage.includes(keyword)) {
        score += 25;
        reasons.push(`Suspicious promotional language detected: '${keyword}'`);
      }
    });
    
    if (suspiciousUrls.some(url => lowercaseMessage.includes(url))) {
      score += 15;
      reasons.push("Contains URLs which may be phishing attempts");
    }
    
    // Cap score at 100
    const confidence = Math.min(score, 100);
    const threatScore = (confidence / 10).toFixed(1);
    
    let classification = "Safe";
    if (confidence > 75) {
      classification = "Spam";
    } else if (confidence > 40) {
      classification = "Suspicious";
    }
    
    return {
      classification,
      confidence,
      threatScore: parseFloat(threatScore),
      reasons: reasons.length > 0 ? reasons : ["Message appears safe."]
    };
  }
}
