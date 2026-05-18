import type {
  BlogPost,
  DockApp,
  FinderNode,
  FinderLocation,
  GalleryItem,
  LocationType,
  LocationsMap,
  NavIcon,
  NavLink,
  SafariBookmark,
  SocialLink,
  TechStackCategory,
  WindowConfig,
} from "#types";

import AboutImg from "../../public/images/Aboutpic.png";

/**
 * Top-nav link labels and their window targets.
 */
const navLinks = [
  {
    id: 1,
    name: "Projects",
    type: "finder",
  },
  {
    id: 3,
    name: "Contact",
    type: "contact",
  },
  {
    id: 4,
    name: "Resume",
    type: "resume",
  },
] satisfies NavLink[];

/**
 * Status/action icons shown in the top nav.
 */
const navIcons = [
  {
    id: 1,
    type: "status",
    img: "/icons/wifi.svg",
  },
  {
    id: 2,
    type: "status",
    img: "/icons/search.svg",
  },
  {
    id: 3,
    type: "status",
    img: "/icons/user.svg",
  },
  {
    id: 4,
    type: "theme",
    img: "/icons/mode.svg",
  },
] satisfies NavIcon[];

/**
 * Dock icon config. `id` must map to a window key when `canOpen` is true.
 */
const dockApps = [
  {
    id: "finder",
    name: "Portfolio", // was "Finder"
    icon: "finder.png",
    canOpen: true,
    showOnMobile: true,
  },
  {
    id: "safari",
    name: "Articles", // was "Safari"
    icon: "safari.png",
    canOpen: true,
    showOnMobile: true,
  },
  {
    id: "photos",
    name: "Gallery", // was "Photos"
    icon: "photos.png",
    canOpen: true,
    showOnMobile: true,
  },
  {
    id: "contact",
    name: "Contact", // or "Get in touch"
    icon: "contact.png",
    canOpen: true,
    showOnMobile: true,
  },
  {
    id: "terminal",
    name: "Skills", // was "Terminal"
    icon: "terminal.png",
    canOpen: true,
    showOnMobile: false,
  },
  {
    id: "veronica",
    name: "Veronica",
    icon: "terminal.png",
    canOpen: true,
    showOnMobile: false,
  },
  {
    id: "trash",
    name: "Bin", // was "Trash"
    icon: "trash.png",
    canOpen: false,
    showOnMobile: false,
  },
] satisfies DockApp[];

/**
 * Article cards shown in the Safari/Articles window.
 */
const blogPosts = [
  {
    id: 1,
    date: "May 1, 2026",
    title: "DocSpace – Collaborative Document Editor",
    image:
      "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=2000&auto=format&fit=crop",
    link: "https://github.com/vitthalganeshshivane/DocSpace-Collaborative-Document-Editor",
  },
  {
    id: 2,
    date: "April 15, 2026",
    title: "Writeflow – Where Ideas Flow",
    image:
      "https://img.freepik.com/free-photo/online-message-blog-chat-communication-envelop-graphic-icon-concept_53876-139717.jpg",
    link: "http://writeflow-blogs.vercel.app/",
  },
  {
    id: 3,
    date: "March 10, 2026",
    title: "MindGuard – Mental Health Detection & Assessment System",
    image:
      "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?q=80&w=2000&auto=format&fit=crop",
    link: "https://mental-health-detection.vercel.app/",
  },
  {
    id: 4,
    date: "February 1, 2026",
    title: "Vroom45 – Ride Booking App",
    image:
      "https://media.licdn.com/dms/image/v2/D5612AQGEj1_pOIxVIA/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1706172015188?e=2147483647&v=beta&t=tByxAL12GywZbzKlapnj_g6uE0KFEV04HNxkHPPT_1A",
    link: "https://vroom45.vercel.app/",
  },
  {
    id: 5,
    date: "January 15, 2026",
    title: "Digital Classroom Platform",
    image:
      "https://www.bthaber.com/wp-content/uploads/2020/06/GessTurkiye_UzaktanE%C4%9Fitim_Gorsel02-1024x1024.jpg",
    link: "https://digital-classroom-gamma.vercel.app/",
  },
] satisfies BlogPost[];

/**
 * Curated bookmarks shown in Safari bookmark menus.
 */
