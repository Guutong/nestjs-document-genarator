export class UploadS3Command {
  constructor(
    public readonly buffer: Buffer,
    public readonly fileName: string,
  ) {}
}
