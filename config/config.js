const config = {
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || "KHKDJSIOJFWEOF4346346JNDSKLFDSKLNVDLS",
    mongoUri: process.env.MONGODB_URI || 'mongodb://social:social123@ds217208.mlab.com:17208/social'
}

export default config;