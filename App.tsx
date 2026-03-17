import React, { useState, useEffect } from 'react';
import { ScreenName, UserProfile, LearningUnit, QuizResult } from './types';
import { WelcomeScreen } from './components/screens/WelcomeScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { StudentInfoScreen } from './components/screens/StudentInfoScreen';
import { AssessmentScreen } from './components/screens/AssessmentScreen';
import { AnalysisResultScreen } from './components/screens/AnalysisResultScreen';
import { LearningPathScreen } from './components/screens/LearningPathScreen';
import { QuizScreen } from './components/screens/QuizScreen';
import { QuizResultScreen } from './components/screens/QuizResultScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { ParentReportScreen } from './components/screens/ParentReportScreen';
import { ChatScreen } from './components/screens/ChatScreen';
import { GameLibraryScreen } from './components/screens/GameLibraryScreen';
import { ClassSelectionScreen } from './components/screens/ClassSelectionScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { AdminStatisticsScreen } from './components/screens/AdminStatisticsScreen';
import { BottomNavigation } from './components/BottomNavigation';
import { SidebarNavigation } from './components/SidebarNavigation';
import { ApiKeyModal } from './components/ApiKeyModal';
import { analyzeProfile } from './utils/numerology';
import { calculateGradeLevelFromBirthDate } from './utils/gradeCalculator';
import { 
  generateLearningPath, 
  generateChallengeUnit, 
  generateComprehensiveTest,
  generateUnitQuestions,
  generateEntertainmentContent,
  setGlobalApiKey,
  setGlobalModel
} from './utils/aiGenerator';
import { getStudentDbId, removeAccents } from './utils/userUtils';
import { 
  syncStudentData, 
  fetchGlobalConfig, 
  saveGlobalConfig, 
  getSyncConfig, 
  saveSyncConfig, 
  incrementGlobalVisits,
  incrementGlobalQuizzes 
} from './utils/syncService';
import { Loader2 } from 'lucide-react';
import { STUDENT_ACCOUNTS } from './data/studentAccounts';

const STORAGE_KEY = 'math_genius_user_data_v5_auth';
const STUDENT_DB_KEY = 'math_genius_student_db_v1';
const API_KEY_STORAGE = 'GEMINI_API_KEY';
const MODEL_STORAGE = 'GEMINI_MODEL_PREF';



