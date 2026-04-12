const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || "KHKDJSIOJFWEOF4346346JNDSKLFDSKLNVDLS",
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/social'
}

export default config;