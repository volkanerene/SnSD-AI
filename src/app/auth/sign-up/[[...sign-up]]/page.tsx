import { Metadata } from 'next';
import SignUpViewPage from '@/features/auth/components/sign-up-view';

export const metadata: Metadata = {
  title: 'SnSD Consultants | Hesap Oluştur',
  description:
    'SnSD Consultants platformunda yeni bir hesap oluşturarak gelişmiş tedarikçi yönetimi özelliklerine erişin.'
};

export default function Page() {
  return <SignUpViewPage />;
}
