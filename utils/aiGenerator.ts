
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserProfile, LearningUnit, GameActivity, Question } from "../types";

// --- GLOBAL CONFIGURATION ---
let GLOBAL_API_KEY = "";
let PREFERRED_MODEL = "gemini-1.5-flash";

const MODEL_FALLBACK_LIST = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro",
  "gemini-1.0-pro",
  "gemini-pro"
];

export const setGlobalApiKey = (key: string) => {
  GLOBAL_API_KEY = key;
};

export const setGlobalModel = (model: string) => {
  let actualModel = model;
  
  // Clean up exact names from UI dropdowns which might include "models/" prefix
  if (actualModel.startsWith("models/")) {
    actualModel = actualModel.replace("models/", "");
  }

  // Handle fictional future models or known problematic models from UI/Cloud
  if (actualModel.includes("gemini-3") || actualModel.includes("preview")) {
    actualModel = "gemini-2.0-flash"; 
  }
  
  PREFERRED_MODEL = actualModel;
};

// --- HELPER: FALLBACK GENERATION ---
const generateWithFallback = async (
  contents: any,
  config: any,
  taskName: string = "Generation"
): Promise<any> => {
  // Ultra-resilient model sequence: Try newest stable models first, then fall back to older ones
  const modelsToTry = [
    "gemini-2.0-flash",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
    "gemini-pro"
  ];
  
  // If user has a valid preference, put it at front (but still try flash if it fails)
  if (PREFERRED_MODEL && !modelsToTry.includes(PREFERRED_MODEL)) {
    modelsToTry.unshift(PREFERRED_MODEL);
  }

  let errors: string[] = [];
  const TIMEOUT_MS = 90000; // Increased to 90 seconds for high reliability

  for (const model of modelsToTry) {
    try {
      const ai = new GoogleGenerativeAI(GLOBAL_API_KEY);
      
      // Defensively strip "models/" again right before calling the SDK
      let cleanModel = model;
      if (cleanModel.startsWith("models/")) {
        cleanModel = cleanModel.replace("models/", "");
      }
      
      const genModel = ai.getGenerativeModel({ 
        model: cleanModel,
        systemInstruction: config?.systemInstruction
      });

      const reqContents = typeof contents === 'string' 
        ? [{ role: "user", parts: [{ text: contents }] }]
        : (Array.isArray(contents) ? contents : [contents]);

      const result = await Promise.race([
        genModel.generateContent({
          contents: reqContents,
          generationConfig: {
            responseMimeType: config?.responseMimeType || "application/json",
            maxOutputTokens: 8192,
            temperature: config?.temperature || 0.7
          }
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), TIMEOUT_MS))
      ]) as any;

      return { text: result.response.text() };
    } catch (error: any) {
      console.warn(`${taskName} failed with ${model}. Error:`, error);
      errors.push(`[${model}] ${error.message}`);
      
      // If we hit a rate limit/quota issue (429), log clearly but CONTINUE trying other models
      // because different model tiers (e.g. 1.0 vs 2.5) have separate rate limit buckets
      if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota")) {
        errors.push(`[${model}] Hết lượt sử dụng miễn phí (Quota Exceeded). Vui lòng thử lại sau vài phút hoặc dùng API Key khác.`);
        // We removed the 'break' here to ensure the system exhaustively tries all fallback models
      } else {
        errors.push(`[${model}] ${error.message}`);
      }
    }
  }

  // If all failed, provide a very clear human-readable summary if it's purely a quota issue
  const allQuotaErrors = errors.every(e => e.includes("Hết lượt sử dụng") || e.includes("429"));
  if (allQuotaErrors) {
      throw new Error(`API Key của bạn đã hết lượt sử dụng miễn phí (Quota Exceeded) cho tất cả các mô hình. Vui lòng tạo API Key mới từ Google AI Studio hoặc nâng cấp tài khoản, sau đó vào phần Cài đặt của ứng dụng để cập nhật.`);
  }

  throw new Error(`AI không phản hồi. Chi tiết: ${errors.join(' | ')}`);
};

