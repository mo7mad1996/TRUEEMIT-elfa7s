export default ({ $auth, redirect }) => {
  if (!$auth.loggedIn) return redirect("/login");
  if ($auth.user.job != "manager") return redirect("/" + $auth.user.job);
};
