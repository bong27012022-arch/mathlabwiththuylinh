
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, FunctionSquare, Shapes, BarChart2, TrendingUp, Calculator, Lightbulb, Sparkles, Edit3, Plus, School, BookOpen, GraduationCap, Loader2, Binary, Sigma, Box, Circle, Triangle, Ruler, Scale, Divide, FileText, BrainCircuit, PenTool, Database, PieChart, Activity, Layers, Cylinder } from 'lucide-react';
import { UserProfile } from '../../types';
import { calculateGradeLevelFromBirthDate } from '../../utils/gradeCalculator';

interface Topic {
  id: string;
  label: string;
  subLabel: string;
  icon: React.ElementType;
  isReview?: boolean; // Flag to style exam reviews differently
  isSpecialExam?: boolean; // Highlight for Entrance/Graduation exams
}

type EducationLevel = 'primary' | 'middle' | 'high';

// Standard Exam Review Topics
const STANDARD_REVIEWS: Topic[] = [
    { id: 'review-mid-1', label: 'Ôn tập Giữa Học kỳ 1', subLabel: 'Tổng hợp kiến thức SGK', icon: FileText, isReview: true },
    { id: 'review-end-1', label: 'Ôn tập Cuối Học kỳ 1', subLabel: 'Đề thi thử & Tổng hợp', icon: FileText, isReview: true },
    { id: 'review-mid-2', label: 'Ôn tập Giữa Học kỳ 2', subLabel: 'Tổng hợp kiến thức SGK', icon: FileText, isReview: true },
    { id: 'review-end-2', label: 'Ôn tập Cuối Học kỳ 2', subLabel: 'Đề thi thử & Tổng hợp', icon: FileText, isReview: true },
];

const GRADE_9_ENTRANCE_EXAM: Topic = { 
    id: 'review-grade-10', 
    label: 'Ôn thi vào 10', 
    subLabel: 'Luyện đề Toán chuyên & Đại trà', 
    icon: GraduationCap, 
    isReview: true,
    isSpecialExam: true 
};

const GRADE_12_GRADUATION_EXAM: Topic = { 
    id: 'review-graduation', 
    label: 'Ôn thi Tốt nghiệp THPT', 
    subLabel: 'Luyện đề Đại học & Tốt nghiệp', 
    icon: GraduationCap, 
    isReview: true,
    isSpecialExam: true 
};

