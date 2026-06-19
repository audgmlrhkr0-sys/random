import { Navigate, useParams } from 'react-router-dom';

export default function LegacyRedirect() {
  const params = useParams();
  const rest = params['*'];
  return <Navigate to={rest ? `/${rest}` : '/'} replace />;
}
