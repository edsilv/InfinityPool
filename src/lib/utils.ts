import { Src, SrcObj } from '@/types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Vector3 } from 'three';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function areObjectsIdentical(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function normalizeSrc(src: Src): SrcObj[] {
  const srcs: SrcObj[] = [];

  if (typeof src === 'string') {
    srcs.push({
      url: src as string,
    });
  } else if (Array.isArray(src)) {
    // if it's an array, then it's already a ModelSrc object
    srcs.push(...(src as SrcObj[]));
  } else {
    // if it's not a string or an array, then it's a single ModelSrc object
    srcs.push(src as SrcObj);
  }

  return srcs;
}

export const copyText = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);
};

export const parseAnnotations = (value: any) => {
  const parsed = JSON.parse(value);

  parsed.forEach((anno: any) => {
    anno.cameraPosition = new Vector3().fromArray(Object.values(anno.cameraPosition));
    anno.cameraTarget = new Vector3().fromArray(Object.values(anno.cameraTarget));
    anno.normal = new Vector3().fromArray(Object.values(anno.normal));
    anno.position = new Vector3().fromArray(Object.values(anno.position));
  });

  return parsed;
};

export function getElementTranslate(el: HTMLElement): number[] | null {
  let x: number;
  let y: number;

  let transformValue = el.getAttribute('transform');
  let translateValues: string[] | null = null;

  if (transformValue) {
    let match = transformValue.match(/translate\(([^)]+)\)/);
    if (match) {
      translateValues = match[1].split(', ');
    }
  }

  if (translateValues) {
    x = Number(translateValues[0]);
    y = Number(translateValues[1]);

    return [x, y];
  }

  return null;
}

export function setElementTranslate(el: HTMLElement, x: number, y: number) {
  el?.setAttribute('transform', `translate(${x}, ${y})`);
}
