
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
    // Mặc định dùng Database chính xác của cô Linh
    return { 
        enabled: true, 
        databaseUrl: 'https://rung-chuong-vang-sp-default-rtdb.asia-southeast1.firebasedatabase.app/' 
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
        let baseUrl = config.databaseUrl.trim();
        if (!baseUrl.startsWith('http')) baseUrl = `https://${baseUrl}`;
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);
        
        const url = `${baseUrl}/students.json${config.secretKey ? `?auth=${config.secretKey}` : ''}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Fetch failed with status: ${response.status} ${response.statusText}`);
            return null;
        }
        return await response.json();
    } catch (e) {
        console.error("Fetch students network error:", e);
        return null;
    }
};

export const syncAllStudents = async (db: Record<string, any>) => {
    const config = getSyncConfig();
    if (!config.enabled || !config.databaseUrl) return null;

    try {
        let baseUrl = config.databaseUrl.trim();
        if (!baseUrl.startsWith('http')) baseUrl = `https://${baseUrl}`;
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

        const url = `${baseUrl}/students.json${config.secretKey ? `?auth=${config.secretKey}` : ''}`;
        
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(db),
        });

        if (!response.ok) {
            console.error(`Batch sync failed with status: ${response.status}`);
            return null;
        }
        return await response.json();
    } catch (e) {
        console.error("Batch sync network error:", e);
        return null;
    }
};
export const fetchGlobalConfig = async () => {
    const config = getSyncConfig();
    if (!config.enabled || !config.databaseUrl) return null;

    try {
        let baseUrl = config.databaseUrl.trim();
        if (!baseUrl.startsWith('http')) baseUrl = `https://${baseUrl}`;
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

        const url = `${baseUrl}/config.json${config.secretKey ? `?auth=${config.secretKey}` : ''}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Fetch config failed with status: ${response.status}`);
            return null;
        }
        return await response.json();
    } catch (e) {
        console.error("Fetch global config network error:", e);
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

export const fetchGlobalVisits = async (): Promise<number> => {
    const config = getSyncConfig();
    if (!config.enabled || !config.databaseUrl) return 0;
    try {
        let baseUrl = config.databaseUrl.trim();
        if (!baseUrl.startsWith('http')) baseUrl = `https://${baseUrl}`;
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

        const url = `${baseUrl}/stats/totalVisits.json${config.secretKey ? `?auth=${config.secretKey}` : ''}`;
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            return typeof data === 'number' ? data : 0;
        }
    } catch (e) { console.error(e) }
    return 0;
};

export const incrementGlobalVisits = async () => {
    // Only increment once per device per hour to avoid spamming the DB
    const lastVisit = localStorage.getItem('math_genius_last_visit');
    const now = Date.now();
    if (lastVisit && now - parseInt(lastVisit) < 1000 * 60 * 60) {
        return; // Already counted this hour
    }
    
    const currentVisits = await fetchGlobalVisits();
    const config = getSyncConfig();
    if (!config.enabled || !config.databaseUrl) return;

    try {
        let baseUrl = config.databaseUrl.trim();
        if (!baseUrl.startsWith('http')) baseUrl = `https://${baseUrl}`;
        if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

        const url = `${baseUrl}/stats/totalVisits.json${config.secretKey ? `?auth=${config.secretKey}` : ''}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentVisits + 1)
        });
        
        if (response.ok) {
            localStorage.setItem('math_genius_last_visit', now.toString());
        }
    } catch (e) { console.error(e) }
};
