import { pipe } from 'fp-ts/function';
import { DownloadService } from './DownloadService';

export class DownloadServiceImpl implements DownloadService {
  public constructor(private readonly document: Document) {}

  public download = (filename: string) => (content: string): void =>
    pipe(
      [content],
      blobData => new Blob(blobData, { type: 'application/octet-stream' }),
      URL.createObjectURL,
      blobURL =>
        pipe(
          this.createLink(filename, blobURL),
          link => link.click(),
          () => URL.revokeObjectURL(blobURL),
        ),
    );

  private createLink(filename: string, blobURL: string): HTMLAnchorElement {
    const link = this.document.createElement('a');
    link.style.display = 'none';
    link.href = blobURL;
    link.setAttribute('download', filename);
    return link;
  }
}
