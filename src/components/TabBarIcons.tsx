// Кастомные "гибридные" иконки только для нижней навигации: контур тела
// (path из Phosphor weight="regular") + залитые сплошным цветом головы
// (тот же круг, что в Phosphor weight="duotone" идёт как второстепенный слой
// с opacity 0.2 — здесь рендерится тем же currentColor с полной непрозрачностью
// поверх контура). Оба path — точные данные из @phosphor-icons/react, ничего
// не рисовалось от руки. Проп weight принимается и игнорируется — чтобы можно
// было использовать этот же компонент по тому же вызову, что и обычные
// Phosphor-иконки (<Icon size={..} weight="fill" style={{ color }} />).
import type { SVGProps } from 'react';

interface HybridIconProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
  weight?: string;
}

function HybridIcon({ size = 24, weight, outline, heads, ...props }: HybridIconProps & { outline: string; heads: string }) {
  void weight; // проп принимается для совместимости вызова с обычными Phosphor-иконками и игнорируется
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" fill="currentColor" {...props}>
      <path d={outline} />
      <path d={heads} />
    </svg>
  );
}

const CONTACTS_OUTLINE = "M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1-7.37-4.89,8,8,0,0,1,0-6.22A8,8,0,0,1,192,112a24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.84,8,57,57,0,0,0-98.16,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-29.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,1,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,1,0,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z";
const CONTACTS_HEADS = "M168,144a40,40,0,1,1-40-40A40,40,0,0,1,168,144ZM64,56A32,32,0,1,0,96,88,32,32,0,0,0,64,56Zm128,0a32,32,0,1,0,32,32A32,32,0,0,0,192,56Z";
const SEVCHIK_OUTLINE = "M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z";
const SEVCHIK_HEADS = "M192,96a64,64,0,1,1-64-64A64,64,0,0,1,192,96Z";

export function ContactsHybridIcon(props: HybridIconProps) {
  return <HybridIcon outline={CONTACTS_OUTLINE} heads={CONTACTS_HEADS} {...props} />;
}

export function SevchikHybridIcon(props: HybridIconProps) {
  return <HybridIcon outline={SEVCHIK_OUTLINE} heads={SEVCHIK_HEADS} {...props} />;
}
