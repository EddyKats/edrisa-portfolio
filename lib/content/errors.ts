export class ContentWriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentWriteError";
  }
}
