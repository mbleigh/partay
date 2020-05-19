declare module "emojilib" {
  export const lib: {
    [key: string]: {
      char: string;
      category: string;
      keywords: string[];
      fitzpatrick_scale: boolean;
    };
  };
}