const safariBookmarks = [
  {
    id: 1,
    category: "Portfolio",
    title: "Vitthal's Portfolio",
    url: "https://vitthalganeshshivane.github.io/portfolio",
  },
  {
    id: 2,
    category: "Portfolio",
    title: "Vitthal's Projects",
    url: "https://github.com/vitthalganeshshivane?tab=repositories",
  },
  {
    id: 3,
    category: "Content",
    title: "Latest Project",
    url:
      blogPosts[0]?.link ??
      "https://github.com/vitthalganeshshivane?tab=repositories",
  },
  {
    id: 4,
    category: "Learning",
    title: "Redux Toolkit",
    url: "https://redux-toolkit.js.org",
  },
  {
    id: 5,
    category: "Learning",
    title: "TypeScript Docs",
    url: "https://www.typescriptlang.org/docs/",
  },
  {
    id: 6,
    category: "Social",
    title: "GitHub",
    url: "https://github.com/vitthalganeshshivane",
  },
  {
    id: 7,
    category: "Social",
    title: "LinkedIn",
    url: "https://linkedin.com/in/vitthalganeshshivane",
  },
] satisfies SafariBookmark[];

/**
 * Tech stack grouped by category.
 */
const techStack = [
  {
    category: "Frontend",
    items: ["React", "JavaScript", "HTML5", "CSS3"],
  },
  {
    category: "Styling",
    items: ["Tailwind CSS"],
  },
  {
    category: "Backend",
    items: ["Node.js", "Express.js"],
  },
  {
    category: "Data",
    items: ["MongoDB"],
  },
  {
    category: "Tools",
    items: ["Git", "VS Code", "Postman", "npm/yarn"],
  },
  {
    category: "Other",
    items: [
      "Next.js",
      "Socket.io",
      "Mongoose",
      "JWT",
      "Bcrypt",
      "Axios",
      "Material-UI",
      "Bootstrap",
    ],
  },
  {
    category: "Learning",
    items: ["Redux", "TypeScript", "AWS"],
  },
] satisfies TechStackCategory[];

/**
 * Social links with icon and accent color.
 */
const socials = [
  {
    id: 1,
    text: "Github",
    icon: "/icons/github.svg",
    bg: "#f4656b",
    link: "https://github.com/vitthalganeshshivane",
  },
  {
    id: 2,
    text: "Website",
    icon: "/icons/atom.svg",
    bg: "#4bcb63",
    link: "https://vitthalganeshshivane.vercel.app",
  },
  {
    id: 3,
    text: "Twitter/X",
    icon: "/icons/twitter.svg",
    bg: "#ff866b",
    link: "https://x.com/vitthalganeshshivane",
  },
  {
    id: 4,
    text: "LinkedIn",
    icon: "/icons/linkedin.svg",
    bg: "#05b6f6",
    link: "https://www.linkedin.com/in/vitthalganeshshivane",
  },
] satisfies SocialLink[];

/** Certification cards shown in Photos and Finder > Photos. */
const ISSUER_URLS = {
  "Online Course Platform": "https://example.com/full-stack-web-development",
  "React Training Institute": "https://example.com/react-development",
  FreeCodeCamp: "https://www.freecodecamp.org",
  "MongoDB University": "https://university.mongodb.com",
} as const;

/** Certification cards shown in Photos and Finder > Photos. */
const GALLERY_IMAGES = [
  {
    title: "Full Stack Web Development",
    issuer: "Online Course Platform",
    issuerUrl: ISSUER_URLS["Online Course Platform"],
    category: "Backend",
    imageUrl:
      "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=2000&auto=format&fit=crop",
  },
  {
    title: "React Development",
    issuer: "React Training Institute",
    issuerUrl: ISSUER_URLS["React Training Institute"],
    category: "Frontend",
    imageUrl:
      "https://img.freepik.com/free-photo/online-message-blog-chat-communication-envelop-graphic-icon-concept_53876-139717.jpg",
  },
  {
    title: "JavaScript Algorithms and Data Structures",
    issuer: "FreeCodeCamp",
    issuerUrl: ISSUER_URLS["FreeCodeCamp"],
    category: "Frontend",
    imageUrl:
      "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?q=80&w=2000&auto=format&fit=crop",
  },
  {
    title: "MongoDB for Developers",
    issuer: "MongoDB University",
    issuerUrl: ISSUER_URLS["MongoDB University"],
    category: "Data",
    imageUrl:
      "https://www.bthaber.com/wp-content/uploads/2020/06/GessTurkiye_UzaktanE%C4%9Fitim_Gorsel02-1024x1024.jpg",
  },
] as const;

