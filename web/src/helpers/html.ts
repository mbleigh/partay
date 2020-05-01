export function formValue(qs: string): any {
  return ((document.querySelector(qs) as HTMLInputElement) || { value: null })
    .value;
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
