# YouTube Transcript Assistant

A powerful Next.js application that helps you fetch, enhance, and manage YouTube video transcripts with advanced language support and term highlighting capabilities.

![YouTube Transcript Assistant](https://raw.githubusercontent.com/yourusername/vibe-test/main/public/screenshot.png)

## Features

- 🎥 **YouTube Integration**: Easily fetch transcripts from any YouTube video
- 🌐 **Multi-language Support**: Access transcripts in multiple languages when available
- ✨ **Transcript Enhancement**: Improve transcript readability and formatting
- 📝 **Term Management**: Save and highlight important terms across transcripts
- 🔍 **Smart Search**: Search through your saved transcripts and terms
- 🗄️ **MongoDB Storage**: Persistent storage of transcripts and terms using MongoDB

## Getting Started

First, make sure you have:

- Node.js installed
- MongoDB instance running
- Environment variables configured (see `.env.example`)

Then install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## How to Use

1. **Fetch a Transcript**: Paste a YouTube URL and select your preferred language
2. **Enhance the Content**: Click the "Enhance" button to improve the transcript's formatting
3. **Save Important Terms**: Select any text to save terms for future reference
4. **Manage Transcripts**: Access your saved transcripts from the sidebar
5. **Search and Filter**: Easily find specific terms or transcripts

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Radix UI](https://www.radix-ui.com/) - Headless UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - learn about Tailwind CSS
- [shadcn/ui Documentation](https://ui.shadcn.com/) - learn about shadcn/ui components

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
