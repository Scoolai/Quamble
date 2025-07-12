const API_BASE_URL = import.meta.env.PROD 
  ? '/api'  // Production: Use relative path
  : '/api'  // Development: Use proxy