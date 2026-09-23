import { useEffect, useState } from "react";
import "./BibleReader.css";

export default function BibleReader() {
    const [books, setBooks] = useState([]);
    const [chapters, setChapters] = useState([]);
    const [verses, setVerses] = useState([]);

    const [selectedBook, setSelectedBook] = useState("");
    const [selectedChapter, setSelectedChapter] = useState("");
    const [selectedVerse, setSelectedVerse] = useState("");

    const [loadingBooks, setLoadingBooks] = useState(false);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const [loadingVerses, setLoadingVerses] = useState(false);
    const [error, setError] = useState("");

    // Load all books when the page opens
    useEffect(() => {
        async function loadBooks() {
            try {
                setLoadingBooks(true);
                setError("");

                const response = await fetch("http://localhost:5000/api/books");

                if (!response.ok) {
                    throw new Error("Unable to load books");
                }

                const data = await response.json();
                setBooks(data);
            } catch (error) {
                console.error(error);
                setError("Unable to load books");
            } finally {
                setLoadingBooks(false);
            }
        }

        loadBooks();
    }, []);

    // Load chapters after selecting a book
    async function handleBookChange(event) {
        const book = event.target.value;

        setSelectedBook(book);
        setSelectedChapter("");
        setSelectedVerse("");
        setChapters([]);
        setVerses([]);
        setError("");

        if (!book) return;

        try {
            setLoadingChapters(true);

            const response = await fetch(
                `http://localhost:5000/api/books/${encodeURIComponent(book)}/chapters`
            );

            if (!response.ok) {
                throw new Error("Unable to load chapters");
            }

            const data = await response.json();
            setChapters(data);
        } catch (error) {
            console.error(error);
            setError("Unable to load chapters");
        } finally {
            setLoadingChapters(false);
        }
    }

    // Load the complete chapter after selecting a chapter
    async function handleChapterChange(event) {
        const chapter = event.target.value;

        setSelectedChapter(chapter);
        setSelectedVerse("");
        setVerses([]);
        setError("");

        if (!chapter) return;

        try {
            setLoadingVerses(true);

            const response = await fetch(
                `http://localhost:5000/api/books/${encodeURIComponent(
                    selectedBook
                )}/chapters/${chapter}`
            );

            if (!response.ok) {
                throw new Error("Unable to load chapter");
            }

            const data = await response.json();
            setVerses(data.verses);
        } catch (error) {
            console.error(error);
            setError("Unable to load chapter");
        } finally {
            setLoadingVerses(false);
        }
    }

    // Scroll to the selected verse
    useEffect(() => {
        if (!selectedVerse) return;

        const verseElement = document.getElementById(
            `verse-${selectedVerse}`
        );

        verseElement?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }, [selectedVerse]);

    return (
        <main className="bible-reader">
        <h1>Bible Reader</h1>

        <div className="selectors">
        <label>
        Book

        <select
        value={selectedBook}
        onChange={handleBookChange}
        disabled={loadingBooks}
        >
        <option value="">
        {loadingBooks ? "Loading books..." : "Select a book"}
        </option>

        {books.map((item) => (
            <option key={item.book} value={item.book}>
            {item.book}
            </option>
        ))}
        </select>
        </label>

        <label>
        Chapter

        <select
        value={selectedChapter}
        onChange={handleChapterChange}
        disabled={!selectedBook || loadingChapters}
        >
        <option value="">
        {loadingChapters ? "Loading chapters..." : "Select a chapter"}
        </option>

        {chapters.map((chapter) => (
            <option key={chapter} value={chapter}>
            {chapter}
            </option>
        ))}
        </select>
        </label>

        <label>
        Verse

        <select
        value={selectedVerse}
        onChange={(event) => setSelectedVerse(event.target.value)}
        disabled={!selectedChapter || loadingVerses}
        >
        <option value="">{loadingVerses ? "Loading..." : "Select a verse"}</option>

        {verses.map((item) => (
            <option key={item.verse} value={item.verse}>
            {item.verse}
            </option>
        ))}
        </select>
        </label>
        </div>

        {error && <p className="error">{error}</p>}

        {loadingVerses && <p>Loading chapter...</p>}

        {verses.length > 0 && (
            <article className="chapter">
            <h2>
            {selectedBook} {selectedChapter}
            </h2>

            <div className="chapter-text">
            {verses.map((item) => {
                const isSelected =
                String(item.verse) === String(selectedVerse);

                return (
                    <p
                    key={item.verse}
                    id={`verse-${item.verse}`}
                    className={isSelected ? "verse selected" : "verse"}
                    >
                    <sup>{item.verse}</sup> {item.text}
                    </p>
                );
            })}
            </div>
            </article>
        )}
        </main>
    );
}
