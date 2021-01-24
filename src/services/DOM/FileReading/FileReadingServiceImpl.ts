import { flow } from 'fp-ts/function';
import { FileReadingService } from './FileReadingService';

export class FileReadingServiceImpl implements FileReadingService {
  public readAsText = (file: File) => (): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = flow(this.onFileLoad.bind(this), resolve);
      reader.onerror = reject;
    });

  private onFileLoad({ target }: ProgressEvent<FileReader>): string {
    if (target === null) {
      throw new Error();
    }
    const { result } = target;
    if (typeof result !== 'string') {
      throw new Error();
    }
    return result;
  }
}