/**
 * Finder icon positions for photos root.
 * Layout is designed for 4 tiles; extra images reuse slots.
 */
const GALLERY_POSITIONS = [
  "top-10 left-10",
  "top-10 left-56",
  "top-56 left-10",
  "top-56 left-56",
] as const;

/**
 * Gallery image tiles for the Photos window.
 */
const gallery = GALLERY_IMAGES.map((img, index) => ({
  id: index + 1,
  title: img.title,
  issuer: img.issuer,
  issuerUrl: img.issuerUrl,
  category: img.category,
  img: img.imageUrl,
})) satisfies GalleryItem[];

/** Avatar URL shown in the Contact window. */
const CONTACT_AVATAR_URL = "/images/Aboutpic.png";

/** Primary email shown in the Contact window. */
const CONTACT_EMAIL = "vitthalganeshshivane@gmail.com";

/**
 * Project metadata for terminal commands.
 */
const projects = [
  {
    name: "DocSpace",
    description:
      "Collaborative document editor inspired by Google Docs. Rich-text editing with TipTap, tables, task lists, comments.",
    tags: ["React", "TipTap", "Node.js", "MongoDB"],
    href: "https://github.com/vitthalganeshshivane/DocSpace-Collaborative-Document-Editor",
  },
  {
    name: "Writeflow",
    description:
      "Distraction-free writing and blogging platform. Clean editor experience, minimal productivity-oriented UI.",
    tags: ["React", "Node.js", "Express", "MongoDB"],
    href: "https://github.com/vitthalganeshshivane/Writeflow-Client",
  },
  {
    name: "MindGuard",
    description:
      "AI-powered mental health detection system. ML risk prediction with LLM-powered empathetic assessments.",
    tags: ["React", "Python", "Machine Learning", "LLM"],
    href: "https://github.com/vitthalganeshshivane/mental-health-frontend",
  },
  {
    name: "Vroom45",
    description:
      "Full-stack ride booking app. Real-time location tracking, fare calculation, driver-passenger interaction.",
    tags: ["React", "Node.js", "Express", "MongoDB"],
    href: "https://github.com/vitthalganeshshivane/Ubar_Clone-frontend",
  },
  {
    name: "Digital Classroom",
    description:
      "Web-based classroom management system. Assignments, live class links, notice board, study material.",
    tags: ["React", "Node.js", "Express", "MongoDB"],
    href: "https://github.com/vitthalganeshshivane/digital-classroom-frontend",
  },
];

export {
  blogPosts,
  CONTACT_AVATAR_URL,
  CONTACT_EMAIL,
  dockApps,
  gallery,
  navIcons,
  navLinks,
  projects,
  safariBookmarks,
  socials,
  techStack,
};

/**
 * Finder root: Work projects and related assets.
 */
