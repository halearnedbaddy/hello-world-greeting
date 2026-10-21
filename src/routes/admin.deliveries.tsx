import { createFileRoute } from '@tanstack/react-router';
import { DeliveriesPage } from '@/components/admin/pages';

export const Route = createFileRoute('/admin/deliveries')({
  head: () => ({ meta: [{ title: 'Deliveries | Beez Admin' }, { name: 'description', content: 'Beez admin: deliveries.' }, { property: 'og:title', content: 'Deliveries | Beez Admin' }, { property: 'og:description', content: 'Manage Beez deliveries.' }] }),
  component: DeliveriesPage,
});
