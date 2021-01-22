import React, { FC, MouseEvent } from 'react';
import { Button } from '@material-ui/core';

interface Props {
  onClick(e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>): void;
}

export const TryAgainButton: FC<Props> = ({ onClick }) => (
  <Button type="button" variant="contained" color="primary" onClick={onClick}>
    Try again
  </Button>
);
