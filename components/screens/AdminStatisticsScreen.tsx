import React, { useEffect, useState, useMemo } from 'react';
import { UserProfile } from '../../types';
import { fetchAllStudents, syncAllStudents } from '../../utils/syncService';
import { Users, LogIn, TrendingUp, Calendar, Search, ChevronDown, ChevronUp, BookOpen, GraduationCap, RefreshCcw, Upload } from 'lucide-react';

const STUDENT_DB_KEY = 'math_genius_student_db_v1';

// Bảng màu gradient cho từng lớp
const CLASS_COLORS: Record<number, { from: string; to: string; badge: string; text: string; border: string; light: string }> = {
    6: { from: 'from-pink-500', to: 'to-rose-500', badge: 'bg-pink-100 text-pink-700', text: 'text-pink-600', border: 'border-pink-200', light: 'bg-pink-50' },
    7: { from: 'from-orange-500', to: 'to-amber-500', badge: 'bg-orange-100 text-orange-700', text: 'text-orange-600', border: 'border-orange-200', light: 'bg-orange-50' },
    8: { from: 'from-emerald-500', to: 'to-teal-500', badge: 'bg-emerald-100 text-emerald-700', text: 'text-emerald-600', border: 'border-emerald-200', light: 'bg-emerald-50' },
    9: { from: 'from-blue-500', to: 'to-cyan-500', badge: 'bg-blue-100 text-blue-700', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
    10: { from: 'from-violet-500', to: 'to-purple-500', badge: 'bg-violet-100 text-violet-700', text: 'text-violet-600', border: 'border-violet-200', light: 'bg-violet-50' },
    11: { from: 'from-indigo-500', to: 'to-blue-600', badge: 'bg-indigo-100 text-indigo-700', text: 'text-indigo-600', border: 'border-indigo-200', light: 'bg-indigo-50' },
    12: { from: 'from-red-500', to: 'to-orange-500', badge: 'bg-red-100 text-red-700', text: 'text-red-600', border: 'border-red-200', light: 'bg-red-50' },
};

const DEFAULT_COLOR = { from: 'from-gray-500', to: 'to-slate-500', badge: 'bg-gray-100 text-gray-700', text: 'text-gray-600', border: 'border-gray-200', light: 'bg-gray-50' };

function getClassColor(grade: number) {
    return CLASS_COLORS[grade] || DEFAULT_COLOR;
}

export function AdminStatisticsScreen() {
    const [students, setStudents] = useState<UserProfile[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [openClasses, setOpenClasses] = useState<Set<number>>(new Set());
    const [filterGrade, setFilterGrade] = useState<number | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        setIsRefreshing(true);
        try {
            // 1. Load Local DB
            const rawDb = localStorage.getItem(STUDENT_DB_KEY);
            let mergedDb: Record<string, UserProfile> = rawDb ? JSON.parse(rawDb) : {};

            // 2. Load Cloud DB
            const cloudDb = await fetchAllStudents();
            if (cloudDb) {
                // Smart Merge: Gộp mảng history và loginDates thay vì ghi đè
                Object.keys(cloudDb).forEach(id => {
                    if (mergedDb[id]) {
                        const local = mergedDb[id];
                        const cloud = cloudDb[id];
                        
                        // Gộp loginDates
                        const combinedLogins = [
                            ...(local.loginDates || []), 
                            ...(cloud.loginDates || [])
                        ];
                        local.loginDates = Array.from(new Set(combinedLogins)).sort((a, b) => b - a);

                        // Gộp history
                        const combinedHistory = [
                            ...(local.history || []),
                            ...(cloud.history || [])
                        ];
                        // De-duplicate history based on timestamp and unitId
                        local.history = combinedHistory.filter((v, i, a) =>
                            a.findIndex(t => t.timestamp === v.timestamp && t.unitId === v.unitId) === i
                        ).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

                        // Cập nhật các thông tin khác (Lấy cái mới nhất)
                        local.grade = cloud.grade || local.grade;
                        local.proficiencyLevel = cloud.proficiencyLevel || local.proficiencyLevel;
                    } else {
                        mergedDb[id] = cloudDb[id];
                    }
                });
            }

            const studentList = Object.values(mergedDb).filter(user => !user.isAdmin);
            studentList.sort((a, b) => (b.loginDates?.length || 0) - (a.loginDates?.length || 0));
            setStudents(studentList);
            
            // Open all classes by default
            if (openClasses.size === 0) {
                const grades = new Set(studentList.map(s => s.grade));
                setOpenClasses(grades);
            }
            setLastUpdated(new Date());
        } catch (e) {
            console.error("Error loading student data", e);
        } finally {
            setIsRefreshing(false);
        }
    };

    const handlePushToCloud = async () => {
        const confirmResult = window.confirm("Bạn có muốn đẩy toàn bộ dữ liệu từ máy này lên Cloud không? Việc này giúp đồng bộ số liệu nếu bạn vừa chuyển từ máy khác sang.");
        if (!confirmResult) return;

        setIsRefreshing(true);
        try {
            const rawDb = localStorage.getItem(STUDENT_DB_KEY);
            if (rawDb) {
                const db = JSON.parse(rawDb);
                await syncAllStudents(db);
                alert("Đã đồng bộ dữ liệu lên Cloud thành công!");
                loadStudents(); // Reload total
            }
        } catch (e) {
            console.error("Error pushing to cloud", e);
            alert("Lỗi đồng bộ: " + e);
        } finally {
            setIsRefreshing(false);
        }
    };

    // Nhóm học sinh theo lớp
    const groupedByClass = useMemo(() => {
        const filtered = students.filter(student =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        const grouped: Record<number, UserProfile[]> = {};
        filtered.forEach(student => {
            const grade = student.grade || 0;
            if (!grouped[grade]) grouped[grade] = [];
            grouped[grade].push(student);
        });

        // Sắp xếp theo lớp tăng dần
        const sorted = Object.entries(grouped)
            .map(([grade, students]) => ({ grade: Number(grade), students }))
            .sort((a, b) => a.grade - b.grade);

        return sorted;
    }, [students, searchQuery]);

    // Lọc theo lớp nếu có
    const displayedClasses = useMemo(() => {
        if (filterGrade === null) return groupedByClass;
        return groupedByClass.filter(g => g.grade === filterGrade);
    }, [groupedByClass, filterGrade]);

    // Danh sách tất cả các lớp (để hiển thị filter chip)
    const allGrades = useMemo(() => {
        const grades = [...new Set(students.map(s => s.grade))].sort((a, b) => a - b);
        return grades;
    }, [students]);

    const toggleClass = (grade: number) => {
        setOpenClasses(prev => {
            const next = new Set(prev);
            if (next.has(grade)) {
                next.delete(grade);
            } else {
                next.add(grade);
            }
            return next;
        });
    };

    const formatDate = (timestamp: number) => {
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(new Date(timestamp));
    };

    const calculateProgress = (student: UserProfile) => {
        if (!student.history || student.history.length === 0) return 'Chưa có data';
        const recentScores = student.history.slice(0, 5).map(h => Math.round((h.score / h.totalQuestions) * 100));
        const avg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
        return `${avg.toFixed(1)}% (TB ${recentScores.length} bài gần nhất)`;
    };

    const getClassStats = (classStudents: UserProfile[]) => {
        const totalLogins = classStudents.reduce((acc, s) => acc + (s.loginDates?.length || 0), 0);
        const totalQuizzes = classStudents.reduce((acc, s) => acc + (s.history?.length || 0), 0);
        return { totalLogins, totalQuizzes };
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <TrendingUp className="w-7 h-7 md:w-8 md:h-8 text-indigo-600" />
                        Thống kê theo Lớp
                    </h1>
                    <p className="text-gray-500 mt-2 text-sm md:text-base">Theo dõi hoạt động của học sinh từ tất cả thiết bị (Cloud Sync)</p>
                </div>
                <div className="flex items-center gap-3 self-start md:self-auto">
                    {lastUpdated && (
                        <span className="text-[10px] text-gray-400 font-medium">
                            Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
                        </span>
                    )}
                    <button 
                        onClick={loadStudents}
                        disabled={isRefreshing}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                            isRefreshing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                        }`}
                    >
                        <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Đang tải...' : 'Làm mới'}
                    </button>
                    <button 
                        onClick={handlePushToCloud}
                        disabled={isRefreshing}
                        title="Đẩy dữ liệu từ máy này lên Cloud"
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                            isRefreshing ? 'border-gray-100 text-gray-300' : 'border-indigo-100 text-indigo-400 hover:bg-indigo-50'
                        }`}
                    >
                        <Upload className="w-4 h-4" />
                        Đẩy dữ liệu lên Cloud
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                        <Users className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">Tổng HS</p>
                        <p className="text-xl md:text-2xl font-bold text-gray-900">{students.length}</p>
                    </div>
                </div>
                <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 shrink-0">
                        <LogIn className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">Lượt truy cập</p>
                        <p className="text-xl md:text-2xl font-bold text-gray-900">
                            {students.reduce((acc, student) => acc + (student.loginDates?.length || 0), 0)}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 shrink-0">
                        <GraduationCap className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">Số lớp</p>
                        <p className="text-xl md:text-2xl font-bold text-gray-900">{allGrades.length}</p>
                    </div>
                </div>
                <div className="bg-white p-4 md:p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                        <BookOpen className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] md:text-xs text-gray-500 font-medium uppercase tracking-wide">Tổng bài làm</p>
                        <p className="text-xl md:text-2xl font-bold text-gray-900">
                            {students.reduce((acc, s) => acc + (s.history?.length || 0), 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 flex flex-col md:flex-row gap-3 md:gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên học sinh..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                    />
                </div>
                {/* Filter Chips */}
                <div className="flex flex-wrap gap-2 items-center">
                    <button
                        onClick={() => setFilterGrade(null)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filterGrade === null
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        Tất cả
                    </button>
                    {allGrades.map(grade => {
                        const color = getClassColor(grade);
                        return (
                            <button
                                key={grade}
                                onClick={() => setFilterGrade(filterGrade === grade ? null : grade)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${filterGrade === grade
                                    ? `bg-gradient-to-r ${color.from} ${color.to} text-white shadow-md`
                                    : `${color.badge} hover:opacity-80`
                                    }`}
                            >
                                Lớp {grade}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Grouped Student Lists */}
            <div className="flex flex-col gap-4 md:gap-5">
                {displayedClasses.length > 0 ? (
                    displayedClasses.map(({ grade, students: classStudents }) => {
                        const color = getClassColor(grade);
                        const isOpen = openClasses.has(grade);
                        const stats = getClassStats(classStudents);

                        return (
                            <div key={grade} className={`bg-white rounded-2xl shadow-sm border ${color.border} overflow-hidden transition-all duration-300`}>
                                {/* Class Header - Clickable */}
                                <button
                                    onClick={() => toggleClass(grade)}
                                    className={`w-full flex items-center justify-between p-4 md:p-5 transition-colors hover:bg-gray-50/50`}
                                >
                                    <div className="flex items-center gap-3 md:gap-4">
                                        <div className={`w-11 h-11 md:w-14 md:h-14 bg-gradient-to-br ${color.from} ${color.to} rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0`}>
                                            <span className="text-lg md:text-xl font-black">{grade}</span>
                                        </div>
                                        <div className="text-left">
                                            <h2 className="text-base md:text-lg font-bold text-gray-900">Lớp {grade}</h2>
                                            <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
                                                <span className={`inline-flex items-center gap-1 text-[10px] md:text-xs font-semibold ${color.badge} px-2 py-0.5 rounded-full`}>
                                                    <Users className="w-3 h-3" />
                                                    {classStudents.length} học sinh
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-medium text-gray-400">
                                                    <LogIn className="w-3 h-3" />
                                                    {stats.totalLogins} lượt truy cập
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-medium text-gray-400">
                                                    <BookOpen className="w-3 h-3" />
                                                    {stats.totalQuizzes} bài đã làm
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-xl ${isOpen ? color.light : 'bg-gray-100'} transition-colors`}>
                                        {isOpen
                                            ? <ChevronUp className={`w-5 h-5 ${color.text}`} />
                                            : <ChevronDown className="w-5 h-5 text-gray-400" />
                                        }
                                    </div>
                                </button>

                                {/* Expandable Student List */}
                                {isOpen && (
                                    <div className={`border-t ${color.border}`}>
                                        {/* Desktop Table */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className={`${color.light}`}>
                                                        <th className="py-3 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">STT</th>
                                                        <th className="py-3 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">Học sinh</th>
                                                        <th className="py-3 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">Lượt truy cập</th>
                                                        <th className="py-3 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">Truy cập gần nhất</th>
                                                        <th className="py-3 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">Số bài đã làm</th>
                                                        <th className="py-3 px-6 font-semibold text-gray-500 text-xs uppercase tracking-wider">Tiến độ (TB)</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {classStudents.map((student, index) => (
                                                        <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                                            <td className="py-3.5 px-6 text-gray-400 font-mono text-sm">{index + 1}</td>
                                                            <td className="py-3.5 px-6">
                                                                <div className="font-medium text-gray-900">{student.name}</div>
                                                                <div className="text-xs text-gray-400 mt-0.5">{student.dob}</div>
                                                            </td>
                                                            <td className="py-3.5 px-6">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color.badge}`}>
                                                                    {student.loginDates?.length || 0} lần
                                                                </span>
                                                            </td>
                                                            <td className="py-3.5 px-6 text-gray-500 text-sm">
                                                                {student.loginDates && student.loginDates.length > 0
                                                                    ? formatDate(student.loginDates[student.loginDates.length - 1])
                                                                    : <span className="text-gray-300 italic">Chưa có</span>}
                                                            </td>
                                                            <td className="py-3.5 px-6">
                                                                <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                                                                    <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                                                                    {student.history?.length || 0}
                                                                </span>
                                                            </td>
                                                            <td className="py-3.5 px-6 text-gray-600 font-medium text-sm">
                                                                {calculateProgress(student)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile Card List */}
                                        <div className="md:hidden flex flex-col divide-y divide-gray-50">
                                            {classStudents.map((student, index) => (
                                                <div key={index} className="p-4 hover:bg-gray-50/50 transition-colors">
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div>
                                                            <div className="font-semibold text-gray-900 text-sm">{student.name}</div>
                                                            <div className="text-xs text-gray-400">{student.dob}</div>
                                                        </div>
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${color.badge}`}>
                                                            {student.loginDates?.length || 0} lần truy cập
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        <div className="bg-gray-50 rounded-lg p-2">
                                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Bài đã làm</p>
                                                            <p className="text-sm font-bold text-gray-700">{student.history?.length || 0}</p>
                                                        </div>
                                                        <div className="bg-gray-50 rounded-lg p-2">
                                                            <p className="text-[10px] text-gray-400 uppercase font-bold">Tiến độ</p>
                                                            <p className="text-xs font-bold text-gray-700">{calculateProgress(student)}</p>
                                                        </div>
                                                    </div>
                                                    {student.loginDates && student.loginDates.length > 0 && (
                                                        <p className="text-[10px] text-gray-400 mt-2">
                                                            Gần nhất: {formatDate(student.loginDates[student.loginDates.length - 1])}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-7 h-7 text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-medium">Không tìm thấy học sinh nào phù hợp</p>
                        <p className="text-gray-300 text-sm mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc lớp</p>
                    </div>
                )}
            </div>
        </div>
    );
}
