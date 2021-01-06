import React, { FC, useEffect } from 'react';
import { useExtensionService, useTabService } from '../../services/ServiceContainer';

export const PopupPanel: FC = () => {
  const extensionService = useExtensionService();
  const tabService = useTabService();

  const url = extensionService.getURL('index.html');

  useEffect(() => {
    (async () => {
      const tab = await tabService.getAllInWindow();
      console.log(tab);
    })();
  });

  return (
    <div>
      <a href={url}>Open in full screen</a>
    </div>
  );
};
