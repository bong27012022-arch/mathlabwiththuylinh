
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, LearningUnit, GameActivity } from "../types";

// --- GLOBAL CONFIGURATION ---
let GLOBAL_API_KEY = "";
let PREFERRED_MODEL = "gemini-3-flash-preview";

// Fallback Priority List
const MODEL_FALLBACK_LIST = [
  "gemini-3-flash-preview",
  "gemini-3-pro-preview",
  "gemini-2.5-flash"
];

export const setGlobalApiKey = (key: string) => {
  GLOBAL_API_KEY = key;
};

export const setGlobalModel = (model: string) => {
  PREFERRED_MODEL = model;
};

// --- HELPER: FALLBACK GENERATION ---
const generateWithFallback = async (
  contents: any,
  config: any,
  taskName: string = "Generation"
): Promise<any> => {
  if (!GLOBAL_API_KEY) {
    throw new Error("Vui lòng nhập API Key trong phần Cài đặt để sử dụng tính năng AI.");
  }

  // Prioritize selected model, then try others in order
  const modelsToTry = [
    PREFERRED_MODEL,
    ...MODEL_FALLBACK_LIST.filter(m => m !== PREFERRED_MODEL)
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const ai = new GoogleGenAI({ apiKey: GLOBAL_API_KEY });
      // console.log(`Attempting ${taskName} with model: ${model}`);

      const response = await ai.models.generateContent({
        model: model,
        contents: contents,
        config: config
      });

      return response;
    } catch (error: any) {
      console.warn(`${taskName} failed with ${model}. Error:`, error);
      lastError = error;
      // Continue to next model
    }
  }

  // If all failed
  throw lastError || new Error("Tất cả các mô hình AI đều không phản hồi. Vui lòng kiểm tra API Key hoặc thử lại sau.");
};

const MATH_FORMATTING_RULES = `
QUY TẮC HIỂN THỊ CÔNG THỨC TOÁN HỌC (QUAN TRỌNG):
1. LUÔN hiển thị công thức toán học dưới dạng ký hiệu Unicode đẹp mắt hoặc HTML đơn giản.
2. KHÔNG dùng LaTeX ($$, $).
3. CÁCH VIẾT:
   - Phân số: dùng a/b hoặc <sup>a</sup>/<sub>b</sub>
   - Mũ: x² (Unicode) hoặc x<sup>2</sup> (HTML)
   - Chỉ số dưới: aₙ (Unicode) hoặc a<sub>n</sub> (HTML)
   - Căn: √x
   - Các ký hiệu: ± × ÷ ≤ ≥ ≠ ≈ ∞ ∈ ∪ ∩ ∅ π Δ Σ ∫
4. ĐỊNH DẠNG:
   - Với các biểu thức phức tạp, hãy dùng thẻ HTML để trình bày rõ ràng.
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
        systemInstruction: "You are a personalized AI Math Tutor. Be helpful, accurate, and stick to the requested support level.",
        temperature: 0.7
      },
      "Chat AI"
    );
    return response.text || "Xin lỗi, cô đang suy nghĩ chút, em hỏi lại nhé?";
  } catch (error: any) {
    console.error("Chat Error", error);
    return `Hệ thống gặp lỗi: ${error.message || "Không thể kết nối"}. Vui lòng kiểm tra API Key.`;
  }
};

export const generateLearningPath = async (
  user: UserProfile,
  topics: string[]
): Promise<LearningUnit[]> => {
  const history = user.history || [];
  let performanceContext = "";
  let adjustedLevel = user.proficiencyLevel || 2;
  const numerology = user.numerologyProfile;
  const habits = user.learningHabits?.join(", ") || "Không có dữ liệu thói quen";
  const notes = user.aiNotes || "Không có ghi chú thêm";

  const proficiencyMap = ["Yếu (Cần củng cố căn bản)", "Trung bình", "Khá", "Xuất sắc (Chuyên sâu)"];
  const levelDesc = proficiencyMap[adjustedLevel - 1] || proficiencyMap[1];

  if (history.length > 0) {
    const recentHistory = history.slice(0, 5);
    const recentAvg = recentHistory.reduce((acc, h) => acc + (h.score / h.totalQuestions), 0) / (recentHistory.length || 1);
    if (recentAvg < 0.5) adjustedLevel = 1;
    else if (recentAvg > 0.85) adjustedLevel = 4;

    performanceContext = `
      DỮ LIỆU LỊCH SỬ THỰC TẾ:
      - Điểm trung bình gần đây: ${(recentAvg * 10).toFixed(1)}/10.
      - Level được điều chỉnh: ${proficiencyMap[adjustedLevel - 1]}.
      `;
  } else {
    performanceContext = `Học sinh mới bắt đầu. Sử dụng đánh giá ban đầu: ${levelDesc}.`;
  }

  const prompt = `
    Đóng vai một chuyên gia giáo dục toán học AI & Phân tích dữ liệu hành vi.
    Nhiệm vụ: Thiết kế lộ trình học tập cá nhân hóa sâu sắc cho học sinh này.

    === HỒ SƠ HỌC SINH ===
    1. CƠ BẢN: Lớp ${user.grade}, Chủ đề: ${topics.join(", ")}, Năng lực: ${levelDesc}
    2. THẦN SỐ HỌC: Số ${user.numerologyNumber} - ${numerology?.title}. Phong cách: ${numerology?.learningStyle}.
    3. THÓI QUEN: ${habits}. Ghi chú: "${notes}"
    4. NGỮ CẢNH: ${performanceContext}

    === YÊU CẦU ===
    Tạo danh sách Bài học (Learning Unit):
    - Nội dung phù hợp Lớp ${user.grade}.
    - Điều chỉnh độ khó và phong cách dựa trên thói quen và thần số học.
    - Số lượng: 5-7 bài.
    ${MATH_FORMATTING_RULES}

    === OUTPUT JSON ONLY ===
    { "units": [ { "topicId": "...", "title": "...", "description": "...", "totalXp": 0, "durationMinutes": 0, "questions": [ ... ] } ] }
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      units: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            topicId: { type: Type.STRING },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            totalXp: { type: Type.NUMBER },
            durationMinutes: { type: Type.NUMBER },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["multiple-choice", "true-false", "fill-in-blank"] },
                  content: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
                  correctAnswer: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] }
                },
                required: ["id", "type", "content", "correctAnswer", "explanation", "difficulty"]
              }
            }
          },
          required: ["topicId", "title", "description", "questions", "totalXp", "durationMinutes"]
        }
      }
    },
    required: ["units"]
  };

  try {
    const response = await generateWithFallback(
      prompt,
      {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an Advanced AI Tutor. Output strictly valid JSON.",
        temperature: 0.7
      },
      "Generating Learning Path"
    );

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from AI");
    const parsedData = JSON.parse(jsonText);

    return parsedData.units.map((unit: any, index: number) => ({
      ...unit,
      id: `unit-${Date.now()}-${index}`,
      status: index === 0 ? 'active' : 'locked',
      level: adjustedLevel
    }));

  } catch (error) {
    console.error("AI Generation Error:", error);
    return [];
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
    - Số lượng: 10-15 câu (20% Trung bình, 80% Khó).
    - Output JSON ONLY (Single Unit structure).
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      topicId: { type: Type.STRING },
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      totalXp: { type: Type.NUMBER },
      durationMinutes: { type: Type.NUMBER },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["multiple-choice", "true-false", "fill-in-blank"] },
            content: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] }
          },
          required: ["id", "type", "content", "correctAnswer", "explanation", "difficulty"]
        }
      }
    },
    required: ["topicId", "title", "description", "questions", "totalXp", "durationMinutes"]
  };

  try {
    const response = await generateWithFallback(
      prompt,
      {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are a strict Math Coach. JSON output only.",
        temperature: 0.8
      },
      "Generating Challenge"
    );

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data");
    const parsedUnit = JSON.parse(jsonText);

    return {
      ...parsedUnit,
      id: currentUnit.id,
      status: 'active',
      level: nextLevel
    };
  } catch (error) {
    console.error("Challenge Gen Error", error);
    return null;
  }
};

