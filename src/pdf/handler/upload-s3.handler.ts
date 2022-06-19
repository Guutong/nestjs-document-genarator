import {
  S3Client,
  ListBucketsCommand,
  CreateBucketCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UploadS3Command } from '../command/upload-s3.command';

@CommandHandler(UploadS3Command)
export class UploadS3Handler implements ICommandHandler<UploadS3Command> {
  constructor(private eventBus: EventBus) {}

  async execute(command: UploadS3Command) {
    const client = new S3Client({});
    const bucketName = 'pdf-generator-bucket';

    const listBucketsCommandOutput = await client.send(
      new ListBucketsCommand({}),
    );
    const bucketExists = listBucketsCommandOutput.Buckets.some(
      (bucket) => bucket.Name === bucketName,
    );
    if (!bucketExists) {
      const createBucketCommand = new CreateBucketCommand({
        Bucket: bucketName,
      });
      await client.send(createBucketCommand);
    }

    client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: command.fileName,
        Body: command.buffer,
      }),
    );

    this.eventBus.publish(
      new UploadS3Command(command.buffer, command.fileName),
    );
  }
}
