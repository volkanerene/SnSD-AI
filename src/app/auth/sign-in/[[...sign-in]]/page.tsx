import { Metadata } from 'next';
import SignInViewPage from '@/features/auth/components/sign-in-view';

export const metadata: Metadata = {
  title: 'SnSD Consultants | Giriş Yap',
  description:
    'SnSD Consultants platformuna giriş yaparak tedarikçi yönetimi ve değerlendirme araçlarına erişin.'
};

export default function Page() {
  return <SignInViewPage />;
}
