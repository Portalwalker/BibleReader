import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";



dotenv.config();

const { Pool } = pg;

const app = express();
const port = process.env.PORT || 5000;

app.use(
    cors({
        origin: [
            "http://localhost:3000",
            "http://localhost:5173"
        ]
    })
);

app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Test database connection
app.get("/api/health", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");

        res.json({
            status: "ok",
            databaseTime: result.rows[0].now
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Database connection failed"
        });
    }
});

// Get books
app.get("/api/books", async (req, res) => {
    try {
        const result = await pool.query(`
        WITH UniqueList AS (
            SELECT DISTINCT book
            FROM Scripture
        )
        SELECT book 
        FROM UniqueList
        ORDER BY 
        CASE book
            -- Old Testament
            WHEN 'Genesis'          THEN 1
            WHEN 'Exodus'           THEN 2
            WHEN 'Leviticus'        THEN 3
            WHEN 'Numbers'          THEN 4
            WHEN 'Deuteronomy'      THEN 5
            WHEN 'Joshua'           THEN 6
            WHEN 'Judges'           THEN 7
            WHEN 'Ruth'             THEN 8
            WHEN '1 Samuel'         THEN 9
            WHEN '2 Samuel'         THEN 10
            WHEN '1 Kings'          THEN 11
            WHEN '2 Kings'          THEN 12
            WHEN '1 Chronicles'     THEN 13
            WHEN '2 Chronicles'     THEN 14
            WHEN 'Ezra'             THEN 15
            WHEN 'Nehemiah'         THEN 16
            WHEN 'Esther'           THEN 17
            WHEN 'Job'              THEN 18
            WHEN 'Psalms'           THEN 19
            WHEN 'Proverbs'         THEN 20
            WHEN 'Ecclesiastes'     THEN 21
            WHEN 'Song of Solomon'  THEN 22
            WHEN 'Isaiah'           THEN 23
            WHEN 'Jeremiah'         THEN 24
            WHEN 'Lamentations'     THEN 25
            WHEN 'Ezekiel'          THEN 26
            WHEN 'Daniel'           THEN 27
            WHEN 'Hosea'            THEN 28
            WHEN 'Joel'             THEN 29
            WHEN 'Amos'             THEN 30
            WHEN 'Obadiah'          THEN 31
            WHEN 'Jonah'            THEN 32
            WHEN 'Micah'            THEN 33
            WHEN 'Nahum'            THEN 34
            WHEN 'Habakkuk'         THEN 35
            WHEN 'Zephaniah'        THEN 36
            WHEN 'Haggai'           THEN 37
            WHEN 'Zechariah'        THEN 38
            WHEN 'Malachi'          THEN 39
            
            -- New Testament
            WHEN 'Matthew'          THEN 40
            WHEN 'Mark'             THEN 41
            WHEN 'Luke'             THEN 42
            WHEN 'John'             THEN 43
            WHEN 'Acts'             THEN 44
            WHEN 'Romans'           THEN 45
            WHEN '1 Corinthians'    THEN 46
            WHEN '2 Corinthians'    THEN 47
            WHEN 'Galatians'        THEN 48
            WHEN 'Ephesians'        THEN 49
            WHEN 'Philippians'      THEN 50
            WHEN 'Colossians'       THEN 51
            WHEN '1 Thessalonians'  THEN 52
            WHEN '2 Thessalonians'  THEN 53
            WHEN '1 Timothy'        THEN 54
            WHEN '2 Timothy'        THEN 55
            WHEN 'Titus'            THEN 56
            WHEN 'Philemon'         THEN 57
            WHEN 'Hebrews'          THEN 58
            WHEN 'James'            THEN 59
            WHEN '1 Peter'          THEN 60
            WHEN '2 Peter'          THEN 61
            WHEN '1 John'           THEN 62
            WHEN '2 John'           THEN 63
            WHEN '3 John'           THEN 64
            WHEN 'Jude'             THEN 65
            WHEN 'Revelation'       THEN 66
            
            ELSE 999 
        END;
        `);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Could not load books"
        });
    }
});

// Get chapters for a book
app.get("/api/books/:book/chapters", async (req, res) => {
    const { book } = req.params;

    try {
        const result = await pool.query(
            `
            SELECT DISTINCT chapter
            FROM Scripture
            WHERE book = $1
            ORDER BY chapter
            `,
            [book]
        );

        res.json(result.rows.map((row) => row.chapter));
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Could not load chapters"
        });
    }
});

// Get a complete chapter
app.get("/api/books/:book/chapters/:chapter", async (req, res) => {
    const { book } = req.params;
    const chapter = Number(req.params.chapter);

    if (!Number.isInteger(chapter) || chapter < 1) {
        return res.status(400).json({
            error: "Invalid chapter"
        });
    }

    try {
        const result = await pool.query(
            `
            SELECT verse, text
            FROM Scripture
            WHERE book = $1
            AND chapter = $2
            ORDER BY verse
            `,
            [book, chapter]
        );

        res.json({
            book,
            chapter,
            verses: result.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: "Could not load chapter"
        });
    }
});

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});
