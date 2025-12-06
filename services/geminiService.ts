import { GoogleGenAI } from "@google/genai";
import { Chapter } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PAST_EXAM_CONTEXT = `
  华中师范大学 2023-2024 学年第一学期 期末考试试卷(A 卷) 数学分析 3
  Key Exam Questions found in the paper:
  1. Multiple Choice: Limit of (xy)/(x^2+y^2). (Chapter 16)
  2. Multiple Choice: Gamma function expression. (Chapter 19)
  3. Multiple Choice: Changing order of integration dxdy to dydx. (Chapter 21)
  4. Multiple Choice: Sequence of points convergence. (Chapter 16)
  5. Multiple Choice: Relationship between Partial Derivatives, Differentiability, and Continuity. (Chapter 17)
  6. Limit calculation: lim xy/sqrt(x^2+y^2). (Chapter 16)
  7. Improper integral calculation: lim double integral over circle. (Chapter 21)
  8. Total differential of composite function involving sin/cos. (Chapter 17)
  9. Tangent plane equation to surface x^2+2y^2+3z^2=6. (Chapter 17/22)
  10. Gradient calculation of xy^2+yz^3. (Chapter 17)
  11. Calculation: Double integral (x+y)sin(x-y) using change of variables u=x+y, v=x-y. (Chapter 21)
  12. Calculation: Line integral (Green/Stokes) on intersection of sphere and plane. (Chapter 20/22)
  13. Implicit function theorem proof and differential calculation. (Chapter 18)
  14. Surface integral (Gauss formula application). (Chapter 22)
  15. Extremum of multivariable function (Lagrange/Unconstrained). (Chapter 17/18)
  16. Proof: Non-differentiability of sqrt(|xy|) at (0,0). (Chapter 17)
  17. Differential equation verification for integral function. (Chapter 19)
  18. Uniform convergence of parametric integral. (Chapter 19)
`;

export const generateChapterAnalysis = async (chapter: Chapter): Promise<string> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Role: You are a friendly, experienced Senior Tutor (学长/学姐) helping a junior student pass their "Mathematical Analysis 3" final exam at ECNU.
    
    Target Audience: A student who is struggling and worried about failing. They prefer calculation over complex proofs. They need clear, visual connections to things they already know.
    
    Current Chapter: **${chapter.title}** (${chapter.description})
    
    Context: The student has provided a past exam paper (Content: ${PAST_EXAM_CONTEXT}).
    
    Task: Create a Markdown study guide specifically for this chapter.
    
    Format Guidelines:
    1.  **Tone**: Conversational, encouraging, not dry. Use "You" and "We".
    2.  **Visual Connections**: Use Tables or "ASCII Maps" to compare "Old Knowledge (Volume 1/Calculus 1)" vs "New Knowledge (Volume 2)".
    3.  **Exam Focus**: Explicitly mention if a concept appeared in the provided Past Exam Paper.
    4.  **Textbook References**: Label theorems with their likely Theorem Number (e.g., Theorem 17.5) or page reference hints (e.g., "See Book P.120") to make it feel like a real companion to the ECNU textbook.

    Structure:
    
    # ${chapter.title} - 期末救急指南 🚑
    
    ## 1. 它是怎么来的？ (The Connection)
    *Don't just define it.* Create a comparison table:
    | Volume 1 (Old Friend) | Volume 2 (New Enemy?) | Connection |
    | --------------------- | --------------------- | ---------- |
    | (e.g. f'(x))         | (e.g. grad f)         | (Explanation) |
    
    ## 2. 核心计算 (Must-Know Calculations)
    *Focus on the Exam.* List the 2-3 most likely calculation types for this chapter.
    *   **Type 1**: [Name] -> [Formula] -> [Step-by-step Strategy]
    *   *Reference*: "This is like Question X in the 23-24 Exam."
    
    ## 3. 课本重点打卡 (Book Marking)
    List key theorems the student should bookmark in their ECNU textbook.
    *   **Theorem [Number]**: [Name] - *Why it matters?*
    
    ## 4. 常见“坑”与“雷” (Traps)
    What mistakes do students usually make? (e.g., forgetting the Jacobian determinant, mixing up Green's vs Stokes).
    
    ## 5. 简单对话 (Q&A)
    Simulate a short dialogue where the student asks a "dumb question" and you answer it simply.
    
    Start generating now in Chinese (Simplified). Use LaTeX for math.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.4, 
      }
    });

    return response.text || "生成失败，请重试。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("AI 响应超时，请检查网络连接。");
  }
};