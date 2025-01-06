import { useEffect, useState } from "react";
import "./App.css";

interface emojiObj {
	unicode: string;
}

async function getEmojiArr(emojiCount: number) {
	const response = await fetch(
		"https://emojihub.yurace.pro/api/all/category/food-and-drink",
		{
			method: "GET",
		}
	);
	const emojiArr: emojiObj[] = await response.json();
	emojiCount = Math.min(emojiArr.length, emojiCount);

	const randomEmojiSet: Set<number> = new Set();
	while (randomEmojiSet.size < emojiCount) {
		const emojiUnicodeString =
			emojiArr[Math.floor(Math.random() * emojiArr.length)].unicode[0];
		const emojiUnicodeNumber = parseInt("0x" + emojiUnicodeString.slice(2));
		randomEmojiSet.add(emojiUnicodeNumber);
	}

	return randomEmojiSet;
}

// event listener on emoji click
// check if emoji is in clicked emojis
// true = game lost
// false = add to clicked emojis and increment score

function Header({ score, highScore }: { score: number; highScore: number }) {
	return (
		<>
			<h3>Current Score: {score}</h3>
			<h3>High Score: {highScore}</h3>
		</>
	);
}

function Game({
	highScore,
	emojiSet,
	gameOverFunction,
}: {
	highScore: number;
	emojiSet: Set<number>;
	gameOverFunction({
		score,
		gameKey,
	}: {
		score: number;
		gameKey: `${string}-${string}-${string}-${string}-${string}`;
	}): void;
}) {
	const [score, setScore] = useState(0);

	function userLost() {
		gameOverFunction({ score: score, gameKey: crypto.randomUUID() });
	}

	function incrementScore() {
		setScore(score + 1);
	}

	return (
		<>
			<Header highScore={highScore} score={score}></Header>

			<MemoryCard
				emojiSet={emojiSet}
				userLostFunction={userLost}
				scoreIncrementFunction={incrementScore}
			></MemoryCard>
		</>
	);
}

function MemoryCard({
	emojiSet,
	userLostFunction,
	scoreIncrementFunction,
}: {
	emojiSet: Set<number>;
	userLostFunction: () => void;
	scoreIncrementFunction: () => void;
}) {
	const [visibleEmoji, setVisibleEmoji] = useState(10003);
	const [clickedEmojis, setClickedEmojis] = useState<Set<number>>(new Set());
	const [isCorrect, setIsCorrect] = useState<string | null>(null);

	useEffect(() => {
		// getEmojiArr(emojiTotalCount).then((emojiData) => {
		// 	setEmojiSet(emojiData);
		if (emojiSet.size > 0) {
			const emojiArr = Array.from(emojiSet);
			setVisibleEmoji(emojiArr[Math.floor(Math.random() * emojiArr.length)]);
		}
		// });
	}, [emojiSet]);

	function handleEmojiClick(userSeenChoice: boolean) {
		const userMadeCorrectChoice =
			userSeenChoice !== clickedEmojis.has(visibleEmoji);
		setIsCorrect(userMadeCorrectChoice ? "correct" : null);
		if (!userMadeCorrectChoice) {
			userLostFunction();
			return;
		}

		scoreIncrementFunction();

		const newClickedEmojis = new Set(clickedEmojis);
		newClickedEmojis.add(visibleEmoji);
		setClickedEmojis(newClickedEmojis);
		const emojiArr = Array.from(emojiSet);
		setVisibleEmoji(emojiArr[Math.floor(Math.random() * emojiArr.length)]);
		// add emoji to clicked emojis list and remove from emojiarr
	}

	return (
		<>
			<div className={"emoji-card " + (isCorrect ? isCorrect : "")}>
				<div className="emoji">{String.fromCodePoint(visibleEmoji)}</div>
			</div>

			<div>
				<button onClick={() => handleEmojiClick(true)}>New ✅</button>{" "}
				<button onClick={() => handleEmojiClick(false)}>Old ❌</button>
			</div>
		</>
	);
}

function App() {
	const [emojiSet, setEmojiSet] = useState<Set<number>>(new Set());
	const [highScore, setHighScore] = useState(0);
	const emojiTotalCount = 10;
	const [gameKey, setGameKey] = useState(crypto.randomUUID());

	function gameOver({
		score,
		gameKey,
	}: {
		score: number;
		gameKey: `${string}-${string}-${string}-${string}-${string}`;
	}) {
		// set high score and change game key
		alert("you lost");
		setGameKey(gameKey);
		setHighScore(score);
	}

	useEffect(() => {
		getEmojiArr(emojiTotalCount).then((emojiData) => {
			setEmojiSet(emojiData);
		});
	}, [emojiTotalCount]);

	return (
		<Game
			key={gameKey}
			highScore={highScore}
			emojiSet={emojiSet}
			gameOverFunction={gameOver}
		></Game>
	);
}

export default App;
