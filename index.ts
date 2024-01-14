import dotenv from 'dotenv';
import { Game } from "@gathertown/gather-game-client";
global.WebSocket = require("isomorphic-ws");
dotenv.config();

const args = process.argv.slice(2);

if (args.length < 2) {
	console.log("引数が足りません。位置を交換したいユーザー名を2つ指定してください。");
	process.exit(1);
}

// gather game client setup
const game = new Game(process.env.SPACE_ID as string, () => Promise.resolve({ apiKey: process.env.API_KEY as string }));
game.connect();
game.subscribeToConnection((connected) => console.log("connected?", connected));



setTimeout(()=> {
	console.log('2秒経過')
	// ユーザー名からplayerIdを取得
	const findPlayer1 = Object.entries(game.players).find(([k,v]) => v.name === args[0])
	const findPlayer2 = Object.entries(game.players).find(([k,v]) => v.name === args[1])
	const player1Id = findPlayer1 ? findPlayer1[0] : null;
	const player2Id = findPlayer2 ? findPlayer2[0] : null;
	if (!player1Id || !player2Id) {
		!player1Id && console.log(`${args[0]}のメンバー情報が見つかりませんでした`);
		!player2Id && console.log(`${args[1]}のメンバー情報が見つかりませんでした`);
		process.exit(1);
	}

	game.subscribeToEvent('playerSetsEmoteV2', (data) => {
		const player1 = game.players[player1Id]
		const player2 = game.players[player2Id]
		
		if (data.playerSetsEmoteV2.emote === '👏') {
			console.log('teleport実行')
			game.teleport(player2.map as string, player2.x, player2.y, player1Id);
			game.teleport(player1.map as string, player1.x, player1.y, player2Id);
		}
	});	
}, 2000)