# WhatsApp Web Sender 🚀

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Web%20API-green?style=for-the-badge&logo=whatsapp)](https://whatsapp.com/)

A powerful bulk messaging platform built with Next.js that integrates directly with WhatsApp Web to enable efficient communication at scale.

## 📖 The Story Behind This Project

I created WhatsApp Web Sender to solve a very specific problem: **how to communicate important information to large groups of people quickly and reliably** using the platform they already use every day.

### The Inspiration
Last year, I was helping a local non-profit organization coordinate volunteers for community events. They needed to send reminders, updates, and emergency information to hundreds of volunteers quickly. While WhatsApp groups were helpful, they had limitations:

- Manual sending to each contact was time-consuming
- No way to track delivery status at scale
- Difficult to personalize messages for different groups
- No centralized dashboard to manage communications

Existing solutions were either too expensive for a small non-profit or too complicated for their volunteers to use. That's when I decided to build a self-hosted, user-friendly alternative.

### How It Works
WhatsApp Web Sender connects to the official WhatsApp Web API through a secure browser instance, allowing you to:
- Send personalized messages to hundreds of contacts
- Track delivery status in real-time
- Schedule messages for optimal delivery times
- Manage multiple WhatsApp accounts simultaneously
- Maintain complete control over your data

## 🏗️ Architecture

```
whatsapp-web-sender/
├── frontend/                 # Next.js application
│   ├── app/                 # App router pages
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility libraries
│   ├── server/              # Backend API routes
│   └── public/              # Static assets
├── server/                  # Express.js server
│   └── main.js             # Server entry point
├── package.json            # Root dependencies
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- A WhatsApp account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yadavamarjeet/whatsapp-web-sender.git
   cd whatsapp-web-sender
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   This starts both the Next.js frontend and Express backend concurrently.

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Features

- **Multi-Device Support**: Connect multiple WhatsApp accounts simultaneously
- **Bulk Messaging**: Send personalized messages to hundreds of contacts
- **Real-time Analytics**: Track message delivery status in real-time
- **Contact Management**: Import and organize contacts from CSV files
- **Template System**: Save and reuse message templates
- **Session Persistence**: Maintain WhatsApp sessions across restarts
- **Responsive Design**: Works perfectly on desktop and mobile devices

## 🔧 Technical Implementation

### Concurrent Frontend + Backend
I've implemented a unique architecture where both the Next.js frontend and Express backend run concurrently from a single codebase:

```javascript
// package.json
"scripts": {
  "dev": "concurrently \"next dev\" \"node server/main.js\"",
  "build": "next build",
  "start": "concurrently \"next start\" \"node server/main.js\""
}
```

### How The Integration Works
1. **Frontend** (Next.js): Provides the user interface and API routes for application logic
2. **Backend** (Express): Handles WhatsApp Web integration through Puppeteer
3. **Real-time Communication**: Socket.io enables live updates between frontend and backend
4. **Session Management**: WhatsApp authentication sessions are persisted securely

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Backend**: Express.js with Socket.io
- **WhatsApp Integration**: whatsapp-web.js
- **Authentication**: NextAuth.js
- **Database**: SQLite with better-sqlite3
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (Frontend) + Railway (Backend)

## 📦 Deployment

### Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyadavamarjeet%2Fwhatsapp-web-sender)

### Manual Deployment
1. Build the application: `npm run build`
2. Start production server: `npm start`
3. Set up reverse proxy (nginx recommended) for port 3000

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Important Notes

- This project is not affiliated with WhatsApp Inc. or Meta Platforms Inc.
- Please use responsibly and in compliance with WhatsApp's Terms of Service
- Bulk messaging should only be used with recipient consent

## 🆘 Support

If you have any questions or need help setting up the project, please:
1. Check the [Wiki](https://github.com/yadavamarjeet/whatsapp-web-sender/wiki) for detailed guides
2. Open an [Issue](https://github.com/yadavamarjeet/whatsapp-web-sender/issues) on GitHub
3. Reach out to me directly via email

---

**⭐ Star this repo if you found it helpful!**

Built with ❤️ by [Amarjeet Yadav](https://github.com/yadavamarjeet)