export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>(ScreenName.WELCOME);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeUnit, setActiveUnit] = useState<LearningUnit | null>(null);
  const [loginError, setLoginError] = useState<string>('');

  // API Key State
  const [apiKey, setApiKey] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Quiz State
  const [lastQuizResult, setLastQuizResult] = useState<QuizResult | null>(null);
  const [isReviewingQuiz, setIsReviewingQuiz] = useState(false);

  // Load API Key on Mount
  useEffect(() => {
    incrementGlobalVisits();
    
    const storedKey = localStorage.getItem(API_KEY_STORAGE);
    const storedModel = localStorage.getItem(MODEL_STORAGE) === 'gemini-1.5-pro' ? 'gemini-1.5-flash' : (localStorage.getItem(MODEL_STORAGE) || 'gemini-1.5-flash');

    if (storedKey) {
      setApiKey(storedKey);
      setGlobalApiKey(storedKey);
      setGlobalModel(storedModel);
      loadGlobalConfigData();
    } else {
      setShowKeyModal(true);
      loadGlobalConfigData();
    }
  }, []);

  const handleSaveApiKey = async (key: string, model: string) => {
    localStorage.setItem(API_KEY_STORAGE, key);
    localStorage.setItem(MODEL_STORAGE, model);
    setApiKey(key);
    setGlobalApiKey(key);
    setGlobalModel(model);
    setShowKeyModal(false);

    // If admin, also save to cloud as master key
    if (user.isAdmin) {
      const confirmSave = window.confirm("Bạn là Admin, bạn có muốn lưu Cấu hình Sync hiện tại lên Cloud không? (Lưu ý: API Key sẽ không còn được tự động chia sẻ cho học sinh để tránh lỗi giới hạn Quota).");
      if (confirmSave) {
        const syncConfig = getSyncConfig();
        await saveGlobalConfig({ 
          apiKey: key, 
          model: model,
          syncConfig: {
            enabled: syncConfig.enabled,
            databaseUrl: syncConfig.databaseUrl,
            secretKey: syncConfig.secretKey
          }
        });
        alert("Đã lưu Master Configuration lên Cloud!");
      }
    }
  };

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load save data", e);
    }
    return {
      name: '',
      dob: '',
      grade: 11,
      numerologyNumber: 0,
      proficiencyLevel: 3,
      history: [],
      loginDates: []
    };
  });

  const loadGlobalConfigData = async () => {
    try {
      const config = await fetchGlobalConfig();
      if (config) {
        // AI Config
        // Bỏ việc tự động load apiKey chung để mỗi học sinh dùng 1 key riêng (tránh 429 Limit)
        if (config.model) {
          localStorage.setItem(MODEL_STORAGE, config.model);
          setGlobalModel(config.model);
        }
        
        // Sync Config
        if (config.syncConfig) {
          const currentSync = getSyncConfig();
          const newSync = { ...currentSync, ...config.syncConfig };
          saveSyncConfig(newSync);
        }
        
        return true;
      }
    } catch (e) {
      console.error("Failed to load global config", e);
    }
    return false;
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    if (user.name && user.dob) {
      const dbId = getStudentDbId(user.name, user.dob);
      try {
        const rawDb = localStorage.getItem(STUDENT_DB_KEY);
        const db = rawDb ? JSON.parse(rawDb) : {};
        // Update the DB record with current user state
        db[dbId] = user;
        localStorage.setItem(STUDENT_DB_KEY, JSON.stringify(db));
        
        // Push to Cloud Sync if enabled
        syncStudentData(dbId, user);
      } catch (e) {
        console.error("Error saving to DB", e);
      }
    }
  }, [user]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Basic check if session is valid and not expired
      if (parsed.expiryDate && Date.now() > parsed.expiryDate) {
        // Session expired, force logout logic visually by not setting screen
        handleLogout();
        return;
      }

      if (parsed.name && parsed.learningPath && parsed.learningPath.length > 0) {
        setCurrentScreen(ScreenName.LEARNING_PATH);
      }
    }
  }, []);

  const handleLogin = async (name: string, dob: string) => {
    // Attempt to load global config on login if missing
    if (!apiKey) {
      setShowKeyModal(true);
    }

    const inputName = name.trim().toLowerCase();
    const inputDob = dob.trim();
    const normalizedInputName = removeAccents(inputName);

    // 1. Check if it's a Pre-defined Student Account
    const student = STUDENT_ACCOUNTS.find(s =>
      removeAccents(s.name) === normalizedInputName && s.dob === inputDob
    );

    // 2. Load DB
    let db: Record<string, UserProfile> = {};
    try {
      const rawDb = localStorage.getItem(STUDENT_DB_KEY);
      db = rawDb ? JSON.parse(rawDb) : {};
    } catch (e) { console.error(e); }

    let userData: UserProfile | null = null;
    let isNewPublicUser = false;
    const dbId = getStudentDbId(inputName, inputDob);

    // --- DATA MIGRATION / MERGING ---
    // Check if there are other entries that normalize to the same dbId and merge them
    let mergedHistory: QuizResult[] = [];
    let mergedLoginDates: number[] = [];
    let existingProfile: UserProfile | null = null;

    Object.keys(db).forEach(key => {
      const [kName, kDob] = key.split('_');
      if (removeAccents(kName) === removeAccents(inputName) && kDob === inputDob) {
        const record = db[key];
        if (record.history) mergedHistory = [...mergedHistory, ...record.history];
        if (record.loginDates) mergedLoginDates = [...mergedLoginDates, ...record.loginDates];
        if (!existingProfile || (record.learningPath && record.learningPath.length > 0)) {
          existingProfile = record;
        }
        // If the key is not the canonical dbId, we'll eventually replace it
        if (key !== dbId) {
          delete db[key];
        }
      }
    });

    // De-duplicate history based on timestamp and unitId
    const uniqueHistory = mergedHistory.filter((v, i, a) =>
      a.findIndex(t => t.timestamp === v.timestamp && t.unitId === v.unitId) === i
    ).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    const uniqueLogins = Array.from(new Set(mergedLoginDates)).sort((a, b) => b - a);

    if (student) {
      // --- CASE A: Pre-defined Student ---
      if (existingProfile) {
        const profile = existingProfile as UserProfile;
        userData = {
          ...profile,
          history: uniqueHistory,
          loginDates: [Date.now(), ...uniqueLogins].slice(0, 50),
          isVip: student.isVip,
          isAdmin: student.isAdmin,
          name: student.name,
          dob: student.dob
        };
      } else {
        // First time login for Pre-defined student
        const analysis = analyzeProfile(student.name, student.dob);
        const gradeInfo = calculateGradeLevelFromBirthDate(student.dob) as any;
        const limitDays = student.limitDays || 90;
        const expiry = Date.now() + (limitDays * 24 * 60 * 60 * 1000);

        userData = {
          name: student.name,
          dob: student.dob,
          grade: student.grade || (gradeInfo.isValid ? gradeInfo.grade : 11) || 11,
          numerologyNumber: analysis.lifePathNumber,
          numerologyProfile: analysis,
          proficiencyLevel: 3,
          history: [],
          isVip: student.isVip,
          isAdmin: student.isAdmin,
          expiryDate: expiry,
          loginDates: [Date.now()]
        };
      }
    } else {
      // --- CASE B: Public / Trial User ---
      if (existingProfile) {
        const profile = existingProfile as UserProfile;
        userData = {
          ...profile,
          history: uniqueHistory,
          loginDates: [Date.now(), ...uniqueLogins].slice(0, 50),
          expiryDate: profile.expiryDate
        };

        // CHECK EXPIRATION
        if (userData.expiryDate && Date.now() > userData.expiryDate) {
          setLoginError('Tài khoản dùng thử 7 ngày của bạn đã hết hạn. Vui lòng liên hệ Admin để gia hạn.');
          return;
        }
      } else {
        // New Public User
        isNewPublicUser = true;
        const analysis = analyzeProfile(name, dob);
        const gradeInfo = calculateGradeLevelFromBirthDate(dob) as any;

        const TRIAL_DAYS = 90;
        const expiry = Date.now() + (TRIAL_DAYS * 24 * 60 * 60 * 1000);

        userData = {
          name: name,
          dob: dob,
          grade: (gradeInfo.isValid ? gradeInfo.grade : 10) || 10,
          numerologyNumber: analysis.lifePathNumber,
          numerologyProfile: analysis,
          proficiencyLevel: 3,
          history: [],
          isVip: false,
          isAdmin: false,
          expiryDate: expiry,
          loginDates: [Date.now()]
        };
      }
    }

    // Save cleaned DB back
    if (userData) {
      const finalUser = userData as UserProfile;
      db[dbId] = finalUser;
      localStorage.setItem(STUDENT_DB_KEY, JSON.stringify(db));

      setUser(finalUser);
      setLoginError('');

      if (finalUser.learningPath && finalUser.learningPath.length > 0) {
        setCurrentScreen(ScreenName.LEARNING_PATH);
      } else {
        // If it's a new public user or incomplete profile
        setCurrentScreen(ScreenName.ASSESSMENT);
      }
    } else {
      setLoginError('Có lỗi xảy ra khi tạo hồ sơ.');
    }
  };

  const handleStudentInfoNext = () => {
    if (user.dob) {
      const analysis = analyzeProfile(user.name, user.dob);
      setUser(prev => ({
        ...prev,
        numerologyNumber: analysis.lifePathNumber,
        numerologyProfile: analysis
      }));
    }
    setCurrentScreen(ScreenName.ASSESSMENT);
  };

  const handleAssessmentNext = (proficiency: number, habits: string[], notes: string) => {
    setUser(prev => ({
      ...prev,
      proficiencyLevel: proficiency,
      learningHabits: habits,
      aiNotes: notes
    }));
    setCurrentScreen(ScreenName.ANALYSIS_RESULT);
  };

  const handleCreateLearningPath = async (grade: number, topics: string[]) => {
    if (!apiKey) {
      setShowKeyModal(true);
      return;
    }
    setIsGenerating(true);
    const updatedUser = { ...user, grade, selectedTopics: topics };
    setUser(updatedUser);

    try {
      const learningPath = await generateLearningPath(updatedUser, topics);
      setUser(prev => ({
        ...prev,
        grade,
        selectedTopics: topics,
        learningPath: learningPath
      }));
      setCurrentScreen(ScreenName.LEARNING_PATH);
    } catch (error: any) {
      console.error("Failed to generate path", error);
      alert("Hệ thống AI đang bận hoặc có lỗi xảy ra. Đã thiết lập lộ trình cơ bản cho bạn. Bạn có thể thử lại sau!");
      setCurrentScreen(ScreenName.LEARNING_PATH);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpgradeUnit = async (unit: LearningUnit) => {
    if (!apiKey) {
      setShowKeyModal(true);
      return;
    }
    setIsGenerating(true);
    try {
      const newUnit = await generateChallengeUnit(user, unit);
      if (newUnit && user.learningPath) {
        // Ensure the unit is updated in the path
        const updatedPath = user.learningPath.map(u =>
          u.id === unit.id ? newUnit : u
        );
        
        setUser(prev => ({ ...prev, learningPath: updatedPath }));
        setActiveUnit(newUnit);
        setIsReviewingQuiz(false);
        setLastQuizResult(null);
        
        // Use a small timeout to ensure state settles before switching screen
        setTimeout(() => {
          setCurrentScreen(ScreenName.QUIZ);
          setIsGenerating(false);
        }, 100);
      } else {
        alert("Không thể tạo bài tập nâng cao lúc này. Vui lòng thử lại sau.");
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Failed to generate challenge", error);
      alert("Hệ thống gặp lỗi khi tạo bài tập nâng cao.");
      setIsGenerating(false);
    }
  };

  const handleComprehensiveTest = async () => {
    if (!apiKey) {
      setShowKeyModal(true);
      return;
    }
    setIsGenerating(true);
    try {
      const examUnit = await generateComprehensiveTest(user);
      if (examUnit) {
        setActiveUnit(examUnit);
        setIsReviewingQuiz(false);
        setLastQuizResult(null);
        setCurrentScreen(ScreenName.QUIZ);
      }
    } catch (error) {
      console.error("Failed to generate exam", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuizFinish = (result: QuizResult) => {
    // Tăng đếm tổng số bài thi trên Cloud (kể cả chưa đăng nhập)
    incrementGlobalQuizzes();

    const finalResult: QuizResult = {
      ...result,
      timestamp: Date.now(),
      unitTitle: activeUnit?.title || "Bài học"
    };

    setLastQuizResult(finalResult);
    setIsReviewingQuiz(false);

    if (user.learningPath && activeUnit?.level !== 99) {
      const updatedPath = user.learningPath.map(u => {
        if (u.id === result.unitId) {
          const isPass = (result.score / result.totalQuestions) >= 0.5;
          return { ...u, status: isPass ? 'completed' : 'active' } as any;
        }
        return u;
      });

      setUser(prev => ({
        ...prev,
        learningPath: updatedPath,
        history: [finalResult, ...(prev.history || [])]
      }));
    } else {
      setUser(prev => ({
        ...prev,
        history: [finalResult, ...(prev.history || [])]
      }));
    }

    setCurrentScreen(ScreenName.QUIZ_RESULT);
  };

  const handleStartReview = () => {
    setIsReviewingQuiz(true);
    setCurrentScreen(ScreenName.QUIZ);
  };

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser({
      name: '',
      dob: '',
      grade: 11,
      numerologyNumber: 0,
      proficiencyLevel: 3,
      history: [],
      loginDates: []
    });
    setLoginError('');
    setCurrentScreen(ScreenName.WELCOME);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case ScreenName.WELCOME:
        return <WelcomeScreen onStart={() => setCurrentScreen(ScreenName.LOGIN)} />;
      case ScreenName.LOGIN:
        return <LoginScreen onLogin={handleLogin} onBack={() => setCurrentScreen(ScreenName.WELCOME)} error={loginError} />;
      case ScreenName.STUDENT_INFO:
        return <StudentInfoScreen user={user} setUser={setUser} onNext={handleStudentInfoNext} onBack={() => setCurrentScreen(ScreenName.WELCOME)} />;
      case ScreenName.ASSESSMENT:
        return <AssessmentScreen
          onNext={handleAssessmentNext}
          onBack={() => setCurrentScreen(ScreenName.LOGIN)}
          setProficiency={(level) => setUser({ ...user, proficiencyLevel: level })}
        />;
      case ScreenName.ANALYSIS_RESULT:
        return <AnalysisResultScreen
          user={user}
          onNext={() => setCurrentScreen(ScreenName.CLASS_SELECTION)}
          onBack={() => setCurrentScreen(ScreenName.ASSESSMENT)}
        />;
      case ScreenName.CLASS_SELECTION:
        return (
          <ClassSelectionScreen
            user={user}
            onNext={handleCreateLearningPath}
            onBack={() => setCurrentScreen(ScreenName.ANALYSIS_RESULT)}
            isGenerating={isGenerating}
          />
        );
      case ScreenName.LEARNING_PATH:
        return <LearningPathScreen
          user={user}
          onStartQuiz={async (unit) => {
            if (!unit.questions || unit.questions.length === 0) {
              setIsGenerating(true);
              try {
                const questions = await generateUnitQuestions(user, unit);
                if (questions && questions.length > 0) {
                  // Update user unit with questions
                  const updatedPath = user.learningPath?.map(u => 
                    u.id === unit.id ? { ...u, questions } : u
                  ) || [];
                  
                  setUser(prev => ({ ...prev, learningPath: updatedPath }));
                  setActiveUnit({ ...unit, questions });
                } else {
                  alert("Không thể tải câu hỏi. Vui lòng thử lại!");
                  return;
                }
              } catch (error) {
                console.error("Lazy load questions error", error);
                alert("Lỗi khi chuẩn bị bài học. Vui lòng kiểm tra kết nối!");
                return;
              } finally {
                setIsGenerating(false);
              }
            } else {
              setActiveUnit(unit);
            }
            
            setIsReviewingQuiz(false);
            setLastQuizResult(null);
            setCurrentScreen(ScreenName.QUIZ);
          }}
          onUpgradeUnit={handleUpgradeUnit}
          onBack={() => setCurrentScreen(ScreenName.CLASS_SELECTION)}
          onStartComprehensiveTest={handleComprehensiveTest}
        />;
      case ScreenName.QUIZ:
        return <QuizScreen
          unit={activeUnit}
          isReviewMode={isReviewingQuiz}
          existingAnswers={isReviewingQuiz ? lastQuizResult?.userAnswers : undefined}
          onFinish={handleQuizFinish}
          onBack={() => isReviewingQuiz ? setCurrentScreen(ScreenName.QUIZ_RESULT) : setCurrentScreen(ScreenName.LEARNING_PATH)}
        />;
      case ScreenName.QUIZ_RESULT:
        return <QuizResultScreen
          result={lastQuizResult}
          onReview={handleStartReview}
          onContinue={() => setCurrentScreen(ScreenName.LEARNING_PATH)}
        />;
      case ScreenName.PROFILE:
        return <ProfileScreen user={user} onLogout={handleLogout} />;
      case ScreenName.PARENT_REPORT:
        return <ParentReportScreen user={user} />;
      case ScreenName.HISTORY:
        return <HistoryScreen user={user} />;
      case ScreenName.ADMIN_STATISTICS:
        return <AdminStatisticsScreen />;
      case ScreenName.CHAT:
        return <ChatScreen user={user} />;
      case ScreenName.GAMES:
        return <GameLibraryScreen user={user} setUser={setUser} />;
      case ScreenName.SETTINGS:
        return <SettingsScreen user={user} onLogout={handleLogout} onBack={() => setCurrentScreen(ScreenName.PROFILE)} />;
      default:
        return <WelcomeScreen onStart={() => setCurrentScreen(ScreenName.LOGIN)} />;
    }
  };

  const isNavigable = [
    ScreenName.LEARNING_PATH,
    ScreenName.PROFILE,
    ScreenName.PARENT_REPORT,
    ScreenName.CHAT,
    ScreenName.GAMES,
    ScreenName.SETTINGS,
    ScreenName.HISTORY,
    ScreenName.ADMIN_STATISTICS
  ].includes(currentScreen);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-display flex w-full">
      {/* API KEY MODAL */}
      <ApiKeyModal
        isOpen={showKeyModal}
        onSave={handleSaveApiKey}
        initialKey={apiKey}
        onClose={apiKey ? () => setShowKeyModal(false) : undefined}
      />

      {/* Sidebar for Desktop */}
      {isNavigable && (
        <SidebarNavigation
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          user={user}
          onLogout={handleLogout}
          onOpenSettings={() => setShowKeyModal(true)} // Pass handler
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen relative overflow-hidden transition-all duration-300 ${isNavigable ? 'md:ml-80' : ''}`}>
        <div className="flex-1 w-full h-full overflow-y-auto no-scrollbar relative">
          {renderScreen()}
        </div>

        {/* Loading Overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-[60] flex flex-col items-center justify-center fixed">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-teal-100 border-t-primary animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-teal-800 font-bold text-lg animate-pulse">AI đang xử lý...</p>
            <p className="text-sm text-gray-500">Đang chuẩn bị nội dung học tập</p>
          </div>
        )}

        {/* Bottom Navigation for Mobile */}
        {isNavigable && (
          <BottomNavigation currentScreen={currentScreen} onNavigate={setCurrentScreen} user={user} />
        )}
      </div>
    </div>
  );
}
