window.QUELORA_CONFIG = {
    "cid": "QU-ME7MZ3WI-3CUPR",
    "apiUrl": "https://api.quelora.local",
    "assetBaseUrl": "https://api.quelora.local",
    "login": {
        "baseUrl": "https://api.quelora.local/sso/verify",
        "providers": [
            "Quelora"
        ],
    },
    "entityConfig": {
        "selector": '.news-card', 
        "entityIdAttribute": 'data-entity',
        "interactionPlacement": {
            "position": 'after', 
            "relativeTo": '.news-meta'
        }
    },
    "authWidget": {
        "enabled":  true,
        "position": 'inside',
        "selector": '#my-nav-actions',
    },
    "audio": {
        "enable_mic_transcription": true,
        "save_comment_audio": true,
        "max_recording_seconds": 60,
        "bitrate": 16000
    },
    "geolocation": {
        "enabled": true,
        "provider": "ipapi"
    }
};
