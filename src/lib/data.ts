import sobral from "@/assets/sobral.jpg";
import joaoEduardo from "@/assets/joao-eduardo.jpg";
import catAlimentacao from "@/assets/cat-alimentacao.png";
import catLojas from "@/assets/cat-lojas.png";
import catBeleza from "@/assets/cat-beleza.png";
import catServicos from "@/assets/cat-servicos.png";
import catSaude from "@/assets/cat-saude.png";

export type Category = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  icon: string;
};

export const categories: Category[] = [
  { id: "alimentacao", name: "Alimentação", emoji: "🍔", color: "oklch(0.96 0.04 60)", icon: catAlimentacao },
  { id: "lojas", name: "Lojas", emoji: "🛍️", color: "oklch(0.96 0.06 100)", icon: catLojas },
  { id: "beleza", name: "Beleza", emoji: "✂️", color: "oklch(0.96 0.03 20)", icon: catBeleza },
  { id: "servicos", name: "Serviços", emoji: "🔧", color: "oklch(0.95 0.04 230)", icon: catServicos },
  { id: "saude", name: "Saúde", emoji: "❤️", color: "oklch(0.96 0.04 25)", icon: catSaude },
];

export type Neighborhood = {
  id: string;
  name: string;
  image: string;
};

export const neighborhoods: Neighborhood[] = [
  { id: "sobral", name: "Sobral", image: sobral },
  { id: "joao-eduardo", name: "João Eduardo", image: joaoEduardo },
];

export const waLink = (phone: string, msg = "Olá! Vi seu negócio no GuiaAcre.") =>
  `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
