import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Orígenes permitidos para CORS (incluye los nuevos subdominios locales)
const allowedOrigins = [
    // Producción
    "https://quelora.org",
    "https://www.quelora.org",
    "https://api.quelora.org",
    "https://dashboard.quelora.org",
    // Desarrollo local (IP 192.168.217.130)
    "http://dashboard.quelora.local",
    "https://dashboard.quelora.local",
    "http://demo.quelora.local",
    "https://demo.quelora.local",
    "http://api.quelora.local",
    "https://api.quelora.local",
    "http://api-dashboard.quelora.local",
    "https://api-dashboard.quelora.local",
    "http://mail.quelora.local",
    "https://mail.quelora.local",
    // localhost tradicional
    "http://localhost:3001",
    "http://localhost:3000",
];

app.use(helmet());
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 10000,
        message: { error: "Too many requests, try again later." },
    })
);

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                console.warn(`CORS bloqueado para origen: ${origin}`);
                callback(new Error("Not allowed by CORS"));
            }
        },
    })
);

// --- CONFIGURACIÓN DE SEGURIDAD (HELMET + CSP) ---
app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "'unsafe-eval'",
                    "https://*.cloudflare.com",
                    "https://challenges.cloudflare.com",
                    "https://unpkg.com",
                    "https://cdn.jsdelivr.net",
                    "https://accounts.google.com",
                    "https://accounts.google.com/gsi/client",
                    "https://www.gstatic.com",
                    "https://apis.google.com",
                    "https://connect.facebook.net",
                    "https://connect.facebook.com",
                    "https://cdnjs.cloudflare.com"
                ],
                styleSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://fonts.googleapis.com",
                    "https://accounts.google.com",
                    "https://www.gstatic.com",
                    "https://fonts.googleapis.com/css2",
                    "https://cdn.jsdelivr.net",
                    "https://unpkg.com",
                    "https://cdnjs.cloudflare.com"
                ],
                fontSrc: [
                    "'self'",
                    "data:",
                    "https://fonts.gstatic.com",
                    "https://fonts.googleapis.com",
                    "https://www.gstatic.com",
                    "https://cdn.jsdelivr.net"
                ],
                imgSrc: [
                    "'self'",
                    "data:",
                    "blob:",
                    "https:",
                    "http:",
                    "https://*.cloudflare.com",
                    "https://external-preview.redd.it",
                    "https://i.redd.it/",
                    "https://picsum.photos",
                    "https://www.youtube.com/",
                    "https://preview.redd.it",
                    "https://i.pravatar.cc",
                    "https://lh3.googleusercontent.com",
                    "https://*.googleusercontent.com",
                    "https://www.gstatic.com",
                    "https://graph.facebook.com",
                    "https://avatars.githubusercontent.com",
                    "https://flagcdn.com",
                    "http://dashboard.quelora.local",
                    "https://dashboard.quelora.local",
                    "http://demo.quelora.local",
                    "https://demo.quelora.local"
                ],
                connectSrc: [
                    "'self'",
                    "https:",
                    "http://dashboard.quelora.local",
                    "https://dashboard.quelora.local",
                    "http://demo.quelora.local",
                    "https://demo.quelora.local",
                    "http://api.quelora.local",
                    "https://api.quelora.local",
                    "http://api-dashboard.quelora.local",
                    "https://api-dashboard.quelora.local",
                    "http://mail.quelora.local",
                    "https://mail.quelora.local",
                    "https://*.cloudflare.com",
                    "https://challenges.cloudflare.com",
                    "https://cdn.jsdelivr.net",
                    "https://accounts.google.com",
                    "https://www.googleapis.com",
                    "https://*.google.com",
                    "https://*.gstatic.com",
                    "https://*.quelora.org",
                    "https://graph.facebook.com",
                    "https://api.twitter.com",
                    "https://cdnjs.cloudflare.com",
                    "https://ipapi.co",
                    "wss://*.quelora.org",
                    "wss://tracker.openwebtorrent.com",
                    "wss://tracker.btorrent.xyz",
                    "wss://tracker.webtorrent.io",
                    "wss://tracker.webtorrent.dev:443",
                    "ws://localhost:8000",
                    "wss://relay.damus.io",
                    "wss://nos.lol",
                    "wss://relay.nostr.band",
                    "wss://relay.primal.net",
                    "wss://relay.nostr.dev.br",
                    "wss://relay.wellorder.net",
                    "wss://relay.nostrich.de",
                    "wss://relay.nostr.info",
                    "wss://nostr.rocks",
                    "wss://relay.nostr.pub",
                    "wss://relay.nostr.inosta.cc",
                    "wss://nostr.wine",
                    "wss://*"
                ],
                frameSrc: [
                    "'self'",
                    "https:",
                    "https://*.cloudflare.com",
                    "https://challenges.cloudflare.com",
                    "https://www.youtube.com",
                    "https://www.youtube-nocookie.com",
                    "https://accounts.google.com",
                    "https://*.google.com",
                    "https://*.gstatic.com",
                    "https://facebook.com",
                    "https://www.facebook.com",
                    "https://staticxx.facebook.com"
                ],
                mediaSrc: [
                    "'self'",
                    "https://www.youtube.com",
                    "blob:",
                    "data:",
                    "https://quelora.github.io"
                ],
                objectSrc: ["'none'"],
                baseUri: ["'self'"],
                formAction: ["'self'", "https://accounts.google.com"],
                workerSrc: ["'self'", "blob:"],
                manifestSrc: ["'self'"]
            },
        },
        crossOriginEmbedderPolicy: false,
        crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
        crossOriginResourcePolicy: { policy: "cross-origin" },
        hsts:
            process.env.NODE_ENV === "production"
                ? {
                    maxAge: 31536000,
                    includeSubDomains: true,
                    preload: true,
                }
                : false,
        referrerPolicy: {
            policy: "strict-origin-when-cross-origin",
        },
    })
);

