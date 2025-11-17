export const mockGit = {
  diff: "",
  stagedFiles: [],

  setDiff(text: string) {
    this.diff = text;
  },

  getDiff() {
    return this.diff;
  },

  setStaged(files: string[]) {
    this.stagedFiles = files as any;
  },

  getStaged() {
    return this.stagedFiles;
  },
};
