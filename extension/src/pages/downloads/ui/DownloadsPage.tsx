import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useState } from 'react';
import { QueuePage } from './QueuePage';
import { SubscriptionsPage } from './SubscriptionsPage';

/** "Downloads": queue and subscriptions (docs/extension/pages/downloads.md). */
export function DownloadsPage() {
  const [tab, setTab] = useState<'queue' | 'subscriptions'>(() =>
    location.hash.includes('subscriptions') ? 'subscriptions' : 'queue',
  );
  return (
    <>
      <Tabs value={tab} onChange={(_, value: 'queue' | 'subscriptions') => setTab(value)} sx={{ mb: 2 }}>
        <Tab value="queue" label="Очередь" />
        <Tab value="subscriptions" label="Подписки" />
      </Tabs>
      {tab === 'queue' ? <QueuePage /> : <SubscriptionsPage />}
    </>
  );
}
