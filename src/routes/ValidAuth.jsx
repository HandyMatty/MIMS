import PropTypes from 'prop-types';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const Auth = ({ store, redirect }) => {
  const { token, userData } = store();
  const location = useLocation();

  return token && userData ? (
    <Outlet />
  ) : (
    <Navigate to={redirect} state={{ from: location }} replace />
  );
};

export const UnAuth = ({ store, redirect }) => {
  const { token, userData } = store();
  const location = useLocation();

  return token || userData ? (
    <Navigate to={redirect} state={{ from: location }} replace />
  ) : (
    <Outlet />
  );
};

Auth.propTypes = {
  store: PropTypes.func.isRequired,
  redirect: PropTypes.string.isRequired,
};

UnAuth.propTypes = {
  store: PropTypes.func.isRequired,
  redirect: PropTypes.string.isRequired,
};
