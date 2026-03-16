
// all possible roles in the system
export const ROLES = [
    "super_admin",
    "client_admin",
    "client_viewer",
];

// roles that belong to clients
export const CLIENT_ROLES = [
    "client_admin",
    "client_viewer",
];

// application level roles
export const APPLICATION_ROLES = {
    SUPER_ADMIN : "super_admin",
    CLIENT_VIEWER : "client_viewer",
}

// check if role is a valid client role
export const isValidClientRole = (role) => CLIENT_ROLES.includes(role);

// check if role is valid in the system
export const isValidRole = (role) => ROLES.includes(role);