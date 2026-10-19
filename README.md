# 🌍 Countrydex

A Discord bot that turns geography into an addictive collection game. Hunt flags, guess countries, and compete with players worldwide.

## 🎯 Overview

Countrydex spawns flags from around the world in your Discord server. Race to identify them, build your collection, and climb the global leaderboard.

## ✨ Features

- 🏳️ **Auto-spawning flags** - New flags appear every hour at :30
- 🎮 **Interactive guessing** - Pop-up interface for country identification
- 🏆 **Global leaderboard** - Compete on completion rate, collection size, and speed
- 📊 **Personal stats** - Track your progress with `/dex`
- 💾 **Reliable data** - Database backed up daily
- 🌍 **Multi-language** - Guess the flags in english or french

## 🛠️ Commands

| Command | Description |
|---------|-------------|
| `/help` | Display all available commands |
| `/language` | Change your prefered language (english by default) |
| `/dex` | View your complete flag collection and stats |
| `/lb` | Check the global leaderboard |
| `/clear [1-99]` | Clear messages (requires `MANAGE_MESSAGES`) |
| `/ping` | Display latency and uptime |
| `/reset` | Reset your progression (⚠️ irreversible for now) |

## 🚀 Tech Stack

- **Runtime**: Node.js

- **Framework**: discord.js

- **Database**: PostgreSQL

- **Dependencies**: 
  - node-vibrant (color extraction)
  - moment (time handling)
  - axios (HTTP requests)
  - deepl-node (translations)

you can find more details into [packages file](package.json)

- **Hosting**: Raspberry Pi 5 (8GB)

## 🎮 How to Play

1. Add Countrydex to your Discord server
2. Change your language if needed (english by default)
3. Flags will spawn automatically in designated channels
4. Click the pop-up and guess the country (name or code)
5. Build your collection and compete globally

## 📦 Installation

Invite the bot in your server from this [Invitation Link](https://discord.com/oauth2/authorize?client_id=1342612831647957063&permissions=125968&integration_type=0&scope=bot+applications.commands)

## 🔧 Configuration

Countrydex only requires a text channel having `spawning` in its name, and the permissions asked in the invitation.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome ! Feel free to open issues or submit pull requests.

## 📞 Support

Join our [Discord Server](https://discord.gg/ZSt2vPydbN) for support, updates and Beta Testing Programm.

---

**Sharpen your knowledge, and start your hunting journey.**
