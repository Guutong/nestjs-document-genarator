export class GeneratePdfCommand {
  constructor(
    public readonly html: string,
    public readonly style: string,
    public readonly fileName: string,
  ) {}
}
