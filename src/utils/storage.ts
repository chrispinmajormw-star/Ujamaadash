class SafeStorage {
  private mem: Record<string, string> = {};

  getItem(key: string): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return this.mem[key] || null;
    }
  }

  setItem(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      this.mem[key] = value;
    }
  }

  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      delete this.mem[key];
    }
  }

  clear(): void {
    try {
      window.localStorage.clear();
    } catch (e) {
      this.mem = {};
    }
  }
}

export const safeStorage = new SafeStorage();
