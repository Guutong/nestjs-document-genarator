export class UploadS3CompletedEvent {
  constructor(
    public readonly buffer: Buffer,
    public readonly fileName: string,
  ) {}
}
