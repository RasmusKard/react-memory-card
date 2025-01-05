import { useEffect, useState } from "react";
import "./App.css";

async function getEmojiArr(emojiCount: number) {
	const response = await fetch("https://emojihub.yurace.pro/api/all", {
		method: "GET",
	});
	const emojiArr = await response.json();

	const randomEmojiArr = [];

	for (let i = 0; i < emojiCount; i++) {
		randomEmojiArr.push(
			emojiArr[Math.floor(Math.random() * emojiArr.length)].unicode[0]
		);
	}

	return randomEmojiArr;
}

function App() {
	const [emojiArr, setEmojiArr] = useState<string[] | []>([]);

	useEffect(() => {
		getEmojiArr(20).then((emojiData) => setEmojiArr(emojiData));
	}, []);

	return (
		<>
			{emojiArr.map((emoji) => {
				const emojiUnicode = emoji;
				const emojiUnicodeNumber = parseInt("0x" + emojiUnicode.slice(2));
				return (
					<Card
						key={emojiUnicodeNumber}
						emojiUnicodeNumber={emojiUnicodeNumber}
					></Card>
				);
			})}
		</>
	);
}

function Card({ emojiUnicodeNumber }: { emojiUnicodeNumber: number }) {
	return (
		<>
			<div className="emoji-card">
				<div className="emoji">{String.fromCodePoint(emojiUnicodeNumber)}</div>
			</div>
		</>
	);
}

export default App;
