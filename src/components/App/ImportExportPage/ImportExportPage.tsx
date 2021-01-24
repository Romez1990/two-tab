import React, { FC, useState } from 'react';
import { Container, Button } from '@material-ui/core';
import { constVoid, pipe } from 'fp-ts/function';
import { Option, some, none, fold, isSome, isNone } from 'fp-ts/Option';
import { fold as foldE } from 'fp-ts/Either';
import { map } from 'fp-ts/Task';
import { useService } from '../../Providers/ServiceContainer';
import { run } from '../../../services/Utils/fp-ts/Task';
import { ImportFileNotSelectedError } from './Errors';

export const ImportExportPage: FC = () => {
  const importExport = useService('importExportService');

  const [importFileValue, setImportFileValue] = useState<string>('');
  const [importFile, setImportFile] = useState<Option<File>>(none);

  const changeFile = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value, files } = e.target;
    if (files === null) {
      throw new Error();
    }
    if (files.length === 0) return;
    const file = files[0];
    if (typeof file === 'undefined') {
      throw new Error();
    }
    setImportFileValue(value);
    setImportFile(some(file));
  };

  const [importError, setImportError] = useState<Option<string>>(none);

  const importData = (): Promise<void> =>
    pipe(
      importFile,
      fold(
        () => new ImportFileNotSelectedError().throw(),
        importExport.import.bind(importExport),
        //
      ),
      map(
        foldE(
          () => setImportError(some('Invalid file format')),
          constVoid,
          //
        ),
      ),
      run,
    );

  const exportData = (): Promise<void> =>
    pipe(
      importExport.export(),
      run,
      //
    );

  return (
    <Container>
      <input type="file" value={importFileValue} onChange={changeFile} />
      <Button variant="contained" color="primary" onClick={importData} disabled={isNone(importFile)}>
        Import
      </Button>
      {isSome(importError) && <div>{importError.value}</div>}
      <Button variant="contained" color="primary" onClick={exportData}>
        Export
      </Button>
    </Container>
  );
};
