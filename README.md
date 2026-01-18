# FounderMatch 🚀
**Find your perfect co-founder in minutes.**
FounderMatch is a "Tinder for Founders" application designed to solve the hardest part of building a startup: finding the right partner. We use AI to analyze compatibility, ensuring you match with someone who shares your vision, commitment, and drive.

## 💡 Inspiration
Finding a co-founder is like dating, but with higher stakes. Most startups fail due to founder conflict, not product failure. We built FounderMatch to create a dedicated space where founders can connect openly, skipping the awkward networking events and cold DMs.
## ✨ Features
*   **🔥 Swipe Interface:** A distraction-free, tactile card stack to browse potential co-founders.
*   **🤖 AI Compatibility Analysis:** Powered by **Google Gemini**, our AI analyzes profiles upon matching to provide a detailed compatibility score and summary.
*   **✅ Structured Onboarding:** Captures critical data upfront: Role, Skills, Commitment Level, and Equity Expectations.
*   **🔒 Verified Profiles:** GitHub-based authentication ensures all users are legitimate.
*   **💬 Instant Connection:** Match and get a breakdown of why you work well together before you even chat.
## 🛠️ Tech Stack
*   **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Animations:** [Framer Motion](https://www.framer.com/motion/) & [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
*   **Database & Auth:** [Supabase](https://supabase.com/)
*   **AI Model:** [Google Gemini](https://deepmind.google/technologies/gemini/)
*   **Icons:** [Lucide React](https://lucide.dev/)
## 🚀 Getting Started
Follow these steps to get the project running locally.
### Prerequisites
*   Node.js 18+
*   npm or yarn
*   A Supabase project
*   A Google Cloud project with Gemini API enabled
### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/AbhayXplor/foundermatch.git
    cd foundermatch
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root directory and add the following:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    GEMINI_API_KEY=your_gemini_api_key
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
5.  **Open the app:**
    Visit [http://localhost:3000](http://localhost:3000) in your browser.
## 🔮 Future Roadmap
*   **GitHub Repo Analysis:** AI agents that pull and summarize public code contributions to verify technical skills.
*   **Project Workspace:** A shared space for matched founders to draft initial equity agreements and business plans.
*   **AI Icebreakers:** Context-aware conversation starters based on shared interests.
## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.
## 📄 License
This project is open source and available under the [MIT License](LICENSE).