const CURRICULUM_DATA: Record<number, Topic[]> = {
  1: [
    { id: 'g1-num', label: 'Số tự nhiên 0-100', subLabel: 'Đếm, đọc, viết, so sánh số', icon: Calculator },
    { id: 'g1-calc', label: 'Cộng trừ phạm vi 100', subLabel: 'Tính nhẩm, đặt tính rồi tính', icon: Plus },
    { id: 'g1-geo', label: 'Hình học cơ bản', subLabel: 'Vuông, tròn, tam giác, điểm', icon: Shapes },
    { id: 'g1-meas', label: 'Đo lường & Thời gian', subLabel: 'cm, giờ, ngày, tuần', icon: Ruler },
  ],
  2: [
    { id: 'g2-num', label: 'Số tự nhiên đến 1000', subLabel: 'Cấu tạo số, tia số', icon: Calculator },
    { id: 'g2-calc', label: 'Phép cộng & Phép trừ', subLabel: 'Có nhớ và không nhớ', icon: Plus },
    { id: 'g2-muldiv', label: 'Làm quen Nhân & Chia', subLabel: 'Bảng cửu chương 2-5', icon: Divide },
    { id: 'g2-geo', label: 'Hình học phẳng', subLabel: 'Tứ giác, khối trụ, cầu', icon: Shapes },
    { id: 'g2-meas', label: 'Đại lượng đo lường', subLabel: 'dm, m, kg, lít, ngày tháng', icon: Scale },
  ],
  3: [
    { id: 'g3-num', label: 'Số đến 100.000', subLabel: 'Hàng nghìn, chục nghìn', icon: Calculator },
    { id: 'g3-calc', label: 'Phép tính nâng cao', subLabel: 'Nhân chia số nhiều chữ số', icon: Divide },
    { id: 'g3-geo', label: 'Hình học & Diện tích', subLabel: 'Chu vi, Diện tích, Góc vuông', icon: Box },
    { id: 'g3-meas', label: 'Đo lường mở rộng', subLabel: 'mm, g, ml, nhiệt độ', icon: Ruler },
    { id: 'g3-stat', label: 'Thống kê cơ bản', subLabel: 'Bảng số liệu, khả năng', icon: BarChart2 },
  ],
  4: [
    { id: 'g4-num', label: 'Số tự nhiên lớp triệu', subLabel: 'Hàng và lớp, dãy số', icon: Calculator },
    { id: 'g4-frac', label: 'Phân số', subLabel: 'Rút gọn, quy đồng, tính toán', icon: PieChart },
    { id: 'g4-geo', label: 'Hình học phẳng', subLabel: 'Góc nhọn/tù, Hai đường thẳng', icon: Shapes },
    { id: 'g4-meas', label: 'Đo lường & Biểu đồ', subLabel: 'Yến, tạ, tấn, giây, thế kỷ', icon: BarChart2 },
    { id: 'g4-avg', label: 'Trung bình cộng', subLabel: 'Giải toán có lời văn', icon: Sigma },
  ],
  5: [
    { id: 'g5-dec', label: 'Số thập phân', subLabel: 'Đọc, viết, tính toán', icon: Calculator },
    { id: 'g5-perc', label: 'Tỉ số phần trăm', subLabel: 'Bài toán tỉ lệ, lãi suất', icon: TrendingUp },
    { id: 'g5-area', label: 'Diện tích hình phẳng', subLabel: 'Tam giác, Hình thang, Tròn', icon: Triangle },
    { id: 'g5-vol', label: 'Thể tích hình khối', subLabel: 'Hình hộp CN, Lập phương', icon: Box },
    { id: 'g5-stat', label: 'Số liệu thống kê', subLabel: 'Biểu đồ hình quạt', icon: PieChart },
  ],
  6: [
    { id: 'g6-nat', label: 'Số tự nhiên', subLabel: 'Lũy thừa, Chia hết, Ước/Bội', icon: Binary },
    { id: 'g6-int', label: 'Số nguyên', subLabel: 'Quy tắc dấu, phép tính', icon: Plus },
    { id: 'g6-frac', label: 'Phân số & Thập phân', subLabel: 'Tính toán và làm tròn', icon: Divide },
    { id: 'g6-geo', label: 'Hình học trực quan', subLabel: 'Tam giác đều, Lục giác đều', icon: Shapes },
    { id: 'g6-stat', label: 'Thống kê & Xác suất', subLabel: 'Biểu đồ tranh/cột, Thực nghiệm', icon: BarChart2 },
  ],
  7: [
    { id: 'g7-rat', label: 'Số hữu tỉ & Số thực', subLabel: 'Căn bậc hai, Giá trị tuyệt đối', icon: Calculator },
    { id: 'g7-alg', label: 'Biểu thức đại số', subLabel: 'Đa thức một biến, Nghiệm', icon: FunctionSquare },
    { id: 'g7-geo3d', label: 'Hình khối thực tế', subLabel: 'Lăng trụ đứng, Hình chóp', icon: Box },
    { id: 'g7-geo2d', label: 'Góc & Đường thẳng', subLabel: 'Hai đt song song, Tam giác', icon: Triangle },
    { id: 'g7-stat', label: 'Thu thập & Biểu diễn', subLabel: 'Phân tích dữ liệu', icon: Database },
  ],
  8: [
    { id: 'g8-poly', label: 'Đa thức nhiều biến', subLabel: 'Hằng đẳng thức đáng nhớ', icon: FunctionSquare },
    { id: 'g8-frac', label: 'Phân thức đại số', subLabel: 'Cộng trừ nhân chia phân thức', icon: Divide },
    { id: 'g8-func', label: 'Hàm số bậc nhất', subLabel: 'Đồ thị y = ax + b', icon: TrendingUp },
    { id: 'g8-geo', label: 'Tứ giác & Định lý Talet', subLabel: 'Hình thang, Bình hành, Thoi', icon: Shapes },
    { id: 'g8-data', label: 'Phân tích dữ liệu', subLabel: 'Tần số, Biểu đồ', icon: BarChart2 },
  ],
  9: [
    { id: 'g9-sys', label: 'Hệ phương trình', subLabel: 'Bậc nhất hai ẩn', icon: Layers },
    { id: 'g9-quad', label: 'Phương trình bậc hai', subLabel: 'Hàm số y = ax², Hệ thức Vi-ét', icon: TrendingUp },
    { id: 'g9-root', label: 'Căn bậc 2 & 3', subLabel: 'Biến đổi biểu thức chứa căn', icon: Calculator },
    { id: 'g9-circle', label: 'Đường tròn', subLabel: 'Góc, Tiếp tuyến, Dây cung', icon: Circle },
    { id: 'g9-geo3d', label: 'Hình Trụ - Nón - Cầu', subLabel: 'Diện tích và Thể tích', icon: Cylinder },
  ],
  10: [
    { id: 'g10-prop', label: 'Mệnh đề & Tập hợp', subLabel: 'Logic toán học cơ bản', icon: Binary },
    { id: 'g10-ineq', label: 'Bất phương trình', subLabel: 'BPT bậc nhất hai ẩn', icon: Scale },
    { id: 'g10-func', label: 'Hàm số bậc hai', subLabel: 'Parabol & Dấu tam thức', icon: TrendingUp },
    { id: 'g10-vec', label: 'Vectơ & Tọa độ', subLabel: 'Tổng, Hiệu, Tích vô hướng', icon: ArrowLeft },
    { id: 'g10-stat', label: 'Thống kê & Xác suất', subLabel: 'Số đặc trưng, Quy tắc đếm', icon: BarChart2 },
  ],
  11: [
    { id: 'g11-trig', label: 'Lượng giác', subLabel: 'Hàm số & Phương trình LG', icon: Activity },
    { id: 'g11-seq', label: 'Dãy số', subLabel: 'Cấp số cộng, Cấp số nhân', icon: Layers },
    { id: 'g11-lim', label: 'Giới hạn & Liên tục', subLabel: 'Lim dãy số, Lim hàm số', icon: Sigma },
    { id: 'g11-geo', label: 'Hình học không gian', subLabel: 'Đường thẳng, Mặt phẳng, Góc', icon: Box },
    { id: 'g11-prob', label: 'Xác suất', subLabel: 'Biến cố hợp, giao, độc lập', icon: Lightbulb },
  ],
  12: [
    { id: 'g12-func', label: 'Ứng dụng đạo hàm', subLabel: 'Đơn điệu, Cực trị, Tiệm cận', icon: TrendingUp },
    { id: 'g12-vec', label: 'Vectơ không gian', subLabel: 'Hệ trục tọa độ Oxyz', icon: Box },
    { id: 'g12-stat', label: 'Thống kê mô tả', subLabel: 'Các số đặc trưng mức độ phân tán', icon: BarChart2 },
    { id: 'g12-int', label: 'Nguyên hàm Tích phân', subLabel: 'Diện tích, Thể tích', icon: Sigma },
    { id: 'g12-prob', label: 'Xác suất có điều kiện', subLabel: 'Công thức xác suất toàn phần', icon: Lightbulb },
    { id: 'g12-oxyz', label: 'Phương pháp tọa độ', subLabel: 'Phương trình mặt phẳng, đường thẳng', icon: PenTool },
  ]
};

