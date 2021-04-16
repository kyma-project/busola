var mgr = new Oidc.UserManager();
mgr.signinSilentCallback().catch((error) => {
  console.error(error);
});
