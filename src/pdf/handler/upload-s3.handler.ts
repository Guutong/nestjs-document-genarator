import {
  S3Client,
  ListBucketsCommand,
  CreateBucketCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Logger } from '@nestjs/common';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { UploadS3Command } from '../command/upload-s3.command';
import { UploadS3CompletedEvent } from '../event/upload-s3-completed.event';

@CommandHandler(UploadS3Command)
export class UploadS3Handler implements ICommandHandler<UploadS3Command> {
  private readonly logger = new Logger(UploadS3Handler.name);
  constructor(private eventBus: EventBus) {}

  async execute(command: UploadS3Command) {
    this.logger.debug(`UploadS3Handler execute with UploadS3Command`);
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
      this.logger.debug(`Creating bucket ${bucketName}`);
      await client.send(createBucketCommand);
    }

    this.logger.debug(`Uploading file ${command.fileName} to S3`);
    client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: command.fileName,
        Body: command.buffer,
      }),
    );

    this.logger.debug(`Publishing event UploadS3CompletedEvent`);
    this.eventBus.publish(
      new UploadS3CompletedEvent(command.buffer, command.fileName),
    );
  }
}
