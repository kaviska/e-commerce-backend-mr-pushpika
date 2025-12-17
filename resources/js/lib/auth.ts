export const getAuthUser = () => {
    const user = localStorage.getItem("user");
    if (!user) return null;
    try {
        return JSON.parse(user);
    } catch (error) {
        console.error("Error parsing user from localStorage", error);
        return null;
    }
};

export const getUserId = () => {
    const user = getAuthUser();
    return user ? user.id : null;
};