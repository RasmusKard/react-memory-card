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

function App() {
	const [emojiSet, setEmojiSet] = useState<Set<number>>(new Set());
	const [visibleEmoji, setVisibleEmoji] = useState(10003);
	const [clickedEmojis, setClickedEmojis] = useState<Set<number>>(new Set());
	const [score, setScore] = useState(0);
	const [highScore, setHighScore] = useState(0);
	const [isCorrect, setIsCorrect] = useState<string | null>(null);

	const emojiTotalCount = 10;

	useEffect(() => {
		getEmojiArr(emojiTotalCount).then((emojiData) => {
			setEmojiSet(emojiData);
			const emojiArr = Array.from(emojiData);
			setVisibleEmoji(emojiArr[Math.floor(Math.random() * emojiArr.length)]);
		});
	}, [emojiTotalCount]);

	function handleEmojiClick(userSeenChoice: boolean) {
		const userHasSeen = clickedEmojis.has(visibleEmoji);

		const userMadeCorrectChoice = userSeenChoice !== userHasSeen;
		setIsCorrect(userMadeCorrectChoice ? "correct" : "incorrect");

		if (!userMadeCorrectChoice) {
			// user choice wrong, lose
			setHighScore(Math.max(highScore, score));
			setClickedEmojis(new Set());
			return;
		}

		setScore(score + 1);
		const newClickedEmojis = new Set(clickedEmojis);
		newClickedEmojis.add(visibleEmoji);
		setClickedEmojis(newClickedEmojis);

		const emojiArr = Array.from(emojiSet);
		setVisibleEmoji(emojiArr[Math.floor(Math.random() * emojiArr.length)]);
		// add emoji to clicked emojis list and remove from emojiarr
	}

	return (
		<>
			<h3>Current Score: {score}</h3>
			<h3>High Score: {highScore}</h3>
			{/* <p>
				Clicked Emojis:{" "}
				{Array.from(clickedEmojis).map((emojiNumber) => {
					return String.fromCodePoint(emojiNumber);
				})}
			</p> */}

			<div className={"emoji-card " + (isCorrect ? isCorrect : "")}>
				<div className="emoji">{String.fromCodePoint(visibleEmoji)}</div>
			</div>

			<div>
				<button onClick={() => handleEmojiClick(true)}>New ✅</button>{" "}
				<button onClick={() => handleEmojiClick(false)}>Old ❌</button>
			</div>

			{/* <Card
				key={emojiNumber}
				emojiUnicodeNumber={emojiNumber}
				handleEmojiClick={() => handleEmojiClick(emojiNumber)}
			></Card> */}
		</>
	);
}

// function Card({
// 	emojiUnicodeNumber,
// 	handleEmojiClick,
// }: {
// 	emojiUnicodeNumber: number;
// 	handleEmojiClick: () => void;
// }) {
// 	return (
// 		<>
// 			<div onClick={handleEmojiClick} className="emoji-card">
// 				<div className="emoji">{String.fromCodePoint(emojiUnicodeNumber)}</div>
// 			</div>
// 		</>
// 	);
// }

export default App;
