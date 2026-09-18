import ProtectedRoute from "@/components/auth/ProtectedRoute";

type RecommendationLayoutProps = {
  children: React.ReactNode;
};

export default function RecommendationLayout({
  children,
}: RecommendationLayoutProps) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