interface Props {
  user: UserProfile;
  onNext: (grade: number, topics: string[]) => void;
  onBack: () => void;
  isGenerating: boolean;
}

export const ClassSelectionScreen: React.FC<Props> = ({ user, onNext, onBack, isGenerating }) => {
  // Use the new high-precision calculator
  const gradeCalc = calculateGradeLevelFromBirthDate(user.dob) as any;
  const initialGrade = gradeCalc.isValid ? (gradeCalc.grade || 11) : 11;

  const getLevelFromGrade = (grade: number): EducationLevel => {
      if (grade <= 5) return 'primary';
      if (grade <= 9) return 'middle';
      return 'high';
  };
  
  const [educationLevel, setEducationLevel] = useState<EducationLevel>(getLevelFromGrade(initialGrade));
  const [selectedGrade, setSelectedGrade] = useState<number>(initialGrade);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [customTopicInput, setCustomTopicInput] = useState('');
  const [topics, setTopics] = useState<Topic[]>([]);

  const levels: { id: EducationLevel; label: string; icon: React.ElementType; grades: number[] }[] = [
    { id: 'primary', label: 'Tiểu học', icon: BookOpen, grades: [1, 2, 3, 4, 5] },
    { id: 'middle', label: 'THCS', icon: School, grades: [6, 7, 8, 9] },
    { id: 'high', label: 'THPT', icon: GraduationCap, grades: [10, 11, 12] },
  ];

  useEffect(() => {
    const baseTopics = CURRICULUM_DATA[selectedGrade] || [];
    let allTopics = [...baseTopics, ...STANDARD_REVIEWS];
    
    if (selectedGrade === 9) {
        allTopics.push(GRADE_9_ENTRANCE_EXAM);
    } else if (selectedGrade === 12) {
        allTopics.push(GRADE_12_GRADUATION_EXAM);
    }

    setTopics(allTopics);
    
    if (baseTopics.length >= 3) {
      setSelectedTopics(baseTopics.slice(0, 3).map(t => t.id));
    } else {
      setSelectedTopics(baseTopics.map(t => t.id));
    }
  }, [selectedGrade]);

  const handleLevelChange = (level: EducationLevel) => {
    setEducationLevel(level);
    const levelData = levels.find(l => l.id === level);
    if (levelData && !levelData.grades.includes(selectedGrade)) {
        setSelectedGrade(levelData.grades[0]);
    }
  };

  const toggleTopic = (id: string) => {
    if (selectedTopics.includes(id)) {
      setSelectedTopics(selectedTopics.filter(t => t !== id));
    } else {
      setSelectedTopics([...selectedTopics, id]);
    }
  };

  const selectAllTopics = () => {
    if (selectedTopics.length === topics.length) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics(topics.map(t => t.id));
    }
  };

  const handleAddTopic = () => {
    if (!customTopicInput.trim()) return;
    const newId = `custom-${Date.now()}`;
    const newTopic: Topic = {
      id: newId,
      label: customTopicInput,
      subLabel: 'Chủ đề tự chọn',
      icon: Sparkles
    };
    setTopics([...topics, newTopic]);
    setSelectedTopics([...selectedTopics, newId]);
    setCustomTopicInput('');
  };

  const currentLevelData = levels.find(l => l.id === educationLevel);

  const handleCreatePath = () => {
    const selectedTopicLabels = topics
        .filter(t => selectedTopics.includes(t.id))
        .map(t => t.label);
    onNext(selectedGrade, selectedTopicLabels);
  };

  return (
    <div className="bg-primary-surface dark:bg-dark-bg min-h-screen font-display text-gray-900 dark:text-gray-100 transition-colors flex flex-col pb-28">
      <div className="sticky top-0 z-10 bg-primary-surface/90 dark:bg-dark-bg/95 backdrop-blur-md border-b border-teal-100 dark:border-gray-800">
        <div className="flex items-center p-4 justify-between max-w-5xl mx-auto w-full">
          <button onClick={onBack} className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-teal-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft />
          </button>
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-bold leading-tight">Thiết lập lộ trình</h2>
            <div className="flex gap-1 mt-1">
              <div className="w-8 h-1 bg-primary rounded-full"></div>
              <div className="w-2 h-1 bg-teal-200 dark:bg-gray-700 rounded-full"></div>
              <div className="w-2 h-1 bg-teal-200 dark:bg-gray-700 rounded-full"></div>
            </div>
          </div>
          <div className="size-10"></div>
        </div>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 pt-6">
        <div className="mb-4 text-center md:text-left">
          <h2 className="text-[28px] font-bold leading-tight mb-2">Chọn lớp học của bạn</h2>
          <p className="text-teal-800/70 dark:text-gray-400 text-base font-normal">
             {gradeCalc.isValid 
               ? `Dựa trên ngày sinh, AI đề xuất bạn đang học lớp ${gradeCalc.grade} (${gradeCalc.schoolYear}).` 
               : "Vui lòng chọn lớp học phù hợp với trình độ của bạn."}
          </p>
        </div>

        <div className="flex p-1.5 bg-white dark:bg-dark-surface border border-teal-100 dark:border-gray-700 rounded-xl mb-6 shadow-sm max-w-lg mx-auto md:mx-0">
          {levels.map((level) => {
            const Icon = level.icon;
            const isActive = educationLevel === level.id;
            return (
              <button
                key={level.id}
                onClick={() => handleLevelChange(level.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                  isActive 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-gray-400 dark:text-gray-500'} />
                {level.label}
              </button>
            )
          })}
        </div>

        <div className="w-full overflow-x-auto no-scrollbar pb-2 px-1 mb-6">
          <div className="flex gap-3 w-max mx-auto md:mx-0">
            {currentLevelData?.grades.map((grade) => {
              const isSelected = selectedGrade === grade;
              return (
                <button 
                  key={grade} 
                  onClick={() => setSelectedGrade(grade)}
                  className={`relative flex h-14 min-w-[80px] shrink-0 items-center justify-center rounded-2xl transition-all shadow-sm
                    ${isSelected 
                      ? 'bg-white dark:bg-dark-surface border-2 border-primary text-teal-900 dark:text-white font-bold scale-105 shadow-md z-10' 
                      : 'bg-white dark:bg-dark-surface border border-teal-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary/50'
                    }`}
                >
                  <span className={isSelected ? 'text-lg' : 'text-base font-medium'}>Lớp {grade}</span>
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-primary text-white rounded-full p-1 border-2 border-white dark:border-dark-bg shadow-sm">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-px w-full bg-teal-200/50 dark:bg-gray-800 mb-6"></div>

        <div className="mb-5 flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-bold leading-tight mb-1">Chủ đề & Ôn thi</h3>
            <p className="text-sm text-teal-800/70 dark:text-gray-400">Nội dung SGK KNTT Lớp {selectedGrade}</p>
          </div>
          <button 
            onClick={selectAllTopics}
            className="text-sm font-medium text-teal-700 dark:text-primary hover:underline pb-1"
          >
            {selectedTopics.length === topics.length ? 'Bỏ chọn' : 'Chọn tất cả'}
          </button>
        </div>

        {topics.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <Sparkles className="w-10 h-10 mb-2 opacity-50" />
              <p>Chưa có dữ liệu cho lớp này</p>
           </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
              {topics.map((topic) => {
                const isSelected = selectedTopics.includes(topic.id);
                const Icon = topic.icon;
                const isReview = topic.isReview;
                const isSpecial = topic.isSpecialExam;
                
                return (
                  <div 
                    key={topic.id}
                    onClick={() => toggleTopic(topic.id)}
                    className={`relative flex flex-col items-start p-4 rounded-2xl cursor-pointer transition-all duration-200
                      ${isSelected 
                        ? (isSpecial ? 'bg-red-50 border-2 border-red-500 dark:bg-red-900/10' : isReview ? 'bg-orange-50 border-2 border-orange-400 dark:bg-orange-900/10' : 'bg-white dark:bg-dark-surface border-2 border-primary shadow-sm') 
                        : (isSpecial ? 'bg-red-50/50 border border-red-200 dark:border-red-800/30' : isReview ? 'bg-orange-50/50 border border-orange-200 dark:border-orange-800/30' : 'bg-white/60 dark:bg-dark-surface border border-transparent dark:border-gray-700 hover:bg-white hover:shadow-md')
                      }`}
                  >
                      <div className="flex justify-between w-full mb-3">
                        <div className={`p-2 rounded-lg ${
                            isSelected 
                                ? (isSpecial ? 'bg-red-200 text-red-900' : isReview ? 'bg-orange-200 text-orange-900' : 'bg-primary/20 text-teal-900') 
                                : (isSpecial ? 'bg-red-100 text-red-700' : isReview ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300')
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        {isSelected ? (
                          <div className={isSpecial ? 'text-red-500' : isReview ? 'text-orange-500' : 'text-primary'}><Check className="w-5 h-5 fill-current" /></div>
                        ) : (
                          <div className={`w-5 h-5 rounded-full border-2 ${isSpecial ? 'border-red-200' : isReview ? 'border-orange-200' : 'border-gray-300 dark:border-gray-600'}`}></div>
                        )}
                      </div>
                      <span className={`text-lg font-bold leading-tight ${isSpecial ? 'text-red-900 dark:text-red-100' : isReview ? 'text-orange-900 dark:text-orange-100' : ''}`}>{topic.label}</span>
                      <span className={`text-xs mt-1 truncate w-full ${isSpecial ? 'text-red-700 dark:text-red-200' : isReview ? 'text-orange-700 dark:text-orange-200' : 'text-gray-500 dark:text-gray-400'}`}>{topic.subLabel}</span>
                  </div>
                );
              })}
          </div>
        )}

        <div className="mt-4 mb-2 max-w-lg">
           <h3 className="text-lg font-bold leading-tight mb-3">Chủ đề khác?</h3>
           <div className="relative flex items-center shadow-sm rounded-2xl bg-white dark:bg-dark-surface border border-teal-100 dark:border-gray-700 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <Edit3 className="text-gray-400 w-5 h-5" />
              </div>
              <input 
                className="block w-full p-4 pl-12 pr-20 text-sm text-gray-900 bg-transparent border-none rounded-2xl focus:ring-0 placeholder-gray-400 dark:text-white" 
                placeholder="Nhập chủ đề bạn muốn học thêm..." 
                type="text"
                value={customTopicInput}
                onChange={(e) => setCustomTopicInput(e.target.value)}
              />
              <button 
                onClick={handleAddTopic}
                disabled={!customTopicInput.trim()}
                className="absolute right-2.5 bottom-2.5 bg-primary/10 hover:bg-primary hover:text-white text-teal-800 font-medium rounded-lg text-sm px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                 <Plus className="w-4 h-4" />
                 Thêm
              </button>
           </div>
        </div>
        
        <div className="h-10"></div>
      </div>

       <div className="fixed bottom-0 left-0 md:left-64 right-0 w-full p-4 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-lg border-t border-teal-100 dark:border-gray-800 z-20">
         <div className="max-w-md mx-auto">
            <button 
            onClick={handleCreatePath}
            disabled={selectedTopics.length < 1 || isGenerating}
            className={`relative flex w-full items-center justify-center gap-2 rounded-xl p-4 transition-all active:scale-[0.98] shadow-lg overflow-hidden
                ${selectedTopics.length < 1 || isGenerating
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-primary text-teal-950 shadow-primary/30 hover:bg-primary-dark hover:text-white'}`}
            >
            {isGenerating ? (
                <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-lg font-bold leading-tight">Đang phân tích dữ liệu...</span>
                </>
            ) : (
                <>
                <BrainCircuit className="w-5 h-5" />
                <span className="text-lg font-bold leading-tight">Tạo lộ trình tối ưu (AI)</span>
                </>
            )}
            </button>
         </div>
      </div>
    </div>
  );
};
