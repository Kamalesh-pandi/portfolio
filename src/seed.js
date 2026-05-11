import { db } from './firebase.js';
import { collection, addDoc, getDocs, deleteDoc } from "firebase/firestore";

const resumeData = {
  profile: {
    name: "S Kamaleshpandi",
    role: "Flutter Developer",
    subtitle: "Flutter Developer crafting high-performance mobile apps with Spring Boot & Firebase.",
    cgpa: "7.8",
    projectsBuilt: "4+",
    yearsExp: "2+",
    email: "kamaleshpandi07@gmail.com",
    linkedin: "https://linkedin.com/in/skamaleshpandi",
    github: "https://github.com/skamaleshpandi",
    phone: "+91 9790608692",
    about: "Passionate Flutter Developer crafting high-performance mobile apps with Spring Boot and Firebase."
  },
  skills: [
    { name: "Flutter", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg" },
    { name: "Dart", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dart/dart-original.svg" },
    { name: "Firebase", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
    { name: "Spring Boot", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" },
    { name: "MySQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    { name: "React", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
    { name: "Java", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" },
    { name: "Gen AI", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/googlecloud/googlecloud-original.svg" },
    { name: "LLM", icon: "https://www.vectorlogo.zone/logos/openai/openai-icon.svg" }
  ],
  experience: [
    { 
      date: "2024 - 2028", 
      title: "Bachelor of Information Technology", 
      description: "Sri Krishna College of Engineering and Technology, Coimbatore, Tamil Nadu. Maintaining a CGPA of 7.7." 
    }
  ],
  projects: [
    { 
      title: "Food Order App", 
      description: "Full-stack application with Flutter and Spring Boot. Features menu browsing, cart management, and Admin Dashboard.", 
      emoji: "🍔", 
      tags: ["Flutter", "Spring Boot", "REST API"],
      github: "https://github.com/Kamalesh-pandi/Food_Application",
      demoUrl: "",
      images: [
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80"
      ]
    },
    { 
      title: "News App", 
      description: "Real-time news application with category filtering and public API integration.", 
      emoji: "📰", 
      tags: ["Flutter", "News API", "Clean UI"],
      github: "https://github.com/Kamalesh-pandi/News_App",
      demoUrl: "",
      images: [
        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80"
      ]
    },
    { 
      title: "BMI Calculator", 
      description: "Intuitive BMI calculator with dynamic category indication and modular structure.", 
      emoji: "⚖️", 
      tags: ["Flutter", "Dart", "UI/UX"],
      github: "https://github.com/Kamalesh-pandi/BMI_Calculator",
      demoUrl: "",
      images: [
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80"
      ]
    }
  ],
  awards: [
    { 
      title: "Google Cloud Certified", 
      issuer: "Google", 
      date: "2025",
      images: ["https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80"]
    },
    { 
      title: "Best Innovator Award", 
      issuer: "College Tech Fest", 
      date: "2024",
      images: ["https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"]
    }
  ]
};

export const seedDatabase = async () => {
  try {
    console.log("Starting seeding process...");

    // Seed Profile (assuming only one document)
    const profileRef = collection(db, "profile");
    await addDoc(profileRef, resumeData.profile);
    console.log("Profile seeded.");

    // Seed Skills
    const skillsRef = collection(db, "skills");
    for (const skill of resumeData.skills) {
      await addDoc(skillsRef, skill);
    }
    console.log("Skills seeded.");

    // Seed Experience
    const expRef = collection(db, "experience");
    for (const exp of resumeData.experience) {
      await addDoc(expRef, exp);
    }
    console.log("Experience seeded.");

    // Seed Projects
    const projRef = collection(db, "projects");
    for (const proj of resumeData.projects) {
      await addDoc(projRef, proj);
    }
    console.log("Projects seeded.");

    // Seed Awards
    const awardsRef = collection(db, "awards");
    for (const award of resumeData.awards) {
      await addDoc(awardsRef, award);
    }
    console.log("Awards seeded.");

    console.log("Database seeded successfully!");
  } catch (e) {
    console.error("Error seeding database: ", e);
  }
};
