export const Auth = {
isLoggedIn: () => localStorage.getItem("isLoggedIn") === "true",
getToken: () => localStorage.getItem("access_token"),
logout: () => {
localStorage.clear();
window.location.href = "/login";
},
};