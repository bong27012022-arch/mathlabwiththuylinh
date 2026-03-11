
/**
 * Tự động tính toán lớp học dựa trên năm sinh theo quy tắc giáo dục Việt Nam
 * @param {number} birthYear - Năm sinh (ví dụ: 2009)
 * @param {Date} currentDate - Ngày hiện tại để tính toán (mặc định: now)
 * @returns {Object} Thông tin lớp học, cấp học và năm học
 */
export function calculateGradeLevel(birthYear: number, currentDate: Date = new Date()) {
  // === CONSTANTS ===
  const BASE_BIRTH_YEAR = 2008;
  const BASE_GRADE = 12;
  const BASE_SCHOOL_YEAR = 2025;
  const CURRENT_YEAR = currentDate.getFullYear();
  const CURRENT_MONTH = currentDate.getMonth() + 1; // 1-12
  const CURRENT_DAY = currentDate.getDate();

  // === BƯỚC 1: Xác định năm học hiện tại ===
  // Năm học mới bắt đầu từ ngày 5/9 hàng năm
  let schoolYearStart: number;
  if (CURRENT_MONTH > 9 || (CURRENT_MONTH === 9 && CURRENT_DAY >= 5)) {
    schoolYearStart = CURRENT_YEAR;
  } else {
    schoolYearStart = CURRENT_YEAR - 1;
  }
  const schoolYearEnd = schoolYearStart + 1;
  const schoolYearStr = `${schoolYearStart}-${schoolYearEnd}`;

  // === VALIDATION NĂM SINH ===
  if (birthYear < (CURRENT_YEAR - 25) || birthYear > (CURRENT_YEAR - 5)) {
    return {
      isValid: false,
      message: `Năm sinh ${birthYear} không hợp lệ. Vui lòng nhập năm sinh từ ${CURRENT_YEAR - 25} đến ${CURRENT_YEAR - 5}.`,
      grade: null as number | null,
      level: null as string | null,
      levelVN: null as string | null,
      schoolYear: schoolYearStr,
      schoolYearStart,
      schoolYearEnd,
      birthYear: birthYear
    };
  }

  // === BƯỚC 2: Tính lớp học ===
  // Công thức: lớp = 12 - (năm_sinh - 2008) + (năm_học - 2025)
  const grade = BASE_GRADE - (birthYear - BASE_BIRTH_YEAR) + (schoolYearStart - BASE_SCHOOL_YEAR);

  // === BƯỚC 3: Kiểm tra hợp lệ (1-12) & Edge Cases ===
  let isValid = true;
  let message = "";
  let level = "";
  let levelVN = "";

  if (grade < 1) {
    isValid = false;
    level = "Preschool";
    levelVN = "Mầm non";
    message = `Học sinh sinh năm ${birthYear} chưa đủ tuổi vào lớp 1. Dự kiến vào lớp 1 năm học ${schoolYearStart + (1 - grade)}-${schoolYearEnd + (1 - grade)}.`;
    return { isValid, message, grade: null as number | null, level, levelVN, schoolYear: schoolYearStr, schoolYearStart, schoolYearEnd, birthYear };
  }

  if (grade > 12) {
    isValid = false;
    level = "Graduated";
    levelVN = "Đã tốt nghiệp";
    message = `Học sinh sinh năm ${birthYear} đã tốt nghiệp THPT. App Linh's Mathlab chỉ hỗ trợ từ lớp 1 đến lớp 12.`;
    return { isValid, message, grade: null as number | null, level, levelVN, schoolYear: schoolYearStr, schoolYearStart, schoolYearEnd, birthYear };
  }

  // === BƯỚC 4: Xác định cấp học ===
  if (grade >= 1 && grade <= 5) {
    level = "Primary";
    levelVN = "Tiểu học";
  } else if (grade >= 6 && grade <= 9) {
    level = "Secondary";
    levelVN = "THCS";
  } else {
    level = "High School";
    levelVN = "THPT";
  }

  message = `Học sinh sinh năm ${birthYear} đang học lớp ${grade} (${levelVN}) trong năm học ${schoolYearStr}.`;

  return {
    isValid,
    message,
    grade: grade as number | null,
    level,
    levelVN,
    schoolYear: schoolYearStr,
    schoolYearStart,
    schoolYearEnd,
    birthYear
  };
}

/**
 * Helper: Tính toán từ chuỗi ngày sinh (dd/mm/yyyy)
 * @param {string} dob - Chuỗi ngày sinh
 * @returns {Object} Kết quả từ calculateGradeLevel
 */
export function calculateGradeLevelFromBirthDate(dob: string) {
  const parts = (dob || '').split('/');
  const birthYear = parts.length >= 3 ? parseInt(parts[2]) : 0;

  if (!dob || dob.length < 10 || isNaN(birthYear) || birthYear === 0) {
    return {
      isValid: false,
      message: "Ngày sinh không đúng định dạng.",
      grade: null as number | null,
      level: null as string | null,
      levelVN: null as string | null,
      schoolYear: "",
      schoolYearStart: 0,
      schoolYearEnd: 0,
      birthYear: 0
    };
  }
  return calculateGradeLevel(birthYear);
}