const WORK_LOCATION = {
  id: 1,
  type: "work",
  name: "Work",
  icon: "/icons/work.svg",
  kind: "folder",
  scope: "root",
  children: [
    // ▶ Project 1
    {
      id: 5,
      name: "DocSpace – Collaborative Document Editor",
      icon: "/images/folder.png",
      kind: "folder",
      scope: "nested",
      position: "top-8 left-12", // icon position inside Finder
      windowPosition: "top-[5.25rem] right-8", // optional: Finder window position
      children: [
        {
          id: 1,
          name: "DocSpace Project Description.txt",
          icon: "/images/txt.png",
          kind: "file",
          fileType: "txt",
          position: "top-5 left-10",
          description: [
            "DocSpace is a Google Docs–inspired collaborative document editor built from scratch.",
            "It supports rich-text editing with headings, font styles, tables, task lists, comments, rulers, and formatting tools.",
            "The editor is powered by TipTap and designed with a clean, productivity-focused UI.",
            "The project focuses heavily on editor internals, extensibility, and real-world document workflows.",
          ],
        },
        {
          id: 2,
          name: "DocSpace Live Demo.url",
          icon: "/images/safari.png",
          kind: "file",
          fileType: "url",
          href: "https://github.com/vitthalganeshshivane/DocSpace-Collaborative-Document-Editor",
          position: "top-10 right-20",
        },
        {
          id: 4,
          name: "docspace-preview.png",
          icon: "/images/image.png",
          kind: "file",
          fileType: "img",
          position: "top-52 right-80",
          imageUrl:
            "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?q=80&w=2000&auto=format&fit=crop",
        },
        {
          id: 5,
          name: "Source Code.url",
          icon: "/images/plain.png",
          kind: "file",
          fileType: "url",
          href: "https://github.com/vitthalganeshshivane/DocSpace-Collaborative-Document-Editor",
          position: "top-60 right-20",
        },
      ],
    },

    // ▶ Project 2
    {
      id: 6,
      name: "Writeflow – Where Ideas Flow",
      icon: "/images/folder.png",
      kind: "folder",
      scope: "nested",
      position: "top-8 left-72",
      windowPosition: "top-[17.75rem] right-8",
      children: [
        {
          id: 1,
          name: "Writeflow Project Description.txt",
          icon: "/images/txt.png",
          kind: "file",
          fileType: "txt",
          position: "top-5 right-10",
          description: [
            "Writeflow is a modern, distraction-free writing and blogging platform focused on clean workflows and content creation.",
            "It enables users to write, edit, and manage posts with a smooth editor experience and a minimal, productivity-oriented UI.",
            "The project emphasizes structured writing, scalability, and real-world content publishing flows.",
          ],
        },
        {
          id: 2,
          name: "Writeflow Frontend.url",
          icon: "/images/safari.png",
          kind: "file",
          fileType: "url",
          href: "https://github.com/vitthalganeshshivane/Writeflow-Client",
          position: "top-10 left-10",
        },
        {
          id: 3,
          name: "Writeflow Backend.url",
          icon: "/images/safari.png",
          kind: "file",
          fileType: "url",
          href: "https://github.com/vitthalganeshshivane/Writeflow-Server",
          position: "top-20 left-50",
        },
        {
          id: 4,
          name: "writeflow-preview.png",
          icon: "/images/image.png",
          kind: "file",
          fileType: "img",
          position: "top-52 left-80",
          imageUrl:
            "https://img.freepik.com/free-photo/online-message-blog-chat-communication-envelop-graphic-icon-concept_53876-139717.jpg",
        },
        {
          id: 5,
          name: "Source Code.url",
          icon: "/images/plain.png",
          kind: "file",
          fileType: "url",
          href: "https://github.com/vitthalganeshshivane/Writeflow-Client",
          position: "top-60 left-5",
        },
      ],
    },

    // ▶ Project 3
    {
      id: 7,
      name: "MindGuard – Mental Health Detection & Assessment System",
      icon: "/images/folder.png",
      kind: "folder",
      scope: "nested",
      position: "top-36 left-12",
      windowPosition: "top-[30.25rem] right-8",
      children: [
        {
          id: 1,
          name: "MindGuard Project Description.txt",
          icon: "/images/txt.png",
          kind: "file",
          fileType: "txt",
          position: "top-5 left-10",
          description: [
            "MindGuard is an AI-powered mental health detection system designed to identify early signs of stress, anxiety, and depression.",
            "The project combines machine learning–based risk prediction with LLM-powered empathetic assessments and personalized suggestions.",
            "Built as a full-stack system, it focuses on real-world mental health workflows, safety considerations, and explainable AI-assisted decision support rather than diagnosis.",
          ],
        },
        {
          id: 2,
          name: "MindGuard Frontend.url",
          icon: "/images/safari.png",
          kind: "file",
          fileType: "url",
          href: "https://github.com/vitthalganeshshivane/mental-health-frontend",
          position: "top-10 right-20",
        },
        {
          id: 3,
          name: "MindGuard Backend.url",
          icon: "/images/safari.png",
          kind: "file",
          fileType: "url",
          href: "https://github.com/vitthalganeshshivane/mental-health-backend",
          position: "top-10 right-50",
        },
        {
          id: 4,
          name: "mindguard-preview.png",
          icon: "/images/image.png",
          kind: "file",
          fileType: "img",
          position: "top-52 right-50",
          imageUrl:
            "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?q=80&w=2000&auto=format&fit=crop",
        },
        {
          id: 5,
          name: "Source Code.url",
          icon: "/images/plain.png",
          kind: "file",
          fileType: "url",
          href: "https://github.com/vitthalganeshshivane/mental-health-frontend",
          position: "top-60 left-5",
        },
      ],
    },

    // ▶ Project 4
    {
      id: 8,
      name: "Vroom45 – Ride Booking App",
      icon: "/images/folder.png",
      kind: "folder",
      scope: "nested",
      position: "top-36 left-72",
      windowPosition: "top-[36.5rem] right-8",
      children: [
        {
          id: 1,
          name: "Vroom45 Project Description.txt",
          icon: "/images/txt.png",
          kind: "file",
          fileType: "txt",
          position: "top-5 left-10",
          description: [
            "A full-stack Uber clone named Vroom45 that enables users to book rides in real time.",
            "Built with modern MERN technologies, this app features user authentication, location tracking, fare calculation, driver-passenger interaction.",
            "The UI is mobile-optimized with ongoing enhancements for desktop support.",
          ],
        },
        {
          id: 2,
          name: "Vroom45 Frontend.url",
          icon: "/images/safari.png",
          kind: "file",
          fileType: "url",
          href: "https://github.com/vitthalganeshshivane/Ubar_Clone-frontend",
          position: "top-10 right-10",
        },
        {
          id: 3,
          name: "Vroom45 Backend.url",
          icon: "/images/safari.png",
          kind: "file",
          fileType: "url",
          href: "https://github.com/vitthalganeshshivane/Ubar_Clone-backend",
          position: "top-10 right-50",
        },
        {
          id: 4,
          name: "vroom45-preview.png",
          icon: "/images/image.png",
          kind: "file",
          fileType: "img",
          position: "top-52 right-50",
          imageUrl:
            "https://media.licdn.com/dms/image/v2/D5612AQGEj1_pOIxVIA/article-cover_image-shrink_600_2000/article-cover_image-shrink_600_2000/0/1706172015188?e=2147483647&v=beta&t=tByxAL12GywZbzKlapnj_g6uE0KFEV04HNxkHPPT_1A",
        },
        {
          id: 5,
          name: "Source Code.url",
          icon: "/images/plain.png",
          kind: "file",
          fileType: "url",
          href: "https://github.com/vitthalganeshshivane/Ubar_Clone-frontend",
          position: "top-60 left-5",
        },
      ],
    },

    // ▶ Project 5
    {
      id: 9,
      name: "Digital Classroom Platform",
      icon: "/images/folder.png",
      kind: "folder",
      scope: "nested",
      position: "top-64 left-12",
      windowPosition: "top-[11.5rem] right-8",
      children: [
        {
          id: 1,
          name: "Digital Classroom Project Description.txt",
          icon: "/images/txt.png",
          kind: "file",
          fileType: "txt",
          position: "top-5 left-10",
          description: [
            "A modern web-based classroom management system designed for teachers and students.",
            "It includes features such as user authentication, assignment uploads by teacher, live class links, notice board, and subject-wise study material.",
            "Built with a scalable MERN stack architecture and responsive UI.",
          ],
        },
        {
          id: 2,
          name: "Digital Classroom Frontend.url",
          icon: "/images/safari.png",
          kind: "file",
          fileType: "url",
          href: "https://github.com/vitthalganeshshivane/digital-classroom-frontend",
          position: "top-10 right-20",
        },
        {
          id: 3,
          name: "Digital Classroom Backend.url",
          icon: "/images/safari.png",
          kind: "file",
          fileType: "url",
          href: "https://github.com/vitthalganeshshivane/digital-classroom-backend",
          position: "top-10 right-50",
        },
        {
          id: 4,
          name: "digital-classroom-preview.png",
          icon: "/images/image.png",
          kind: "file",
          fileType: "img",
          position: "top-52 right-40",
          imageUrl:
            "https://www.bthaber.com/wp-content/uploads/2020/06/GessTurkiye_UzaktanE%C4%9Fitim_Gorsel02-1024x1024.jpg",
        },
        {
          id: 5,
          name: "Source Code.url",
          icon: "/images/plain.png",
          kind: "file",
          fileType: "url",
          href: "https://github.com/vitthalganeshshivane/digital-classroom-frontend",
          position: "top-60 left-5",
        },
      ],
    },

    // ▶ Experience Folder (Internship)
    {
      id: 10,
      name: "Professional Experience",
      icon: "/images/folder.png",
      kind: "folder",
      scope: "nested",
      position: "top-64 left-72",
      windowPosition: "top-[24rem] right-8",
      children: [
        {
          id: 1,
          name: "MERN Stack Developer Internship.txt",
          icon: "/images/txt.png",
          kind: "file",
          fileType: "txt",
          position: "top-5 left-10",
          description: [
            "Developing full-stack web applications using MongoDB, Express.js, React, and Node.js",
            "Collaborating with senior developers to implement new features and optimize existing code",
            "Participating in code reviews and learning industry best practices",
            "Working with REST APIs and implementing responsive user interfaces",
            "Gaining hands-on experience with version control using Git and GitHub",
          ],
        },
        {
          id: 2,
          name: "Amika Softwares.url",
          icon: "/images/safari.png",
          kind: "file",
          fileType: "url",
          href: "https://amikasoftwares.com/",
          position: "top-10 right-20",
        },
        // {
        //   id: 4,
        //   name: "experience-badge.png",
        //   icon: "/images/image.png",
        //   kind: "file",
        //   fileType: "img",
        //   position: "top-52 right-80",
        //   imageUrl:
        //     "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop",
        // },
        // {
        //   id: 5,
        //   name: "Internship Certificate.url",
        //   icon: "/images/plain.png",
        //   kind: "file",
        //   fileType: "url",
        //   href: "https://github.com/vitthalganeshshivane/portfolio",
        //   position: "top-60 right-20",
        // },
      ],
    },
  ],
} as const satisfies FinderLocation;

