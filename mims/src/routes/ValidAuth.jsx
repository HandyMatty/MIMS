import PropTypes from 'prop-types';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

// Component to validate authentication
export const Auth = ({ store, redirect }) => {
  const { token, userData } = store();
  const location = useLocation();

  return token && userData ? (
    <Outlet />
  ) : (
    <Navigate to={redirect} state={{ from: location }} replace />
  );
};

Auth.propTypes = {
  store: PropTypes.func.isRequired,
  redirect: PropTypes.string.isRequired,
};

// Component to validate unauthenticated access
export const UnAuth = ({ store, redirect }) => {
  const { token, userData } = store();
  const location = useLocation();

  return token || userData ? (
    <Navigate to={redirect} state={{ from: location }} replace />
  ) : (
    <Outlet />
  );
};

UnAuth.propTypes = {
  store: PropTypes.func.isRequired,
  redirect: PropTypes.string.isRequired,
};
