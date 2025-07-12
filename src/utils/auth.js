// Create a utility file for authentication functions

export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem("authToken", token)
    } else {
        localStorage.removeItem("authToken")
    }
}

export const getAuthToken = () => {
    return localStorage.getItem("authToken")
}

export const removeAuthToken = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("username")
}

export const isAuthenticated = () => {
    const token = getAuthToken()
    return token !== null && token !== undefined
}

export const getAuthHeaders = () => {
    const token = getAuthToken()
    return token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    } : {
        'Content-Type': 'application/json'
    }
}

export const getAuthHeadersForFormData = () => {
    const token = getAuthToken()
    return token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
    } : {
        'Content-Type': 'multipart/form-data'
    }
}