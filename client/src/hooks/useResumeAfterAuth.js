import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { setAuthSuccess } from "../features/auth/authSlice";

// Replays a submission that the auth modal interrupted. An enforced logout
// drops the pending work instead of replaying it after the next sign-in.
// Returns the setter that marks work as pending.
export function useResumeAfterAuth(resume) {
  const dispatch = useDispatch();
  const authSuccess = useSelector((s) => s.auth.authSuccess);
  const enforcedLogout = useSelector((s) => s.auth.enforcedLogout);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (enforcedLogout) {
      setPending(false);
      return;
    }
    if (authSuccess && pending) {
      setPending(false);
      dispatch(setAuthSuccess(false));
      resume();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authSuccess, enforcedLogout]);

  return setPending;
}
