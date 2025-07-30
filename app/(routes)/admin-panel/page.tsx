// app/admin-panel/page.tsx
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { redirect } from 'next/navigation';
import ROLE from '@/common/role';
import AdminPanel from './adminpanel';


export default async function AdminPanelPage() {
  const token = (await cookies()).get('token')?.value;
  if (!token) redirect('/login');

  const secret = new TextEncoder().encode(process.env.TOKEN_SECRET_KEY);
  let payload: { name: string, role: string, profilePic: string };
  try {
    const { payload: decoded } = await jwtVerify(token, secret) as { payload: { name: string, role: string, profilePic: string } };
    payload = decoded;
  } catch {
    redirect('/login');
  }

  if (payload.role !== ROLE.ADMIN) redirect('/unauthorized');

  return <AdminPanel user={{
    name: payload.name,
    role: payload.role,
    profilePic: payload.profilePic,
  }} />;
}
