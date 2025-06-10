const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;

export const getGeminiReply = async (userInput: string): Promise<string> => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: userInput }
            ]
          }
        ]
      }),
    });

    const data = await response.json();

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply || reply.trim() === "") {
      return "I'm having trouble responding right now. Please try again later.";
    }

    return reply;
  } catch (error: any) {
    console.error('Gemini API Error:', error?.message || error);
    return "I'm having trouble responding right now. Please try again later.";
  }
};
