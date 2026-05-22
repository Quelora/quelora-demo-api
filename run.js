/*
 * Quelora — quelora-demo-api
 * Copyright (C) 2026 Germán Zelaya — https://quelora.org
 * SPDX-License-Identifier: AGPL-3.0-only
 *
 * This file is part of Quelora. See the LICENSE file for terms.
 */

/**
 * @fileoverview Main Express server configuration and API endpoints.
 * Handles security, routing, database connection, and data retrieval.
 */

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

const allowedOrigins = [
    "https://quelora.org",
    "https://www.quelora.org",
    "https://api.quelora.org",
    "https://dashboard.quelora.org",
    "http://dashboard.quelora.dev",
    "https://dashboard.quelora.dev",
    "http://demo.quelora.dev",
    "https://demo.quelora.dev",
    "http://api.quelora.dev",
    "https://api.quelora.dev",
    "http://api-dashboard.quelora.dev",
    "https://api-dashboard.quelora.dev",
    "http://mail.quelora.dev",
    "https://mail.quelora.dev",
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
                console.warn(`CORS blocked for origin: ${origin}`);
                callback(new Error("Not allowed by CORS"));
            }
        },
    })
);

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
                    "http://dashboard.quelora.dev",
                    "https://dashboard.quelora.dev",
                    "http://demo.quelora.dev",
                    "https://demo.quelora.dev"
                ],
                connectSrc: [
                    "'self'",
                    "https:",
                    "http://dashboard.quelora.dev",
                    "https://dashboard.quelora.dev",
                    "http://demo.quelora.dev",
                    "https://demo.quelora.dev",
                    "http://api.quelora.dev",
                    "https://api.quelora.dev",
                    "http://api-dashboard.quelora.dev",
                    "https://api-dashboard.quelora.dev",
                    "http://mail.quelora.dev",
                    "https://mail.quelora.dev",
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
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    });

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

/**
 * Retrieves a paginated list of active, non-live posts.
 */
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

/**
 * Retrieves up to 2 currently live posts.
 */
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

/**
 * Retrieves a random selection of active posts.
 */
app.get("/api/posts/random", async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 5, 10);
        
        const randomPosts = await Post.aggregate([
            {
                $match: {
                    "deletion.status": "active",
                    cid: CID
                }
            },
            { $sample: { size: limit } },
            { $project: { likes: 0 } }
        ]);

        res.json(randomPosts);
    } catch (error) {
        console.error("Error fetching random posts:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/**
 * Retrieves a single active post by its entity ID or Object ID.
 */
app.get("/api/posts/:id", async (req, res) => {
    try {
        const id = req.params.id;
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID format provided." });
        }

        const post = await Post.findOne({
            $or: [{ entity: id }, { _id: id }],
            "deletion.status": "active",
            cid: CID
        }).select('-likes').lean();

        if (!post) {
            return res.status(404).json({ error: "Post not found." });
        }

        res.json(post);
    } catch (error) {
        console.error("Error fetching post by ID:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Demo API running at http://localhost:${PORT}`);
});