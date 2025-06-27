import { Suspense } from 'react';
import LogoutComponent from './LogoutComponent';
export const metadata = {
  title: 'Logout - ToxicGames',
  description: 'Logging out from ToxicGames',
};

export default function LogoutPage() {
  return (
    <Suspense fallback={<div>Loading page...</div>}>

      <div className="py-8">
        <LogoutComponent />
      </div>
    </Suspense>
  );
}
