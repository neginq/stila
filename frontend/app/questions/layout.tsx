import ProtectedRoute from "@/components/auth/ProtectedRoute";

type QuestionsLayoutProps = {
  children: React.ReactNode;
};

export default function QuestionsLayout({ children }: QuestionsLayoutProps) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
