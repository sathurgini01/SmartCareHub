require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5006;

app.listen(PORT, () => {
  console.log(`AI Symptom Service running on port ${PORT}`);
});