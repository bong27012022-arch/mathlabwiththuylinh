export const removeAccents = (str: string): string => {
    return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .trim().toLowerCase();
};

export const getStudentDbId = (name: string, dob: string): string => {
    const normalizedName = removeAccents(name);
    const normalizedDob = dob.trim();
    return `${normalizedName}_${normalizedDob}`;
};
