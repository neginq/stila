import ProtectedRoute from "@/components/auth/ProtectedRoute";

type ProfileLayoutProps = {
  children: React.ReactNode;
};

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
