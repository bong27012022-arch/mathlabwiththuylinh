
const SYNC_CONFIG_KEY = 'math_genius_sync_config';

export interface SyncConfig {
    enabled: boolean;
    databaseUrl: string; // e.g. https://project-id.firebaseio.com/
    secretKey?: string;
}

export const getSyncConfig = (): SyncConfig => {
    try {
        const saved = localStorage.getItem(SYNC_CONFIG_KEY);
        if (saved) return JSON.parse(saved);
    } catch (e) {
        console.error("Failed to load sync config", e);
    }
    // Mặc định bật sẵn với Server dùng thử cho người dùng
    return { 
        enabled: true, 
        databaseUrl: 'https://mathlab-linh-default-rtdb.asia-southeast1.firebasedatabase.app/' 
    };
};

export const saveSyncConfig = (config: SyncConfig) => {
    localStorage.setItem(SYNC_CONFIG_KEY, JSON.stringify(config));
};

export const syncStudentData = async (studentId: string, data: any) => {
    const config = getSyncConfig();
    if (!config.enabled || !config.databaseUrl) return null;

    try {
        const baseUrl = config.databaseUrl.endsWith('/') ? config.databaseUrl : `${config.databaseUrl}/`;
        const url = `${baseUrl}students/${studentId}.json${config.secretKey ? `?auth=${config.secretKey}` : ''}`;
        
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Sync failed: ${response.statusText}`);
        }
        return await response.json();
    } catch (e) {
        console.error("Sync error:", e);
        return null;
    }
};

export const fetchAllStudents = async () => {
    const config = getSyncConfig();
    if (!config.enabled || !config.databaseUrl) return null;

    try {
        const baseUrl = config.databaseUrl.endsWith('/') ? config.databaseUrl : `${config.databaseUrl}/`;
        const url = `${baseUrl}students.json${config.secretKey ? `?auth=${config.secretKey}` : ''}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Fetch failed: ${response.statusText}`);
        }
        return await response.json();
    } catch (e) {
        console.error("Fetch students error:", e);
        return null;
    }
};

export const syncAllStudents = async (db: Record<string, any>) => {
    const config = getSyncConfig();
    if (!config.enabled || !config.databaseUrl) return null;

    try {
        const baseUrl = config.databaseUrl.endsWith('/') ? config.databaseUrl : `${config.databaseUrl}/`;
        const url = `${baseUrl}students.json${config.secretKey ? `?auth=${config.secretKey}` : ''}`;
        
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(db),
        });

        if (!response.ok) {
            throw new Error(`Batch sync failed: ${response.statusText}`);
        }
        return await response.json();
    } catch (e) {
        console.error("Batch sync error:", e);
        return null;
    }
};
export const fetchGlobalConfig = async () => {
    const config = getSyncConfig();
    if (!config.enabled || !config.databaseUrl) return null;

    try {
        const baseUrl = config.databaseUrl.endsWith('/') ? config.databaseUrl : `${config.databaseUrl}/`;
        const url = `${baseUrl}config.json${config.secretKey ? `?auth=${config.secretKey}` : ''}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Fetch config failed: ${response.statusText}`);
        }
        return await response.json();
    } catch (e) {
        console.error("Fetch global config error:", e);
        return null;
    }
};

export const saveGlobalConfig = async (data: any) => {
    const config = getSyncConfig();
    if (!config.enabled || !config.databaseUrl) return null;

    try {
        const baseUrl = config.databaseUrl.endsWith('/') ? config.databaseUrl : `${config.databaseUrl}/`;
        const url = `${baseUrl}config.json${config.secretKey ? `?auth=${config.secretKey}` : ''}`;
        
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`Save config failed: ${response.statusText}`);
        }
        return await response.json();
    } catch (e) {
        console.error("Save global config error:", e);
        return null;
    }
};
