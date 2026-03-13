require('dotenv').config({ path: __dirname + '/.env' }); // Assuming .env is in the backend directory

const confusionService = require('./services/confusionService');

const testTelemetry = {
  mouseData: { erraticMovements: 12, speed: "slow", unstructuredHovering: true },
  scrollData: { reversals: 7, readingSpeed: "inconsistent" },
  faceEmotion: "frustrated"
};

async function runTest() {
  try {
    console.log("Testing calculateConfusionScore with data:", testTelemetry);
    const result = await confusionService.calculateConfusionScore(testTelemetry);
    console.log("\\n--- Result ---");
    console.log(JSON.stringify(result, null, 2));
    console.log("Test completely successful.");
  } catch (err) {
    console.error("Test failed:", err);
  }
}

runTest();