const MATH_FORMATTING_RULES = `
QUY TẮC HIỂN THỊ CÔNG THỨC TOÁN HỌC (QUAN TRỌNG):
1. LUÔN hiển thị công thức toán học dưới dạng ký hiệu Unicode đẹp mắt hoặc HTML đơn giản.
2. KHÔNG dùng LaTeX ($$, $).
3. PHÂN SỐ: Dùng thẻ <span class="fraction"><span class="num">a</span><span class="den">b</span></span>
4. MŨ: x² (Unicode) hoặc x<sup>2</sup> (HTML)
5. CHỈ SỐ DƯỚI: aₙ (Unicode) hoặc a<sub>n</sub> (HTML)
6. CĂN: √x hoặc √<span class="under-root">abc</span>
7. KÝ HIỆU: ± × ÷ ≤ ≥ ≠ ≈ ∞ ∈ ∪ ∩ ∅ π Δ Σ ∫
8. ĐỊNH DẠNG: Với các biểu thức phức tạp, hãy dùng thẻ HTML để trình bày rõ ràng. Đảm bảo thẻ HTML đóng đúng.
`;

const VIETNAMESE_CURRICULUM_GUIDELINES = `
CHƯƠNG TRÌNH GIÁO DỤC PHỔ THÔNG 2018 - TOÁN THPT (Lớp 10, 11, 12):
- LỚP 10: Tập trung vào Logic toán học, Tập hợp, Bất phương trình bậc nhất 2 ẩn, Hệ thức lượng trong tam giác, Vectơ, Thống kê, Hàm số bậc hai, Dấu tam thức bậc hai, Phương pháp tọa độ trong mặt phẳng, Đại số tổ hợp, Xác suất.
- LỚP 11: Hàm số lượng giác, Phương trình lượng giác, Dãy số, Cấp số cộng/nhân, Giới hạn, Quan hệ song song trong không gian, Thống kê ghép nhóm, Hàm số Mũ/Logarit, Đạo hàm, Quan hệ vuông góc trong không gian, Xác suất có điều kiện.
- LỚP 12: Ứng dụng đạo hàm khảo sát hàm số, Vectơ và tọa độ Oxyz trong không gian, Nguyên hàm, Tích phân, Ứng dụng tích phân tính diện tích/thể tích, Xác suất Bayes.

YÊU CẦU VỀ DẠNG BÀI:
1. TRẮC NGHIỆM 4 LỰA CHỌN: Chuẩn cấu trúc A, B, C, D. Các nhiễu phải hợp lý.
2. TRẮC NGHIỆM ĐÚNG/SAi: Đưa ra một nhận định và yêu cầu học sinh chọn "Đúng" hoặc "Sai".
3. TRẮC NGHIỆM TRẢ LỜI NGẮN: Kết quả là một số cụ thể hoặc biểu thức đơn giản.
`;

