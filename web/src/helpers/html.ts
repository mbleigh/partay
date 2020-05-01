export function formValue(qs: string): any {
  return ((document.querySelector(qs) as HTMLInputElement) || { value: null })
    .value;
}
