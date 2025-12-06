import { GoogleGenAI } from "@google/genai";
import { Chapter, NoteAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PAST_EXAM_CONTEXT = `
  华中师范大学 2023-2024 学年第一学期 期末考试试卷(A 卷) 数学分析 3
  
  【核心考题映射】:
  1. [选择题] 二元函数极限 (xy)/(x^2+y^2). (对应章节: 第十六章)
  2. [选择题] Gamma函数表达式. (对应章节: 第十九章)
  3. [选择题] 交换积分次序. (对应章节: 第二十一章)
  4. [选择题] 点列的敛散性. (对应章节: 第十六章)
  5. [选择题] 偏导数、可微性与连续性的关系辨析. (对应章节: 第十七章)
  6. [填空题] 极限计算 lim xy/sqrt(x^2+y^2). (对应章节: 第十六章)
  7. [填空题] 反常二重积分计算 (含圆域). (对应章节: 第二十一章)
  8. [填空题] 复合函数全微分 (含三角函数). (对应章节: 第十七章)
  9. [填空题] 曲面切平面方程 x^2+2y^2+3z^2=6. (对应章节: 第十七章/二十二章)
  10. [填空题] 梯度计算. (对应章节: 第十七章)
  11. [计算题] 二重积分换元法 (u=x+y, v=x-y). (对应章节: 第二十一章)
  12. [计算题] 曲线积分 (格林公式/斯托克斯公式) 在交线上的应用. (对应章节: 第二十章/二十二章)
  13. [计算题] 隐函数定理证明及全微分计算. (对应章节: 第十八章)
  14. [计算题] 曲面积分 (高斯公式应用). (对应章节: 第二十二章)
  15. [计算题] 多元函数极值 (条件极值/无条件极值). (对应章节: 第十七章/十八章)
  16. [证明题] 证明函数在原点不可微. (对应章节: 第十七章)
  17. [证明题] 含参量积分满足微分方程. (对应章节: 第十九章)
  18. [综合题] 含参量反常积分的一致收敛性证明. (对应章节: 第十九章)
`;

// 1. 生成主复习讲义
export const generateChapterAnalysis = async (chapter: Chapter): Promise<string> => {
  const model = "gemini-2.5-flash";
  
  const prompt = `
    Role: 你是华东师范大学数学系的一位资深助教 (Academic Mentor)。
    
    Goal: 帮助一名基础稍弱、急需通过期末考试的学生复习 **${chapter.title}**。
    
    Strategy (Logic Chain):
    学生最大的困难是觉得多元微积分抽象。请严格遵循以下逻辑链条进行讲解：
    
    1.  **概念降维 (The Bridge)**: 不要上来就讲新概念。先回顾“一元微积分”中对应的旧概念，然后用 **表格** 对比，告诉她从一维变成多维，什么变了，什么没变。
    2.  **核心计算流 (The Algorithm)**: 针对期末考试侧重计算的特点，总结 2-3 个核心题型的“傻瓜式”计算步骤。**必须针对每个步骤配一个具体的、简单的计算例题 (Example)**，让她知道数字是怎么代进去的。
    3.  **避坑指南 (Pitfalls)**: 指出往届学生最容易扣分的地方。
    4.  **真题实战 (Exam Link)**: 明确指出本章内容对应去年试卷的哪道题，并简述思路。

    Format Requirements (Markdown):
    
    # ${chapter.title} 复习讲义

    > **助教寄语**: 用一两句话通俗概括本章在考卷中的地位。

    ## 1. 知识迁移：从一元到多元
    (此处必须包含一个 Markdown 表格，列: "一元情形 (Math 1/2)", "多元情形 (Math 3)", "本质区别/注意事项")

    ## 2. 核心考点与解题模版 (含例题)
    
    ### 题型一：[题型名称]
    *   **识别**: 题目里出现什么字眼就要用这个方法？
    *   **通用步骤**:
        1. ...
        2. ...
    *   **📘 典型例题**:
        > **题目**: [给出一个基础但经典的题目]
        > **解**: 
        > 1. 第一步...
        > 2. 第二步...
        > **答案**: ...
    
    ### 题型二：[题型名称]
    ... (同样格式，必须包含例题)

    ## 3. 必背公式清单 (Cheat Sheet)
    *   公式 A: ...
    *(使用 LaTeX 格式)*

    ## 4. 易错点 (高能预警)
    *   ⚠️ [错误类型 1]: ...

    ## 5. 真题链接
    *本章内容对应 23-24 期末试卷中的：*
    - **第 X 题**: [简述题目类型]。

    Tone: 专业、清晰、逻辑性强，但也带有鼓励性。
    Context: 此时是期末复习冲刺阶段。
    Reference: ${PAST_EXAM_CONTEXT}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { temperature: 0.2 }
    });
    return response.text || "助教正在整理笔记...";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("连接助教服务器超时。");
  }
};

// 2. 答疑助手
export const askTutor = async (chapter: Chapter, question: string, history: string): Promise<string> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Context: 正在复习华东师范大学数学分析教材的 **${chapter.title}**。
    User Question: "${question}"
    
    Role: 你的身份是负责答疑的助教。
    Requirement:
    1.  直接回答学生的问题，语言要通俗易懂，不要掉书袋。
    2.  **必须**举一个具体的**小例子 (Example)** 来佐证你的解释。例如，如果问“什么是偏导数”，就构造一个 z=x^2+y^2 来算给她看。
    3.  如果涉及到计算细节，分步写出过程。
    
    Previous Chat Context:
    ${history}
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text || "助教思考中...";
  } catch (error) {
    return "网络波动，请重试。";
  }
};

// 3. 笔记诊断与薄弱点分析
export const analyzeWeakness = async (chapter: Chapter, notes: string): Promise<NoteAnalysis> => {
  const model = "gemini-2.5-flash";
  const prompt = `
    Task: 分析学生关于 **${chapter.title}** 的复习笔记，找出薄弱环节。
    Student Notes: "${notes}"
    
    Output Format (JSON):
    请返回一个 JSON 对象，包含三个字段：
    - weakness: (String) 分析她对哪些概念理解不清或记得不牢。
    - suggestion: (String) 针对薄弱点的具体复习建议（看书看哪里，或者背哪个公式）。
    - practiceProblem: (String) 出一道针对性的计算题（带答案），让她练手。
    
    Example Output:
    {
      "weakness": "你似乎混淆了全微分存在的充分条件和必要条件...",
      "suggestion": "建议重点复习定理 17.X，记住可微一定连续，但连续不一定可微...",
      "practiceProblem": "**题目**: 判定 f(x,y)=... 在 (0,0) 的可微性。\\n**答案**: ..."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    const text = response.text || "{}";
    // Clean potential markdown code blocks
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr) as NoteAnalysis;
  } catch (error) {
    console.error(error);
    return {
      weakness: "无法分析笔记内容，请确保笔记有实质性数学内容。",
      suggestion: "请多记录一些你对于定义或者计算步骤的理解。",
      practiceProblem: "暂无推荐题目。"
    };
  }
};
