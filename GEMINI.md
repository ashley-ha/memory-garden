### IMPORTANT
documentation for this project is in docs/ folder
for example, for nextjs documentation, you can find it in docs/nextjs.txt

## Plan & Review
### Before starting work
- Always in plan mode to make a plan
- After you get the plan, make sure you write the plan to .claude/tasks/TASK_NAME.md
- The plan should be a detailed implementation plan and the reasoning behind them, as well as tasks broken down.
- If the task requires external knowledge or a certain package, also use research to get the latest knowledge (Use Task tool for research)
- Don't over plan it, always think MVP.
- One you write the plan, firstly ask me to review it. Do not continue until I approve the plan.

### While Implementing
- You should update the plan as you work.
- After you complete tasks in the plan, you should update and append detailed descriptions of the changes you made, so following tasks can be easily handed over to other engineers.

## Project Overview
this project is a simple project designed to acheive the following challenge: 
"It is imperative that humanity not fall while AI ascends. Humanity has to continue to rise, become better alongside. Create something that is specifically designed to uplift team human.

This challenge will run for 2 weeks until Aug 17th EOD PST. It has to be something that was uniquely created for this challenge and would not exist otherwise. Criteria includes execution, leverage, novelty, inspiration, aesthetics, amusement."

the core idea of our project: Memory Garden - collaborative flashcards that don't suck. People post topics they're struggling with, the community creates beautiful explanation cards (analogies + definitions), and everyone studies together using spaced repetition.

Why This Works:
- Solves a real problem: Anki is powerful but lonely and ugly
- Natural motivation: Contributors see their impact ("Your analogy helped 500 people!")
- Actually useful: People will return daily to study
- Simpler to build: No complex trees, just cards and topics

how it uplifts team human:
understanding & learning: creates a beautiful, social way to master difficult concepts together
community impact: contributors see their explanations helping hundreds of learners
human connection: instead of memorizing alone, you're learning from a caring community where each card has a human touch


<Project Plan> 
Memory Garden (MVP)
1. Core Concept
Collaborative flashcards that combine the power of spaced repetition with the warmth of community learning. Think "beautiful Anki with social features" - people create and study cards together.

2. MVP Flow

Post a Topic
"I'm struggling with: Quantum Entanglement"

Community Creates Cards
- Analogy cards: "It's like two dancers who mirror each other perfectly, even in separate rooms"
- Definition cards: "When two particles share a quantum state and measuring one instantly affects the other"

Study Mode
- Beautiful card interface (not Anki's brutalism)
- Shows card → user rates understanding (Easy/Good/Hard/Again)
- Spaced repetition schedules next review
- See who created each card - feels social

For a given topic that the user is trying to learn, the users can also suggest 
resources to learn the topic, such as online courses, books, videos, etc. 
The users can also vote on the resources. 
Recognition System
- "⭐ 127 learners found this helpful"
- User profiles: "Created 45 cards, helped 1,200 learners"

Essential MVP Features:

Users can submit a "Topic" they want to learn (e.g., "Quantum Entanglement")
Users can create "Cards" for any topic (analogy or definition type)
Beautiful study mode with spaced repetition
Simple rating system (Easy/Good/Hard/Again)
Recognition system showing impact ("helped X learners")
Basic user attribution (optional name field)

Skip for MVP:

User authentication (use anonymous with optional names)
Advanced spaced repetition algorithms (use simple intervals)
Visual cards/diagrams
Real-time study companions
Complex badge systems
Search/filtering

1. Rivendell-Inspired Aesthetic: "Memory Garden of Imladris"
Timeless elvish wisdom meets learning - beautiful, serene, and deeply thoughtful:

Fonts: 
- Headers: "Cinzel" (elvish elegance for titles like "The Last Homely House")
- Body: "Crimson Text" (ancient manuscript feel for card content)
- UI: "Inter" (clean but warm for interface elements)

Colors (The Palette of Rivendell):

Background: #F5F5DC (warm parchment - like Bilbo's writings)
Primary text: #2C3E2C (deep forest green - Rivendell's eternal woods)
Cards: #FEFEFE with golden edges (aged elvish scrolls)
Accent: #D4AF37 (soft gold - elvish light and wisdom)
Success: #6B8E5A (muted sage - peaceful knowledge)
Needs Review: #CD853F (warm bronze - gentle encouragement)

Subtle Rivendell Elements:

Cards have delicate golden borders when focused (elvish craftsmanship)
Gentle flowing transitions (like water in Rivendell)
Soft glows on interactive elements (starlight effect)
Elegant spacing and typography (elvish attention to beauty)
Success animations with gentle sparkles (magic in the air)

Unicode symbols with Tolkien spirit:
✨ for "Create Card" (Eärendil's light)
📜 for "Study" (wisdom scrolls) 
⭐ for helpfulness (Gil-Estel - star of hope)
🍃 for mastered topics (peaceful completion)

4. Three Main Views (The Halls of Memory)
Page 1: The Last Homely House (Homepage - /)

List of topics with study stats (like Elrond's library)
"Begin New Study"  button → opens gentle modal
Each topic shows: Title, description, number of cards, fellow learners
Subtle greeting: "Welcome, friend. What wisdom do you seek?"

Page 2: The Hall of Fire (/topic/[id])

Topic title and description at top (like a chapter from the Red Book)
"✨ Contribute Wisdom" button → inline form for analogy or definition  
List of all cards for this topic (scrolls of knowledge)
Each card shows: content preview, type, author, how many found it helpful
Gentle attribution: "shared by Emma" or "wisdom of Marcus"

Page 3: The Path of Learning (/study/[topicId])

Beautiful card interface showing one card at a time
Card content with elegant typography (like reading Bilbo's notes)
Author attribution: "remembered by Emma" or "as told by Marcus"
Flip to reveal deeper understanding
Rate your journey: "Again" | "Challenging" | "Well Learned" | "Mastered"
Progress like stars appearing: "3 of 12 memories strengthened"



5. Technical Recommendations for Speed
Suggested Simple Stack:
- Next.js 14+ (App Router)
- TypeScript 
- Tailwind CSS for styling
- Supabase for database (PostgreSQL with instant API)
- Deployed on Vercel (one-click from GitHub)

Data Model (keep it simple):
Topics: id, title, description, createdAt
Cards: id, topicId, type (analogy/definition), content, authorName, createdAt
Reviews: userId (session-based), cardId, rating, nextReview, createdAt
Applause: userId (session-based), cardId, createdAt

Simple Spaced Repetition:
- Again: 1 minute
- Hard: 10 minutes  
- Good: 1 day
- Easy: 4 days
No need for:

Authentication system
WebSockets/real-time
Complex state management
File uploads
Email notifications

6. Day-by-Day MVP Plan
Days 1-3: Setup + The Garden (homepage with topics)
Days 4-6: Topic view with card creation
Days 7-9: Study mode with beautiful card interface
Days 10-11: Spaced repetition and rating system
Days 12-13: Polish styling, add garden aesthetic touches
Day 14: Deploy and test

7. Future Enhancements (Post-MVP)

Visual cards with simple diagrams
User accounts and reputation ("Sage of Physics" badges)
Real-time study companions
Advanced spaced repetition algorithms
Export beautiful card collections
"Study together" multiplayer mode

Remember: The goal is a working prototype that makes learning feel magical and social. The magic is in combining beautiful design with the proven power of spaced repetition and community contribution.
</Project Plan> 
