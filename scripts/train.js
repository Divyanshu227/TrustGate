import fs from 'fs';
import { parse } from 'csv-parse';
import natural from 'natural';
import path from 'path';

console.log("Starting model training...");

const classifier = new natural.BayesClassifier();
let count = 0;

fs.createReadStream('./lib/emails.csv')
  .pipe(parse({ delimiter: ',', columns: true }))
  .on('data', function(csvrow) {
      if (csvrow.text && csvrow.spam) {
          const label = csvrow.spam === '1' ? 'Spam' : 'Safe';
          classifier.addDocument(csvrow.text, label);
          count++;
          if (count % 500 === 0) {
              console.log(`Loaded ${count} documents...`);
          }
      }
  })
  .on('end', function() {
      console.log(`Finished loading ${count} documents. Training now... (This may take a minute)`);
      classifier.train();
      
      console.log("Training complete! Saving to lib/classifier.json...");
      classifier.save('./lib/classifier.json', function(err, classifier) {
          if (err) {
              console.error("Error saving model:", err);
          } else {
              console.log("Model successfully saved to lib/classifier.json!");
          }
      });
  })
  .on('error', function(err) {
      console.error("Error parsing CSV:", err);
  });
