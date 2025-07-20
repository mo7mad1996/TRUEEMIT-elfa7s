<template>
  <div></div>
</template>

<script>
export default {
  name: "IndexPage",
  middleware({ redirect, $auth }) {
    if (!$auth.loggedIn) return redirect("/login");
    else redirect("/" + $auth.user.job);
  },
  head: () => ({ title: "trueEmit" }),
};
</script>
