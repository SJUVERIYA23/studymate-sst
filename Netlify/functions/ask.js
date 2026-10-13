exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    const apiKey = process.env.GROQ_API_KEY; // Grabs key safely from Netlify Vault!

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are an elite CBSE Class 10 SST Board Examiner. Provide surgical, high-yield revision using strict NCERT terminology. BOLD all key dates, terms, and names. 

Format:
### 📌 1. THE TOP 20 HIGH-PROBABILITY PYQs
Give 20 questions + bulleted answers with bold keywords.

### 🔍 2. HIDDEN NCERT DETAILS (Don't Lose These Marks!)
Give 15 specific box/map/date details often skipped.

### ⚠️ 3. THE COMMON EXAM TRAP
Identify 10 common error and the fix.`
          },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: "Server Error", details: error.message }) 
    };
  }
};
