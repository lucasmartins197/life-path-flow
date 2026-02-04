import { Navigate } from "react-router-dom";

// Redirect root to auth page
const Index = () => {
  return <Navigate to="/auth" replace />;
};

export default Index;