export const chatWithAI = async (
  user: UserProfile,
  message: string,
  history: { role: 'user' | 'model', content: string }[],
  mode: 'hint' | 'guide' | 'solution',
  imageBase64?: string | null
): Promise<string> => {
  // 1. Determine Persona based on Numerology
  const num = user.numerologyNumber || 0;

  let toneInstruction = "Thân thiện, kiên nhẫn và khích lệ."; // Default

  if ([1, 8, 22].includes(num)) {
    toneInstruction = "Thẳng thắn, tập trung vào mục tiêu, thách thức học sinh tư duy độc lập. Ngắn gọn, súc tích.";
  } else if ([2, 6, 9].includes(num)) {
    toneInstruction = "Cực kỳ nhẹ nhàng, quan tâm cảm xúc, dùng nhiều lời khen và động viên. Tạo cảm giác an toàn.";
  } else if ([3, 5].includes(num)) {
    toneInstruction = "Hài hước, vui vẻ, dùng icon sinh động. Biến bài toán thành câu chuyện hoặc trò chơi thú vị.";
  } else if ([4, 7].includes(num)) {
    toneInstruction = "Logic, chi tiết, có cấu trúc rõ ràng. Giải thích nguyên lý cặn kẽ.";
  }

  // 2. Determine Response Strategy based on Mode
  let modeInstruction = "";
  switch (mode) {
    case 'hint':
      modeInstruction = "CHẾ ĐỘ GỢI Ý NHẸ: Tuyệt đối KHÔNG đưa ra đáp án hay công thức ngay. Chỉ đưa ra một manh mối nhỏ, một câu hỏi gợi mở hoặc nhắc lại định nghĩa liên quan để học sinh tự suy nghĩ.";
      break;
    case 'guide':
      modeInstruction = "CHẾ ĐỘ HƯỚNG DẪN: Cung cấp công thức, phương pháp giải hoặc các bước thực hiện. KHÔNG tính toán ra kết quả cuối cùng. Hãy để học sinh tự thực hiện bước tính toán.";
      break;
    case 'solution':
      modeInstruction = "CHẾ ĐỘ GIẢI CHI TIẾT: Trình bày lời giải đầy đủ, từng bước một, có kết quả cuối cùng. Giải thích rõ ràng tại sao lại làm như vậy.";
      break;
  }

  const textPrompt = `
    Bạn là AI Tutor dạy toán riêng cho học sinh tên "${user.name}".
    Học sinh đang học Lớp ${user.grade}.
    
    TÍNH CÁCH & PHONG CÁCH CỦA BẠN:
    ${toneInstruction}
    Hãy xưng hô là "Cô" hoặc "Mình" tùy theo sự thân thiện, gọi học sinh là "bạn" hoặc tên "${user.name}".
    
    YÊU CẦU HIỆN TẠI:
    ${modeInstruction}
    ${imageBase64 ? "Học sinh vừa gửi kèm một hình ảnh bài tập. Hãy xem kỹ hình ảnh và giúp đỡ học sinh." : ""}

    ${MATH_FORMATTING_RULES}

    LỊCH SỬ CHAT:
    ${history.map(h => `${h.role === 'user' ? 'Học sinh' : 'AI'}: ${h.content}`).join('\n')}

    CÂU HỎI MỚI CỦA HỌC SINH:
    "${message}"

    Hãy trả lời ngay bây giờ (Không dùng JSON, trả lời trực tiếp bằng text/HTML đơn giản):
    `;

  let parts: any[] = [];

  if (imageBase64) {
    const match = imageBase64.match(/^data:(.+);base64,(.+)$/);
    if (match) {
      parts.push({
        inlineData: {
          mimeType: match[1],
          data: match[2]
        }
      });
    }
  }

  parts.push({ text: textPrompt });

  try {
    const response = await generateWithFallback(
      { parts: parts },
      {
        systemInstruction: "You are a professional Math Teacher. Be accurate, clear, and follow the specific response mode rules.",
        generationConfig: {
          temperature: 0.4, // Lower temperature for more consistent math
          topP: 0.8,
          maxOutputTokens: 1024,
        }
      },
      "Chat AI"
    );
    return response.text || "Xin lỗi, cô đang suy nghĩ chút, em hỏi lại nhé?";
  } catch (error: any) {
    console.error("Chat Error", error);
    return `Hệ thống gặp lỗi: ${error.message || "Không thể kết nối"}. Vui lòng kiểm tra API Key.`;
  }
};

