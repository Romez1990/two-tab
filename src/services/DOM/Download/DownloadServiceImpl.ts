import { pipe } from 'fp-ts/function';
import { DownloadService } from './DownloadService';

export class DownloadServiceImpl implements DownloadService {
  public constructor(private readonly document: Document) {}

  public download = (filename: string, content: string): void =>
    pipe(
      [content],
      blobData => new Blob(blobData, { type: 'application/octet-stream' }),
      URL.createObjectURL,
      blobURL => {
        const link = this.document.createElement('a');
        link.style.display = 'none';
        link.href = blobURL;
        link.setAttribute('download', filename);
        this.document.body.appendChild(link);
        link.click();
        setTimeout((): void => {
          this.document.body.removeChild(link);
          URL.revokeObjectURL(blobURL);
        }, 200);
      },
    );
}
