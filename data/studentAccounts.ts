
// Danh sách tài khoản học sinh
// Tài khoản (name): Họ và tên (Không phân biệt hoa thường)
// Mật khẩu (dob): Ngày tháng năm sinh (Định dạng dd/mm/yyyy)

export interface StudentAccount {
    name: string;
    dob: string;
    grade?: number; // Tùy chọn: Lớp mặc định nếu có
    isVip?: boolean; // Nếu true sẽ không hiện đếm ngược
    limitDays?: number; // Số ngày sử dụng mặc định (thay vì 30)
    isAdmin?: boolean; // Quyền quản trị viên
}

export const STUDENT_ACCOUNTS: StudentAccount[] = [
    { name: "Hồ Thị Thùy Linh", dob: "05/09/1997", grade: 12, isVip: true, isAdmin: true },
    { name: "Trần Hải Bình", dob: "08/04/2010", grade: 10, isVip: true },
    { name: "Nguyễn Nhật Minh", dob: "15/01/2010", grade: 10, isVip: true },
    { name: "Hoàng Phương Linh", dob: "21/01/2012", grade: 8, isVip: true },
    { name: "Hoàng Thu Trang", dob: "21/09/2014", grade: 6, isVip: true },
    { name: "Hoàng Thảo Vy", dob: "02/09/2010", grade: 10, limitDays: 45 },
    // Bạn có thể thêm danh sách học sinh của mình vào đây...
    { name: "Admin Test", dob: "01/01/2000", grade: 12, isVip: true, isAdmin: true }
];