app.use((req, res, next) => {
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Permissions-Policy", "interest-cohort=()");
    next();
});

app.use(express.json());
app.use(express.static(__dirname));

// Bloquear escrituras en modo demo (solo lectura)
app.use((req, res, next) => {
    if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
        return res
            .status(403)
            .json({ error: "Write operations are disabled in demo mode." });
    }
    next();
});

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
const CID = process.env.CID || 'DEFAULT_CID';

mongoose
    .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    });

// --- Modelos ---
const postSchema = new mongoose.Schema({
    cid: String,
    entity: mongoose.Schema.Types.ObjectId,
    reference: String,
    title: String,
    link: String,
    type: String,
    description: String,
    image: String,
    config: Object,
    likes: Array,
    sharesCount: Number,
    commentCount: Number,
    likesCount: Number,
    viewsCount: Number,
    metadata: Object,
    deletion: Object,
    created_at: Date,
    updated_at: Date,
});
const Post = mongoose.model("Post", postSchema);

// Nota: Los modelos Comment, ProfileLike, Profile ya no se usan pero se mantienen por si acaso
// Se pueden eliminar si no se utilizan en el futuro.
const commentSchema = new mongoose.Schema({
    cid: String,
    postId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    text: String,
    created_at: Date,
});
const Comment = mongoose.model("Comment", commentSchema);

const profileLikeSchema = new mongoose.Schema({
    cid: String,
    entityId: mongoose.Schema.Types.ObjectId,
    userId: mongoose.Schema.Types.ObjectId,
    type: String,
    created_at: Date,
});
const ProfileLike = mongoose.model("ProfileLike", profileLikeSchema);

const profileSchema = new mongoose.Schema({
    cid: String,
    username: String,
    email: String,
    created_at: Date,
});
const Profile = mongoose.model("Profile", profileSchema);

// --- Endpoints ---

// Obtener posts regulares (paginados)
app.get("/api/posts", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 0;
        const limit = Math.min(parseInt(req.query.limit) || 10, 20);

        const posts = await Post.find({
            "deletion.status": "active",
            cid: CID,
            'config.liveMode.isLiveActive': { $ne: true }
        })
            .sort({ created_at: -1 })
            .skip(page * limit)
            .limit(limit)
            .select('-likes')
            .lean();

        res.json(posts);
    } catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Obtener posts en vivo (hasta 2)
app.get("/api/posts/inlive", async (req, res) => {
    try {
        const posts = await Post.find({
            "deletion.status": "active",
            cid: CID,
            "config.liveMode.isLiveActive": true
        })
            .sort({ created_at: -1 })
            .limit(2)
            .select('-likes')
            .lean();

        res.json(posts);
    } catch (error) {
        console.error("Error fetching inlive posts:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Servir la página principal
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Demo API running at http://localhost:${PORT}`);
});