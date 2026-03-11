import React, { useEffect, useState } from 'react';
import { UserProfile } from '../../types';
import { Users, LogIn, TrendingUp, Calendar, Search } from 'lucide-react';

const STUDENT_DB_KEY = 'math_genius_student_db_v1';

export function AdminStatisticsScreen() {
    const [students, setStudents] = useState<UserProfile[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = () => {
        try {
            const rawDb = localStorage.getItem(STUDENT_DB_KEY);
            if (rawDb) {
                const db: Record<string, UserProfile> = JSON.parse(rawDb);
                // Lọc ra danh sách học sinh (không phải admin)
                const studentList = Object.values(db).filter(user => !user.isAdmin);
                // Sắp xếp theo số lần đăng nhập giảm dần
                studentList.sort((a, b) => (b.loginDates?.length || 0) - (a.loginDates?.length || 0));
                setStudents(studentList);
            }
        } catch (e) {
            console.error("Error loading student data", e);
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <TrendingUp className="w-8 h-8 text-indigo-600" />
                    Thống kê Học sinh
                </h1>
                <p className="text-gray-500 mt-2">Theo dõi hoạt động và tiến độ của học sinh trên hệ thống</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Tổng số học sinh</p>
                        <p className="text-2xl font-bold text-gray-900">{students.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <LogIn className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Tổng lượt truy cập</p>
                        <p className="text-2xl font-bold text-gray-900">
                            {students.reduce((acc, student) => acc + (student.loginDates?.length || 0), 0)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo tên học sinh..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Student List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="py-4 px-6 font-semibold text-gray-600">Học sinh</th>
                                <th className="py-4 px-6 font-semibold text-gray-600">Lớp</th>
                                <th className="py-4 px-6 font-semibold text-gray-600">Lượt truy cập</th>
                                <th className="py-4 px-6 font-semibold text-gray-600">Truy cập gần nhất</th>
                                <th className="py-4 px-6 font-semibold text-gray-600">Tiến độ (TB)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map((student, index) => (
                                    <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-gray-900">{student.name}</div>
                                            <div className="text-sm text-gray-500">{student.dob}</div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">{student.grade}</td>
                                        <td className="py-4 px-6">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {student.loginDates?.length || 0} lần
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600 text-sm">
                                            {student.loginDates && student.loginDates.length > 0
                                                ? formatDate(student.loginDates[student.loginDates.length - 1])
                                                : 'Chưa có'}
                                        </td>
                                        <td className="py-4 px-6 text-gray-600 font-medium text-sm">
                                            {calculateProgress(student)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-gray-500">
                                        Không tìm thấy học sinh nào phù hợp
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
