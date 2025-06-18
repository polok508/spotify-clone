import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { clerkMiddleware } from '@clerk/express';
import fileUpload from "express-fileupload";
import path from "path";
import cors from "cors";
import fs from "fs";
import morgan from "morgan";

// Импорты роутов
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import authRoutes from "./routes/auth.route.js";
import songRoutes from "./routes/song.route.js";
import albumRoutes from "./routes/album.route.js";
import statRoutes from "./routes/stat.route.js";
import { connectDB } from "./lib/db.js";
import { createServer } from "http";
import { initializeSocket } from "./lib/socket.js";
import cron from "node-cron";

dotenv.config();

// Проверка обязательных переменных окружения
const requiredEnvVars = [
  'CLERK_SECRET_KEY',
  'ADMIN_EMAILS',
  'MONGODB_URI',
  'PORT',
  'NODE_ENV'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ ERROR: ${varName} is not defined in .env file!`);
    if (varName === 'MONGODB_URI' || varName === 'CLERK_SECRET_KEY') process.exit(1);
  } else {
    console.log(`✅ ${varName} loaded`);
  }
});

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
initializeSocket(httpServer);

// ==================== Middlewares ====================

// Безопасность
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "same-site" }
}));

// CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Clerk-Auth-Message"],
  credentials: true,
  exposedHeaders: ["X-Clerk-Auth-Message"]
}));

// Логирование
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP'
});

// Парсинг JSON с лимитом
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Clerk middleware
app.use(clerkMiddleware());

// File upload
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: path.join(__dirname, "tmp"),
  createParentPath: true,
  limits: { 
    fileSize: 10 * 1024 * 1024,
    files: 5
  },
  abortOnLimit: true
}));

// ==================== Routes ====================

// Health Check
app.get('/api/healthcheck', apiLimiter, async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const memoryUsage = process.memoryUsage();
    
    res.json({
      status: 'OK',
      db: dbStatus,
      memory: {
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'DB check failed', 
      error: error.message 
    });
  }
});

const tempDir = path.join(process.cwd(), "tmp");
cron.schedule("0 * * * *", () => {
  if (fs.existsSync(tempDir)) {
    fs.readdir(tempDir, (err, files) => {
      if (err) {
        console.log("error", err);
        return;
      }

      for (const file of files) {
        fs.unlink(path.join(tempDir, file), (err) => {});
      }
    });
  }
})

// API Routes
app.use("/api/users", apiLimiter, userRoutes);
app.use("/api/auth", apiLimiter, authRoutes);
app.use("/api/admin", apiLimiter, adminRoutes);
app.use("/api/songs", apiLimiter, songRoutes);
app.use("/api/albums", apiLimiter, albumRoutes);
app.use("/api/stats", apiLimiter, statRoutes);

if(process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")))
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"))
  })
};

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('⚠️ Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : err.message,
    ...(process.env.NODE_ENV === "development" && { 
      stack: err.stack,
      details: err.details 
    })
  });
});

// ==================== Server Startup ====================

// Graceful Shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    
    // Добавляем индексы для оптимизации
    await mongoose.connection.db.collection('songs').createIndex({ title: 1 });
    await mongoose.connection.db.collection('songs').createIndex({ albumId: 1 });
    await mongoose.connection.db.collection('stats').createIndex({ createdAt: -1 });

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`🔗 MongoDB connected: ${mongoose.connection.host}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