// Optimized: Only generates titles and metadata, no questions (FAST)
export const generateLearningPath = async (
  user: UserProfile,
  topics: string[]
): Promise<LearningUnit[]> => {
  const adjustedLevel = user.proficiencyLevel || 2;
  const levelDesc = ["Yếu", "Trung bình", "Khá", "Xuất sắc"][adjustedLevel - 1] || "Trung bình";

  const prompt = `
    Đóng vai một chuyên gia giáo dục toán học AI.
    Nhiệm vụ: Thiết kế danh sách các BÀI HỌC (Learning Units) cho lộ trình học tập Toán THPT Lớp ${user.grade}.
    Chủ đề: ${topics.join(", ")}. Năng lực học sinh: ${levelDesc}.
    
    YÊU CẦU:
    - CHỈ sử dụng kiến thức Toán THPT Lớp ${user.grade}, tuyệt đối KHÔNG dùng kiến thức Tiểu học/THCS.
    - Tạo 5-7 bài học cụ thể, súc tích.
    - KHÔNG tạo câu hỏi ở bước này.
    - Output JSON ONLY.
    
    === OUTPUT JSON ONLY ===
    { "units": [ { "topicId": "...", "title": "...", "description": "...", "totalXp": 100, "durationMinutes": 15 } ] }
  `;

  try {
    const response = await generateWithFallback(
      prompt,
      {
        responseMimeType: "application/json",
        systemInstruction: `Bạn là Chuyên gia Xây dựng Lộ trình Toán THPT theo Chương trình GDPT 2018 (SGK Kết nối tri thức).
        ${VIETNAMESE_CURRICULUM_GUIDELINES}
        Output strictly valid JSON.`,
        temperature: 0.7
      },
      "Generating Path"
    );

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data");
    const jsonMatch = jsonText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    const cleanedJsonText = jsonMatch ? jsonMatch[0] : jsonText;
    const parsedData = JSON.parse(cleanedJsonText);

    return parsedData.units.map((unit: any, index: number) => ({
      ...unit,
      id: `unit-${Date.now()}-${index}`,
      status: index === 0 ? 'active' : 'locked',
      level: adjustedLevel,
      questions: [] // Empty questions to be filled on-demand
    }));

  } catch (error) {
    console.error("AI Generation Error:", error);
    // FALLBACK: Return basic path if AI hits rate limit or fails
    return [
      {
        id: `unit-fallback-${Date.now()}-1`,
        topicId: "fallback",
        title: "Lỗi tạo lộ trình (AI)",
        description: `Lỗi AI: ${error instanceof Error ? error.message : String(error)}`,
        totalXp: 100,
        durationMinutes: 15,
        status: 'active',
        level: adjustedLevel,
        questions: []
      },
      {
        id: `unit-fallback-${Date.now()}-2`,
        topicId: "fallback",
        title: "Kiến thức trọng tâm (AI Đang Bận)",
        description: "Các chủ đề mặc định để bạn không bị gián đoạn việc học.",
        totalXp: 150,
        durationMinutes: 20,
        status: 'locked',
        level: adjustedLevel,
        questions: []
      }
    ];
  }
};

