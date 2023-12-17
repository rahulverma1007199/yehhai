import Users from "./users.js";
import Blogs from "./blogs.js";

Users.associate({Blogs});
Blogs.associate({Users});

export {Users,Blogs};