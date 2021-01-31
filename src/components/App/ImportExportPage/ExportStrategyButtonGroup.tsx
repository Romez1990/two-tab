import React, { FC } from 'react';
import { createStyles, makeStyles, ButtonGroup, Button } from '@material-ui/core';
import clsx from 'clsx';
import { ExportStrategyName } from '../../../services/Storage/ImportExport';

interface Props {
  readonly strategies: ReadonlyArray<ExportStrategyName>;
  readonly activeStrategy: ExportStrategyName;
  onChange(strategy: ExportStrategyName): void;
}

const useStyles = makeStyles(() =>
  createStyles({
    activeStrategy: {
      background: '#4d4d4d',
    },
  }),
);

export const ExportStrategyButtonGroup: FC<Props> = ({ strategies, activeStrategy, onChange }) => {
  const onChanged = (strategy: ExportStrategyName) => (): void => onChange(strategy);

  const classes = useStyles();

  return (
    <ButtonGroup color="primary">
      {strategies.map(strategy => (
        <Button
          key={strategy}
          className={clsx({ [classes.activeStrategy]: strategy === activeStrategy })}
          onClick={onChanged(strategy)}
        >
          {strategy}
        </Button>
      ))}
    </ButtonGroup>
  );
};