// New: Generates questions for a specific unit (Lazy Loading)
export const generateUnitQuestions = async (
  user: UserProfile,
  unit: LearningUnit
): Promise<Question[]> => {
  const levelDesc = ["Yếu", "Trung bình", "Khá", "Xuất sắc"][(unit.level || 2) - 1];
  
  const prompt = `
    Tạo ĐÚNG 10 câu hỏi toán học Lớp ${user.grade} (kiến thức THPT) cho bài học: "${unit.title}".
    Mô tả bài học: ${unit.description}.
    Độ khó: ${levelDesc}.

    YÊU CẦU CHẤT LƯỢNG (QUAN TRỌNG):
    - TUÂN THỦ: Chương trình GDPT 2018 và SGK Kết nối tri thức.
    - SỐ LƯỢNG: Phải tạo đủ ĐÚNG 10 câu hỏi.
    - NỘI DUNG: Phải là kiến thức Toán THPT Lớp ${user.grade}. TUYỆT ĐỐI KHÔNG dùng kiến thức cấp 1, cấp 2.
    - DẠNG BÀI: Đa dạng loại câu hỏi (trắc nghiệm 4 lựa chọn, đúng/sai, điền biểu thức/số).
    - GIẢI THÍCH: Phải có giải thích chi tiết, sư phạm, bước học sinh dễ hiểu.
    
    ${MATH_FORMATTING_RULES}

    === OUTPUT JSON ONLY ===
    { 
      "questions": [ 
        { 
          "id": "q1", 
          "type": "multiple-choice", 
          "content": "Câu hỏi trắc nghiệm 4 lựa chọn...", 
          "options": ["A...", "B...", "C...", "D..."], 
          "correctAnswer": "A...", 
          "explanation": "Giải thích...", 
          "difficulty": "medium" 
        },
        { 
          "id": "q2", 
          "type": "true-false", 
          "content": "Câu hỏi Đúng/Sai...", 
          "options": ["Đúng", "Sai"], 
          "correctAnswer": "Đúng", 
          "explanation": "Giải thích...", 
          "difficulty": "medium" 
        },
        { 
          "id": "q3", 
          "type": "fill-in-blank", 
          "content": "Câu hỏi điền số/biểu thức...", 
          "correctAnswer": "10", 
          "explanation": "Giải thích...", 
          "difficulty": "hard" 
        }
      ] 
    }
    Lưu ý: Tạo ĐÚNG 10 câu hỏi với cấu trúc JSON như trên.
  `;

  try {
    const response = await generateWithFallback(
      prompt,
      {
        responseMimeType: "application/json",
        systemInstruction: `Bạn là Giáo viên Toán THPT thực thụ, am hiểu sâu sắc Chương trình GDPT 2018. 
        Mọi đề bài phải chính xác về thuật ngữ toán học, đúng dạng bài thi của Bộ GD&ĐT Việt Nam.
        ${VIETNAMESE_CURRICULUM_GUIDELINES}
        Ensure 100% accuracy.`,
        temperature: 0.6
      },
      "Generating Questions"
    );

    const jsonText = response.text;
    if (!jsonText) throw new Error("No questions data");
    const jsonMatch = jsonText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    const cleanedJsonText = jsonMatch ? jsonMatch[0] : jsonText;
    const parsed = JSON.parse(cleanedJsonText);
    return parsed.questions;
  } catch (error) {
    console.error("Question Generation Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    // FALLBACK: Return error-diagnostic questions if AI fails
    // FALLBACK: Return error-diagnostic questions if AI fails
    const fallbackQuestions: Question[] = [];
    for (let i = 1; i <= 10; i++) {
      fallbackQuestions.push({
        id: `q_fb_${i}`,
        type: "multiple-choice",
        content: `Lỗi AI: ${errorMessage.substring(0, 150)}...`,
        options: ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
        correctAnswer: "Đáp án A",
        explanation: `Đây là câu hỏi dự phòng do hệ thống AI đang bận. Lỗi: ${errorMessage}`,
        difficulty: "easy"
      });
    }
    return fallbackQuestions;
  }
};

export const generateChallengeUnit = async (
  user: UserProfile,
  currentUnit: LearningUnit
): Promise<LearningUnit | null> => {
  const nextLevel = (currentUnit.level || 1) + 1;
    const prompt = `
      Tạo PHIÊN BẢN NÂNG CAO (Level ${nextLevel}) cho bài học "${currentUnit.title}".
      - Lớp: ${user.grade}
      - Số lượng: ĐÚNG 10 câu (20% Trung bình, 80% Khó).
      - Yêu cầu: Bám sát Chương trình GDPT 2018, độ khó nâng cao, tính phân hóa cao.
      - Output JSON ONLY (Single Unit structure).
      
      ${MATH_FORMATTING_RULES}
    `;

  try {
    const response = await generateWithFallback(
      prompt,
      {
        responseMimeType: "application/json",
        systemInstruction: `Bạn là Chuyên gia luyện thi Toán THPT. Đề bài nâng cao, logic, đúng cấu trúc.
        ${VIETNAMESE_CURRICULUM_GUIDELINES}
        JSON output only.`,
        temperature: 0.8
      },
      "Generating Challenge"
    );

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data");
    const jsonMatch = jsonText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    const cleanedJsonText = jsonMatch ? jsonMatch[0] : jsonText;
    const parsedUnit = JSON.parse(cleanedJsonText);

    return {
      ...parsedUnit,
      id: currentUnit.id,
      status: 'active',
      level: nextLevel
    };
  } catch (error) {
    console.error("Challenge Gen Error", error);
    // FALLBACK: Return the current unit but upgraded level and a note
    return {
      ...currentUnit,
      level: nextLevel,
      status: 'active',
      title: `${currentUnit.title} (Nâng cao - Dự phòng)`,
      description: "Hệ thống AI đang bận, tạm thời sử dụng bộ câu hỏi ôn tập chuyên sâu. Vui lòng thử lại sau để có bộ câu hỏi mới nhất.",
      questions: currentUnit.questions.map((q, i) => ({
        ...q,
        id: `challenge_fb_${i}`,
        difficulty: 'hard',
        content: `[Nâng cao] ${q.content}`
      }))
    };
  }
};

export const generateComprehensiveTest = async (user: UserProfile): Promise<LearningUnit | null> => {
  const prompt = `
    Tạo BÀI KIỂM TRA TỔNG HỢP (Final Exam) cho học sinh Lớp ${user.grade}.
    - 10 câu hỏi (2 Dễ, 5 TB, 3 Khó).
    - Đủ 3 loại câu hỏi: trắc nghiệm 4 lựa chọn, đúng/sai, điền biểu thức/số.
    - Nội dung: Bao quát toàn bộ chương trình lớp ${user.grade} theo GDPT 2018.
    - Output JSON ONLY (Single Unit structure).

    ${MATH_FORMATTING_RULES}
  `;
  try {
    const response = await generateWithFallback(
      prompt,
      {
        responseMimeType: "application/json",
        systemInstruction: `Bạn là Hội đồng khảo thí Toán THPT. Đề thi phải có tính phân hóa, chính xác tuyệt đối.
        ${VIETNAMESE_CURRICULUM_GUIDELINES}
        JSON output only.`,
        temperature: 0.7
      },
      "Generating Exam"
    );
    const jsonText = response.text;
    if (!jsonText) throw new Error("No data");
    const jsonMatch = jsonText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    const cleanedJsonText = jsonMatch ? jsonMatch[0] : jsonText;
    const parsedUnit = JSON.parse(cleanedJsonText);

    return {
      ...parsedUnit,
      id: `exam-${Date.now()}`,
      status: 'active',
      level: 99
    };
  } catch (error) {
    console.error("Exam Gen Error", error);
    return null;
  }
};

export const generateEntertainmentContent = async (user: UserProfile): Promise<GameActivity[]> => {
  const prompt = `
    Tạo 4-5 trò chơi toán học vui nhộn cho học sinh Lớp ${user.grade}.
    - Types: game, puzzle, challenge.
    - Mỗi game phải có 1 câu hỏi cụ thể và đáp án ngắn.
    - Output JSON ONLY.
  `;
  try {
    const response = await generateWithFallback(
      prompt,
      {
        responseMimeType: "application/json",
        systemInstruction: "You are a Gamification Master. Output format: { activities: [ { id, type, title, description, difficulty, duration, xpReward, interactiveContent, answer, hint, funFact } ] }. JSON output only.",
        temperature: 0.85
      },
      "Generating Games"
    );
    const jsonText = response.text;
    if (!jsonText) throw new Error("No data");
    const jsonMatch = jsonText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    const cleanedJsonText = jsonMatch ? jsonMatch[0] : jsonText;
    const parsed = JSON.parse(cleanedJsonText);
    return parsed.activities;
  } catch (error) {
    console.error("Game Gen Error", error);
    return [
      {
        id: "fallback-1",
        type: "puzzle",
        title: "Bí mật con số 0",
        description: "Tại sao con số 0 lại quan trọng đến thế?",
        difficulty: "Dễ",
        duration: "2 phút",
        xpReward: 50,
        interactiveContent: "Cái gì không có bắt đầu, không có kết thúc, và cũng chẳng có gì ở giữa? (Nhập tên hình học)",
        answer: "Hình tròn",
        hint: "Hình dáng của nó giống cái nhẫn.",
        funFact: "Số 0 được phát minh bởi người Ấn Độ cổ đại!"
      }
    ];
  }
};
