
import { GoogleGenAI } from "@google/genai";
import { InternshipApplication, UserProfile } from "../types";

export const getAIInsights = async (applications: InternshipApplication[], user?: UserProfile) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const userContext = user 
    ? `The user is ${user.name}. Their current career goal is: "${user.goal}" in the ${user.targetIndustry} industry.`
    : "The user is an anonymous applicant.";

  const prompt = `
    As an expert career coach, analyze the following internship application data and provide 3-4 concise, actionable insights.
    
    Context: ${userContext}
    
    Application Data: ${JSON.stringify(applications)}
    
    Please ensure the tips are highly personalized to their goals.
    
    Format the response as a JSON object with:
    {
      "summary": "one sentence overview personalized to the user",
      "tips": ["personalized tip 1", "personalized tip 2", "personalized tip 3"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    return JSON.parse(response.text || '{"summary": "No data to analyze", "tips": []}');
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "I'm having trouble analyzing your specific career path right now, but your momentum is great!",
      tips: ["Review your resume for each specific role.", "Follow up 1 week after applying.", "Network on LinkedIn with employees."]
    };
  }
};
