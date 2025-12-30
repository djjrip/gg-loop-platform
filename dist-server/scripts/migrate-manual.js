import Database from 'better-sqlite3';
console.log("Running Manual Migration for x_post_logs...");
const db = new Database('local.db');
const query = `
CREATE TABLE IF NOT EXISTS x_post_logs (
    id varchar PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    content text NOT NULL,
    tweet_id varchar,
    status varchar NOT NULL,
    month varchar NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_x_post_logs_month ON x_post_logs (month);
`;
try {
    db.exec(query);
    console.log("Migration Successful.");
}
catch (err) {
    console.error("Migration Failed:", err);
}
