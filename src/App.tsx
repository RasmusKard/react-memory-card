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
	{ name: "Bronze", img: bronzeIcon, requiredScore: 0 },
	{ name: "Silver", img: silverIcon, requiredScore: 10 },
	{ name: "Gold", img: goldIcon, requiredScore: 30 },
	{ name: "Platinum", img: platinumIcon, requiredScore: 60 },
	{ name: "Diamond", img: diamondIcon, requiredScore: 100 },
	{ name: "Master", img: masterIcon, requiredScore: 160 },
	{ name: "Challenger", img: challengerIcon, requiredScore: 230 },
];

const GROUPS = [
	"creature-face",
	"monkey-face",
	"drink",
	"food-asian",
	"food-fruit",
	"food-prepared",
	"food-sweet",
	"food-vegetable",
	"animal-amphibian",
	"animal-bird",
	"animal-bug",
	"animal-mammal",
	"animal-marine",
	"animal-reptile",
	"plant-flower",
	"plant-other",
	"travel-and-places",
];

interface emojiObj {
	unicode: string;
}

async function getEmojiArr(emojiCount: number) {
	const emojiArr: emojiObj[] = [];
	for (const group of GROUPS) {
		const response = await fetch(
			`https://emojihub.yurace.pro/api/all/group/${group}`,
			{
				method: "GET",
			}
		);
		const responseArr = await response.json();
		emojiArr.push(...responseArr);
		emojiCount = Math.min(emojiArr.length, emojiCount);
	}

	const randomEmojiSet: Set<number> = new Set();
	while (randomEmojiSet.size < emojiCount) {
		const emojiUnicodeString =
			emojiArr[Math.floor(Math.random() * emojiArr.length)].unicode[0];
		const emojiUnicodeNumber = parseInt("0x" + emojiUnicodeString.slice(2));
		randomEmojiSet.add(emojiUnicodeNumber);
	}

	return randomEmojiSet;
}

function App() {
	const [gameKey, setGameKey] = useState(crypto.randomUUID());

	const rankTierLocalStorage = localStorage.getItem("rankTier");
	const [rankTier, setRankTier] = useState(
		rankTierLocalStorage ? JSON.parse(rankTierLocalStorage) : 0
	);

	function gameOver({
		gameKey,
	}: {
		gameKey: `${string}-${string}-${string}-${string}-${string}`;
	}) {
		// set high score and change game key
		alert("You lost");
		setGameKey(gameKey);
	}

	function rankUp() {
		const newRank = rankTier + 1;
		localStorage.setItem("rankTier", JSON.stringify(newRank));
		setRankTier(newRank);

		const newRankName = RANKSARRAY[newRank].name;

		alert(`Congratulations, you ranked up to ${newRankName}!`);
	}

	return (
		<>
			<h1 id="app-title">
				How high can you climb in the ranked ladder of memory?
			</h1>

			<hr></hr>

			<Game
				key={gameKey}
				gameOverFunction={gameOver}
				currentRankTier={rankTier}
				rankUpFunction={rankUp}
			></Game>
		</>
	);
}

function Game({
	gameOverFunction,
	currentRankTier,
	rankUpFunction,
}: {
	gameOverFunction({
		score,
		gameKey,
	}: {
		score: number;
		gameKey: `${string}-${string}-${string}-${string}-${string}`;
	}): void;
	currentRankTier: number;
	rankUpFunction: () => void;
}) {
	const [emojiSet, setEmojiSet] = useState<Set<number>>(new Set());
	const currentRankScore = RANKSARRAY[currentRankTier].requiredScore;
	const [score, setScore] = useState(currentRankScore);

	const nextRankScore = RANKSARRAY[currentRankTier + 1].requiredScore;

	const emojiTotalCount = Math.floor((nextRankScore - currentRankScore) * 0.75);

	useEffect(() => {
		getEmojiArr(emojiTotalCount).then((emojiData) => {
			setEmojiSet(emojiData);
		});
	}, [emojiTotalCount]);

	function userLost() {
		gameOverFunction({ score: score, gameKey: crypto.randomUUID() });
	}

	function incrementScore() {
		const newScore = score + 1;
		if (newScore >= nextRankScore) {
			rankUpFunction();
		}
		setScore(newScore);
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

function Header({
	score,
	currentRankTier,
}: {
	score: number;
	currentRankTier: number;
}) {
	const goalScore = RANKSARRAY[currentRankTier + 1].requiredScore;
	const currentRankScore = RANKSARRAY[currentRankTier].requiredScore;

	const currentRankIcon = RANKSARRAY[currentRankTier].img;
	const nextRankIcon = RANKSARRAY[currentRankTier + 1].img;
	return (
		<>
			<div id="rank-container">
				<img id="rank-icon" src={currentRankIcon}></img>
				{score} LP
				<progress value={score} max={goalScore}></progress>
				{goalScore} LP
				<img id="rank-icon" src={nextRankIcon}></img>
			</div>
			<p>Current score: {score - currentRankScore}</p>
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
	const [visibleEmoji, setVisibleEmoji] = useState(128260);
	const [clickedEmojis, setClickedEmojis] = useState<Set<number>>(new Set());

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
				<div className="emoji">{String.fromCodePoint(visibleEmoji)}</div>
			</div>

			<div>
				<button onClick={() => handleEmojiClick(true)}>New ✅</button>{" "}
				<button onClick={() => handleEmojiClick(false)}>Old ❌</button>
			</div>
		</>
	);
}

export default App;
