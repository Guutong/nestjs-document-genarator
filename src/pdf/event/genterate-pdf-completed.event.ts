export class GeneratePdfCompletedEvent {
  constructor(
    public readonly buffer: Buffer,
    public readonly fileName: string,
  ) {}
}
