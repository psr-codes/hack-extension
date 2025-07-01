class Config {
    static getGeminiApiKey() {
        return null;
    }
    
    static async setGeminiApiKey(apiKey) {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            await chrome.storage.local.set({ geminiApiKey: apiKey });
        }
    }
    
    static async getStoredGeminiApiKey() {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            const result = await chrome.storage.local.get(['geminiApiKey']);
            return result.geminiApiKey || this.getGeminiApiKey();
        }
        return this.getGeminiApiKey();
    }
}
window.Config = Config;
