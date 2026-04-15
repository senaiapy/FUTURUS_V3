import { TrendingUp, BarChart3, ShieldCheck, Globe } from "lucide-react";

export const features = [
  {
    icon: BarChart3,
    title: "Preveja o Mercado", // Predict the Market
    description: "Analise tendências e faça previsões precisas em diversos mercados globais.",
    color: "indigo"
  },
  {
    icon: ShieldCheck,
    title: "Segurança Total", // Total Security
    description: "Sua conta e seus lucros protegidos com a mais alta tecnologia de segurança.",
    color: "purple"
  },
  {
    icon: Globe,
    title: "Alcance Global", // Global Reach
    description: "Acesse mercados de todo o mundo, de esportes a finanças e criptomoedas.",
    color: "violet"
  }
];

export const landingSlides = [
  {
    id: 1,
    title: "Preveja. Negocie. Ganhe. Recompensas",
    description: "Experimente uma maneira divertida e recompensadora de negociar no mercado de cotas — onde cada previsão conta e cada negociação importa.",
    buttonText: "Comece Hoje Mesmo",
    buttonLink: "/register",
    imageOne: "/images/frontend/banner/6911814f6fc921762754895.png", // Man jumping
    imageTwo: "/images/frontend/banner/691180f4699c31762754804.png", // Tablet sports
    imageThree: "/images/frontend/banner/691180f461d2f1762754804.png", // Chart/Target
    bgImage: "/images/frontend/banner/69105ac7d4d531762679495.png" // Cloud arrow bg
  },
  {
    id: 2,
    title: "Microcotas, Oportunidades",
    description: "Transforme suas previsões de mercado em lucros. Negocie ações fracionárias e concorra com outros usuários na plataforma.",
    buttonText: "Participe da Ação",
    buttonLink: "/register",
    imageOne: "/images/frontend/banner/6911816b61e601762754923.png", // Man with tablet
    imageTwo: "/images/frontend/banner/6911816b9399e1762754923.png", // Cloud dashboard
    imageThree: "/images/frontend/banner/69105a4b197271762679371.png", // Chart up
    bgImage: "/images/frontend/banner/69105a8261e0b1762679426.png" // Blue tech bg
  }
];