export const generateComprehensiveTest = async (user: UserProfile): Promise<LearningUnit | null> => {
  const prompt = `
    Tạo BÀI KIỂM TRA TỔNG HỢP (Final Exam) cho học sinh Lớp ${user.grade}.
    - 20 câu hỏi (5 Dễ, 10 TB, 5 Khó).
    - Đủ 3 loại câu hỏi: trắc nghiệm, đúng/sai, điền từ.
    - Output JSON ONLY (Single Unit structure).
  `;
  // Reuse Schema from Challenge
  const schema = {
    type: Type.OBJECT,
    properties: {
      topicId: { type: Type.STRING },
      title: { type: Type.STRING },
      description: { type: Type.STRING },
      totalXp: { type: Type.NUMBER },
      durationMinutes: { type: Type.NUMBER },
      questions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["multiple-choice", "true-false", "fill-in-blank"] },
            content: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["easy", "medium", "hard"] }
          },
          required: ["id", "type", "content", "correctAnswer", "explanation", "difficulty"]
        }
      }
    },
    required: ["topicId", "title", "description", "questions", "totalXp", "durationMinutes"]
  };

  try {
    const response = await generateWithFallback(
      prompt,
      {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an Exam Creator AI. JSON output only.",
        temperature: 0.7
      },
      "Generating Exam"
    );
    const jsonText = response.text;
    if (!jsonText) throw new Error("No data");
    const parsedUnit = JSON.parse(jsonText);

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
  const schema = {
    type: Type.OBJECT,
    properties: {
      activities: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["game", "puzzle", "challenge"] },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            difficulty: { type: Type.STRING, enum: ["Dễ", "Vừa", "Khó"] },
            duration: { type: Type.STRING },
            xpReward: { type: Type.NUMBER },
            interactiveContent: { type: Type.STRING },
            answer: { type: Type.STRING },
            hint: { type: Type.STRING, nullable: true },
            funFact: { type: Type.STRING }
          },
          required: ["id", "type", "title", "description", "difficulty", "duration", "xpReward", "interactiveContent", "answer", "funFact"]
        }
      }
    },
    required: ["activities"]
  };

  try {
    const response = await generateWithFallback(
      prompt,
      {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are a Gamification Master. JSON output only.",
        temperature: 0.85
      },
      "Generating Games"
    );
    const jsonText = response.text;
    if (!jsonText) throw new Error("No data");
    const parsed = JSON.parse(jsonText);
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
