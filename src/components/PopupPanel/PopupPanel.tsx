import React, { FC } from 'react';
import { useExtensionService } from '../ServiceContainer';

export const PopupPanel: FC = () => {
  const extensionService = useExtensionService();

  const url = extensionService.getURL('index.html');

  return (
    <div>
      <a href={url}>Open in full screen</a>
    </div>
  );
};