/**
 * Finder root: About me content.
 */
const ABOUT_LOCATION = {
  id: 2,
  type: "about",
  name: "About me",
  icon: "/icons/info.svg",
  kind: "folder",
  scope: "root",
  children: [
    {
      id: 1,
      name: "about-me.txt",
      icon: "/images/txt.png",
      kind: "file",
      fileType: "txt",
      position: "top-10 left-10",
      subtitle: "Aspiring Software Engineer • MERN Stack Developer",
      image: AboutImg,
      description: [
        "I'm Vitthal Ganesh Shivane, an aspiring software engineer with a passion for building innovative solutions through clean, efficient code.",
        "I began my educational journey with a Diploma in Mechanical Engineering, where I developed a strong foundation in problem-solving and analytical thinking.",
        "Currently, I'm pursuing my BTech in Computer Science and Engineering, where I'm diving deep into the world of software development.",
        "I'm particularly passionate about full-stack development and enjoy working with modern technologies like React, Node.js, and MongoDB.",
        "Every project is an opportunity to learn something new and push the boundaries of what I can create.",
        "When I'm not coding, you'll find me exploring new technologies, or brainstorming ideas for my next project.",
        "I believe in continuous learning and am always excited to take on new challenges.",
      ],
    },
    {
      id: 2,
      name: "highlights.txt",
      icon: "/images/txt.png",
      kind: "file",
      fileType: "txt",
      position: "top-10 left-52",
      subtitle: "What Drives Me • My Journey • Fun Facts",
      description: [
        "Passionate Coder: Love turning ideas into reality through clean, efficient code",
        "Quick Learner: Always eager to learn new technologies and best practices",
        "Team Player: Enjoy collaborating with others to solve complex problems",
        "Problem Solver: Thrive on tackling challenging problems with creative solutions",
        "Fun Facts: 800+ Hours of coding practice | 5+ Projects completed | 5+ Technologies mastered",
      ],
    },
  ],
} as const satisfies FinderLocation;

