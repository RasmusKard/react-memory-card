import { useEffect, useState } from "react";
import "./App.css";
import bronzeIcon from "./assets/bronze.png";
import silverIcon from "./assets/silver.png";
import goldIcon from "./assets/gold.png";
import platinumIcon from "./assets/platinum.png";
import diamondIcon from "./assets/diamond.png";
import masterIcon from "./assets/master.png";
import challengerIcon from "./assets/challenger.png";

const RANKSARRAY = [
	{ name: "bronze", img: bronzeIcon, requiredScore: 0 },
	{ name: "silver", img: silverIcon, requiredScore: 5 },
	{ name: "gold", img: goldIcon, requiredScore: 10 },
	{ name: "platinum", img: platinumIcon, requiredScore: 25 },
	{ name: "diamond", img: diamondIcon, requiredScore: 35 },
	{ name: "master", img: masterIcon, requiredScore: 45 },
	{ name: "challenger", img: challengerIcon, requiredScore: 60 },
];

interface emojiObj {
	unicode: string;
}

async function getEmojiArr(emojiCount: number) {
	const response = await fetch("https://emojihub.yurace.pro/api/all", {
		method: "GET",
	});
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

function Header({
	score,
	currentRankTier,
}: {
	score: number;
	currentRankTier: number;
}) {
	const goalScore = RANKSARRAY[currentRankTier + 1].requiredScore;
	return (
		<>
			<div id="rank-container">
				<img id="rank-icon" src={bronzeIcon}></img>
				{score} LP
				<progress value={score} max={goalScore}></progress>
				{goalScore} LP
				<img id="rank-icon" src={silverIcon}></img>
			</div>
		</>
	);
}

function Game({
	emojiSet,
	gameOverFunction,
	currentRankTier,
}: {
	emojiSet: Set<number>;
	gameOverFunction({
		score,
		gameKey,
	}: {
		score: number;
		gameKey: `${string}-${string}-${string}-${string}-${string}`;
	}): void;
	currentRankTier: number;
}) {
	const [score, setScore] = useState(RANKSARRAY[currentRankTier].requiredScore);

	function userLost() {
		gameOverFunction({ score: score, gameKey: crypto.randomUUID() });
	}

	function incrementScore() {
		setScore(score + 1);
	}

	return (
		<>
			<Header score={score} currentRankTier={currentRankTier}></Header>

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
			<div className="emoji-card">
				<div className={"emoji " + (isCorrect ? isCorrect : "")}>
					{String.fromCodePoint(visibleEmoji)}
				</div>
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
	const [rankTier, setRankTier] = useState(0);
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
	}

	useEffect(() => {
		getEmojiArr(emojiTotalCount).then((emojiData) => {
			setEmojiSet(emojiData);
		});
	}, [emojiTotalCount]);

	return (
		<>
			<h1 id="app-title">
				How high can you climb in the ranked ladder of memory?
			</h1>

			<hr></hr>

			<Game
				key={gameKey}
				emojiSet={emojiSet}
				gameOverFunction={gameOver}
				currentRankTier={rankTier}
			></Game>
		</>
	);
}

export default App;
