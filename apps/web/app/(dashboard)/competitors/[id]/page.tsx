import { redirect } from 'next/navigation';

export default function CompetitorIndexPage({ params }: { params: { id: string } }) {
  redirect(`/competitors/${params.id}/overview`);
}