/**
 * Finder root: Resume files (pdf or external links).
 */
const RESUME_LOCATION = {
  id: 3,
  type: "resume",
  name: "Resume",
  icon: "/icons/file.svg",
  kind: "folder",
  scope: "root",
  children: [
    {
      id: 1,
      name: "Education Summary.txt",
      icon: "/images/txt.png",
      kind: "file",
      fileType: "txt",
      position: "top-10 left-10",
      description: [
        "BTech in Computer Science and Engineering (2023 - 2026)",
        "Rashtrasant Tukadoji Maharaj Nagpur University, Nagpur, Maharashtra",
        "Diploma in Mechanical Engineering (2020 - 2023)",
        "Puranmal Lahoti Government Polytechnic, Latur, Latur, Maharashtra",
      ],
    },
    {
      id: 2,
      name: "Certifications.txt",
      icon: "/images/txt.png",
      kind: "file",
      fileType: "txt",
      position: "top-10 left-50",
      description: [
        "Full Stack Web Development (2023)",
        "React Development (2024)",
        "JavaScript Algorithms and Data Structures (2023)",
        "MongoDB for Developers (2024)",
      ],
    },
    {
      id: 3,
      name: "Resume.pdf",
      icon: "/images/pdf.png",
      kind: "file",
      fileType: "pdf",
      // you can add `href` if you want to open a hosted resume
      href: "/files/Vitthal_Ganesh_Shivane_Resume.pdf",
      position: "top-10 right-20",
    },
  ],
} as const satisfies FinderLocation;

/**
 * Finder root: Photos gallery files.
 */
const PHOTOS_LOCATION = {
  id: 4,
  type: "photos",
  name: "Certifications",
  icon: "/icons/file.svg",
  kind: "folder",
  scope: "root",
  children: GALLERY_IMAGES.map((certificate, index) => ({
    id: index + 1,
    name: certificate.title,
    subtitle: certificate.issuer,
    issuerUrl: certificate.issuerUrl,
    category: certificate.category,
    icon: "/images/image.png",
    kind: "file",
    fileType: "img",
    position: GALLERY_POSITIONS[index % GALLERY_POSITIONS.length],
    imageUrl: certificate.imageUrl,
  })),
} as const satisfies FinderLocation;

/**
 * Finder root: Trash items (non-openable by default).
 */
const TRASH_LOCATION = {
  id: 5,
  type: "trash",
  name: "Trash",
  icon: "/icons/trash.svg",
  kind: "folder",
  scope: "root",
  children: [
    {
      id: 1,
      name: "trash1.png",
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      position: "top-10 left-10",
      imageUrl: "/images/trash-1.png",
    },
    {
      id: 2,
      name: "trash2.png",
      icon: "/images/image.png",
      kind: "file",
      fileType: "img",
      position: "top-40 left-80",
      imageUrl: "/images/trash-2.png",
    },
  ],
} as const satisfies FinderLocation;

/**
 * Finder root map by location key.
 */
export const locations = {
  work: WORK_LOCATION,
  about: ABOUT_LOCATION,
  resume: RESUME_LOCATION,
  photos: PHOTOS_LOCATION,
  trash: TRASH_LOCATION,
} as const satisfies LocationsMap;

interface HomeItemRef {
  location: LocationType;
  // Path of node IDs from the location root to the item to render on Home.
  path: number[];
}

const homeItemRefs = [
  { location: "work", path: [5] },
  { location: "work", path: [9] },
  { location: "work", path: [10] },
  { location: "work", path: [6] },
  { location: "work", path: [7] },
  { location: "work", path: [8] },
] satisfies HomeItemRef[];

const resolveHomeItem = ({
  location,
  path,
}: HomeItemRef): FinderNode | null => {
  let current: FinderNode = locations[location];

  for (const nodeId of path) {
    if (current.kind !== "folder") return null;
    const next: FinderNode | undefined = current.children.find(
      (child: FinderNode) => child.id === nodeId,
    );
    if (!next) return null;
    current = next;
  }

  return current;
};

/** Curated Finder nodes rendered as desktop shortcuts on Home. */
export const homeItems = homeItemRefs
  .map((ref, index) => {
    const item = resolveHomeItem(ref);
    if (!item) {
      console.warn("Invalid home item reference", { index, ref });
    }
    return item;
  })
  .filter((item): item is FinderNode => item !== null);

/**
 * Baseline z-index for unfocused windows.
 */
const INITIAL_Z_INDEX = 1000;

/**
 * Initial window state for all supported window ids.
 */
const WINDOW_CONFIG: WindowConfig = {
  finder: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  contact: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  resume: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  safari: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  photos: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  terminal: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  veronica: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  txtfile: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
  imgfile: { isOpen: false, zIndex: INITIAL_Z_INDEX, data: null },
};

export { INITIAL_Z_INDEX, WINDOW_CONFIG };
